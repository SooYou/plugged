var utils = require("./utils");
var util = require("util");

var convertPlugTimeToDate = function(plugTime) {
    var res = /(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+).(\d+)/g.exec(plugTime);
    var time = "Invalid Date";

    if(res === null)
        return time;

    for(var i = res.length - 1; i >= 0; i--) {
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

var parseSelf = function(data) {
    data = data || {};
    data.friends = [];

    return data;
};

var createState = function(data) {
    data = data || {};

    return {
        credentials: data.credentials || {},
        self: data.self || {},
        room: data.room || {},
        usercache: data.usercache || [],
        chatcache: data.chatcache || []
    };
};

exports.parseXP = function(data) { return data; };
exports.parseBan = function(data) { return data; };
exports.pushVote = function(data) { return data; };
exports.parseChat = function(data) { return data; };
exports.parseSelf = parseSelf;
exports.parseUser = function(data) { return data; };
exports.parseRoom = function(data) { return data; };
exports.parseMeta = function(data) { return data; };
exports.parseLock = function(data) { return data; };
exports.parseMute = function(data) { return data; };
exports.parseCycle = function(data) { return data; };
exports.parseGrabs = function(data) { return data; };
exports.parseMedia = function(data) { return data; };
exports.parseVotes = function(data) { return data; };
exports.parseBooth = function(data) { return data; };
exports.parseModBan = function(data) { return data; };
exports.createState = createState;
exports.parseModMove = function(data) { return data; };
exports.parseSettings = function(data) { return data; };
exports.parseModAddDJ = function(data) { return data; };
exports.parsePlayback = function(data) { return data; };
exports.serializeMedia = function(data) { return data; };
exports.parsePromotion = function(data) { return data; };
exports.parseModRemove = function(data) { return data; };
exports.parseUserUpdate = function(data) { return data; };
exports.parseChatDelete = function(data) { return data; };
exports.parseExtendedRoom = function(data) { return data; };
exports.parseHistoryEntry = function(data) { return data; };
exports.parseFriendRequest = function(data) { return data; };
exports.parseRoomNameUpdate = function(data) { return data; };
exports.serializeMediaObjects = function(data) { return data; };
exports.convertPlugTimeToDate = function(data) { return data; };
exports.parseRoomWelcomeUpdate = function(data) { return data; };
exports.parseRoomDescriptionUpdate = function(data) { return data; };