const app = require("tns-core-modules/application");
var application = require("application");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
var observable = require("data/observable");
var viewModel = new observable.Observable();
const appSettings = require("application-settings");
var dialogs = require("tns-core-modules/ui/dialogs");
var imagepicker = require("nativescript-imagepicker");
const DatePicker = require("tns-core-modules/ui/date-picker").DatePicker;
const dropdown = require("nativescript-drop-down");

// consts
const batsmanTypeItems = [
    { display: "Right Hand Batsman" },
    { display: "Left Hand Batsman" }
];
const bowlerTypeItems = [
    { display: "Right Hand Spin" },
    { display: "Right Hand Off Spin" },
    { display: "Right Hand Pace" },
    { display: "Right Hand Chinaman" },
    { display: "Left Hand Spin" },
    { display: "Left Hand Off Spin" },
    { display: "Left Hand Pace" },
    { display: "Left Hand Chinaman" }
];

// profile
var userId;
var isSelf;

// title
var pageTitle;

// user args
var imgSrc;
var imgSrcOriginal;
var name;
var email;
var phone;

// player info args
var isPlayer;
var batsmanTypeIndex;
var batsmanTypeList;
var bowlerTypeIndex;
var bowlerTypeList;
var birthDate;
var maxDate;

// coach info args
var isCoach;
var yearsExperience;

// loading
var isLoading = true;

/**
 * Sets up page. Gets data to display to the page.
 * @param {any} args
 */
function navigatingTo(args) {
    page = args.object;

    isSelf = true;  // for now we can only edit outselves.
    var sendToken = appSettings.getString(global.tokenAccess);

    // set main stuff
    pageTitle = "Edit Profile";
    viewModel.set("profileTitle", pageTitle);
    viewModel.set("batsmanTypeItems", batsmanTypeItems);
    viewModel.set("bowlerTypeItems", bowlerTypeItems);
    page.bindingContext = viewModel;



    // we can really only edit ourself. So we don't add other features in.
    if (isSelf) {
        http.request({
            url: global.serverUrl + global.endpointUser + "me/",
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sendToken }
        }).then(function (result) {
            // console.log(result);
            var obj = JSON.stringify(result);
            obj = JSON.parse(obj);

            // user didn't get from database.
            if (!obj.content || !obj.content.id) {
                console.error("Could not find myself.");
                return;
            }

            // go through vars and add to profile page
            _makeProfilePage(obj.content, isSelf);

        }, function (error) {
            console.error(error);
        });
    } else {
        dialogs.alert({
            title: "Couldn't find user!",
            message: "A user ID wasn't provided.",
            okButtonText: "Okay"
        }).then(function () { });
    }

    const playerSwitch = page.getViewById("player-switch");
    playerSwitch.on("checkedChange", (args) => {
        console.log("checkedChange ", args.object.checked);
        viewModel.set("isPlayer", args.object.checked);
        isPlayer = args.object.checked;
        console.log(isPlayer);
    });

    const coachSwitch = page.getViewById("coach-switch");
    coachSwitch.on("checkedChange", (args) => {
        console.log("checkedChange ", args.object.checked);
        viewModel.set("isCoach", args.object.checked);
        isCoach = args.object.checked;
        console.log(isCoach);
    });

}
exports.navigatingTo = navigatingTo;

exports.onDrawerButtonTap = function (args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

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
    console.log("Setting up page");

    firstName = user.first_name
    lastName = user.last_name;
    imgSrc = user.imgSrc;
    imgSrcOriginal = imgSrc;
    isPlayer = user.is_player;
    if (isSelf) {
        email = user.email;
        if (isPlayer && user.player) {
            phone = user.player.phone_number;
        }
    }
    inClub = false; // TODO make club display work

    console.log("Setting up dropdowns");

    // set batsman dropdown
    batsmanTypeList = new dropdown.ValueList(batsmanTypeItems);
    viewModel.set("batsmanTypeList", batsmanTypeList);
    batsmanTypeIndex = 0;

    // set bowler dropdown
    bowlerTypeList = new dropdown.ValueList(bowlerTypeItems);
    viewModel.set("bowlerTypeList", bowlerTypeList);
    bowlerTypeIndex = 0;

    console.log("Setting up player");

    if (isPlayer && user.player) {
        batsmanTypeIndex = user.player.batsman_type;
        bowlerTypeIndex = user.player.bowler_type;
        birthDate = new Date(user.player.birthdate);
    }
    maxDate = Date.now();

    console.log("Setting up coach");

    isCoach = user.is_coach;
    if (isCoach && user.coach) {
        yearsExperience = user.coach.years_experience;
    }

    console.log("Doing viewmodels");

    // set all
    viewModel.set("imgSrc", imgSrc);
    viewModel.set("firstName", firstName);
    viewModel.set("lastName", lastName);
    viewModel.set("email", email);
    viewModel.set("phone", phone);
    viewModel.set("isPlayer", isPlayer);
    viewModel.set("batsmanTypeIndex", batsmanTypeIndex);
    viewModel.set("bowlerTypeIndex", bowlerTypeIndex);
    viewModel.set("birthDate", birthDate);
    viewModel.set("maxDate", maxDate);
    viewModel.set("isCoach", isCoach);
    viewModel.set("yearsExperience", yearsExperience);

    console.log("Nearly done");

    // done. Stop loading
    isLoading = false;
    viewModel.set("isLoading", isLoading);

    console.log("Done");

}

function cancel(args) {
    if (isSelf) {
        page.frame.goBack();
    } else {
        dialogs.alert({
            title: "Can't edit someone else's profile!",
            okButtonText: "Okay"
        }).then(function () { });
    }
}
exports.cancel = cancel;

/**
 * Upload changes to database
 * @param {any} args
 */
function save(args) {
    // user args
    var saveImgSrc = viewModel.get("imgSrc");
    var saveFirstName = viewModel.get("firstName");
    var saveLastName = viewModel.get("lastName");
    var saveEmail = viewModel.get("email");
    var savePhone = viewModel.get("phone");

    // password
    var oldPassword = viewModel.get("oldPassword");
    var newPassword = viewModel.get("newPassword");
    var confirmPassword = viewModel.get("confirmPassword");

    viewModel.set("profileStatus", false);
    // player info args
    let dropdownBatsman = page.getViewById("batsmanType");
    var saveBatsmanType = dropdownBatsman.selectedIndex;
    console.log("From ID: " + saveBatsmanType + "; From VM: " + viewModel.get("batsmanTypeIndex"));
    let dropdownBowler = page.getViewById("bowlerType");
    var saveBowlerType = dropdownBowler.selectedIndex;
    console.log("From ID: " + saveBowlerType + "; From VM: " + viewModel.get("bowlerTypeIndex"));
    let datePicker = page.getViewById("birthDate");
    console.log(datePicker);
    var saveBirthDate = new Date(datePicker.year, datePicker.month, datePicker.day);

    // coach info args
    var saveYearsExperience = viewModel.get("yearsExperience");

    // add all valid fields to this object
    var allFields = [];
    // FIELD: { name: "name", value: clubName }
    // FILE: { name: "logo", filename: file, mimeType: "image/*" }

    // checks
    if (!saveFirstName || !saveLastName) {
        dialogs.alert({
            title: "Name fields can't be blank!",
            okButtonText: "Okay"
        }).then(function () { });
        return;
    }



    if (isPlayer && !saveBirthDate) {
        dialogs.alert({
            title: "Must have birthdate!",
            message: "Players must have a birthdate",
            okButtonText: "Okay"
        }).then(function () { });
        return;
    }

    // check name
    if (saveFirstName != firstName) {
        allFields.push({ name: "first_name", value: saveFirstName });
    }
    if (saveLastName != lastName) {
        allFields.push({ name: "last_name", value: saveLastName });
    }

    // check imgSrc
    if (saveImgSrc != imgSrcOriginal) {
        allFields.push({ name: "profile_pic", filename: saveImgSrc, mimeType: "image/*" });
    }

    // http request only accepts strings
    var stringBatsman = String(saveBatsmanType);
    var stringBowler = String(saveBowlerType);
    var stringBirthdate = saveBirthDate.toISOString().split('T')[0];
    if (isPlayer) {
        console.log("here");
        if (savePhone != phone) {
            allFields.push({ name: "player.phone_number", value: savePhone });
        }
        if (saveBatsmanType != batsmanTypeIndex) {
            allFields.push({ name: "player.batsman_type", value: stringBatsman });
        }
        if (saveBowlerType != bowlerTypeIndex) {
            allFields.push({ name: "player.bowler_type", value: stringBowler });
        }
        if (saveBirthDate) {
            allFields.push({ name: "player.birthdate", value: stringBirthdate });
        }
    }

    // do all coach fields
    if (isCoach) {
        if (saveYearsExperience != yearsExperience) {
            allFields.push({ name: "coach.years_experience", value: saveYearsExperience });
        }
    }


    // do upload
    let sendToken = appSettings.getString(global.tokenAccess);
    var request = {
        url: global.serverUrl + global.endpointUser + "me/",
        method: "PATCH",
        headers: {
            "Content-Type": "multipart/form-data", "Authorization": "Bearer " + sendToken
        },
        description: "Updating"
    };

    console.log(allFields);
    var task = session.multipartUpload(allFields, request);
    //task.on("progress", progressHandler);
    task.on("error", errorHandler);
    //task.on("responded", respondedHandler);
    task.on("complete", completeHandler);

    // go back for now. Probably not the best.
    // page.frame.goBack();
}
exports.save = save;

/**
 * Allows user to select a new image for their profile picture.
 */
function changeImage() {
    console.log("changing image");
    var context = imagepicker.create({ mode: "single" });
    context
        .authorize()
        .then(() => {
            return context.present();
        })
        .then(function (selection) {
            if (selection.length > 0) {
                imgSrc = selection[0].android.toString();
                viewModel.set("imgSrc", imgSrc);
            } else {
                console.error("No image could be found.");
                dialogs.alert({
                    title: "Error getting images",
                    message: "No image could be found.",
                    okButtonText: "Okay"
                }).then(function () { });
            }
        }).catch(function (e) {
            console.error(e);
            dialogs.alert({
                title: "Error getting images",
                message: e,
                okButtonText: "Okay"
            }).then(function () { });
        });
}
exports.changeImage = changeImage;

function batsmanTypeDropdownChanged(args) {
    let dropdownBatsman = page.getViewById("batsmanType");
    let shotTypeIndex = dropdownBatsman.selectedIndex;
    let shotTypeName = batsmanTypeItems[dropdownBatsman.selectedIndex].display;
    console.log(shotTypeIndex + " " + shotTypeName);
}
exports.batsmanTypeDropdownChanged = batsmanTypeDropdownChanged;

function bowlerTypeDropdownChanged(args) {
    let dropdownRating = page.getViewById("bowlerType");
    let ratingTypeIndex = dropdownRating.selectedIndex;
    let ratingTypeName = bowlerTypeItems[dropdownRating.selectedIndex].display;
    console.log(ratingTypeIndex + " " + ratingTypeName);
}
exports.bowlerTypeDropdownChanged = bowlerTypeDropdownChanged;

function passwordChange(args) {
     //Password change to be implemented
     if (oldPassword || newPassword || confirmPassword) {
        let completed = 0;
        completed += oldPassword ? 1 : 0;
        completed += newPassword ? 1 : 0;
        completed += confirmPassword ? 1 : 0;
        if (completed < 3 || newPassword != confirmPassword) {
            dialogs.alert({
                title: "Bad password!",
                message: "Password fields must either be filled out properly or left blank.",
                okButtonText: "Okay"
            }).then(function () { });
            return;
        }
        // TODO check old password before sending. Not sure how.
    }
}
exports.passwordChange = passwordChange;


// event arguments:
// task: Task
// currentBytes: number
// totalBytes: number
function progressHandler(e) {
    alert("uploaded " + e.currentBytes + " / " + e.totalBytes);
}

// event arguments:
// task: Task
// responseCode: number
// error: java.lang.Exception (Android) / NSError (iOS)
// response: net.gotev.uploadservice.ServerResponse (Android) / NSHTTPURLResponse (iOS)
function errorHandler(e) {
    viewModel.set("profileStatus", true);
    alert("received " + e.responseCode + " code.");
    var serverResponse = e.response;
    console.log(JSON.stringify(serverResponse));
    console.log(e.response.getBodyAsString());
}


// event arguments:
// task: Task
// responseCode: number
// data: string
function respondedHandler(e) {
    alert("responded received " + e.responseCode + " code. Server sent: " + e.data);
}

// event arguments:
// task: Task
// responseCode: number
// response: net.gotev.uploadservice.ServerResponse (Android) / NSHTTPURLResponse (iOS)
function completeHandler(e) {
    alert("received " + e.responseCode + " code");
    var serverResponse = e.response;
    viewModel.set("profileStatus", true);

}

// event arguments:
// task: Task
function cancelledHandler(e) {
    alert("upload cancelled");
}