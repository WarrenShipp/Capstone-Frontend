const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
var dialogs = require("tns-core-modules/ui/dialogs");
var http = require("http");

var viewModel = new observable();

// page vars
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

/**
 * Shuts the modal.
 * @param {any} args
 */
function onCancel(args) {
    args.object.closeModal();
}
exports.onCancel = onCancel;

/**
 * Send message to server to create new account. Also handles validation.
 * @param {any} args
 */
function onCreate(args) {
    // check if everything is filled out
    firstName = viewModel.get("firstName");
    lastName = viewModel.get("lastName");
    email = viewModel.get("email");
    password = viewModel.get("password");
    passwordConfirm = viewModel.get("passwordConfirm");
    viewModel.set("loginStatus", false);
    if (
        !firstName || !lastName || !email || !password || !passwordConfirm
    ) {
        dialogs.alert({
            title: "Not all fields filled out!",
            message: "Please make sure all fields are filled out.",
            okButtonText: "Okay"
        }).then(function () { });
        viewModel.set("loginStatus", true);
        return;
    }

    // check if passwords match
    if (password != passwordConfirm) {
        dialogs.alert({
            title: "Passwords don't match!",
            message: "Please make sure the confirmed password matches the password field.",
            okButtonText: "Okay"
        }).then(function () { });
        viewModel.set("loginStatus", true);
        return;
    }

    // do request
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
        viewModel.set("loginStatus", true);
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);

        // inform user and leave modal
        dialogs.alert({
            title: "Account created!",
            message: "Your new account is created. Please log in.",
            okButtonText: "Okay"
        }).then(function () {
            args.object.closeModal();
        });
    }, function (error) {
        viewModel.set("loginStatus", true);
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
