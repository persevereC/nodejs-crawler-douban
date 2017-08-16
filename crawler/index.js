"use strict";

// 引入模块
var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

// 爬虫的UR L信息
var opt = {
  hostname: 'www.cnblogs.com',
  path: '',
  port: 80
};

// 创建http get请求
http.get(opt, function(res) {
  var html = ''; // 保存抓取到的HTML源码
  var blogs = []; // 保存解析HTML后的数据，即我们需要的电影信息

  // 前面说过
  // res 是 Class: http.IncomingMessage 的一个实例
  // 而 http.IncomingMessage 实现了 stream.Readable 接口
  // 所以 http.IncomingMessage 也有 stream.Readable 的事件和方法
  // 比如 Event: 'data', Event: 'end', readable.setEncoding() 等

  // 设置编码
  res.setEncoding('utf-8');

  // 抓取页面内容
  res.on('data', function(chunk) {
    html += chunk;
  });

  res.on('end', function() {
    // 使用 cheerio 加载抓取到的HTML代码
    // 然后就可以使用 jQuery 的方法了
    // 比如获取某个class：$('.className')
    // 这样就能获取所有这个class包含的内容
    var $ = cheerio.load(html);

    // 解析页面
    // 每篇文章都在 item class 中
    $('#post_list .post_item .post_item_body').each(function() {
      // 获取图片链接
      var blog = {
        title: $('.post_item_body .titlelnk', this).text(), // 获取文章标题
        titleUrl: $('.post_item_body a', this).attr('href'), //文章链接地址
        peopleUrl: $('.post_item_summary a', this).attr('href'), // 博客地址
        peopleImg: $('.post_item_summary img', this).attr('src'),// 园友头像
        intro: $('.post_item_summary', this).text(), // 获取文章简介
        name: $('.post_item_foot .lightblue', this).text() // 获取文章简介
      };

      // 把所有文章放在一个数组里面
      blogs.push(blog);
      if (blog.peopleImg) {// 如果有图片则下载图片
        downloadImg('img/', 'http:' + blog.peopleImg);
      }
    });

    // 保存抓取到的文章数据
    saveData('data/data.json', blogs);
  });
}).on('error', function(err) {
  console.log(err);
});


/**
 * 保存数据到本地
 *
 * @param {string} path 保存数据的文件
 * @param {array} blogs 文章信息数组
 */
function saveData(path, blogs) {
  // 调用 fs.writeFile 方法保存数据到本地
  fs.writeFile(path, JSON.stringify(blogs, null, 4), function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('Data saved');
  });
}

/**
 * 下载图片
 *
 * @param {string} imgDir 存放图片的文件夹
 * @param {string} url 图片的URL地址
 */
function downloadImg(imgDir, url) {
  http.get(url, function(res) {
    var data = '';

    res.setEncoding('binary');

    res.on('data', function(chunk) {
      data += chunk;
    });

    res.on('end', function() {
      // 调用 fs.writeFile 方法保存图片到本地
      fs.writeFile(imgDir + path.basename(url), data, 'binary',
        function(err) {
          if (err) {
            return console.log(err);
          }
          console.log('Image downloaded: ', path.basename(url));
        });
    });
  }).on('error', function(err) {
    console.log(err);
  });
}