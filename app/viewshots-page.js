const app = require("tns-core-modules/application");
var application = require("application");

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.navigateToSingle = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("singleshot-page");
}