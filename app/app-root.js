const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");

function navigateToHome(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "home-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}


function navigateToSearch(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "search-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}

exports.navigateToLogin = function(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "login-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}

exports.navigateToRecord = function(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "recordshot-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}

exports.navigateToProfile = function(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "profile-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}

exports.navigateToSaved = function(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "viewshots-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}

exports.navigateToHome = navigateToHome;
exports.navigateToSearch = navigateToSearch;