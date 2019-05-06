﻿const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");
var observable = require("data/observable").Observable;
const appSettings = require("application-settings");


exports.onNavigatingTo = function(args){
    var viewModel = new observable();
    page = args.object;
    viewModel.set("imageUri", "folder.png");
    var loggedIn = appSettings.getString("tokenAccess") ? true : false;
    viewModel.set("loggedIn", loggedIn);
    page.bindingContext = viewModel;
}

function navigateToSearch(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("search-page");
}

function navigateToRecord(args) {
    // const button = args.object;
    // const page = button.page;
    // page.frame.navigate("videocamera-page");
    var navigationOptions={
        moduleName:'videocamera-page',
        backstackVisible: false
    }
    
    frameModule.topmost().navigate(navigationOptions);
}

function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.navigateToProfile = function (args) {
    if (appSettings.getString("tokenAccess")) {
        const button = args.object;
        const page = button.page;
        var navigationOptions = {
            moduleName: 'profile-page',
            context: {
                isSelf: true
            }
        };
        page.frame.navigate(navigationOptions);
    }
}

exports.navigateToShots = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("viewshots-page");
}

exports.navigateToTest = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("test-page");
}

exports.navigateToSearch = navigateToSearch;
exports.navigateToRecord = navigateToRecord;
exports.onDrawerButtonTap = onDrawerButtonTap;