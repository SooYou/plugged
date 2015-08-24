var request = require("request");
var util = require("util");

var verbs = ["GET", "POST", "PUT", "DELETE"];

var RequestError = function(data, status, code) {
    Error.captureStackTrace(this);

    this.name = "RequestError";
    this.message = (data && Array.isArray(data) && data.length > 0) ? data[0] : "Request returned " + (status || null);
    this.status = status || null;
    this.code = code || null;
};

util.inherits(RequestError, Error);

var watcher = function(query) {
    if(query.queue.length === 0)
        query._stopWatcher();

    while(query._process());
};

var processEntry = function(query, entry) {
    request(entry.options, function requestCB(err, res, body) {
        query.active--;

        if(typeof entry.callback !== "undefined") {
             if(!err && res.statusCode == 200) {

                // remove unnecessary information like status and time.
                if(body && body.hasOwnProperty("data"))
                    body = body.data;

                // received data is expected to be just one object
                if(entry.extractArray) {
                    var length = body.length;

                    if(length > 1) {
                        err = new RequestError([
                                "received data from endpoint [",
                                entry.verb,
                                "] ",
                                entry.url,
                                " included more than one object. Enforced first object assignment anyway"
                            ].join(''),
                            "ok",
                            res.statusCode
                        );
                    }

                    // enforce single object
                    if(length >= 1)
                        body = body[0];
                    else
                        body = null;
                }

                entry.options = null;
                entry.callback(err, body);

            } else {
                // don't bother trying it again in case this entry got flushed through (tries === -1).
                if((entry.tries >= 0 && entry.tries < 2) && (res ? res.statusCode : 0) >= 500) {
                    entry.tries++;
                    query.queue.push(entry);
                    query._process();
                } else {
                    if(!err) {
                        err = new RequestError(
                            body ? body.data : null,
                            body ? body.status : null,
                            res ? res.code : null
                        );
                    }

                    entry.options = null;
                    entry.callback(err);
                }

            }

        } else {
            entry = null;
        }

    });
}

function Query() {
    this.jar = null;
    this.queue = [];
    this.active = 0;
    this.watcherID = -1;
}

Query.prototype._process = function() {
    if(this.queue.length > 0) {
        if(this.active <= 5) {
            this.active++;
            processEntry(this, this.queue.shift());

            return true;
        } else if(this.watcherID === -1) {
            this._startWatcher();
        }
    }

    return false;
};

Query.prototype._startWatcher = function() {
    if(this.watcherID >= 0)
        this._stopWatcher();

    //otherwise plug flips its shit and tells us to stop flooding its API
    this.watcherID = setTimeout(watcher, 5*1000, this);
};

Query.prototype._stopWatcher = function() {
    clearTimeout(this.watcherID);
    this.watcherID = -1;
};

Query.prototype.setJar = function(jar, storage) {
    this.jar = jar || request.jar(storage);
};

Query.prototype.getJar = function() {
    return this.jar;
};

Query.prototype.query = function(verb, url, data, callback, extractArray, flush) {
    extractArray = extractArray || false;
    flush = flush || false;

    // reorganize arguments since parameter data is optional
    if(typeof data === "function") {
        if(typeof callback === "boolean") {
            flush = extractArray;
            extractArray = callback;
        }
        callback = data;
        data = {};
    }

    if(!verb || verbs.indexOf(verb.toUpperCase()) < 0)
        throw new Error("verb was not defined or invalid");
    if(!url || typeof url !== "string")
        throw new Error("url was not defined or not of type string");

    var entry = {
        tries: 0,
        extractArray: extractArray,
        callback: callback,
        options: {
            url: url,
            method: verb,
            jar: this.jar,
            encoding: "utf8",
            body: data,
            json: true,
            headers: {
                "User-Agent": "PlugClient/1.1 (NODE)",
                "Accept": "application/json, text/javascript; q=0.1, */*; q=0.5",
                "Content-Type": "application/json"
            }
        }
    };

    if(!flush) {
        this.queue.push(entry);
        this._process();
    } else {
        this.active++;
        processEntry(this, entry);
    }
};

Query.prototype.flushQueue = function() {
    this.queue = [];
    this._stopWatcher();
};

module.exports = Query;
