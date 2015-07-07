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

var serializeMedia = function(data) {
    data = data || {};
    var title = utils.splitTitle(data.title);

    if(typeof data.id !== "string")
        data.id = String(data.id);

    var media = {
        id: 0,
        cid: data.id || "",
        author: title[0] || "",
        title: title[1] || "",
        duration: 0
    };

    if(!data.hasOwnProperty("artwork_url")) {
        media.format = 1;
        media.image = "https://i.ytimg.com/vi/" + data.id + "/default.jpg";
    } else {
        media.format = 2;
        media.image = data.artwork_url || "";
        media.duration = Math.round((data.duration || 0) / 1000);
    }

    return media;
};

var serializeMediaObjects = function(data) {
    data = data || {};
    var arr = [];

    for(var i = 0, l = data.length; i < l; i++)
        arr[i] = serializeMedia(data[i]);

    return arr;
};

var parseSelf = function(data) {
    data = data || {};

    return {
        joined: convertPlugTimeToDate(data.joined),
        username: utils.decode(data.username) || "",
        avatarID: data.avatarID || "base01",
        language: data.language || "en",
        blurb: utils.decode(data.blurb) || "",
        slug: data.slug || "",
        notifications: data.notification || [],
        settings: data.settings || {
            chatTimestamps: 12,
            notifyFriendJoin: true,
            notifyScore: true,
            chatImages: true,
            videoOnly: true,
            tooltips: true,
            notifyDJ: true,
            emoji: true,
        },
        ignores: data.ignores || [],
        friends: data.friends || [],
        pw: data.pw || false,
        guest: data.guest || false,
        level: data.level || 0,
        gRole: data.gRole || 0,
        badge: data.badge || "",
        role: data.role || 0,
        sub: data.sub || 0,
        xp: data.xp || 0,
        pp: data.pp || 0,
        id: data.id || -1
    };
};

var parseUser = function(data) {
    data = data || {};

    return {
        joined: convertPlugTimeToDate(data.joined),
        username: utils.decode(data.username) || "",
        avatarID: data.avatarID || "base01",
        language: data.language || "en",
        blurb: utils.decode(data.blurb) || "",
        slug: data.slug || "",
        level: data.level || 0,
        gRole: data.gRole || 0,     // global role
        badge: data.badge || "",
        role: data.role || 0,
        sub: data.sub || 0,
        guest: data.guest || false,
        id: data.id || -1
    };
};

var parseUsers = function(data) {
    data = data || {};
    var arr = [];

    for(var i = data.length-1; i >= 0; i--)
        arr.push(parseUser(data[i]));

    return arr;
};

var parseUserUpdate = function(data) {
    data = data || {};

    return {
        id: data.i || -1,
        level: data.level || undefined,
        avatarID: data.avatarID || undefined,
        username: utils.decode(data.username) || undefined
    };
};

var parseMedia = function(data) {
    data = data || {};

    return {
        author: utils.decode(data.author) || "",
        title: utils.decode(data.title) || "",
        image: data.image || "",
        cid: data.cid || "",
        duration: data.duration || 0,
        format: data.format || 1,   //most media played on plug originates from youtube.
        id: data.id || -1
    }
};

var parseMute = function(data, expireDate) {
    data = data || {};

    return {
        username: utils.decode(data.username) || data.t || "",
        id: data.id || data.i || -1,
        moderator: utils.decode(data.moderator) || data.m || "",
        reason: data.reason || data.r || 1,
        expires: data.expires || expireDate || -1
    };
};

var parseGrabs = function(data) {
    data = data || {};
    var arr = [];

    for(var key in data)
        arr.push(key);

    return arr;
};

var parseModAddDJ = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || ""
    };
};

var parseModMove = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.u) || "",
        oldIndex: data.o || 0,
        newIndex: data.n || 0
    };
};

var parsePlayback = function(data) {
    data = data || {};

    return {
        media: parseMedia(data.media),
        historyID: data.historyID || "",
        playlistID: data.playlistID || -1,
        startTime: convertPlugTimeToDate(data.startTime)
    };
};

var parseHistoryEntry = function (data) {
    data = data || {};

    return {
        id: data.id || "",
        media: (data.media ? {
            cid: data.media.cid || "",
            title: utils.decode(data.media.title) || "",
            author: utils.decode(data.media.author) || "",
            image: data.media.image || "",
            duration: data.media.duration || 0,
            format: data.media.format || 1,
            id: data.media.id || -1,
        } : {
            cid: "",
            title: "",
            author: "",
            image: "",
            duration: 0,
            format: 1,
            id: -1
        }),
        room: (data.room ? {
            name: utils.decode(data.room.name) || "",
            slug: data.room.slug || ""
        } : {
            name: "",
            slug: ""
        }),
        score: (data.score ? {
            grabs: data.score.grabs || 0,
            listeners: data.score.listeners || 0,
            negative: data.score.negative || 0,
            positive: data.score.positive || 0,
            skipped: data.score.skipped || 0
        } : {
            grabs: 0,
            listeners: 0,
            negative: 0,
            positive: 0,
            skipped: 0
        }),
        timestamp: convertPlugTimeToDate(data.timestamp),
        user: (data.user ? {
            id: data.user.id || -1,
            username: utils.decode(data.user.username) || ""
        } : {
            id: -1,
            username: ""
        })
    };
};

var parseFriendRequest = function(data) {
    data = data || {};

    return {
        username: utils.decode(data.username) || "",
        avatarID: data.avatarID || "",
        timestamp: convertPlugTimeToDate(data.timestamp) || "",
        joined: convertPlugTimeToDate(data.joined) || "",
        status: data.status || 0,
        gRole: data.gRole || 0,
        level: data.level || 0,
        id: data.id || -1
    };
};

var parseVotes = function(data) {
    data = data || {};
    var arr = [];

    for(var key in data) {
        arr.push({
            id: key,
            direction: data[key]
        });
    }

    return arr;
};

var pushVote = function(vote) {
    return {
        id: vote.i || -1,
        direction: vote.v || 1
    };
};

var parseSettings = function(data) {
    data = data || {};

    return {
        volume: data.volume || 50,
        avatarcap: data.avatarcap || 50,
        dancing: data.dancing || 1,
        streamDisabled: data.streamDisabled || 0,
        chatSound: data.chatSound || 1,
        chatTranslation: data.chatTranslation || 0,
        chatTimestamps: data.chatTimestamps || 24,
        emoji: data.emoji || 1,
        notifyDJ: data.notifyDJ || 1,
        notifyFriendJoin: data.notifyFriendJoin || 1,
        notifyScore: data.notifyScore || 0,
        tooltips: data.tooltips || 0,
        videoOnly: data.videoOnly || 0
    };
};

var parseExtendedRoom = function(data) {
    data = data || {};

    return {
        cid: data.cid || "",
        dj: (typeof data.dj === "string" ?
                utils.decode(data.dj) :
                typeof data.dj === "object" ?
                parseUser(data.dj) :
                ""),
        favorite: data.favorite || false,
        format: parseInt(data.format) || 1,
        guests: data.guests || 0,
        host: utils.decode(data.host) || "",
        id: data.id || -1,
        image: data.image || "",
        media: utils.decode(data.media) || "",
        name: utils.decode(data.name) || "",
        nsfw: data.nsfw || false,
        capacity: data.capacity || 5000,
        population: parseInt(data.population) || 0,
        private: data.private || false,
        slug: data.slug || ""
    };
};

var parseRoom = function(data) {
    data = data || {};

    return {
        booth: parseBooth(data.booth),
        fx: data.fx || [],
        grabs: parseGrabs(data.grabs),
        meta: parseMeta(data.meta),
        playback: parsePlayback(data.playback),
        role: data.role || 0,
        users: parseUsers(data.users),
        votes: parseVotes(data.votes)
    };
};

var parseMeta = function(data) {
    data = data || {};

    return {
        description: utils.decode(data.description) || "",
        favorite: data.favorite || false,
        hostID: data.hostID || -1,
        hostName: utils.decode(data.hostName) || "",
        id: data.id || -1,
        minChatLevel: data.minChatLevel || 0,
        name: utils.decode(data.name) || "",
        population: data.population || 0,
        slug: data.slug || undefined,
        guests: data.guests || 0,
        welcome: utils.decode(data.welcome) || ""
    };
};

var parseBooth = function(data) {
    data = data || {};

    return {
        dj: data.currentDJ || -1,               //id of the active DJ
        isLocked: data.isLocked || false,       //is waitlist locked?
        shouldCycle: data.shouldCycle || true,  //should it cycle?
        waitlist: data.waitingDJs || []         //array of IDs
    };
};

var parseModBan = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || "",
        duration: data.d || 'h'
    };
};

var parseModRemove = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || "",
        wasPlaying: data.d || false
    };
};

var parseBan = function(data) {
    data = data || {};

    return {
        reason: data.r || undefined,
        duration: data.l || undefined
    };
};

var parseCycle = function(data) {
    data = data || {};

    return {
        shouldCycle: data.f || false,
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

var parseLock = function(data) {
    data = data || {};

    return {
        clearWaitlist: data.c || false,
        isLocked: data.f || false,
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

var parsePromotion = function(data) {
    data = data || {};

    if(data.hasOwnProperty('u') && data.u.length === 1) {
        return {
            moderator: utils.decode(data.m) || "",
            moderatorID: data.mi || -1,
            username: utils.decode(data.u[0].n) || "",
            id: data.u[0].i || -1,
            role: data.u[0].p || 0
        };
    }

    return {};
};

var parseXP = function(data) {
    data = data || {};

    return {
        xp: data.xp || 0,
        level: data.level || -1
    };
};

var parseChat = function(data) {
    data = data || {};

    return {
        message: utils.decode(data.message) || "",
        username: utils.decode(data.un) || "",
        cid: data.cid || "",        //chat ID
        id: data.uid || -1,         //user ID
        sub: data.sub || 0          //subscription identification
    };
};

var parseChatDelete = function(data) {
    data = data || {};

    return {
        moderatorID: data.mi || -1,     //ID of mod that issued the deletion
        cid: data.c || ""               //chat ID
    };
};

var createState = function(data) {
    data = data || {};

    return {
        credentials: data.credentials || {},
        self: parseSelf(data.self),
        room: parseRoom(data.room),
        usercache: data.usercache || [],
        chatcache: data.chatcache || []
    };
};

var parseRoomNameUpdate = function(data) {
    data = data || {};

    return {
        name: utils.decode(data.n) || "",
        moderatorID: data.u || -1
    };
};

var parseRoomDescriptionUpdate = function(data) {
    data = data || {};

    return {
        description: utils.decode(data.d) || "",
        moderatorID: data.u || -1
    };
};

var parseRoomWelcomeUpdate = function(data) {
    data = data || {};

    return {
        welcome: utils.decode(data.w) || "",
        moderatorID: data.u || -1
    };
};

exports.parseXP = parseXP;
exports.parseBan = parseBan;
exports.pushVote = pushVote;
exports.parseChat = parseChat;
exports.parseSelf = parseSelf;
exports.parseUser = parseUser;
exports.parseRoom = parseRoom;
exports.parseMeta = parseMeta;
exports.parseLock = parseLock;
exports.parseMute = parseMute;
exports.parseCycle = parseCycle;
exports.parseGrabs = parseGrabs;
exports.parseMedia = parseMedia;
exports.parseVotes = parseVotes;
exports.parseBooth = parseBooth;
exports.parseModBan = parseModBan;
exports.createState = createState;
exports.parseModMove = parseModMove;
exports.parseSettings = parseSettings;
exports.parseModAddDJ = parseModAddDJ;
exports.parsePlayback = parsePlayback;
exports.serializeMedia = serializeMedia;
exports.parsePromotion = parsePromotion;
exports.parseModRemove = parseModRemove;
exports.parseUserUpdate = parseUserUpdate;
exports.parseChatDelete = parseChatDelete;
exports.parseExtendedRoom = parseExtendedRoom;
exports.parseHistoryEntry = parseHistoryEntry;
exports.parseFriendRequest = parseFriendRequest;
exports.parseRoomNameUpdate = parseRoomNameUpdate;
exports.serializeMediaObjects = serializeMediaObjects;
exports.convertPlugTimeToDate = convertPlugTimeToDate;
exports.parseRoomWelcomeUpdate = parseRoomWelcomeUpdate;
exports.parseRoomDescriptionUpdate = parseRoomDescriptionUpdate;
