const app = require("tns-core-modules/application");
var application = require("application");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
var observable = require("data/observable");
var viewModel = new observable.Observable();
var frameModule = require("ui/frame");
const appSettings = require("application-settings");
var dialogs = require("tns-core-modules/ui/dialogs");
const BatsmanTypes = require("../app/helpers/type-list").BatsmanTypes;
const BowlerTypes = require("../app/helpers/type-list").BowlerTypes;
var HTTPRequestWrapper = require("../app/http/http-request.js");

// profile
var userId;
var isSelf;

// title
var pageTitle;

// user args
var imgSrc;
var name;
var email;
var phone;

// club args
var inClub;
var clubList = [];

// player info args
var isPlayer;
var batsmanType;
var bowlerType;
var birthDate;

// coach info args
var isCoach;
var yearsExperience;

// page vars
var isLoading;

/**
 * Sets up page. Shows the appropriate profile.
 * @param {any} args
 */
function navigatingTo(args) {
    page = args.object;

    // userId = page.navigationContext.userId;
    isSelf = page.navigationContext.isSelf ? page.navigationContext.isSelf : false;

    if (!isSelf) {
        userId = page.navigationContext.userId;
    }
    var sendToken = appSettings.getString(global.tokenAccess);

    // set self-profile-related stuff
    if (isSelf) {
        pageTitle = "My Profile";
    } else {
        pageTitle = "User Profile";
    }
    viewModel.set("profileTitle", pageTitle);
    viewModel.set("canEdit", isSelf);

    // set loading wheel
    isLoading = true;
    viewModel.set("isLoading", isLoading);

    // bind
    page.bindingContext = viewModel;

    // get my profile
    if (isSelf) {
        var request = new HTTPRequestWrapper(
            global.serverUrl + global.endpointUser + "me/",
            "GET",
            "application/json",
            sendToken
        );
        request.send(
            function (result) {
                var obj = JSON.stringify(result);
                obj = JSON.parse(obj);

                // user didn't get from database.
                if (!obj.content || !obj.content.id) {
                    console.error("Could not find myself.");
                    isLoading = false;
                    viewModel.set("isLoading", isLoading);
                    dialogs.alert({
                        title: "Couldn't find myself!",
                        message: "",
                        okButtonText: "Okay"
                    }).then(
                        function () {
                            frameModule.topmost().goBack();
                        });
                    return;
                }

                // go through vars and add to profile page
                _makeProfilePage(obj.content, isSelf);
            },
            function (error) {
                isLoading = false;
                viewModel.set("isLoading", isLoading);
                dialogs.alert({
                    title: "Couldn't find myself!",
                    message: error.message,
                    okButtonText: "Okay"
                }).then(
                    function () {
                        frameModule.topmost().goBack();
                    });
                return;
            }
        );
    }
    // get other profile
    else if (userId) {

        var request = new HTTPRequestWrapper(
            global.serverUrl + global.endpointUser + userId,
            "GET",
            "application/json",
            sendToken
        );
        request.send(
            function (result) {
                var obj = JSON.stringify(result);
                obj = JSON.parse(obj);

                // user didn't get from database.
                if (!obj.content || !obj.content.id) {
                    console.error("Could not find a user.");
                    isLoading = false;
                    viewModel.set("isLoading", isLoading);
                    dialogs.alert({
                        title: "Couldn't find a user!",
                        message: "",
                        okButtonText: "Okay"
                    }).then(
                        function () {
                            frameModule.topmost().goBack();
                        });
                    return;
                }

                // go through vars and add to profile page
                _makeProfilePage(obj.content, isSelf);
            },
            function (error) {
                isLoading = false;
                viewModel.set("isLoading", isLoading);
                dialogs.alert({
                    title: "Couldn't find a user!",
                    message: error.message,
                    okButtonText: "Okay"
                }).then(
                    function () {
                        frameModule.topmost().goBack();
                    });
                return;
            }
        );
        
    } else {
        isLoading = false;
        viewModel.set("isLoading", isLoading);
        dialogs.alert({
            title: "Couldn't find user!",
            message: "A user ID wasn't provided.",
            okButtonText: "Okay"
        }).then(
            function () {
                frameModule.topmost().goBack();
            });
    }
    
}
exports.navigatingTo = navigatingTo;

/**
 * Opens Sidedrawer.
 * @param {any} args
 */
function onDrawerButtonTap(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}
exports.onDrawerButtonTap = onDrawerButtonTap;

/**
 * Takes user information and passes it to view.
 * @param {any} user
 * @param {any} isSelf
 */
function _makeProfilePage(user, isSelf) {
    /* REMINDER:
    name            : String
    email           : String
    phone           : String
    imgSrc          : String
    inClub          : boolean
    clubs           : NOT IMPLEMENTED
    isPlayer        : boolean
    batsmanType     : String
    bowlerType      : String
    birthDate       : String
    isCoach         : boolean
    yearsExperience : integer
    canEdit         : boolean
    */

    // get values from user object
    name = user.first_name + " " + user.last_name;
    imgSrc = user.profile_pic;
    isPlayer = user.is_player;
    if (isSelf) {
        email = user.email;
        if (isPlayer && user.player) {
            phone = user.player.phone_number;
        }
    }
    inClub = false; // TODO make club display work
    if (isPlayer && user.player) {
        batsmanType = BatsmanTypes.getNameFromValue(user.player.batsman_type);
        bowlerType = BowlerTypes.getNameFromValue(user.player.bowler_type);
        birthDate = user.player.birthdate;
    }
    isCoach = user.is_coach;
    if (isCoach && user.coach) {
        yearsExperience = user.coach.years_experience;
    }
    canEdit = isSelf;

    // set all
    viewModel.set("imgSrc", imgSrc);
    viewModel.set("name", name);
    viewModel.set("email", email);
    viewModel.set("phone", phone);
    viewModel.set("inClub", inClub);
    viewModel.set("isPlayer", isPlayer);
    viewModel.set("batsmanType", batsmanType);
    viewModel.set("bowlerType", bowlerType);
    viewModel.set("birthDate", birthDate);
    viewModel.set("isCoach", isCoach);
    viewModel.set("yearsExperience", yearsExperience);
    viewModel.set("canEdit", canEdit);

    // stop loading
    isLoading = false;
    viewModel.set("isLoading", isLoading);
}

/**
 * Link to edit my own profile.
 * @param {any} args
 */
function editSelf(args) {
    if (isSelf) {
        page.frame.navigate({
            moduleName: "edit-profile-page",
        });
    } else {
        dialogs.alert({
            title: "Can't edit someone else's profile!",
            okButtonText: "Okay"
        }).then(function () { });
    }
}
exports.editSelf = editSelf;
