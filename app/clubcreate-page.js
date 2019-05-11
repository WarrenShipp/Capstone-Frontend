﻿const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
var fileSystemModule = require("tns-core-modules/file-system");
var imagepicker = require("nativescript-imagepicker");
var app = require("tns-core-modules/application");
var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");


// Variables
var logo = null;
var sendToken;
var viewModel;
var clubName = "";
var clubPhone = "";
var adddressLine1 = "";
var addressLine2 = "";
var addressSuburb = "";
var addressPostcode = "";
var addressCountry = "";

/**
 * Handles initialisation of club creation.
 * @param {any} args
 */
function onNavigatingTo(args) {
    page = args.object;
    viewModel = new observable();
    page.bindingContext = viewModel;
    viewModel.set("phoneNumber", "");
    var token = appSettings.getString(global.tokenAccess);
    sendToken = token;
}
exports.onNavigatingTo = onNavigatingTo;

/*
function getClubs() {
    // appSettings.getString("token");
    // var sendToken = "Token " + token;
    console.log(viewModel.get("clubName"));
    var clubName = viewModel.get("clubName");
    var urlSearch = global.serverUrl + global.endpointClub;
    http.request({
        url: urlSearch,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function (result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
    }, function (error) {
        console.error(JSON.stringify(error));
    });
}
exports.getClubs = getClubs;
*/

/*
function createClubs() {

    var urlSearch = global.serverUrl + global.endpointClub + "?name=" + clubName;
    http.request({
        url: urlSearch,
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function (result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content.results[0].name);
    }, function (error) {
        console.error(JSON.stringify(error));
    });
}
exports.createClubs = createClubs;
*/

/**
 * Picks an image. Sets it as the logo.
 */
function imagePicker() {
    console.log("test image picker");
    var context = imagepicker.create({ mode: "single" });
    context
        .authorize()
        .then(function () {
            return context.present();
        })
        .then(function (selection) {
            selection.forEach(function (selected) {
                // process the selected image
                console.log(selected.android.toString());
                logo = selected.android.toString();
            });
            list.items = selection;
        }).catch(function (e) {
            // process error
        });
}
exports.imagePicker = imagePicker;

/**
 * Sends a requrest to the server to create the club.
 */
function clubRequest() {
    // TODO clientside validation!

    const documentsFolder = fileSystemModule.knownFolders.currentApp();
    const path = fileSystemModule.path.join(documentsFolder.path, "images/ball.jpg");
    var file;
    console.log(path);
    console.log(sendToken);
    if (logo !== null) {
        file = logo;
    }
    else {
        file = path;
    }
    var url = global.serverUrl + global.endpointClub;

    // upload configuration

    clubName = viewModel.get("clubName");
    clubPhone = viewModel.get("phoneNumber");
    adddressLine1 = viewModel.get("street_address_l1");
    addressLine2 = viewModel.get("street_address_l2");
    addressSuburb = viewModel.get("suburb");
    addressPostcode = viewModel.get("postcode");
    addressCountry = viewModel.get("country");

    var request = {
        url: url,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data", "Authorization": sendToken
        },
        description: "Uploading "
    };

    var params = [
        { name: "name", value: clubName },
        { name: "phone_number", value: clubPhone },
        { name: "street_address_l1", value: adddressLine1 },
        { name: "street_address_l2", value: addressLine2 },
        { name: "suburb", value: addressSuburb },
        { name: "postcode", value: addressPostcode },
        { name: "country", value: addressCountry },
        { name: "logo", filename: file, mimeType: "image/*" }
    ];

    var task = session.multipartUpload(params, request);

    //task.on("progress", progressHandler);
    task.on("error", errorHandler);
    task.on("responded", respondedHandler);
    task.on("complete", completeHandler);

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
        //alert("received error " + e.responseCode + " code.");
        alert(e.responseCode + e.response.getBodyAsString())
        var serverResponse = e.response;
        console.log(JSON.stringify(serverResponse));
        console.log(e.error);
        console.log(e.response.getBodyAsString());
        console.log(e.task);
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
        //alert("received " + e.responseCode + " code");
        var serverResponse = e.response;
        alert("Club Created");
    }

    // event arguments:
    // task: Task
    function cancelledHandler(e) {
        alert("upload cancelled");
    }

}
exports.clubRequest = clubRequest;

/**
 * Validates on the clientside.
 */
function _validate() {
    // TODO
}