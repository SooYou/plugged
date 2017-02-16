const fs = require("fs");
const path = require("path");
const util = require("util");

class Logger {
    constructor(options = {
        verbosity: 0,
        inspect: false,
        file: null,
        colors: {
            gray: "\x1b[0m",
            red: "\x1b[31;1m",
            blue: "\x1b[34;1m",
            cyan: "\x1b[36;1m",
            white: "\x1b[37;1m",
            green: "\x1b[32;1m",
            yellow: "\x1b[33;1m",
            magenta: "\x1b[35;1m"
        }
    }) {
        this.options = options;

        if (fs.existsSync(this.file))
            fs.unlink(path.resolve(this.file));
    }

    log(msg, verbosity = 0, color = this.options.colors.white) {
        if (this.verbosity > verbosity)
            console.log(msg);
        
        if(this.file)
            fs.appendFile(this.file, msg.replace(/\x1b\[\d+(;\d)?m/g, '') + '\r\n');
    }

    info(msg) {
        this.log(`[  info  ] ${msg}`);
    }

    warn(msg) {
        this.log(`[  warn  ] ${msg}`, 1, this.options.yellow);
    }

    success(msg) {
        this.log(`[ success ] ${msg}`, 1, this.options.green);
    }

    error(msg) {
        this.log(`[  error  ] ${msg}`, 1, this.options.red);
    }

    wtf(msg) {
        this.log(`[  wtf  ] ${msg}`, 2, this.options.red);
    }
}

module.exports = Logger;
