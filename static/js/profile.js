var app = angular.module("profilePage", ["ngCookies", "angular-md5", "ngAnimate"]);

app.controller("profilePageController", ["$scope", "$http", "$window", "$cookies", "md5", function($scope, $http, $window, $cookies, md5) {

	$(".loginInput")[0].focus();
	$("body").keydown(function(e) {
		if(e.keyCode === 13) $scope.checkAccount(false);
	});
	$scope.checkAccount = function(newUser) {
		if(!$scope.inputs.username || !$scope.inputs.password || (newUser && !$scope.inputs.email)) {
			alert("Please enter a Password");
			return;
		}
		var params;
		if(newUser) {
			params = {
				action: "addProfile",
				username: $scope.inputs.username,
				email: $scope.inputs.email,
				password: md5.createHash($scope.inputs.password)
			};
		} else {
			params = {
				action: "checkProfile",
				emailOrUsername: $scope.inputs.username,
				password: md5.createHash($scope.inputs.password)
			};
		}
		$http.get("profileManager", { params: params }).then(function(res) {
			if (res.data.success) window.location.href = "main.html";
			else alert("Incorrect Username/Password");
		}, function() {
			// failure
		});
	};

	$scope.changePassword = function() {
		if(md5.createHash($scope.oldPassword) === $cookies.get("password")) {
			console.log("yo im here");
			var params = {
				action: "changePassword",
				username: $cookies.get("username"),
				password: md5.createHash($scope.newPassword)
			};
			//console.log(params);
			$http.get("profileManager", { params: params }).then(function(res) {
				//success
				if(res.data.passwordOk) {
					window.location.href = "myPage.html";
					console.log("going back");
				}

			}, function() {
				// failure
			});
		}
	};
	$scope.backToMainPage = function() {
		window.location.href = "myPage.html";
	};



}]);
