const cheerio = require('cheerio');

const $ = cheerio.load('<div class="main"><p>123</p></div>');

console.log($('.main').html());