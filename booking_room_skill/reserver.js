//var request = require('request');
//const SyncRequest = require('sync-request');
const request = require('then-request');
var FormData = require('then-request').FormData;
const iconvLite = require('iconv-lite');
const fs = require('fs');

// console.log(Object.getOwnPropertyNames(request));
// console.dir(request);
// console.log(request.length);
// console.log(request.name);
// console.log(request.prototype);
// console.log(request.default);
// console.log(request.FormData);

function AcquireCharset(headers) {
  const ContentType = headers['content-type'];

  const charsetList = ContentType.match(/charset=([A-Za-z0-9_\-])*/g);
  const charset = charsetList[0].replace('charset=', '');
  return charset;
}

var authdata = JSON.parse(fs.readFileSync('./auth.json', 'utf8'));
authdata =  String(iconvLite.encode(authdata['username'] + ':' + authdata['password'], 'base64'));
console.log(authdata);
const url = 'http://www.hi.is.kit.ac.jp/pukiwiki/';

const headers = {
  'Accept-Charset': 'utf-8',
  //'Authorization': 'Basic ' + String(iconvLite.encode(authdata['username'] + ':' + authdata['password'], 'base64'))
};

var options = {
  headers: headers
};

request('POST', url, options).done((res) => {
  // console.log(Object.getOwnPropertyNames(res));
  const resultCharset = AcquireCharset(res.headers);
  const body = iconvLite.decode(res.body, resultCharset);
  // console.log(Object.prototype.toString.call(body))
  console.log(res.headers);
});

console.log(request);
// console.log(result.headers['content-type']);
// const resultCharset = AcquireCharset(result.headers);
// console.log(resultCharset);
// console.log(Object.prototype.toString.call(result.body));
// const body = iconvLite.decode(result.body, resultCharset);
// console.log(body);
// console.log(Object.getOwnPropertyNames(result.headers['content-type']));
