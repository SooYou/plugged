var fs = require("fs");
var path = require("path");
var util = require("util");

module.exports = function Logger(options) {
    options = options || {};
    this.verbosity = options.verbosity || 0;
    this.inspect = options.inspect || false;
    this.file = options.file || null;
    this.colors = options.colors || {
        gray: "\x1b[0m",
        red: "\x1b[31;1m",
        blue: "\x1b[34;1m",
        cyan: "\x1b[36;1m",
        white: "\x1b[37;1m",
        green: "\x1b[32;1m",
        yellow: "\x1b[33;1m",
        magenta: "\x1b[35;1m"
    };

    if(fs.existsSync(this.file))
        fs.unlink(path.resolve(this.file));

    return function _logger(msg, verbosity, color) {
        verbosity = verbosity || 0;
        color = color || "white";
        var tag;

        switch(color) {
            case "red":
                tag = "  error  ";
                break;
            case "green":
                tag = " success ";
                break;
            case "yellow":
                tag = " warning ";
                break;
            default:
                tag = "  info   ";
                break;
        }

        if(msg && this.verbosity > verbosity) {
            msg = [
                '[',
                this.colors[color],
                tag,
                this.colors["gray"],
                ']',
                ' ',
                this.colors[color],
                (this.inspect && typeof msg === "object" ? util.inspect(msg) : msg),
                this.colors["gray"]
                ].join('');

            console.log(msg);

            if(this.file)
                fs.appendFile(this.file, msg.replace(/\x1b\[\d+(;\d)?m/g, '') + '\r\n');
        }
    }.bind(this);
}