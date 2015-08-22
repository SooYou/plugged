var Iterator = function(array) {
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

exports.splitTitle = splitTitle;
exports.waterfall = waterfall;
exports.Iterator = Iterator;
exports.decode = decode;
