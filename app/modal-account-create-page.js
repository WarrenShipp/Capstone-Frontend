const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
const fileSystemModule = require("tns-core-modules/file-system");
var dialogs = require("tns-core-modules/ui/dialogs");

var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

var viewModel = new observable();

var firstName;
var lastName;
var email;
var password;
var passwordConfirm;

/**
 * Sets up binding context
 * @param {any} args
 */
function onShownModally(args) {
    const page = args.object.page;
    page.bindingContext = viewModel;
}
exports.onShownModally = onShownModally;

function onCancel(args) {
    args.object.closeModal();
}
exports.onCancel = onCancel;

function onCreate(args) {
    // check if everything is filled out
    firstName = viewModel.get("firstName");
    lastName = viewModel.get("lastName");
    email = viewModel.get("email");
    password = viewModel.get("password");
    passwordConfirm = viewModel.get("passwordConfirm");
    if (
        !firstName || !lastName || !email || !password || !passwordConfirm
    ) {
        dialogs.alert({
            title: "Not all fields filled out!",
            message: "Please make sure all fields are filled out.",
            okButtonText: "Okay"
        }).then(function () { });
        return;
    }

    // check if passwords match
    if (password != passwordConfirm) {
        dialogs.alert({
            title: "Passwords don't match!",
            message: "Please make sure the confirmed password matches the password field.",
            okButtonText: "Okay"
        }).then(function () { });
        return;
    }

    var urlSearch = global.serverUrl + "user/";
    var content = {
        "email": email,
        "password": password,
        "first_name": firstName,
        "last_name": lastName
    };
    http.request({
        url: urlSearch,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify(content)
    }).then(function (result) {
        console.log(result);
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        // console.log(obj);

        // inform user and leave modal
        dialogs.alert({
            title: "Account created!",
            message: "Your new account is created. Please log in.",
            okButtonText: "Okay"
        }).then(function () {
            args.object.closeModal();
        });
    }, function (error) {
        console.error(error);
        dialogs.alert({
            title: "Error",
            message: "Details: " + error,
            okButtonText: "Okay"
        }).then(function () {
            args.object.closeModal();
        });
    });
}
exports.onCreate = onCreate;
