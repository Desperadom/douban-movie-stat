var http = require("http");
var cheerio = require("cheerio");

function getHTMLPage(url, callback) {
	console.log(url)
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

User.prototype.init = function() {
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
					// console.log(count)
					var flag = handleDom(cheerio.load(html));
					if(i == needle-1 && !flag) {
						thisYearFlag = false;
					}

					if(count === needle) {
						if(thisYearFlag) {
							needle += 5;
							console.log("i:" + i)
							console.log("needle:" + needle)
							goCircle(count, needle);
						}else {
							//finish
							console.log(me.movieCollection)
							console.log("total: " + me.movieCollection.length)
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



var test = new User("ming33");

test.init();


