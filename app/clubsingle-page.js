// Requirements
var frameModule = require("ui/frame");
var observable = require("data/observable");
const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

// Variables
var gotData;
var viewModel;

/**
 * Opens the Sidedrawer
 */
function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
exports.onDrawerButtonTap = onDrawerButtonTap;


/**
 * Displays club details
 */
exports.pageLoaded = function(args) {
    // todo: finish displaying the members of a club
    console.log("pageLoaded");

    // Get authorisation token
    var sendToken = appSettings.getString(global.tokenAccess);

    // initialise view model    
    var page = args.object;
    viewModel = new observable.Observable();
    page.bindingContext = viewModel;

    // Get club parameters passed on from the list to decide which club to display
    gotData=page.navigationContext;
    var clubId = gotData.id;
    var clubUrl = global.serverUrl + global.endpointClub + clubId;
    // Club Request
    http.request({
        url: clubUrl,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken }
    }).then(function(result) {
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content.name);
        clubDetails(obj.content);
    }, function(error) {
        console.error(JSON.stringify(error));
    });

    
};

/**
 * Displaying club details
 */
function clubDetails(data){
    viewModel.set("name", data.name);
    viewModel.set("imageUri", data.logo);
    viewModel.set("phone", data.phone_number);
    viewModel.set("suburb", data.suburb);
    viewModel.set("country", data.country);
}


/**
 * Goes to the club edit page to allow changing of club details
 */
exports.navigateToEditClub = function(args){
    var navigationOptions={
        moduleName:'clubedit-page',
        context:{id: gotData.id}
    }
    frameModule.topmost().navigate(navigationOptions);
}
