const https = require('https');
const fs = require('fs');
const cheerio = require('cheerio');
var data = [], images = [], pages = [];

for(let i = 0; i < 250; i = i + 25){
	pages.push(i);
};

var p = 0;

getData();
var a = new Date();
function getData(url){
	/*var option = {
		hostname: 'movie.douban.com',
		path: '/top250?start=' + i,
		port: 443
	};*/
	https.get('https://movie.douban.com/top250?start=' + p, (res) => {
		var html = '';
		res.setEncoding = 'utf8';
		res.on('data', (chunk) => {
			html += chunk;
		});
		res.on('end', () => {
			var $ = cheerio.load(html);
			$('.item').each(function() {
				var item = {
					index: $('em', this).text(),
					title: $('.title', this).text(),
					img: $('.pic img', this).attr('src'),
					star: $('.rating_num', this).text(),
					quote: $('.inq', this).text(),
					actor: $('.bd q', this).text()
				};
				data.push(item);
				images.push(item.img);
			})
			p = p + 25;
			
			if(p == 250){
				saveData('./data.json', data);
				downloadImg('./img/', images);
			}else{
				getData();
			}
		});
	}).on('error', (err) => {
		console.error(err);
	});	
}

function saveData(path, data){
	fs.writeFile(path, JSON.stringify(data, null, 4), (err) => {
		if(err) throw err;
		console.log(data.length);
		console.log('data saved');
	})
}

function downloadImg(imgDir, images){
	for(let j = 0; j < images.length; j++){
		https.get(images[j], (res) => {
			var data = '';
			res.setEncoding('binary');
			res.on('data', (chunk) => {
				data += chunk;
			});
			res.on('end', () => {
				fs.writeFile(imgDir + (j+1) +'.jpg', data, 'binary', (err) => {
					if(err) throw err;
					if(j == 249){
						var b = +new Date();
						console.log(b - a);
					}
				});
			});
		}).on('error', (err) => {
			console.error(err);
		})
	};
}