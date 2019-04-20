const frameModule = require("tns-core-modules/ui/frame");
const app = require("tns-core-modules/application");

function navigateToSearch(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("search-page");
}

function navigateToRecord(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("recordshot-page");
}

function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.navigateToProfile = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("profile-page");
}

exports.navigateToShots = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("viewshots-page");
}

exports.navigateToSearch = navigateToSearch;
exports.navigateToRecord = navigateToRecord;
exports.onDrawerButtonTap = onDrawerButtonTap;