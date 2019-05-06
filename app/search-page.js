var frameModule = require("ui/frame");
var observable = require("data/observable");
var observableArray = require("data/observable-array");
var pages = require("ui/page");
var viewModel = observable.Observable;
const Button = require("tns-core-modules/ui/button").Button;
var fetchModule = require("fetch");
var http = require("http");
const appSettings = require("application-settings");
var token;
var searchIndex = 0;
var dateStart;
var dateEnd;
var shot;
var rating;
var user;
const app = require("tns-core-modules/application");
const fileSystemModule = require("tns-core-modules/file-system");
var bghttp = require("nativescript-background-http");
var session = bghttp.session("file-upload");
var dropdown = require("nativescript-drop-down");
var id;

exports.onLoaded = function(args) {
    console.log("pageLoaded");

    shotType = new dropdown.ValueList({display: "Straight Drive"}, {display: "Cover Drive"}, {display: "Square Cut"},
    {display: "Late Cut"}, {display: "Leg Glance"}, {display: "Hook"}, {display: "Pull"}, {display: "Drive through square leg"},
    {display: "On drive"}, {display: "Off Drive"});

    ratingType = new dropdown.ValueList({display: "Perfect"}, {display: "Good"}, {display: "Off Balanced"},
    {display: "Off Position"}, {display: "Played Late"}, {display: "Played Early"});

    userType = new dropdown.ValueList({display: "Admin"}, {display: "Coach"}, {display: "Player"});
    
	var searchType = [
		"Club",
        "Shot",
        "User"
        ];
    var clubName = appSettings.getString("clubName");
    console.log(clubName);

    viewModel = new observable.Observable();
    
    viewModel.set("clubName", clubName);

    viewModel.set("shotClub", "");
    viewModel.set("shotCoach", "");
    viewModel.set("shotPlayer", "");


    viewModel.set("showClub", false);
    viewModel.set("showShot", false);   
    viewModel.set("showUser", false); 
    viewModel.set("showdateStart", false);
    viewModel.set("showdateEnd", false);
    viewModel.set("dateStart", null);
    viewModel.set("dateEnd", null);
    viewModel.set("showSubmit", false);

    // dd = page.getViewById("dd");
    // aa = page.getViewById("aa");
    viewModel.set("shotType", shotType);
    viewModel.set("ratingType", ratingType);
    viewModel.set("userType", userType);


    viewModel.set("showSearchClub", false);
    viewModel.set("showSearchShot", false);
    viewModel.set("showSearchUser", false);

    viewModel.set("typeIndex", null);

    viewModel.set("searchTypes", searchType);
    viewModel.set("shotTypes", shotType);
    viewModel.set("ratingTypes", ratingType)
    viewModel.set("userTypes", userType)

    //viewModel.set("typeIndex", 0);
    //console.log(viewModel.get("searchTypes"));
    

          
    
    args.object.bindingContext = viewModel;

};

exports.Request = function() {
    http.request({
        url: "https://cricket.kinross.co/login/",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        content: JSON.stringify({ "username": "player@example.com", "password": "cricket2" })
    }).then(function(result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        token = obj.content.token;
        console.log(token);
        var sendToken = "Token " + token;
        appSettings.setString("token", sendToken);
        console.log("memes" + appSettings.getString("token"));
    }, function(error) {
        console.error(JSON.stringify(error));
    });
}

exports.getClubs = function() {
    var sendToken = "Token " + token;
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

exports.getShots = function() {
    var sendToken = "Token " + token;
    console.log(viewModel.get("clubName"));
    var clubName = viewModel.get("shotClub");
    var coachName = viewModel.get("shotCoach");
    var playerName = viewModel.get("shotPlayer");
    var date_before = dateStart;
    var date_after = dateEnd;
    var urlSearch = "https://cricket.kinross.co/shot/?" + "club_name=" + clubName + "&coach_name=" + coachName + "&player_name=" + playerName
    "&date_before=" + date_before + "&date_after=" + date_after;  
    console.log(urlSearch);
    // http.request({
    //     url: urlSearch,
    //     method: "GET",
    //     headers: { "Content-Type": "application/json", "Authorization": sendToken }
    // }).then(function(result) {
    //     console.log(JSON.stringify(result));
    //     var obj = JSON.stringify(result);
    //     obj = JSON.parse(obj);
    //     console.log(obj.content.results[0].name);
    //     console.log(coachName);

    // }, function(error) {
    //     console.error(JSON.stringify(error));
    // });
    var navigationOptions={
        moduleName:'results-page',
        context:{
            urlSearch: urlSearch
                }
    }

    frameModule.topmost().navigate(navigationOptions);

}

function displayShots(obj){
    console.log("search display shots start here");
    console.log(obj);


}

exports.playerCreate = function() {
    var sendToken = "Token " + token;
    const documentsFolder = fileSystemModule.knownFolders.currentApp();
    const path = fileSystemModule.path.join(documentsFolder.path, "images/example.png");
    console.log(path);
    console.log(sendToken);
    http.request({
        url: "https://cricket.kinross.co/player/",
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": sendToken },
        content: JSON.stringify({ "user": "tester", "birthdate": "2019-01-01", "phone_number": "0398120260", "batsman_type": "1", "bowler_type": "1"})
    }).then(function(result) {
        console.log(JSON.stringify(result));
    }, function(error) {
        console.error(JSON.stringify(error));
    });
}

exports.shotTest = function() {
    var sendToken = "Token " + token;
    const documentsFolder = fileSystemModule.knownFolders.currentApp();
    const path = fileSystemModule.path.join(documentsFolder.path, "images/example.png");
    console.log(path);
    console.log(sendToken);
    http.request({
        url: "https://cricket.kinross.co/shot/",
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": sendToken },
        content: JSON.stringify({ "player": "bbfd9706-a866-4c89-9fa6-20f705ce5898", "club": "51d3a105-6d8c-4b08-b20f-cfc676afc049", "type": 2, "rating": 2})
    }).then(function(result) {
        console.log(JSON.stringify(result));
        var obj = JSON.stringify(result);
        obj = JSON.parse(obj);
        console.log(obj.content.id);
        id = obj.content.id;
    }, function(error) {
        console.error(JSON.stringify(error));
    });
}

exports.videoTest = function() {

    var sendToken = "Token " + token;
    const documentsFolder = fileSystemModule.knownFolders.currentApp();
    const path = fileSystemModule.path.join(documentsFolder.path, "images/record.mp4");
    console.log(path);
    console.log(sendToken);

    var file =  path;
    var url = "https://cricket.kinross.co/video/";
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
            { name: "shot", value: id },
            { name: "file", filename: file, mimeType: "video/mp4" },
            { name: "length", value: "3001"}
            
         ];
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
    console.log(serverResponse);
    console.log(e);
}


// event arguments:
// task: Task
// responseCode: number
// data: string
function respondedHandler(e) {
    alert("received " + e.responseCode + " code. Server sent: " + e.data);
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

exports.clubRequest = function() {
    var sendToken = "Token " + token;
    const documentsFolder = fileSystemModule.knownFolders.currentApp();
    const path = fileSystemModule.path.join(documentsFolder.path, "images/example.png");
    console.log(path);
    console.log(sendToken);
    // http.request({
    //     url: "https://cricket.kinross.co/club/",
    //     method: "POST",
    //     headers: { "Content-Type": "image/png", "Authorization": sendToken },
    //     content: JSON.stringify({ "player": 1, "club": 1, "type": "1", "rating": "1"})
    // }).then(function(result) {
    //     console.log(JSON.stringify(result));
    // }, function(error) {
    //     console.error(JSON.stringify(error));
    // });

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



exports.clubInfo = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("club-page");
}

exports.shotInfo = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("singleshot-page");
}

exports.userInfo = function(args) {
    const button = args.object;
    const page = button.page;
    page.frame.navigate("profile-page");
}

exports.onDrawerButtonTap = function(args) {
    const sideDrawer = app.getRootView();
    sideDrawer.showDrawer();
}

function shotDropChange(args) {
    console.log("Drop Down selected index changed from " + args.oldIndex + " to " + args.newIndex + ". New value is '" + viewModel.get("shotType").getDisplay(args.newIndex) + "'");
    shot = viewModel.get("shotType").getDisplay(args.newIndex);
    console.log(shot);
}
exports.shotDropChange = shotDropChange;

function shotRatingChange(args) {
    console.log("Drop Down selected index changed from " + args.oldIndex + " to " + args.newIndex + ". New value is '" + viewModel.get("ratingType").getDisplay(args.newIndex) + "'");
    rating = viewModel.get("ratingType").getDisplay(args.newIndex);
    console.log(rating);
}
exports.shotRatingChange = shotRatingChange;

function userChange(args) {
    console.log("Drop Down selected index changed from " + args.oldIndex + " to " + args.newIndex + ". New value is '" + viewModel.get("userType").getDisplay(args.newIndex) + "'");
    user = viewModel.get("userType").getDisplay(args.newIndex);
    console.log(user);
}
exports.userChange = userChange;



exports.showDateStart = function(args){
    viewModel.set("showdateStart", true);
}

exports.showDateEnd = function(args){
    viewModel.set("showdateEnd", true);
}

exports.onStartSelected = function(args) {
    console.log("start date: " + args.date);
    dateStart = args.date;
    viewModel.set("showdateStart", false);
    viewModel.set("dateStart", args.date.toString());

  }

exports.onEndSelected = function(args) {
    console.log("end date: " + args.date);
    dateEnd = args.date;
    viewModel.set("showdateEnd", false);
    viewModel.set("dateEnd", args.date.toString());
  }  

exports.submitSearch = function (args) {
        console.log(searchIndex);

        if(searchIndex == 0){
            console.log("submit search for club");

            var clubName = viewModel.get("clubName");
            var leagueName = viewModel.get("leagueName");
            console.log(clubName + leagueName);
            
            appSettings.setString("clubName", clubName);
            appSettings.setString("leagueName", leagueName);
            const button = args.object;
            const page = button.page;
            page.frame.navigate("results-page");
            // viewModel.set("showSearchClub", true);
            // viewModel.set("showSearchShot", false);
            // viewModel.set("showSearchUser", false);
        }
        else if(searchIndex == 1){
            console.log("submit search for shot");

            var shotPlayer = viewModel.get("shotPlayer");
            var shotType = shot;
            var shotRating = rating;
            var shotCoach = viewModel.get("shotCoach");
            var shotClub = viewModel.get("shotClub");
            var shotStartDate = dateStart;
            var shotEndDate = dateEnd;
            console.log(shotPlayer + shotType + shotRating + shotCoach + shotClub + shotStartDate + shotEndDate);

            // viewModel.set("showSearchClub", false);
            // viewModel.set("showSearchShot", true);
            // viewModel.set("showSearchUser", false);            
        }
        else{
            console.log("submit search for user");

            var userPlayer = viewModel.get("userName");
            var userClub = viewModel.get("userClub");
            var userType = user;
            console.log(userPlayer + userClub + userType);

            // viewModel.set("showSearchClub", false);
            // viewModel.set("showSearchShot", false);
            // viewModel.set("showSearchUser", true);
        }
        
}

//exports.toggle = function() {
//    viewModel.set("showDetails", !viewModel.get("showDetails"));
//    console.log("yes");
//}



exports.dropDownSelectedIndexChanged = function (args){
    console.log("dropDownSelectedIndexChanged");
    console.log(args.newIndex);
    viewModel.set("showSubmit", true);

    if (args.newIndex == 0){
        console.log("club search");
        viewModel.set("showClub", true);
        viewModel.set("showShot", false);   
        viewModel.set("showUser", false);
        searchIndex = 0;
    }
    else if (args.newIndex == 1){
        console.log("shot search");
        viewModel.set("showShot", true);
        viewModel.set("showClub", false);
        viewModel.set("showUser", false); 
        searchIndex = 1;
    }
    else{
        console.log("user search");
        viewModel.set("showUser", true);
        viewModel.set("showClub", false);
        viewModel.set("showShot", false); 
        searchIndex = 2;
    }
};

exports.dropDownOpened = function(){
	console.log("dropDownOpened");
};