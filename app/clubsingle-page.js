var frameModule = require("ui/frame");
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var pages = require("ui/page");
var viewModel = observable.Observable;

var videoPlayer = require("nativescript-videoplayer");

var observableModule = require("data/observable");

const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
var gotData;


exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.record_shot = function(args) {
	console.log("pageLoaded");
    var sendToken = appSettings.getString("token");
        
	var page = args.object;
    viewModel = new observable.Observable();
    page.bindingContext = viewModel;
    gotData=page.navigationContext;
    var clubId = gotData.id;
    console.log(clubId);
    var clubUrl = "https://cricket.kinross.co/club/" + clubId;
    http.request({
        url: clubUrl,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function(result) {
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content.name);
        clubDetails(obj.content);
    }, function(error) {
        console.error(JSON.stringify(error));
    });

    
};

function clubDetails(data){
    console.log(data.suburb);
    viewModel.set("name", data.name);
    viewModel.set("phone", data.phone_number);
    viewModel.set("suburb", data.suburb);
    viewModel.set("country", data.country);
}

exports.navigateToEditClub = function(args){
    var navigationOptions={
        moduleName:'clubedit-page',
        context:{id: gotData.id}
    }
    frameModule.topmost().navigate(navigationOptions);
}
