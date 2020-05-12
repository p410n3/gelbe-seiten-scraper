'use strict'

// Require stuff
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const helper = require('./helper');

// console.log takes too long
let lg = console.log;

// Globals
const gelbeSeitenUrl = 'https://www.gelbeseiten.de';
const alphabet = 'abcdefghijklmnopqrstuvwxyz';

let args = process.argv.slice(2);

if(!args[0]) {
    lg('Enter the name of the city as an CLI argument');
    process.exit();
} 

// Calling most of the stuff here
getLinksOfBusinesses(args[0]).then(arrLinks => {
    fs.writeFile(args[0] + '.json', JSON.stringify(arrLinks), () => {
        lg('File written');
    });
});

// Functions go down here
function getLinksOfBusinesses(nameOfCity) {
    return new Promise(resolve => {
        helper.getCityLink(nameOfCity).then(link => {
            return gelbeSeitenUrl + link + '/unternehmen/';  
        }).then(url => {
            [...alphabet].map(c => {
                axios.get(url + c + '?page=1').then(res => {
                    let $ = cheerio.load(res.data);
                    let links = $('a.link');

                    let arrLinks = [];

                    for(let i = 0; i < links.length; i++) {
                        arrLinks.push(links[0].attribs.href);
                    } 

                    resolve(arrLinks);
                }).catch(e => {});
            });
        });
    })
}

