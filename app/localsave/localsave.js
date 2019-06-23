var Sqlite = require("nativescript-sqlite");
var dialogs = require("tns-core-modules/ui/dialogs");
var appSettings = require("application-settings");

// consts
const localSaveTimeout = 500;   // NOT IMPLEMENTED

/**
 * Used to control access to the local saving SQL repository.
 */
class LocalSave {

    // important constants for DB
    static _dbname = "cricketdb";
    static _tableName = "localshot";
    static _columns = [
        { name: "id", type: "INTEGER PRIMARY KEY AUTOINCREMENT" },
        { name: "path", type: "TEXT" },
        { name: "playername", type: "TEXT" },
        { name: "coachname", type: "TEXT" },
        { name: "clubname", type: "TEXT" },
        { name: "thumbnail", type: "INTEGER" },
        { name: "date", type: "DATETIME" },
        { name: "shottype", type: "INTEGER" },
        { name: "ratingtype", type: "INTEGER" },
        { name: "duration", type: "INTEGER" },
        { name: "playerid", type: "TEXT" },
        { name: "coachid", type: "TEXT" },
        { name: "clubid", type: "TEXT" }
    ];

    /**
     * Sole constructor. Sets up everything using the existing statics.
     */
    constructor() {
        // vals used to keep track of the database's status
        this.ready = false;
        this.error = false;

        var _this = this;
        var _database = new Sqlite(LocalSave._dbname);
        _database.then(function (db) {
            _this.database = db;
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

                // no table with given name exists. So create table.
                if (!row || row.length == 0) {

                    // create query procedurally using the static table
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

                    // run the create query
                    db.execSQL(createQuery, function (err, id) {
                        if (err) {
                            console.error(err);
                            dialogs.alert({
                                title: "Error creating database",
                                message: err,
                                okButtonText: "Okay"
                            }).then(function () { });
                            _this.error = true;
                            return;
                        }
                        _this.ready = true;
                    });
                } else {
                    // confirm that we are ready so we can use the DB
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
     * @param {Function} callback
     * @param {Function} errorCallback
     */
    queryGet(query, vals, callback, errorCallback = null) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise;
        if (!vals || vals.length == 0) {
            promise = this.database.get(query);
        } else {
            promise = this.database.get(query, vals);
        }
        promise.then(
            function (row) {
                try {
                    callback(row);
                } catch (err) {
                    var errorObj = new Error(err);
                    console.error(errorObj.message, errorObj.stack);
                    if (errorCallback) {
                        errorCallback(err);
                    }
                    dialogs.alert({
                        title: "Error on get query",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            },
            function (err) {
                var errorObj = new Error(err);
                console.error(errorObj.message, errorObj.stack);
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
     * @param {Function} callback
     * @param {Function} errorCallback
     */
    queryExec(query, vals, callback, errorCallback = null) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise;
        if (!vals || vals.length == 0) {
            promise = this.database.execSQL(query);
        } else {
            promise = this.database.execSQL(query, vals);
        }
        promise.then(
            function (id) {
                try {
                    callback(id);
                } catch (err) {
                    console.error(err);
                    if (errorCallback) {
                        errorCallback(err);
                    }
                    dialogs.alert({
                        title: "Error on exec query",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            },
            function (err) {
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
     * @param {Function} callback
     * @param {Function} errorCallback
     */
    queryAll(query, vals, callback, errorCallback = null) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise;
        if (!vals || vals.length == 0) {
            promise = this.database.all(query);
        } else {
            promise = this.database.all(query, vals);
        }
        promise.then(
            function (resultSet) {
                try {
                    callback(resultSet);
                } catch (err) {
                    console.error(err);
                    if (errorCallback) {
                        errorCallback(err);
                    }
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
     * @param {Function} callback
     * @param {Function} errorCallback
     */
    queryEach(query, vals, callback, errorCallback = null) {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }
        let promise;
        if (!vals || vals.length == 0) {
            promise = this.database.each(query);
        } else {
            promise = this.database.each(query, vals);
        }
        promise.then(
            function (row) {
                try {
                    callback(row);
                } catch (err) {
                    console.error(err);
                    if (errorCallback) {
                        errorCallback(err);
                    }
                    dialogs.alert({
                        title: "Error on each query",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                }
            },
            function (err) {
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
     * TODO previous implementations was bad. Needs to be replaced with a promise!
     * For now it just returns the state of the DB. It does not block until the
     * function is ready which was the original purpose.
     */
    _timeout() {
        return this.ready;
    }

    /**
     * Deletes all tables and rebuilds the local database.
     */
    rebuild() {
        if (this.error) {
            console.error("Database not open due to error.");
            return false;
        }
        if (!this._timeout()) {
            // cannot get DB
            console.error("Timout error.");
            return false;
        }

        // check if table exists. If not, then create.
        let dbLayer0 = this.database;
        let query = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '%metadata%';";
        this.database.all(query, function (err, rows) {

            try {

                if (err) {
                    console.error(err);
                    dialogs.alert({
                        title: "Error getting tables",
                        message: err,
                        okButtonText: "Okay"
                    }).then(function () { });
                    return;
                }

                // delete tables
                var deleteCount = 0;
                var doneDeleting = false;
                for (var row in rows) {
                    var curTable = rows[row][0];
                    let deleteQuery = "DROP TABLE IF EXISTS " + curTable + ";";
                    dbLayer0.execSQL(deleteQuery, function (err, id) {
                        if (err) {
                            console.error(err);
                            dialogs.alert({
                                title: "Error deleting table",
                                message: "Table: " + curTable + "\n" + err,
                                okButtonText: "Okay"
                            }).then(function () { });
                            return;
                        }
                        
                        // add to complete count
                        deleteCount++;
                    });
                }

                // wait until done.
                while (deleteCount < rows.length) {
                    // error. Escape.
                    if (doneDeleting && (deleteCount < rows.length)) {
                        console.error("Couldn't delete every Table. Aborted operation.");
                        return;
                    }
                }

                // create the final table
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
                dbLayer0.execSQL(createQuery, function (err, id) {
                    if (err) {
                        console.error(err);
                        dialogs.alert({
                            title: "Error creating database",
                            message: err,
                            okButtonText: "Okay"
                        }).then(function () { });
                        return;
                    }
                });

            } catch (err) {
                console.error(err);
            }

        });
    }
}
module.exports = LocalSave;