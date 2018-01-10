const needle = require("needle");
const types = require("./types");
const util = require("util");
const conf = require("./conf/config");

const QUERY_TIMEOUT_INC = 200;
const QUERY_TIMEOUT_MAX = 1600;

const processEntry = function(query, entry) {
    needle.request(entry.method, entry.url, entry.data, entry.options, (err, res) => {
        if (typeof entry.callback !== "undefined") {
            if (!err && res.statusCode === 200) {
                let body = null;
                query._parseCookies(res.cookies);
                // remove unnecessary information like status and time
                if (res && res.body && res.body.hasOwnProperty("data"))
                    body = res.body.data;

                // received data is expected to be just one object
                if (entry.extractArray && body) {
                    const length = body.length;

                    if (length > 1) {
                        err = new types.RequestError(
                            `received data from endpoint [${entry.method}] ${entry.url} contained
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
                            res ? res.body ? res.body.data : res : null,
                            res ? res.body ? res.body.status : res : null,
                            res ? res.statusCode : null
                        );
                    }

                    entry.options = null;
                    entry.callback(err);
                }
            }
        }

        entry = null;
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

    _parseCookies(cookies) {
        if (cookies) {
            for (let cookie in cookies) {
                this.options.jar[cookie] = cookies[cookie];
            }
        }
    }

    _parseStorage(storage) {
        this.options.jar = {};

        if (!storage)
            return;

        if (storage.hasOwnProperty("idx") && typeof storage.idx === "object") {
            this.options.jar = this._jarToObject(storage.idx);
        } else if (typeof storage.getAllCookies === "function") {
            storage.getAllCookies((err, cookies) => {
                this.options.jar = this._jarToObject(cookies);
            });
        }
    }

    _jarToObject(jar = {}) {
        let obj = {};

        for (let domain in jar) {
            for (let path in domain) {
                for (let key in path) {
                        obj[key] = jar[domain][path][key];
                }
            }
        }

        return obj;
    }

    _objectToJar(obj) {
        let jar = {}
        let domain = "plug.dj";

        if (!obj)
            return null;

        if (conf && conf.provider) {
            if (conf.provider.indexOf("https://") !== -1)
                domain = conf.provider.substr(8);
            else if (conf.provider.indexOf("http://") !== -1)
                domain = conf.provider.substr(7);
        }

        jar[domain] = {};
        jar[domain]['/'] = {};

        for (let cookie in obj) {
            jar[domain]['/'][cookie] = obj[cookie];
        }

        return jar;
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
        if (!storage)
            this.options.jar = this._jarToObject(jar);
        else
            this._parseStorage(storage);
    }

    /**
     * @returns {object} jar - the currently used jar
     */
    getJar() {
        return this._objectToJar(this.options.jar);
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
            url: url,
            method: verb,
            data: data,
            flush: flush,
            extractArray: extractArray,
            callback: callback,
            options: {
                cookies: this.options.jar,
                json: this.options.json,
                headers: {
                    "User-Agent": "Plugged/3.0",
                    "Accept": this.options.accept,
                    "Accept-Charset": this.options.encoding,
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
