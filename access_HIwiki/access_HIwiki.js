const request = require('request-promise');
const iconvLite = require('iconv-lite');
const fs = require('fs');
const cheerio = require('cheerio');
const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');

const semilogPattern = /^\d{4}\/\d{1,2}\/\d{1,2}$/gu;

const getProps = Object.prototype.toString

const authdata = JSON.parse(fs.readFileSync('./auth.json', 'utf8'));

const accessHIwikiHeaders = {
  'Accept-Charset': 'utf-8',
  'Connection': 'Keep-Alive'
  // 'Keep-Alive': 'timeout=5, max=1000'
};

const accessHIwikiOptions = {
  url: "https://www.hi.is.kit.ac.jp/pukiwiki/index.php",
  method: "POST",
  auth: {
    user: authdata["name"],
    pass: authdata["pass"]
  },
  headers: accessHIwikiHeaders,
  transform: function (body, response, resolveWithFullResponse) {
    const parser = cheerio.load(body);
    return parser;
  }
};

module.exports = class accessHIwiki {
  constructor() {
    this.username = null;
    this.time = null;
    this.cookie = null;
  }

  async searchSemilog(keyword) {
    let optionsToSearch = Object.assign({}, accessHIwikiOptions);
    optionsToSearch.qs =  {cmd: 'search'};
    optionsToSearch.form = {word: keyword};

    let searchParser = await request(optionsToSearch);
    const semilogArray = [];
    const links = searchParser('li').children();
    for(let i = 0; i < links.length; i++) {
      const page = (links[i]).children[0].data;
      const url = (links[i]).attribs.href;

      if(page.match(semilogPattern)) {
        const semiDate = moment(page, ['YYYY/MM/DD', 'YYYY/MM/D', 'YYYY/M/DD', 'YYYY/M/D']);
        let text = String(semiDate.get('year')) + '年';
        text += String(semiDate.get('month') + 1) + '月';
        text += String(semiDate.get('date')) + '日のゼミログ。';

        let optionsToRead = Object.assign({}, accessHIwikiOptions);
        optionsToRead.url = url;

        const semilogParser = await request(optionsToRead);
        const sentenses = semilogParser('div[id=body]').children();
        for(let j = 0; j < sentenses.length; j++) {
          if(await isIncludingStrong(sentenses[j])) {
            text += await writeText(sentenses[j]);
          }
        }
        text = text.replace('\n', '。');
        semilogArray.push({date: semiDate, text: text});
        if(semilogArray.length > 3){
            break;
        }
      }
    }

    semilogArray.sort(function(semi1, semi2) {
      return (semi1.date.isBefore(semi2.date)) ? 1 : -1;
    });

    return semilogArray;
  }

  async confirmReservation(timeSection) {
    const optionsToReserve = Object.assign({}, accessHIwikiOptions);
    optionsToReserve.qs = {cmd: 'edit', page: ''};

    const start = moment(timeSection.start);
    const end = moment(timeSection.end);

    const reservationList = [];
    for(let t = start; t.diff(end, 'minutes') <= 0; t.add(1, 'd')) {
      optionsToReserve.qs.page = 'FrontPage/' + t.format('YYYY-MM-DD');

      const calParser = await request(optionsToReserve);
      const textArea = String(calParser('textarea[name=msg]').text());
      const schedList = textArea.split('*');

      for(let i = 1; i < schedList.length; i++){
        if(schedList[i].match(/8-509/gu)) {
          let schedTime = acquireTimeSection(schedList[i], t);
          if (schedTime) {
            const schedContent = acquireContent(schedList[i]);
            reservationList.push({time: schedTime, content: schedContent});
          }
        }
      }
    }

    return reservationList;
  }

  async reserveMeetingRoom(date, text) {
    const optionsToReserve = Object.assign({}, accessHIwikiOptions);
    optionsToReserve.qs = {cmd: 'edit', page: 'FrontPage/'};
    optionsToReserve.qs.page += date.format('YYYY-MM-DD');

    const parser = await request(optionsToReserve);
    let textArea = String(parser('textarea[name=msg]').text());
    textArea += text;

    optionsToReserve.form = {'msg': textArea};
    await request(optionsToReserve);
  }
}

var isIncludingStrong = async function(child) {
  if(child.type === 'tag' && child.name === 'strong'){
    return true;
  }

  else if(child.children) {
    const result = await Promise.all(child.children.map(async (v) => {
      return await isIncludingStrong(v);
    }));
    if(result.indexOf(true) >= 0){
      return true;
    } else{
      return false;
    }
  }
  return false;
}

var writeText = async function(child) {
  let text = '';
  if(child.name === 'div') {
    return await text;
  }

  if(child.children) {
    for(let i = 0; i < child.children.length; i++){
      text += await writeText(child.children[i]);
    }
  } else {
    if(child.type === 'text') {
      text += await returnText(child);
    }
  }
  return text;
}

var returnText = async function(tag) {
  return tag.data;
}

var acquireTimeSection = function(text, reserveDay) {
  const timePattern = /\d{1,2}:\d{2}/gu;
  const reservationTime = text.match(timePattern);
  if(reservationTime){
    const formattedMoment = reserveDay.format('YYYY-MM-DD');
    const formattedStart = formattedMoment + ' ' + reservationTime[0];
    const formattedEnd = formattedMoment + ' ' + reservationTime[1];

    const start = moment(formattedStart, 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD H:mm');
    const end = moment(formattedEnd, 'YYYY-MM-DD HH:mm', 'YYYY-MM-DD H:mm');

    return {start: start, end: end};
  }
  else{
    return null;
  }
}

var acquireContent = function(text) {
  text = text.replace(/8-509/gu, '');
  text = text.replace(/\d{1,2}:\d{2}-\d{1,2}:\d{2}/gu, '');
  text = text.replace(/\[#.*\]/gu, '');
  text = text.replace('\n', '。');
  return text;
}

var test = async function() {
  const accessHIwiki = require('.\\access_HIwiki.js');
  let wikiEditor = new accessHIwiki();

  const timeSection = {start: moment('2019-01-08'), end: moment('2019-01-08')};
  const reservationList = await wikiEditor.reserveMeetingRoom(timeSection);
  for(let i = 0; i < reservationList.length; i++){
    console.log(reservationList[i].time.start.format('YYYY-MM-DD HH:mm'));
    console.log(reservationList[i].time.end.format('YYYY-MM-DD HH:mm'));
    console.log(reservationList[i].content);
  }
}

if(require.main === module) {
  test();
}
