angular.module("app", ["chart.js"])
  // Optional configuration
  .config(['ChartJsProvider', function (ChartJsProvider) {
    // Configure all charts
    ChartJsProvider.setOptions({
      colours: ['rgba(47, 132, 71, 0.8)', 'rgba(47, 132, 71, 0.8)'],
      responsive: true
    });
    // Configure all line charts
    ChartJsProvider.setOptions('Line', {
      datasetFill: false
    });
  }])
  .controller("LineCtrl", ['$scope', '$timeout','$http', function ($scope, $timeout,$http) {


    $scope.GetAllCounts = function(){

        $http.get('/api/GetCounts').success(function(response){
        console.log(response);
        $scope.Counts = response;
        $scope.OrderStats = response.OrderStats;
        $scope.Jan=0;$scope.Feb=0;$scope.Mar=0;$scope.Apr=0;$scope.May=0;$scope.Jun=0;$scope.Jul=0;
        $scope.Aug=0;$scope.Sep=0;$scope.Oct=0;$scope.Nov=0;$scope.Dec=0;
        for(var i=0;i<$scope.OrderStats.length;i++)
        {
          if($scope.OrderStats[i].Month=="January")
          {
            $scope.Jan = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="February") {
            $scope.Feb = $scope.OrderStats[i].counts;
          } else if ($scope.OrderStats[i].Month=="March") {
            $scope.Mar = $scope.OrderStats[i].counts;
          } else if ($scope.OrderStats[i].Month=="April") {
            $scope.Apr = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="May") {
            $scope.May = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="June") {
            $scope.Jun = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="July") {
            $scope.Jul = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="August") {
            $scope.Aug = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="September") {
            $scope.Sep = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="October") {
            $scope.Oct = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="November") {
            $scope.Nov = $scope.OrderStats[i].counts;
          }else if ($scope.OrderStats[i].Month=="December") {
            $scope.Dec = $scope.OrderStats[i].counts;
          }
        }
        $scope.labels = ["January", "February", "March", "April", "May", "June", "July","August","September","October","November","December"];
        $scope.series = ['Orders'];
        $scope.data = [
          [$scope.Jan, $scope.Feb, $scope.Mar, $scope.Apr, $scope.May, $scope.Jun, $scope.Jul,$scope.Aug,$scope.Sep,$scope.Oct,$scope.Nov,$scope.Dec]
        ];
        });

    };
    $scope.GetAllCounts();


  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  // Simulate async data update
  // $timeout(function () {
  //   $scope.data = [
  //     [28, 48, 40, 19, 86, 27, 90,45,75,89,45,16]
  //   ];
  // }, 3000);



}]);
