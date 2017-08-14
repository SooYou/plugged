const util = require("util");

// TODO: replace with native iterator implementation
class Iterator {
    constructor(array) {
        if (!Array.isArray(array))
            throw new Error("Parameter is not an array");

        this.array = array;
        this.index = 0;
    }

    next() {
        return this.index < this.array.length ?
        { value: this.array[this.index++], done: false } :
        { done: true }
    }
}

const waterfall = function(funcs, callback, context, ...args) {
    const iterator = new Iterator(funcs);

    (function _obj() {
        const args = [...arguments];
        const step = iterator.next();

        if (!step.done && !args[0]) {
            // shift out error placeholder
            args.shift();
            args.push(_obj);

            setImmediate((context, args, val) => {
                val.apply(context, args);
            }, context, args, step.value);
        } else {
            setImmediate((context, args, callback) => {
                callback && callback.apply(context, args);
            }, context, args, callback);
        }
    }(...args));
};

const splitTitle = function(title = "") {
    if(typeof title === "string") {
        if(title.indexOf('-') >= 0)
            title = title.split('-').map(str => { return str.trim(); });
        else if(title.indexOf(' ') >= 0)
            title = title.split(' ').map(str => { return str.trim(); });
        else
            title = [title, title];
    }

    return title;
};

const decode = function(str) {
    if(typeof str !== "string")
        return str;

    return str
    .replace(/&#34;/g, '\\\"')
    .replace(/&#39;/g, '\'')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

const convertPlugTimeToDate = function(plugTime) {
    const res = /(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+).(\d+)/g.exec(plugTime);
    let time = "Invalid Date";

    if(res === null)
        return time;

    for(let i = res.length - 1; i >= 0; i--) {
        // clean array from unnecessary info
        if(isNaN(res[i]) && !isFinite(res[i]))
            res.splice(i, 1);
    }

    if(res.length === 3) {
        res.unshift("%s-%s-%s");
        time = util.format.apply(util, res);
    } else if(res.length === 6) {
        res.unshift("%s-%s-%sT%s:%s:%sZ");
        time = util.format.apply(util, res);
    } else if(res.length === 7) {
        res.unshift("%s-%s-%sT%s:%s:%s.%sZ");
        time = util.format.apply(util, res);
    }

    return time;
};

exports.convertPlugTimeToDate = convertPlugTimeToDate;
exports.splitTitle = splitTitle;
exports.waterfall = waterfall;
exports.Iterator = Iterator;
exports.decode = decode;
