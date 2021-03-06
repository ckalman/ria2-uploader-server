let request = require('request');
const querystring = require('querystring');
const config = require('../config.json');
var uploadcare = require('../node_modules/uploadcare/lib/main')(config.UPLOAD.PUBLIC_KEY, config.UPLOAD.SECRET_KEY);
var fs = require('fs');


var Uploader = function () {

    return {
        upload,
        info,
        remove
    }

    /**
     * Upload the file
     * {originalName} Original file name, this will be show to the final user.
     * {filePath} Physical file path
     */
    function upload(filePath, originalName) {
        return new Promise(function (resolve, reject) {
            uploadcare.file.upload(fs.createReadStream(filePath), { filename: originalName }, function (err, res) {
                if (res) {
                    resolve(res.file);
                } else {
                    console.error("Error : ", err);
                    reject({ message: 'Invalid upload file' });
                }
            });
        });
    }

    /**
     * Retrive some info like uuid (unique id), where the image / file are deployed, size ...
     */
    function info(uuid, originalName) {
        return new Promise(function (resolve, reject) {
            uploadcare.files.info(uuid, function (err, res) {
                if (res) {
                    // Workaround de l’api : Lorsque je veux récupérer les informations 
                    // pour un upload réussit. Il peux arriver dans certains cas que 
                    // je ne reçois pas les infos. 
                    // Cependant le fichier et bien uploader. 
                    // Dans ce cas je simule la réponse du serveurs.
                    if (!res.original_file_url) {
                        resolve({
                            original_file_url: `https://ucarecdn.com/${uuid}/${originalName}`,
                            uuid: uuid
                        });
                    } else {
                        resolve(res);
                    }
                } else {
                    reject(err);

                }
            });
        });
    }
    
    /**
     * Remove the image from the account
     * BUG: L’image et bien supprimée de mon compte d’upload. 
     * Cependant on peux toujours y accéder via le liens. 
     * j’ignore si il s’agit d’un bug ou si cela nécessite du temps pour être réelement supprimé.
     */
    function remove(uuid) {
        return new Promise(function (resolve, reject) {
            uploadcare.files.remove(uuid, function (err, res) {
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