
const Reset = "\x1b[0m"
const Bright = "\x1b[1m"
const Dim = "\x1b[2m"
const Underscore = "\x1b[4m"
const Blink = "\x1b[5m"
const Reverse = "\x1b[7m"
const Hidden = "\x1b[8m"

const FgBlack = "\x1b[30m"
const FgRed = "\x1b[31m"
const FgGreen = "\x1b[32m"
const FgYellow = "\x1b[33m"
const FgBlue = "\x1b[34m"
const FgMagenta = "\x1b[35m"
const FgCyan = "\x1b[36m"
const FgWhite = "\x1b[37m"

const BgBlack = "\x1b[40m"
const BgRed = "\x1b[41m"
const BgGreen = "\x1b[42m"
const BgYellow = "\x1b[43m"
const BgBlue = "\x1b[44m"
const BgMagenta = "\x1b[45m"
const BgCyan = "\x1b[46m"
const BgWhite = "\x1b[47m"

const fs = require('fs');
const glob = require('glob');

const getDirectories = function (src) {
    return new Promise((resolve, reject) => {
        glob(src + '/**/*', (err, res) => {
            if (err) {
                return reject(err);
            }

            resolve(res);
        });
    });
};

const getFolders = (path) => {
    return new Promise((resolve) => {
        fs.readdir(path, (err, list) => {
        if (err) {
            console.log(err);
            return resolve([]);
        }

        list = list.filter((folder) => {
            return !folder.includes('.');
        });

        return resolve(list);
        });
    });
}

function log(message) {
    console.log(`[${(new Date()).toJSON()}] ${message}`);
}

function error(message) {
    console.error(BgRed, FgWhite, `[${(new Date()).toJSON()}] ${message}`, Reset);
}

module.exports = {
    log,
    error,
    getFolders,
    getDirectories,
};
