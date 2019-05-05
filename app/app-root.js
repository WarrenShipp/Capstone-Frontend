const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");
const appSettings = require("application-settings");
var observable = require("data/observable");

function onLoaded(args) {
    const page = args.object;
    let viewModel = new observable.Observable();
    if (appSettings.getString("token")) {
        viewModel.set("loggedIn", true);
    } else {
        viewModel.set("loggedIn", false);
    }
    page.bindingContext = viewModel;
}
exports.onLoaded = onLoaded;

function navigateToHome(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "home-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}
exports.navigateToHome = navigateToHome;


function navigateToSearch(args) {
    if (appSettings.getString("token")) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "search-page",
            clearHistory: true
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToSearch = navigateToSearch;

function navigateToLogin(args) {
    if (!appSettings.getString("token")) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "login-page",
            clearHistory: true
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToLogin = navigateToLogin;

exports.navigateToRecord = function(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "recordshot-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}

function navigateToProfile(args) {
    if (appSettings.getString("token")) {
        const sideDrawer = app.getRootView();
        const featuredFrame = frameModule.getFrameById("root");
        featuredFrame.navigate({
            moduleName: "profile-page",
            clearHistory: true
        });
        sideDrawer.closeDrawer();
    }
}
exports.navigateToProfile = navigateToProfile;

function navigateToSaved(args) {
    const sideDrawer = app.getRootView();
    const featuredFrame = frameModule.getFrameById("root");
    featuredFrame.navigate({
        moduleName: "viewshots-page",
        clearHistory: true
    });
    sideDrawer.closeDrawer();
}
exports.navigateToSaved = navigateToSaved;

function logout(args) {
    appSettings.remove("token");
    appSettings.remove("userId");
    console.log("Logged out.");
    console.log("Token = " + appSettings.getString("token"));
    // onLoaded(args);
    navigateToHome(args);
}
exports.logout = logout;