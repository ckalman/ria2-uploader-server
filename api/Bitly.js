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

    /**
     * Short the given url.
     * {longUrl} Url to be shorten
     */
    function shorten(longUrl) {
        let url = shortenUrlRequest(longUrl);
        return req(url);
    }

    /**
     * This is used to return the page title for a given Bitlink.
     * {bitlyUrl} Must be a bitlyUrl
     */
    function info(bitlyUrl) {
        let url = infoUrlRequest(bitlyUrl);
        return req(url);
    }

    /**
     * Returns the number of clicks on a single Bitlink with countries stats.
     * {bitlyUrl} Must be a bitlyUrl
     */
    function numberOfClick(bitlyUrl) {
        let url = numberOfClickUrl(bitlyUrl);
        return req(url);
    }
    /**
     * Returns metrics about the countries referring click traffic to a single Bitlink.
     * {bitlyUrl} Must be a bitlyUrl
     */
    function countries(bitlyUrl) {
        let url = countriesUrl(bitlyUrl);
        return req(url);
    }

    /**
     * Generate and execute the request.
     */
    function req(url) {
        return new Promise((resolve, reject) => {
            request(url, function (error, response, body) {
                if (error) {
                    if (error.code == 'ENOTFOUND') {
                        console.error("BITLY API : ", error);
                        reject({ message: "INTERNET CONNEXION ERROR" });
                    }
                    reject(error);
                }
                if (response != undefined) {
                    var body = JSON.parse(response.body);
                    if (body.status_code == 500) {
                        reject({ message: body.status_txt })
                    }
                    resolve(body);
                }
            });
        });
    }

    function countriesUrl(bitlyUrl) {
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            link: bitlyUrl
        });
        return api + '/link/countries?' + params;
    }

    function numberOfClickUrl(bitlyUrl) {
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            link: bitlyUrl
        });
        return api + '/link/clicks?' + params;
    }

    function infoUrlRequest(bitlyUrl) {
        let params = querystring.stringify({
            access_token: ACCESS_TOKEN,
            shortUrl: bitlyUrl
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