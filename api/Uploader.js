let request = require('request');
const querystring = require('querystring');
const config = require('../config.json');
var uploadcare = require('../node_modules/uploadcare/lib/main')(config.UPLOAD.PUBLIC_KEY, config.UPLOAD.SECRET_KEY);

var Uploader = function () {

}

module.exports = Uploader();