const request = require("request");
const types = require("./types");
const util = require("util");

const QUERY_TIMEOUT_INC = 200;
const QUERY_TIMEOUT_MAX = 1600;

const processEntry = function(query, entry) {
    request(entry.options, (err, res, body) => {
        if (typeof entry.callback !== "undefined") {
            if (!err && res.statusCode === 200) {
                // remove unnecessary information like status and time
                if (body && body.hasOwnProperty("data"))
                    body = body.data;

                // received data is expected to be just one object
                if (entry.extractArray) {
                    const length = body.length;

                    if (length > 1) {
                        err = new types.RequestError(
                            `received data from endpoint [${entry.verb}] ${entry.url} contained
                            more than one object. Enforced first object assignment anyway`,
                            "ok",
                            res.statusCode
                        );
                    }

                    if (length >= 1)
                        body = body[0];
                }

                entry.options = null;
                entry.callback(err, body);
            } else {
                if (entry.tries < 2 && (res ? res.statusCode : 0) >= 500) {
                    entry.tries++;

                    if (entry.flush) {
                        processEntry(query, entry);
                    } else {
                        query.queue.push(entry);

                        if (query.offset === 0)
                            query._process();
                    }
                } else {
                    if (!err) {
                        err = new types.RequestError(
                            body ? body.data : null,
                            body ? body.status : null,
                            res ? res.statusCode : null
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
};

/**
 * Query class for initiating proper HTTP requests to plug.dj
 */
class Query {
    /**
     * Create a new instance of Query
     */
    constructor() {
        this.options = {
            jar: null,
            json: true,
            encoding: "utf8",
            contentType: "application/json",
            accept: "application/json, text/javascript; q=0.1, */*; q=0.5"
        };
        this.queue = [];
        this.offset = 0;
        this.id = -1;
        this._process = this._process.bind(this);
    }

    /**
     * process the next entry in the queue
     * @private
     * @param {number} lastRequest - time since last request
     */
    _process(lastRequest = 0) {
        if (this.id !== -1)
            return;

        if (this.queue.length > 0) {
            if (lastRequest + this.offset <= Date.now()) {
                processEntry(this, this.queue.shift());

                if (this.offset < QUERY_TIMEOUT_MAX)
                    this.offset += QUERY_TIMEOUT_INC;
            }

            setTimeout(this._process, this.offset, Date.now());
        } else {
            this.id = setTimeout(() => {
                this.id = -1;

                if (this.queue.length > 0)
                    this._process();
                else
                    this.offset = 0;
            }, 400);
        }
    }

    /**
     * sets the encoding type to be used when building requests
     * @param {string} type - determines the encoding type to be used. Defaults to "utf8"
     */
    setEncoding(type = "utf8") {
        this.options.encoding = type;
    }

    /**
     * @returns {string} returns the current encoding settings
     */
    getEncoding() {
        return this.options.encoding;
    }

    /**
     * Allows to change the currently used cookie jar.
     * @param {object} jar - jar to be used
     * @param {object} storage - allows for a custom cookie store to be used like FileCookieStore
     */
    setJar(jar, storage = null) {
        this.options.jar = jar || request.jar(storage);
    }

    /**
     * @returns {object} jar - the currently used jar
     */
    getJar() {
        return this.options.jar;
    }

    /**
     * @param {string} accept data type for response to accept
     */
    setAccept(accept) {
        this.options.accept = accept;
    }

    /**
     * @returns {string} data type for response to accept
     */
    getAccept() {
        return this.options.accept;
    }

    /**
     * @param {string} type of content to accept
     */
    setContentType(type) {
        this.options.json = type.includes("application/json");
        this.options.contentType = type;
    }

    /**
     * @returns {string} type of content to accept
     */
    getContentType() {
        return this.options.contentType;
    }

    /**
     * queries a new HTTP request to the server
     * @param {string} verb - HTTP verb to be used, for example: "GET", "PUT", "POST", "DELETE", etc.
     * @param {string} url - composed string that defines the url to which server the request should be send
     * @param {object} data - JSON object containing all data that is to be send
     * @param {function} callback - function that will be called on reply
     * @param {boolean} extractArray - when true, flattens the information. Useful when you expect only a single value
     * @param {boolean} flush - when true, Query will ignore the request queue and send the it straight to the server
     */
    query(verb, url, data, callback, extractArray = false, flush = false) {
        if (typeof data !== "object") {
            if (typeof callback === "boolean") {
                flush = extractArray;
                extractArray = callback;
            }

            callback = data;
            data = {};
        }

        // TODO: rethink the way of handling errors on incorrect verbs or an invalid url

        const entry = {
            tries: 0,
            flush: flush,
            extractArray: extractArray,
            callback: callback,
            options: {
                url: url,
                method: verb,
                jar: this.options.jar,
                encoding: this.options.encoding,
                body: data,
                json: this.options.json,
                headers: {
                    "User-Agent": "Plugged/3.0",
                    "Accept": this.options.accept,
                    "Content-Type": this.options.contentType
                }
            }
        };

        if (flush) {
            processEntry(this, entry);
        } else {
            this.queue.push(entry);

            if (this.offset === 0)
                this._process();
        }
    }

    /**
     * clears the request queue
     */
    flushQueue() {
        this.queue = [];
    }
}

module.exports = Query;
