
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
var config = require('../config.json');

var FileValidator = function () {

    return {
        check: check
    }

    function check(filePath) {
        var magic = new Magic(mmm.MAGIC_MIME_TYPE);

        return new Promise((resolve, reject) => {
            magic.detectFile(filePath, function (err, result) {
                if (result) {
                    if (result.match(new RegExp(config.SETTINGS.FILE_VALIDATION_REG, 'g'))){
                        resolve(true);
                    } else {
                        reject({ message: 'bad file type' });
                    }                    
                }else{
                    reject({ message: 'bad file type' });
                }
            });

        });
    }
}

module.exports = FileValidator();