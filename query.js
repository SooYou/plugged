var request = require("request");
var verbs = ["GET", "POST", "PUT", "DELETE"];

function processEntry(query, entry) {
    request(entry.options, function requestCB(err, res, body) {
        query.active--;

        if(typeof entry.callback !== "undefined") {
             if(!err && res.statusCode == 200) {

                // remove unnecessary information.
                if(body && body.hasOwnProperty("data"))
                    body = body.data;

                // extract unnecessary array
                if(entry.extractArray && body.length === 1)
                    body = body[0];
                else if(entry.extractArray && body.length === 0)
                    body = null;

                entry.options = {};
                entry.callback(null, body);

            } else {
                // don't bother trying it again in case this entry got flushed through (tries === -1).
                if((entry.tries >= 0 && entry.tries < 2) && (res ? res.statusCode : 0) >= 500) {
                    entry.tries++;
                    setTimeout(pushAndProcess, 5*1000, query, entry);
                } else {
                    entry.options = {};
                    if(!err) {
                        err = new Error(body && (body.data ? body.data[0] : body.status) || 'Request returned ' + res.statusCode);
                    }
                    err.code = res.statusCode;
                    err.status = body ? body.status : null;
                    err.data = body ? body.data : null;
                    entry.callback(err);
                }

            }

        } else {
            entry = null;
        }

    });
}

function pushAndProcess(query, entry) {
    query.queue.push(entry);
    query.process();
}

function watcher(query) {
    if(query.queue.length === 0)
        query.stopWatcher();

    for(var i = 0; i < Math.min(5, query.queue.length); i++)
        query.process();
}

function Query() {
    this.jar = null;
    this.queue = [];
    this.active = 0;
    this.watcherID = 0;
    this.startWatcher();
}

Query.prototype.setJar = function(jar, storage) {
    this.jar = jar || request.jar(storage);
};

Query.prototype.getJar = function() {
    return this.jar;
};

Query.prototype.query = function(verb, url, data, callback, extractArray, flush) {
    extractArray = extractArray || false;
    flush = flush || false;

    //reorganize arguments since parameter data is optional
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
        tries: (flush ? -1 : 0),
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
                "User-Agent": "PlugClient/1.0 (NODE)",
                "Accept": "application/json, text/javascript; q=0.1, */*; q=0.5",
                "Content-Type": "application/json"
            }
        }
    };

    if(!flush) {
        this.queue.push(entry);
        this.process();
    } else {
        this.active++;
        processEntry(this, entry);
    }
};

Query.prototype.flushQueue = function() {
    this.queue = [];
};

Query.prototype.process = function() {
    if(this.queue.length > 0) {

        if(this.active <= 5) {
            clearTimeout(this.timeoutID);
            this.timeoutID = 0;
            this.active++;
            processEntry(this, this.queue.shift());
        } else if(this.watcherID === 0) {
            this.startWatcher();
        }

    }
};

Query.prototype.startWatcher = function() {
    if(this.watcherID > 0)
        this.stopWatcher();

    //otherwise plug flips its shit and tells us to stop flooding its API
    this.watcherID = setInterval(watcher, 5*1000, this);
};

Query.prototype.stopWatcher = function() {
    clearInterval(this.watcherID);
    this.watcherID = 0;
};

module.exports = Query;
