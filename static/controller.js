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
		});
	}
})