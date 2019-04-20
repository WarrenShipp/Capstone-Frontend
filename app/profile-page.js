const app = require("tns-core-modules/application");
var application = require("application");

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.Requested = function(args) {
    const button = args.object;
    const page = button.page;
    if(page.android) {
        var Toast = android.widget.Toast;
        Toast.makeText(application.android.context, "Requested", Toast.LENGTH_SHORT).show();
    }


}