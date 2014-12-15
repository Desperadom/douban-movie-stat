var http = require("http");
var url = require('url');
var path = require('path');
var cheerio = require("cheerio");
var node_static = require("node-static");

var file = new node_static.Server('./static');
require('http').createServer(function (request, response) {

	var pathname = url.parse(request.url).pathname;
	var ext = path.extname(pathname);

	if(/^.html$|^.css$|^.js$|^.json$|^.xml$|^.ico$/.test(ext.toLowerCase())){
		request.addListener('end', function () {
	        file.serve(request, response);
	    }).resume();
	}else {
		if(request.method == "GET") {
			var query = url.parse(request.url).query;


		}else if(request.method == "POST") {
			var source = "";
			request.on('data', function(chunk) {
                source += chunk;
            }).on("end", function() {
                postData = JSON.parse(source);
                handle(pathname, postData, response);
    
            });
		}
	}
    
}).listen(7000);

function handle(pathname, data, response) {
	var returnData = {};
	if(pathname === "/getMoviesCollection.do") {
		var currentUser = new User(data.id);
		currentUser.init(function() {
			returnData = currentUser.movieCollection;
			console.log(returnData.length)
			handleResponse(response, returnData);
		});
	}

	function handleResponse(response, returnData) {
        response.writeHead(200, {"Content-Type": "application/json"});
		response.write(JSON.stringify(returnData)); 
		response.end();
	}
}



function getHTMLPage(url, callback) {
	http.get(url, function(res) {
		var source = "";
	    res.on('data', function(data) {
	        source += data;
	    });
	    res.on('end', function() {
	        callback(source);
	    });
	});
}

function User(id){
	this.id = id;
	this.totalPage = 0;
	this.movieCollection = [];
}

User.prototype.init = function(callback) {
	var url = "http://movie.douban.com/people/" + this.id + "/collect";
	var me = this;
	var thisYear = new Date().getFullYear();
	var count = 0;
	var thisYearFlag = true;
	getHTMLPage(url, function(html) {
		count++;
		var $ = cheerio.load(html);
		me.totalPage = parseInt($(".paginator > .thispage").attr("data-total-page"), 10);
		handleDom($);
		goCircle(1, 5);
	});

	function goCircle(i, needle) {
		for(; i < needle; i++) {

			(function(i){
				console.log("goCircle : " + i);
				var start = i*15;
				getHTMLPage(url + "?start=" + start, function(html) {
					count++;
					var flag = handleDom(cheerio.load(html));
					if(i == needle-1 && !flag) {
						thisYearFlag = false;
					}

					if(count === needle) {
						if(thisYearFlag) {
							needle += 5;
							goCircle(count, needle);
						}else {
							//finish
							// console.log(me.movieCollection)
							// console.log("total: " + me.movieCollection.length)
							callback();
						}
					}
				});
			})(i);
		}
	}

	function handleDom($) {
        var items = $(".item");
        var flag = true;
        for(var i = 0; i < items.length; i++) {
        	var elem = items.eq(i);
        	var obj = {};
        	obj.id = elem.find(".info li.title > a").attr("href").match(/\d+/)[0];
        	obj.img = elem.find(".pic a > img").attr("src");
        	obj.title = elem.find(".pic a").attr("title");
        	obj.date = elem.find(".info span.date").html();
        	        	
        	if(!new RegExp(thisYear).test(obj.date)){
        		flag = false;
        		break;
        	}
        	
        	var rateDom = elem.find(".info span.date").prev();
        	if(rateDom.attr("class")) {
        		obj.rate = parseInt(rateDom.attr("class").match(/\d/)[0], 10);
        	}else{
        		obj.rate = -1;
        	}
        	me.movieCollection.push(obj);
        }

        return flag;
	}
};




