var http = require("http");
var cheerio = require("cheerio");
var $;
var movieInfoArr = [];

function HTMLHandler(url, callback) {
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
	this.pageNum = 0;
	this.movieCollection = [];
}

User.prototype.init = function(callback) {
	var url = "http://movie.douban.com/people/" + this.id + "/collect";
	var me = this;
	HTMLHandler(url, function(html) {
		$ = cheerio.load(html);
        $(".item").each(function(i, element) {
        	var elem = $(element);
        	var obj = {};
        	obj.id = elem.find(".info li.title > a").attr("href").match(/\d+/)[0];
        	obj.date = elem.find(".info span.date").html();
        	var rateDom = elem.find(".info span.date").prev();
        	if(rateDom.attr("class")) {
        		obj.rate = parseInt(rateDom.attr("class").match(/\d/)[0], 10);
        	}else{
        		obj.rate = -1;
        	}
        	me.movieCollection.push(obj);
        });
        callback();
	});
};

var test = new User("ming33");

test.init(function(){
	console.log(test.movieCollection)
});

// var url = "http://movie.douban.com/people/ming33/collect";
// http.get(url, function(res){
// 	var source = "";
        
//     res.on('data', function(data) {
//         source += data;
//     });
    
//     res.on('end', function() {
//         $ = cheerio.load(source);
//         $(".item").each(function(i, element) {
//         	var elem = $(element);
//         	var obj = {};
//         	obj.id = elem.find(".info li.title > a").attr("href").match(/\d+/)[0];
//         	obj.date = elem.find(".info span.date").html();
//         	var rateDom = elem.find(".info span.date").prev();
//         	if(rateDom.attr("class")) {
//         		obj.rate = parseInt(rateDom.attr("class").match(/\d/)[0], 10);
//         	}else{
//         		obj.rate = -1;
//         	}
//         	movieInfoArr.push(obj);
//         });
//     });

// })

