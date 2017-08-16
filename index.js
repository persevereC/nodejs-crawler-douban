"use strict";

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
var data = [];
var images = [];

let j = 0;
var a = +new Date();
for(let i = 0; i < 250; i=i+25){
    if(i == 0){
		var a = new Date();
	}
	++j;
	let opt = {
		hostname: 'movie.douban.com',
		path: '/top250?start='+i,
		port: 443
	};
	getData(opt);
}

function getData(opt){
	https.get(opt, (res) => {
			var html = '';

		    // res 是 Class: http.IncomingMessage 的一个实例
		    // 而 http.IncomingMessage 实现了 stream.Readable 接口
		    // 所以 http.IncomingMessage 也有 stream.Readable 的事件和方法
		    // 比如 Event: 'data', Event: 'end', readable.setEncoding() 等

		    res.setEncoding('utf-8');

		    res.on('data', (chunk) => {
			    html += chunk;
		    });

		    res.on('end', () => {
				var $ = cheerio.load(html);
				$('.item').each(function() {
					var item = {
						index: $('em', this).text(),
						title: $('.title', this).text(), 
						peopleImg: $('.pic img', this).attr('src'),
						star: $('.rating_num', this).text(),
						quote: $('.inq', this).text(),
						actor: $('.bd p', this).text()
				    };
				    data.push(item);
				    images.push(item.peopleImg);
				});
				console.log(data.length);
				if(data.length == 250){
					saveData('./data/data.json', data);
					downloadImg('./img/', images);
				}
		    });
		}).on('error', (err) => {
		    console.log(err);
		});
}

function saveData(path, data) {
    fs.writeFile(path, JSON.stringify(data, null, 4), (err) => {
		if (err) throw err;
        console.log('Data saved');
    });
}

function downloadImg(imgDir, images) {
	for(let x = 0; x < images.length; x++){
        https.get(images[x], (res) => {
	        var data = '';
	        res.setEncoding('binary');
	        res.on('data', (chunk) => {
	            data += chunk;
	        });
	        res.on('end', () => {
				fs.writeFile(imgDir + (x+1) + '.jpg', data, 'binary', (err) => {
					if (err) throw err;
					//console.log('Image downloaded: ', path.basename(url));
					if(x == 249){
						var b = +new Date();
						console.log(b - a);
					}
				});
			});
	    }).on('error', (err) => {
	        console.log(err);
	    });
	}
}