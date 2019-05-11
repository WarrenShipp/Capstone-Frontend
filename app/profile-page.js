const app = require("tns-core-modules/application");
var application = require("application");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
var observable = require("data/observable");
var viewModel = new observable.Observable();
const appSettings = require("application-settings");
var dialogs = require("tns-core-modules/ui/dialogs");

// consts
const profileUrl = "user/";
const batsmanTypes = [
    "Right Hand Batsman",
    "Left Hand Batsman"
];
const bowlerTypes = [
    "Right Hand Spin",
    "Right Hand Off Spin",
    "Right Hand Pace",
    "Right Hand Chinaman",
    "Left Hand Spin",
    "Left Hand Off Spin",
    "Left Hand Pace",
    "Left Hand Chinaman"
];

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
    console.log(sendToken);

    // set self-profile-related stuff
    if (isSelf) {
        pageTitle = "My Profile";
    } else {
        pageTitle = "User Profile";
    }
    viewModel.set("profileTitle", pageTitle);
    viewModel.set("canEdit", isSelf);
    page.bindingContext = viewModel;

    if (isSelf) {
        http.request({
            url: global.serverUrl + global.endpointUser + "me/",
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken }
        }).then(function (result) {
            console.log(result);
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);

            // user didn't get from database.
            if (!obj.content || !obj.content.id) {
                console.log("Could not find myself.");
                return;
            }

            // go through vars and add to profile page
            _makeProfilePage(obj.content, isSelf);

        }, function (error) {
            console.error(JSON.stringify(error));
        });
    } else if (userId) {
        http.request({
            url: global.serverUrl + global.endpointUser + userId,
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken }
        }).then(function (result) {
            console.log(result);
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);

            // user didn't get from database.
            if (!obj.content || !obj.content.id) {
                console.log("Could not find user.");
                return;
            }

            // go through vars and add to profile page
            _makeProfilePage(obj.content, isSelf);

        }, function (error) {
            console.error(JSON.stringify(error));
        });
    } else {
        dialogs.alert({
            title: "Couldn't find user!",
            message: "A user ID wasn't provided.",
            okButtonText: "Okay"
        }).then(function () { });
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
    /*
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
    name = user.first_name + " " + user.last_name;
    imgSrc = user.imgSrc;
    isPlayer = user.is_player;
    if (isSelf) {
        email = user.email;
        if (isPlayer && user.player) {
            phone = user.player.phone_number;
        }
    }
    inClub = false; // TODO make club display work
    if (isPlayer && user.player) {
        batsmanType = batsmanTypes[user.player.batsman_type];
        bowlerType = bowlerTypes[user.player.bowler_type];
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