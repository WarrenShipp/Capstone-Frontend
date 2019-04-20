var frameModule = require("ui/frame");
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var pages = require("ui/page");
var viewModel = observable.Observable;
var videoPlayer = require("nativescript-videoplayer");

var observableModule = require("data/observable");

const app = require("tns-core-modules/application");

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.record_shot = function(args) {
	console.log("pageLoaded");
	var searchType = [
		"Player1",
        "Player2",
        "Player3"
        ];

        var clubType = [
            "Club1",
            "Club2",
            "Club3"
            ];    
        
	var page = args.object;
	viewModel = new observable.Observable();

    viewModel.set("searchTypes", searchType);
    console.log(viewModel.get("searchTypes"));
    viewModel.set("typeIndex", 0);

    viewModel.set("clubTypes", clubType);
    console.log(viewModel.get("clubTypes"));
    viewModel.set("typeIndex", 0);
    page.bindingContext = viewModel;
};

exports.dropDownSelectedIndexChanged = function(){
	console.log("dropDownSelectedIndexChanged");
};

exports.dropDownOpened = function(){
	console.log("dropDownOpened");
};

