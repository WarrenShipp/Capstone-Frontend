const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
const fileSystemModule = require("tns-core-modules/file-system");

var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

var sendToken;

exports.onNavigatingTo = function(args){
    var viewModel = new observable();

    var token = appSettings.getString("token");
    sendToken = "Token " + token;

    page = args.object;
    page.bindingContext = viewModel;
}

exports.getClubs = function() {
    // appSettings.getString("token");
    // var sendToken = "Token " + token;
    // console.log(viewModel.get("clubName"));
    // var clubName = viewModel.get("clubName");
    var urlSearch = "https://cricket.kinross.co/club/?name=" + clubName;  
    http.request({
        url: urlSearch,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function(result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content.results[0].name);
    }, function(error) {
        console.error(JSON.stringify(error));
    });
}

exports.createClubs = function() {

    var urlSearch = "https://cricket.kinross.co/club/?name=" + clubName;  
    http.request({
        url: urlSearch,
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function(result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content.results[0].name);
    }, function(error) {
        console.error(JSON.stringify(error));
    });
}

exports.clubRequest = function() {
    const documentsFolder = fileSystemModule.knownFolders.currentApp();
    const path = fileSystemModule.path.join(documentsFolder.path, "images/example.png");
    console.log(path);
    console.log(sendToken);

    var file =  path;
    var url = "https://cricket.kinross.co/club/";
    var name = file.substr(file.lastIndexOf("/") + 1);
    
    // upload configuration

    var request = {
            url: url,
            method: "POST",
            headers: {
                "Content-Type": "application/octet-stream", "Authorization": sendToken
            },
            description: "Uploading " + name
            
        };

        var params = [
            { name: "name", value: "abc" },
            { name: "logo", filename: file, mimeType: "image/png" }
         ];
         //var task = session.uploadFile(file, request);
         var task = session.multipartUpload(params, request);   

        task.on("progress", progressHandler);
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
    alert("received " + e.responseCode + " code.");
    var serverResponse = e.response;
    console.log(JSON.stringify(serverResponse));
    console.log(e.error);
    console.log(e.response);
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
    alert("received " + e.responseCode + " code");
    var serverResponse = e.response;
}

// event arguments:
// task: Task
function cancelledHandler(e) {
    alert("upload cancelled");
}

    }