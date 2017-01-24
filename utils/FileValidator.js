
var mime = require('mime-magic');
var config = require('../config.json');

var FileValidator = function () {

    return {
        check: check
    }

    /**
     * Check mime type
     * {filePath} absolute file path
     */
    function check(filePath) {
        return new Promise((resolve, reject) => {
            mime(filePath, function (err, type) {
                if (err) {
                    console.error("ERROR : ", err.message);
                    reject({ message: 'bad file type' });
                } else {
                    if (type.match(new RegExp(config.SETTINGS.FILE_VALIDATION_REG, 'g'))) {
                        resolve(true);
                    } else {
                        reject({ message: 'bad file type' });
                    }
                }
            });
        });
    }
}

module.exports = FileValidator();