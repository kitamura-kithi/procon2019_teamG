const moment = require('moment-timezone');
moment.tz.setDefault('Asia/Tokyo');

const accessHIwiki = require('./access_HIwiki.js');
const wikiEditor = new accessHIwiki();


module.exports.LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('このスキルではヒューマンインタフェース研究室のwikiにアクセスして、wikiの編集，閲覧を行うことができます。')
      .getResponse();
  },
};

module.exports.HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'このスキルでは、現在ミーティングルームの予約に関する機能と、ゼミログの読み上げ機能が利用可能です。';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

module.exports.CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'しょんぼり。';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

module.exports.SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

module.exports.ReserveRoomIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReserveRoomIntent';
  },
  async handle(handlerInput) {
    let attr = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    if(slots.username.value === undefined || slots.date.value === undefined
    || slots.time.value === undefined || slots.duration.value === undefined
    || slots.purpose.value === undefined) {
        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
    }

    else{
        return reserveMeetingRoom(handlerInput);
    }

  }
}

module.exports.ConfirmReservationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ConfirmReservationIntent';
  },
  async handle(handlerInput) {

    const startTime = moment().startOf('date').add(1, 'days');
    const endTime = moment().startOf('date').add(7, 'days');
    const confirmSection = {start: startTime, end: endTime};

    const reservationList = await wikiEditor.confirmReservation(confirmSection);
    return readReservation(handlerInput, reservationList, confirmSection);
  }
}

module.exports.CanselReservationIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CanselReservationIntent';
  },
  handle(handlerInput) {
    if(handlerInput.requestEnvelope.request.intent.slots === undefined
    || handlerInput.requestEnvelope.request.intent.slots.moment === undefined){
      return handlerInput.responseBuilder
        .speak('ミーティングルームの予約機能を利用する際は、時刻の指定を行う必要があります。')
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak('ミーティングルームの予約を取り消します。日時を指定してください。')
  }
}

module.exports.ReadingSemiLogIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReadingSemiLogIntent'
  },
  async handle(handlerInput) {
    let attrs = handlerInput.attributesManager.getSessionAttributes();
    const slots = handlerInput.requestEnvelope.request.intent.slots;

    if(slots.date.value === undefined){
        return promptSettingKeyword(handlerInput);
    }

    else{
        return handlerInput.responseBuilder
            .speak('よかったね')
            .getResponse();
    }

  }
}

module.exports.ReadingSemiLogIntentHandlerWithKeyword = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ReadingSemiLogIntentWithKeyword'
  },
  async handle(handlerInput) {
    const slots = handlerInput.requestEnvelope.request.intent.slots;
    const dialogState = handlerInput.requestEnvelope.request.dialogState;

    if(dialogState !== 'COMPLETED'){


        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
    }

    else {
      const keyword = slots.keyword.value;

      let searchResult = await wikiEditor.searchSemilog(keyword);

      if(searchResult.length !== 0){
        return readSemilog(handlerInput, searchResult);
      }
      else{
        return reportNothingSemilogs(handlerInput, keyword);
      }
    }
  }
}

function promptSettingKeyword(handlerInput) {
  let attrs = {};
  attrs.sessionState = "promptSettingKeyword";
  handlerInput.attributesManager.setSessionAttributes(attrs);

  return handlerInput.responseBuilder
    .addElicitSlotDirective('keyword', {
        name: 'ReadingSemiLogIntentWithKeyword',
        confirmationStatus: 'NONE',
        slots: {}
    })
    .speak('キーワードを指定してください。')
    .reprompt('キーワードを指定してください。')
    .getResponse();
}

function reportNothingSemilogs(handlerInput, keyword) {
  return handlerInput.responseBuilder
    .speak(keyword + 'を含むゼミログは見つかりませんでした。')
    .getResponse();
}

function readSemilog(handlerInput, semilogList) {
  let speechText = '';

  for(let i = 0; i < semilogList.length; i++){
    speechText += semilogList[i].text;

  }

  return handlerInput.responseBuilder
    .speak(speechText)
    .getResponse();
}

function readReservation(handlerInput, reservationList, confirmSection) {
  let speechText = '';
  speechText += String(confirmSection.start.get('year')) + '年';
  speechText += String(confirmSection.start.get('month') + 1) + '月';
  speechText += String(confirmSection.start.get('date')) + '日から';

  if(confirmSection.start.diff(confirmSection.end, 'years') !== 0){
    speechText += String(confirmSection.end.get('year')) + '年';
  }
  speechText += String(confirmSection.end.get('month') + 1) + '月';
  speechText += String(confirmSection.end.get('date')) + '日までの';

  if(reservationList.length > 0){
    speechText += 'ミーティングルームの予約状況をお知らせします。';
    let prevResvStart = Object.assign({}, confirmSection.start);
    for(let i = 0; i < reservationList.length; i++){
      if(reservationList[i].time.start.diff(prevResvStart, 'years') !== 0){
        speechText += String(reservationList[i].time.start.get('year')) + '年';
      }
      if(reservationList[i].time.start.diff(prevResvStart, 'days') !== 0){
        speechText += String(reservationList[i].time.start.get('month') + 1) + '月';
        speechText += String(reservationList[i].time.start.get('date')) + '日';
      }
      speechText += String(reservationList[i].time.start.get('hour')) + '時';
      speechText += String(reservationList[i].time.start.get('minute')) + '分から';
      speechText += String(reservationList[i].time.end.get('hour')) + '時';
      speechText += String(reservationList[i].time.end.get('minute')) + '分まで';

      speechText += reservationList[i].content;
      prevResvStart = reservationList[i].start;
    }
  }else {
    speechText += 'ミーティングルームの予約はありません。';
  }

  return handlerInput.responseBuilder
    .speak(speechText)
    .getResponse()
}

async function reserveMeetingRoom(handlerInput) {
  const slots = handlerInput.requestEnvelope.request.intent.slots;

  const start =  moment(slots.date.value + '-' + slots.time.value, 'YYYY-MM-DD-HH:mm');
  let duration = slots.duration.value
  duration = ((duration.match(/PT\d*M/))[0].replace('PT', '')).replace('M', '');

  const end = moment(start).add(Number(duration), 'minutes');

  const reservationList = await wikiEditor.confirmReservation({start: start, end: end});

  for(let i = 0; i < reservationList.length; i++){
      if(reservationList[i].time.start.diff(start) * reservationList[i].time.end.diff(start) < 0){
          return handlerInput.responseBuilder
              .speak('すみません、その時間は予約済みの様です。予約を中止しました。')
              .getResponse();
      }
      if(reservationList[i].time.start.diff(end) * reservationList[i].time.end.diff(end) < 0){
          return handlerInput.responseBuilder
              .speak('すみません、その時間は予約済みの様です。予約を中止しました。')
              .getResponse();
      }
  }

  let reserveText = '\n*';
  reserveText += start.format('HH:mm') + '-' + end.format('HH:mm') + ' ';
  reserveText += slots.username.value + '：8-509　' + slots.purpose.value + 'で使用';

  let speechText = '以下の予約に成功しました。' + reserveText;
  speechText += String(start.get('year')) + '年' + String(start.get('month') + 1) + '月' + String(start.get('date')) + '日の'
      + String(start.get('hour')) + '時' + String(start.get('minute')) + '分から'
      + String(end.get('hour')) + '時' + String(end.get('minute')) + '分まで';


  return handlerInput.responseBuilder
    .speak(speechText)
    .getResponse();
}
