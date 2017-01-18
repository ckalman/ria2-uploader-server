let request = require('request');
const querystring = require('querystring');
const config = require('../config.json');
var uploadcare = require('../node_modules/uploadcare/lib/main')(config.UPLOAD.PUBLIC_KEY, config.UPLOAD.SECRET_KEY);
var fs = require('fs');

var Uploader = function () {

    return {
        upload,
        info,
    }

    function upload(fileName, name) {
        return new Promise(function (resolve, reject) {
            uploadcare.file.upload(fs.createReadStream(filePath), { filename: name }, function (err, res) {
                if (res) {
                    reslove(res.file);
                } else {
                    reject(err);
                }
            });
        });
    }

    function info(uuid) {
        return new Promise(function (resolve, reject) {
            uploadcare.files.info(uuid, function (err, res) {
                if (res) {
                    resolve(res);
                } else {
                    reject(err);
                }
            });
        });

    }
}

module.exports = Uploader();