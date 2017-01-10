let request = require('request');
const querystring = require('querystring');

const config = require('../config.json');

var Bitly = function () {
    let api = config.BITLY.API_URL;
    const ACCESS_TOKEN = config.BITLY.OAUTH_TOKEN;

    return {
        shorten: shorten,
        info: info,
        numberOfClick: numberOfClick,
        countries: countries
    }

    function shorten(longUrl) {
        let url = shortenUrlRequest(longUrl);
        return request(url);
    }

    function info(bitlyUrl) {
        let url = infoUrlRequest(bitlyUrl);
        return request(url);
    }

    function numberOfClick(bitlyUrl) {
        let url = numberOfClickUrl(bitlyUrl);
        return request(url);
    }

    function countries(bitlyUrl) {
        let url = countriesUrl(bitlyUrl);
        return request(url);
    }

    function request(url) {
        return new Promis((resolve, reject) => {
            request(url, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                resolve(response);
            });
        });
    }

    function countriesUrl(bitlyUrl) {
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            link: bitlyUrl
        });
        return api + '/countries?' + params;
    }

    function numberOfClickUrl(bitlyUrl) {
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            link: bitlyUrl
        });
        return api + '/clicks?' + params;
    }

    function infoUrlRequest(bitlyUrl) {
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            link: bitlyUrl
        });
        return api + '/info?' + params;
    }

    function shortenUrlRequest(longUrl) {
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            longUrl: longUrl
        });
        return api + '/shorten?' + params;
    }    
}

module.exports = Bitly();