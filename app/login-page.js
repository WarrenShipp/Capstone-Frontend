const app = require("tns-core-modules/application");
var application = require("application");

exports.login = function (args) {
    console.log("we have logged in");

    
}

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.login = function(args) {
    const button = args.object;
    const page = button.page;
    if(page.android) {
        var Toast = android.widget.Toast;
        Toast.makeText(application.android.context, "Logged In", Toast.LENGTH_SHORT).show();
    }

    page.frame.navigate("home-page");

}

exports.createAccount = function(args) {
    const button = args.object;
    const page = button.page;
    if(page.android) {
        var Toast = android.widget.Toast;
        Toast.makeText(application.android.context, "Account Created", Toast.LENGTH_SHORT).show();
    }

    page.frame.navigate("home-page");

}