var app = angular.module("mainPage", ["ngCookies", "angular-md5"]);

app.controller("mainPageController", ["$scope", "$http", "$window", "$cookies", "md5", "$compile", function($scope, $http, $window, $cookies, md5, $compile) {
	$("#confirmationDialogue").modal();
	$("#inputDialogue").modal();
	$scope.tabClick = function(selectedTab) {
		$scope.tabCurrent = selectedTab;
		$(".headerButton").removeClass("headerButtonSelected");
		$("#" + selectedTab).addClass("headerButtonSelected");

		switch(selectedTab) {
			case "overview":
				break;

			case "marks":
				$scope.subjectSubheaders = [];
				var params = {
					action: "getSubjects",
					username: $cookies.get("username")
				};
				$http.get("subjectMarks", { params: params }).then(function(res) {
					//success
					$scope.subjectSubheaders = res.data;
				}, function() {
					// failure
				});
				break;

			case "about":
				break;
		}
	};

	$scope.tabClick('overview');

	var currentSubjectSerial;

	$scope.getSubjectPage = function(serial, index, overview) {
		currentSubjectSerial = serial;
		$(".subheaderButton").removeClass('selectedSubjectSubheader');
		$("#subjectSubheader" + index).addClass('selectedSubjectSubheader');
		var params = {
			action: "getSubjectMarks",
			username: $cookies.get("username"),
			subject: currentSubjectSerial
		};
		$http.get("subjectMarks", { params: params }).then(function(res) {
			//success
			$scope.marksArray = res.data;
		}, function() {
			// failure
		});
	};

	$scope.editSubjectName = function(index, serial, currentName) {
		console.log("edit mode", index, serial);
		$("#subjectSubheader" + index + " > span").replaceWith("<input class='subjectSubheaderInput' />");
		$(".subjectSubheaderInput").focus();
		$(".subjectSubheaderInput").focusout(function() {
			submitChanges("editSubject");
		});
		$(".subjectSubheaderInput").keydown(function(e) {
			if(e.keyCode === 13) submitChanges("editSubject");
		});
		$("#subjectSubheader" + index + " > i").replaceWith($compile("<i class='material-icons editIcon' ng-click='deleteSubject()'>delete</i>")($scope));
		$scope.deleteSubject = function() {
			submitChanges("removeSubject");
		};
		function submitChanges(action) {
			console.log("DEFOCUS");
			var newSubjectName = $(".subjectSubheaderInput").val() ? $(".subjectSubheaderInput").val() : currentName;
			var params = {
				action: action,
				username: $cookies.get("username"),
				subject: newSubjectName,
				serial: serial
			};
			$http.get("subjectMarks", { params: params }).then(function(res) {
				//success
				$scope.tabClick('marks');
			}, function() {
				// failure
			});
		}
	};

	$scope.addSubjectButton = function() {
		var params = {
			action: "addSubject",
			username: $cookies.get("username"),
			subject: "New Subject"
		};
		$http.get("subjectMarks", { params: params }).then(function(res) {
			//success
			$scope.tabClick('marks');
		}, function() {
			// failure
		});
	};

	$scope.submitMark = function(mark, topic) {
		var params = {
			action: "submitMark",
			username: $cookies.get("username"),
			subject: currentSubjectSerial,
			mark: mark,
			topic: topic
		};
		$http.get("subjectMarks", { params: params }).then(function(res) {
			//success

		}, function() {
			// failure
		});
	};

}]);
