angular.module("doubanStat", [])
.controller("main", function($scope, $http) {
	
	$scope.submit = function() {
		$http({
			url : "/getMoviesCollection.do",
			method : "post",
			cache : false,
			data : {
				id : $scope.doubanId
			}
		}).success(function(data) {
			$scope.moviesCollectionData = data;
			var user = new movieStat(data);
			user.drawRatePie('#ratePie');
		});
	}
})

var movieStat = function(data) {
	this.data = data;
}

movieStat.prototype.getRateStat = function() {
	var arr = [];
	$.each(this.data, function(index, value){
		if(!arr[value.rate]) arr[value.rate] = 0;
		arr[value.rate]++;
	});
	console.log(arr)
	return arr;
}

movieStat.prototype.drawRatePie = function(select) {
	var width = 300, height = 300;
	var dataset =this.getRateStat();
	
	var svg = d3.select(select).append("svg").attr("width",width).attr("height",height);
	var pie = d3.layout.pie();
	
	var outerRadius = width / 2;
	var innerRadius = width / 4;
	var arc = d3.svg.arc()
					.innerRadius(innerRadius)
					.outerRadius(outerRadius);
	
	var color = d3.scale.category10();
	
	var arcs = svg.selectAll("g")
				  .data(pie(dataset))
				  .enter()
				  .append("g")
				  .attr("transform","translate("+outerRadius+","+outerRadius+")");
				  
	arcs.append("path")
		.attr("fill",function(d,i){
			return color(i);
		})
		.attr("d",function(d){
			return arc(d);
		});
	
	arcs.append("text")
		.attr("transform",function(d){
			return "translate(" + arc.centroid(d) + ")";
		})
		.attr("text-anchor","middle")
		.text(function(d,i) {
			if(i == 0) return '未评分';
			else return i+'星';
		});

}