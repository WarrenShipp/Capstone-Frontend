const appSettings = require("application-settings");
var observable = require("data/observable").Observable;
const fileSystemModule = require("tns-core-modules/file-system");
var imagepicker = require("nativescript-imagepicker");

var http = require("http");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");

var logo = null;
var sendToken;
var viewModel = new observable();
var gotData;
var clubId;

const app = require("tns-core-modules/application");

exports.onDrawerButtonTap = function (args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

exports.onNavigatingTo = function(args){
    
	console.log("pageLoaded");
    sendToken = appSettings.getString("token");
        
	var page = args.object;
    page.bindingContext = viewModel;
    var gotData=page.navigationContext;
    clubId = gotData.id;
    console.log(clubId);
    var clubUrl = "https://cricket.kinross.co/club/" + clubId;
    http.request({
        url: clubUrl,
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": sendToken }
    }).then(function(result) {
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content);
        console.log(obj.content.name);
        clubDetails(obj.content);
    }, function(error) {
        console.error(JSON.stringify(error));
    });
    
}

function clubDetails(data){
    console.log(data.postcode);
    viewModel.set("clubName", data.name);
    viewModel.set("phoneNumber", data.phone_number);
    viewModel.set("street_address_l1", data.street_address_l1);
    viewModel.set("street_address_l2", data.street_address_l2);
    viewModel.set("postcode", data.postcode);
    viewModel.set("suburb", data.suburb);
    viewModel.set("country", data.country);
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
    var editUrl = "https://cricket.kinross.co/club/" + clubId + "/";
    console.log("club url= " + editUrl);
    //var name = file.substr(file.lastIndexOf("/") + 1);
    var clubName = viewModel.get("clubName");
    var clubPhone = viewModel.get("phoneNumber");
    var adddressLine1 = viewModel.get("street_address_l1");
    var addressLine2 = viewModel.get("street_address_l2");
    var addressSuburb = viewModel.get("suburb");
    var addressPostcode = viewModel.get("postcode");
    var addressCountry = viewModel.get("country");
    // upload configuration

    http.request({
        url: editUrl,
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": sendToken },
        content: JSON.stringify({ "name": "patchtest"})
    }).then(function(result) {
        console.log(JSON.stringify(result));
    }, function(error) {
        console.error(JSON.stringify(error));
    });

    var request = {
            url: editUrl,
            method: "PATCH",
            headers: {
                "Content-Type": "multipart/form-data", "Authorization": sendToken
            },
            description: "Updating "
            
        };

        var params = [
            { name: "name", value: clubName },
            { name: "phone_number", value:  clubPhone},
            { name: "street_address_l1", value: adddressLine1 },
            { name: "street_address_l2", value: addressLine2 },
            { name: "suburb", value: addressSuburb },
            { name: "postcode", value: addressPostcode },
            { name: "country", value: addressCountry },
            
         ];

         if(file !== null){
            params.push({ name: "logo", filename: file, mimeType: "image/*" });
         }

         console.log(params);
         //var task = session.uploadFile(file, request);
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