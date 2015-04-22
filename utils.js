var setErrorMessage = function(statusCode, msg) {
    return {
        code: statusCode,
        message: msg
    };
};

var createIterator = function(arr) {
    currentIndex = 0;

    return {
        next: function() {
            return (currentIndex < arr.length ? {
                value: arr[currentIndex++],
                done: false
            } : { done: true });
        }
    };
};

var waterfall = function(funcs, callback) {
    callback = callback || function() {};

    if(!Array.isArray(funcs))
        throw new Error("funcs are not of type array");
    else if(funcs.length <= 0)
        throw new Error("array is empty!");

    var iterator = createIterator(funcs);

    var obj = function() {
        var nxt = iterator.next();
        var err = arguments[0];
        var args = [];

        //not so nice looking copy to keep vm optimizations
        for(var i = (nxt.done ? 0 : 1), l = arguments.length; i < l; i++)
            args.push(arguments[i]);
        args.push(obj);

        if(!nxt.done && !err)
            nxt.value.apply(nxt.value, args);
        else
            callback.apply(callback, (!err ? args : err));
    };

    obj();
};

var loginClient = function(client, tries) {
    tries = tries || 0;

    waterfall([
        client.getCSRF.bind(client),
        client.setLogin.bind(client),
        client._getAuthToken.bind(client)
    ], function _loginCredentialCheck(err) {
        if(err) {
            if(tries < 2) {
                client.log("an error occured while trying to log in", 0, "red");
                client.log("err: " + err.code, 1, "red");
                client.log("trying to reconnect...", 0);
                loginClient(client, ++tries);
            } else {
                client.log("couldn't log in.", 0, "red");
                client.emit(client.LOGIN_ERROR, "couldn't log in");
            }
        } else {
            client._loggedIn.call(client);
        }
    });
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
exports.createIterator = createIterator;
exports.loginClient = loginClient;
exports.waterfall = waterfall;
exports.decode = decode;
