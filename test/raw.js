var utils = require("../utils");
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

var serializeMedia = function(data) {
    data = data || {};
    var title = utils.splitTitle(data.title);

    if(typeof data.id !== "string")
        data.id = String(data.id);

    return {
        id: 0,
        format: (!data.hasOwnProperty("artwork_url") ? 1 : 0),
        cid: data.id || "",
        author: title[0] || "",
        title: title[1] || "",
        image: (!data.hasOwnProperty("artwork_url") ?
            "https://i.ytimg.com/vi/" + data.id + "/default.jpg" :
            data.artwork_url),
        duration: (!data.hasOwnProperty("artwork_url") ?
            0 :
            Math.round((data.duration ? data.duration : 0) / 1000))
    };
};

var serializeMediaObjects = function(data) {
    data = data || {};
    var arr = [];

    for(var i = 0, l = data.length; i < l; i++)
        arr[i] = serializeMedia(data[i]);

    return arr;
};

// preserve sanity of internal state
var mapSelf = function(data) {
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

exports.mapXP = function(data) { return data; };
exports.mapBan = function(data) { return data; };
exports.pushVote = function(data) { return data; };
exports.mapChat = function(data) { return data; };
exports.mapSelf = mapSelf;
exports.mapUser = function(data) { return data; };
exports.mapRoom = function(data) { return data; };
exports.mapMeta = function(data) { return data; };
exports.mapLock = function(data) { return data; };
exports.mapMute = function(data) { return data; };
exports.mapCycle = function(data) { return data; };
exports.mapGrabs = function(data) { return data; };
exports.mapMedia = function(data) { return data; };
exports.mapVotes = function(data) { return data; };
exports.mapBooth = function(data) { return data; };
exports.mapModBan = function(data) { return data; };
exports.createState = createState;
exports.mapModMove = function(data) { return data; };
exports.mapSettings = function(data) { return data; };
exports.mapModAddDJ = function(data) { return data; };
exports.mapPlayback = function(data) { return data; };
exports.serializeMedia = serializeMedia;
exports.mapPromotion = function(data) { return data; };
exports.mapModRemove = function(data) { return data; };
exports.mapUserUpdate = function(data) { return data; };
exports.mapChatDelete = function(data) { return data; };
exports.mapExtendedRoom = function(data) { return data; };
exports.mapHistoryEntry = function(data) { return data; };
exports.mapFriendRequest = function(data) { return data; };
exports.mapRoomNameUpdate = function(data) { return data; };
exports.serializeMediaObjects = serializeMediaObjects;
exports.convertPlugTimeToDate = function(data) { return data; };
exports.mapRoomWelcomeUpdate = function(data) { return data; };
exports.mapRoomDescriptionUpdate = function(data) { return data; };