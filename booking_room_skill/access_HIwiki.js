const request = require('request-promise');
// const SyncRequest = require('sync-request');
// const request = require('then-request');
// var FormData = require('then-request').FormData;
const iconvLite = require('iconv-lite');
const fs = require('fs');

// console.log(Object.getOwnPropertyNames(request));
// console.dir(request);
// console.log(request.length);
// console.log(request.name);
// console.log(request.prototype);
// console.log(request.default);
// console.log(request.FormData);
// async function HIwikiResponse(){
//
// }

module.exports = class accessHIwiki {
  constructor(username, time) {
    this.username = username;
    this.time = time;
    this.headers = null;
    // self = this;
  }

  static async HIwikiResponse(options) {
    let res = null;
    await request(options)
      .then(function (response) {
        // console.log(self);
        res = response;
      })
      .catch(function (err) {
        console.log(err.statusCode);
        res = err;
      });

    return res;
  }

  async reserve() {
    const authdata = JSON.parse(fs.readFileSync('./auth.json', 'utf8'));
    const headers = {
      'Accept-Charset': 'utf-8',
    };

    const options = {
      url: "https://www.hi.is.kit.ac.jp/pukiwiki/",
      // url: "https://www.google.com/",
      method: "POST",
      auth: {
        user: authdata["name"],
        pass: authdata["pass"]
      },
      json: true,
      headers: headers,
      // resolveWithFullResponse: true
      transform: function (body, response, resolveWithFullResponse) {
        return response;
      }
    };

    let res = await accessHIwiki.HIwikiResponse(options);
    //this.headers = res.headers;
    // this.headers = res.headers;
    return res;
    // console.log('request');
    //console.log(this.headers);
    //return this.headers;
  }
};

// module.exports.accessHIwiki = new accessHIwiki('kit', 'kit');

// const HIwiki  = new accessHIwiki('kit', 'kit');
// HIwiki.reserve()
//   .then(function (res) {
//     console.log(res.headers);
//   })
//   .catch(function (err) {
//     console.log(err.statusCode);
//   });


// function AcquireCharset(headers) {
//   const ContentType = headers['content-type'];
//
//   const charsetList = ContentType.match(/charset=([A-Za-z0-9_\-])*/g);
//   const charset = charsetList[0].replace('charset=', '');
//   return charset;
// }
// authdata =  String(iconvLite.encode(authdata['username'] + ':' + authdata['password'], 'base64'));
// console.log(authdata);
// const url = 'http://www.hi.is.kit.ac.jp/pukiwiki/';

// var options = {
//   // url: "https://www.hi.is.kit.ac.jp/pukiwiki/",
//   url: "https://www.google.com/?hl=ja",
//   method: "GET",
//   headers: headers,
//   transform: function(body, response, resolveWithFullResponse) {
//     return body.split(''),reserve.
//   }
// };
//
// request(options)
//   .then(function(body) {
//     console.log(body);
//   })
//   .catch(function(err) {
//     console.log(err.statusCode);
//   })

// console.log(result.headers['content-type']);
// const resultCharset = AcquireCharset(result.headers);
// console.log(resultCharset);
// console.log(Object.prototype.toString.call(result.body));
// const body = iconvLite.decode(result.body, resultCharset);
// console.log(body);
// console.log(Object.getOwnPropertyNames(result.headers['content-type']));
