var setErrorMessage = function(statusCode, msg) {
    return {
        code: statusCode,
        message: msg
    };
};

function Iterator(array) {
    if(!Array.isArray(array))
        throw new Error("Parameter is not an array");

    this.array = array;
    this.index = 0;
}

Iterator.prototype.next = function() {
    return this.index < this.array.length ?
        { value: this.array[this.index++], done: false } :
        { done: true };
};

var waterfall = function(funcs, callback, context) {
    callback = callback || function() {};
    var iterator = new Iterator(funcs);

    (function _obj() {
        var args = [];
        var step = iterator.next();

        // not so nice looking copy to keep vm optimizations
        for(var i = 0, l = arguments.length; i < l; i++)
            args.push(arguments[i]);

        if(!step.done && !args[0]) {
            // shift out error placeholder
            args.shift();
            args.push(_obj);

            setImmediate(function(val, args) {
                val.apply(context, args);
            }, step.value, args);
        } else {
            setImmediate(function(callback, args) {
                callback.apply(context, args);
            }, callback, args);
        }
    }());
};

var loginClient = function(client, tries) {
    tries = tries || 0;

    waterfall([
        client.getCSRF.bind(client),
        client.setLogin.bind(client),
        client._getAuthToken.bind(client)
    ], function _loginCredentialCheck(err) {
        if(err) {
            if(tries < 2 && err.code !== 401) {
                client._log("an error occured while trying to log in", 0, "red");
                client._log(err, 2, "red");
                client._log("retrying...", 0);
                loginClient(client, ++tries);
            } else {
                client._log("couldn't log in.", 0, "red");
                client.emit(client.LOGIN_ERROR, err);
            }
        } else {
            client._loggedIn.call(client);
        }
    });
};

var splitTitle = function(title) {
    title = title || "";

    if(typeof title === "string") {
        if(title.indexOf('-') >= 0)
            title = title.split('-').map(function(str) { return str.trim(); });
        else if(title.indexOf(' ') >= 0)
            title = title.split(' ').map(function(str) { return str.trim(); });
        else
            title = [title, title];
    }

    return title;
};

var decode = function(str) {
    if(typeof str !== "string")
        return str;

    return str
    .replace(/&#34;/g, '\\\"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

exports.setErrorMessage = setErrorMessage;
exports.loginClient = loginClient;
exports.splitTitle = splitTitle;
exports.waterfall = waterfall;
exports.Iterator = Iterator;
exports.decode = decode;
