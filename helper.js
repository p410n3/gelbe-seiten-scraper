// Helper class with helper methods
const axios = require('axios');

class Helper {
    static getCityLink(strCityName) {
        return axios("https://gscms.gelbeseiten.de/citypages/search?query=" + encodeURI(strCityName), {
          "headers": {
            "accept": "application/json",
            "accept-language": "en-US,en;q=0.9,de;q=0.8",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
          },
          "referrer": "https://www.gelbeseiten.de/",
          "referrerPolicy": "origin-when-cross-origin",
          "body": null,
          "method": "GET",
          "mode": "cors"
        }).then(res => {
            return res.data[0].link;
        });
    }
}

module.exports = Helper;
