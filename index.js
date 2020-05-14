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

// First we get all the Links to all the Businesses. When that is done we store the list in a JSON in ./cache
if(fs.existsSync('./cache/' + args[0] + '.json')) {
    lg('List of Businesses found on Disk. Delete manually to force a Re-download.');
} else {
    lg('Downloading list of Businesses...');
    getLinksOfBusinesses(args[0]).then(arrLinks => {
        fs.writeFile('./cache/' + args[0] + '.json', JSON.stringify(arrLinks), () => {
            lg('File written');
        });
    });
}

// Now that this is done we create a folder and download all the Pages in there too. The actual data extraction gets don AFTER that.
if(fs.existsSync('./cache/' + args[0])){
    lg('Cache already written for that City. Delete manually to force a Re-download.');
} else {
    fs.mkdirSync('./cache/' + args[0]);

    // Read the list of Links from the Cache folder into an array
    let links = JSON.parse(fs.readFileSync('./cache/' + args[0] + '.json', 'utf8'));

    links.map(link => {
        axios.get(link)
            .then(res => {
                // TODO file cant be wrotten because of slasghes in the file name FIX THAT
                fs.writeFileSync('./cache/' + args[0] + '/' + link + '.json', res.data);
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
