var Sqlite = require("nativescript-sqlite");
var dialogs = require("tns-core-modules/ui/dialogs");
const localSaveTimeout = 500;

console.log("Loaded localsave");

/**
 * Used to control access to the local saving SQL repository.
 */
class LocalSave {

    static _dbname = "cricketdb";
    static _tableName = "localshot";
    static _columns = [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "path", type: "TEXT" },
        { name: "playername", type: "TEXT" },
        { name: "coachname", type: "TEXT" },
        { name: "clubname", type: "TEXT" },
        { name: "thumbnail", type: "INTEGER" },
        { name: "date", type: "DATETIME" },
        { name: "shottype", type: "INTEGER" },
        { name: "ratingtype", type: "INTEGER" },
        { name: "duration", type: "INTEGER" }
    ];

    constructor() {
        console.log("Constructing LocalSave");
        this.ready = false;
        this.error = false;
        var _this = this;
        var _database = new Sqlite(LocalSave._dbname);
        _database.then(function (db) {
            _this.database = db;
            console.log("creating db");
            // check if table exists. If not, then create.
            let query = "SELECT name FROM sqlite_master WHERE type='table' AND name=?";
            db.get(query, [LocalSave._tableName], function (err, row) {

                if (err) {
                    console.error(err);
                    dialogs.alert({
                        title: "Error checking database",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                    _this.error = true;
                    return;
                }

                console.log(row);

                // no table with given name exists. So create table.
                if (!row || row.length == 0) {
                    console.log("Creating table with name " + LocalSave._tableName);
                    let createQuery = "CREATE TABLE IF NOT EXISTS " + LocalSave._tableName + " (";
                    let first = true;
                    for (var i = 0; i < LocalSave._columns.length; i++) {
                        var item = LocalSave._columns[i];
                        if (!first) {
                            createQuery += ", ";
                        }
                        createQuery += item.name + " " + item.type;
                        first = false;
                    }
                    createQuery += ")";
                    db.execSQL(createQuery, function (err, id) {
                        if (err) {
                            console.error(err);
                            dialogs.alert({
                                title: "Error checking database",
                                message: err,
                                okButtonText: "Okay"
                            }).then(function () { });
                            _this.error = true;
                            return;
                        }
                        console.log("Table created.");
                        _this.ready = true;
                    });
                } else {
                    _this.ready = true;
                }
            });
        }, function (err) {
            console.error(err);
            dialogs.alert({
                title: "Error checking database",
                message: err,
                okButtonText: "Okay"
            }).then(function () { });
            _this.error = true;
            return;
        });
    }

    /**
     * Runs a get query on this database.
     * @param {any} query
     * @param {any} vals
     * @param {any} callback
     */
    queryGet(query, vals, callback) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise = this.database.get(query, vals);
        promise.then(
            function (row) {
                try {
                    callback(row);
                } catch (err) {
                    console.error(err);
                    dialogs.alert({
                        title: "Error on get query",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            },
            function (error) {
                console.error(err);
                dialogs.alert({
                    title: "Error on get query",
                    message: "Query: " + query + "\n" + err,
                    okButtonText: "Okay"
                }).then(function () { });
            });
    }

    /**
     * Runs an exec query on this database.
     * @param {any} query
     * @param {any} vals
     * @param {any} callback
     */
    queryExec(query, vals, callback) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise = this.database.execSQL(query, vals);
        promise.then(
            function (id) {
                try {
                    callback(id);
                } catch (err) {
                    console.error(err);
                    dialogs.alert({
                        title: "Error on exec query",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            },
            function (error) {
                console.error(err);
                dialogs.alert({
                    title: "Error on exec query",
                    message: "Query: " + query + "\n" + err,
                    okButtonText: "Okay"
                }).then(function () { });
            });
    }

    /**
     * Runs an all query on this database.
     * @param {any} query
     * @param {any} vals
     * @param {any} callback
     */
    queryAll(query, vals, anotherName) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise = this.database.all(query, vals);
        promise.then(
            function (resultSet) {
                try {
                    anotherName(resultSet);
                } catch (err) {
                    console.error(err);
                    dialogs.alert({
                        title: "Error on all query",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            },
            function (error) {
                console.error(err);
                dialogs.alert({
                    title: "Error on all query",
                    message: "Query: " + query + "\n" + err,
                    okButtonText: "Okay"
                }).then(function () { });
            });
        
    }

    /**
     * Runs an each query on this database.
     * @param {any} query
     * @param {any} vals
     * @param {any} callback
     */
    queryEach(query, vals, callback) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise = this.database.each(query, vals);
        promise.then(
            function (row) {
                try {
                    callback(row);
                } catch (err) {
                    console.error(err);
                    dialogs.alert({
                        title: "Error on each query",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            },
            function (error) {
                console.error(err);
                dialogs.alert({
                    title: "Error on each query",
                    message: "Query: " + query + "\n" + err,
                    okButtonText: "Okay"
                }).then(function () { });
            });
    }

    /**
     * Times out and waits to see if DB is ready. No function works until the
     * DB does its setup.
     */
    _timeout() {
        let timeStart = (new Date()).getTime();
        let timeNow = 0;
        do {
            if (this.ready) {
                return true;
            }
            timeNow = (new Date()).getTime();
        } while (timeNow - timeStart < localSaveTimeout);
        return false;
    }
}
module.exports = LocalSave;