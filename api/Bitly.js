let request = require('request');
const querystring = require('querystring');

const config = require('../config.json');

var Bitly = function(){
    let api = 'https://api-ssl.bitly.com/v3/';
    const ACCESS_TOKEN = config.BITLY.OAUTH_TOKEN;

    function shorten(longUrl){
        let url = generateShortenUrlRequest(longUrl);        
        return new Promise((resolve, reject) =>{            
            request(url, function(error, response, body){
                if(error){
                    reject(error);
                }
                console.log("success : ", response);
                resolve(response);
            });        
        });
    }

    function generateShortenUrlRequest(longUrl){
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            longUrl: longUrl
        });
        return api + '/shorten?' + params;
    }

    return{
        shorten:shorten
    }
}

module.exports = Bitly();