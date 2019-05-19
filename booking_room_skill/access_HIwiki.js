const request = require('request-promise');
const iconvLite = require('iconv-lite');
const fs = require('fs');

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
        res = response;
      })
      .catch(function (err) {
        console.log(err.statusCode);
        throw err;
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
      method: "POST",
      auth: {
        user: authdata["name"],
        pass: authdata["pass"]
      },
      json: true,
      headers: headers,
      transform: function (body, response, resolveWithFullResponse) {
        return response;
      }
    };

    let res = await accessHIwiki.HIwikiResponse(options);
    return res;
  }
};
