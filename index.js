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
if(fs.existsSync('./cache/' + args[0] + '.json')) {
    lg('List of Businesses found on Disk. Skipping download.');
} else {
    lg('Downloading list of Businesses...');
    getLinksOfBusinesses(args[0]).then(arrLinks => {
        fs.writeFile('./cache/' + args[0] + '.json', JSON.stringify(arrLinks), () => {
            lg('File written');
        });
    });
}

// Functions go down here
function getLinksOfBusinesses(nameOfCity) {
    let arrLinks = [];

    return new Promise(resolve => {
        helper.getCityLink(nameOfCity).then(link => {
            return gelbeSeitenUrl + link + '/unternehmen/';  
        }).then(url => {
            Promise.all([...alphabet].map(c => {
                return axios.get(url + c + '?page=1');
            })).then(array => {
                array.map(res => {
                    let $ = cheerio.load(res.data);
                    let links = $('a.link');

                    for(let i = 0; i < links.length; i++) {
                        arrLinks.push(links[0].attribs.href);
                    } 

                    resolve(arrLinks);
                });
            })
        });
    })
}
