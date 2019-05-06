const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
const fileSystemModule = require("tns-core-modules/file-system");
var imagepicker = require("nativescript-imagepicker");

var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

var logo;
var sendToken;
var viewModel = new observable();

exports.onNavigatingTo = function(args){
    
    page = args.object;
    page.bindingContext = viewModel;

    var token = appSettings.getString("token");
    sendToken = token;

    
    
}

exports.getClubs = function() {
    // appSettings.getString("token");
    // var sendToken = "Token " + token;
    console.log(viewModel.get("clubName"));
    var clubName = viewModel.get("clubName");
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

exports.imagePicker = function(){
    console.log("test");
    var context = imagepicker.create({ mode: "single" });
    context
    .authorize()
    .then(function() {
        return context.present();
    })
    .then(function(selection) {
        selection.forEach(function(selected) {
            // process the selected image
            console.log(selected.android.toString());
            logo = selected.android.toString();
            // console.log("Selection done: " + JSON.stringify(selection));
            // var image = JSON.stringify(selection);
            // var path = JSON.parse(image._android);
            // console.log(path);
        });
        list.items = selection;
    }).catch(function (e) {
        // process error
    });
}

exports.clubRequest = function() {
    // const documentsFolder = fileSystemModule.knownFolders.currentApp();
    // const path = fileSystemModule.path.join(documentsFolder.path, "images/example.png");
    // console.log(path);
    console.log(sendToken);

    var file =  logo;
    var url = "https://cricket.kinross.co/club/";
    var name = file.substr(file.lastIndexOf("/") + 1);
    var clubName = viewModel.get("clubName");
    var clubPhone = viewModel.get("phoneNumber");
    var adddressLine1 = viewModel.get("street_address_l1");
    var addressLine2 = viewModel.get("street_address_l2");
    var addressSuburb = viewModel.get("suburb");
    var addressPostcode = viewModel.get("postcode");
    var addressCountry = viewModel.get("country");
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
            { name: "name", value: clubName },
            { name: "phone_number", value:  clubPhone},
            { name: "street_address_l1", value: adddressLine1 },
            { name: "street_address_l2", value: addressLine2 },
            { name: "suburb", value: addressSuburb },
            { name: "postcode", value: addressPostcode },
            { name: "country", value: addressCountry },
            { name: "logo", filename: file, mimeType: "image/*" }
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