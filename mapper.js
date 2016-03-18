var utils = require("./utils");

var serializeMedia = function(data) {
    data = data || {};

    var flag = 0;
    flag |= data.hasOwnProperty("artwork_url") ? 1 << 0 : 0;
    flag |= data.hasOwnProperty("thumbnails") ? 1 << 1 : 0;
    flag |= data.hasOwnProperty("snippet") ? 1 << 2 : 0;

    if(flag === 0)
        return data;

    if(typeof data.id !== "string")
        data.id = String(data.id);

    var media = {
        id: 0,
        cid: data.id || "",
        author: "",
        title: "",
        duration: 0
    };

    if(flag > 1) {
        var title;

        if((flag & 0x04) === 0x04) {
            data.id = data.id.videoId;
            title = utils.splitTitle(data.snippet.title);
        } else {
            title = utils.splitTitle(data.title);
        }

        media.author = title[0];
        media.title = title[1];
        media.format = 1;
        media.image = ["https://i.ytimg.com/vi/", data.id, "/default.jpg"].join('');
    } else {
        var title = utils.splitTitle(data.title);

        media.author = title[0];
        media.title = title[1];
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

var mapSelf = function(data) {
    data = data || {};

    return {
        joined: utils.convertPlugTimeToDate(data.joined),
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

var mapUser = function(data) {
    data = data || {};

    return {
        joined: utils.convertPlugTimeToDate(data.joined),
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
        silver: data.silver || false,
        id: data.id || -1
    };
};

var mapUsers = function(data) {
    data = data || {};
    var arr = [];

    for(var i = data.length-1; i >= 0; i--)
        arr.push(mapUser(data[i]));

    return arr;
};

var mapUserUpdate = function(data) {
    data = data || {};

    return {
        id: data.i || -1,
        level: data.level || undefined,
        badge: data.badge || undefined,
        avatarID: data.avatarID || undefined,
        username: utils.decode(data.username) || undefined
    };
};

var mapMedia = function(data) {
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

var mapMute = function(data, expireDate) {
    data = data || {};

    return {
        username: utils.decode(data.username) || data.t || "",
        id: data.id || data.i || -1,
        moderator: utils.decode(data.moderator) || data.m || "",
        reason: data.reason || data.r || 1,
        expires: data.expires || expireDate || -1
    };
};

var mapGrabs = function(data) {
    data = data || {};
    var arr = [];

    for(var key in data)
        arr.push(key);

    return arr;
};

var mapModAddDJ = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || ""
    };
};

var mapModMove = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.u) || "",
        oldIndex: data.o || 0,
        newIndex: data.n || 0
    };
};

var mapPlayback = function(data) {
    data = data || {};

    return {
        media: mapMedia(data.media),
        historyID: data.historyID || "",
        playlistID: data.playlistID || -1,
        startTime: utils.convertPlugTimeToDate(data.startTime)
    };
};

var mapHistoryEntry = function (data) {
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
        timestamp: utils.convertPlugTimeToDate(data.timestamp),
        user: (data.user ? {
            id: data.user.id || -1,
            username: utils.decode(data.user.username) || ""
        } : {
            id: -1,
            username: ""
        })
    };
};

var mapFriendRequest = function(data) {
    data = data || {};

    return {
        username: utils.decode(data.username) || "",
        avatarID: data.avatarID || "",
        timestamp: utils.convertPlugTimeToDate(data.timestamp) || "",
        joined: utils.convertPlugTimeToDate(data.joined) || "",
        status: data.status || 0,
        gRole: data.gRole || 0,
        level: data.level || 0,
        id: data.id || -1
    };
};

var mapVotes = function(data) {
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

var mapSettings = function(data) {
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

var mapExtendedRoom = function(data) {
    data = data || {};

    return {
        cid: data.cid || "",
        dj: (typeof data.dj === "string" ?
                utils.decode(data.dj) :
                    typeof data.dj === "object" ?
                    mapUser(data.dj) :
                    ""
            ),
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

var mapRoom = function(data) {
    data = data || {};

    return {
        booth: mapBooth(data.booth),
        fx: data.fx || [],
        grabs: mapGrabs(data.grabs),
        meta: mapMeta(data.meta),
        playback: mapPlayback(data.playback),
        role: data.role || 0,
        users: mapUsers(data.users),
        votes: mapVotes(data.votes)
    };
};

var mapMeta = function(data) {
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

var mapBooth = function(data) {
    data = data || {};

    return {
        dj: data.currentDJ || -1,                                       // id of the active DJ
        isLocked: data.isLocked || false,                               // is waitlist locked?
        shouldCycle: "shouldCycle" in data ? data.shouldCycle : true,   // should it cycle?
        waitlist: data.waitingDJs || []                                 // array of IDs
    };
};

var mapModBan = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || "",
        duration: data.d || ''
    };
};

var mapModRemove = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || "",
        wasPlaying: data.d || false
    };
};

var mapModSkip = function(data) {
    data = data || {};

    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

var mapOwnBan = function(data) {
    data = data || {};

    return {
        reason: data.r || 1,
        duration: data.l || ''
    };
};

var mapBan = function(data) {
    data = data || {};

    return {
        id: data.id || -1,
        reason: data.reason || -1,
        duration: data.duration || '',
        username: utils.decode(data.username) || "",
        moderator: utils.decode(data.moderator) || "",
        timestamp: utils.convertPlugTimeToDate(data.timestamp)
    };
};

var mapCycle = function(data) {
    data = data || {};

    return {
        shouldCycle: data.f || false,
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

var mapLock = function(data) {
    data = data || {};

    return {
        clearWaitlist: data.c || false,
        isLocked: data.f || false,
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

var mapPromotion = function(data) {
    data = data || {};
    var promotions = [];

    for(var i = (data.hasOwnProperty('u') ? data.u.length - 1 : -1); i >= 0; i--) {
        promotions.push({
            moderator: utils.decode(data.m) || "",
            moderatorID: data.mi || -1,
            username: utils.decode(data.u[i].n) || "",
            id: data.u[i].i || -1,
            role: data.u[i].p || 0
        });
    }

    return promotions;
};

var mapXP = function(data) {
    data = data || {};

    return {
        xp: data.xp || 0,
        level: data.level || -1
    };
};

var mapChat = function(data) {
    data = data || {};

    return {
        message: utils.decode(data.message) || "",
        username: utils.decode(data.un) || "",
        cid: data.cid || "",        //chat ID
        id: data.uid || -1,         //user ID
        sub: data.sub || 0          //subscription identification
    };
};

var mapChatDelete = function(data) {
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
        self: mapSelf(data.self),
        room: mapRoom(data.room),
        usercache: data.usercache || [],
        chatcache: data.chatcache || []
    };
};

var mapRoomNameUpdate = function(data) {
    data = data || {};

    return {
        name: utils.decode(data.n) || "",
        moderatorID: data.u || -1
    };
};

var mapRoomDescriptionUpdate = function(data) {
    data = data || {};

    return {
        description: utils.decode(data.d) || "",
        moderatorID: data.u || -1
    };
};

var mapRoomWelcomeUpdate = function(data) {
    data = data || {};

    return {
        welcome: utils.decode(data.w) || "",
        moderatorID: data.u || -1
    };
};

var mapChatLevelUpdate = function(data) {
    data = data || {};

    return {
        chatLevel: data.m || 1,
        moderatorID: data.u || -1
    };
};

exports.mapXP = mapXP;
exports.mapBan = mapBan;
exports.pushVote = pushVote;
exports.mapChat = mapChat;
exports.mapSelf = mapSelf;
exports.mapUser = mapUser;
exports.mapRoom = mapRoom;
exports.mapMeta = mapMeta;
exports.mapLock = mapLock;
exports.mapMute = mapMute;
exports.mapCycle = mapCycle;
exports.mapGrabs = mapGrabs;
exports.mapMedia = mapMedia;
exports.mapVotes = mapVotes;
exports.mapBooth = mapBooth;
exports.mapOwnBan = mapOwnBan;
exports.mapModBan = mapModBan;
exports.createState = createState;
exports.mapModMove = mapModMove;
exports.mapSettings = mapSettings;
exports.mapModAddDJ = mapModAddDJ;
exports.mapModSkip = mapModSkip;
exports.mapPlayback = mapPlayback;
exports.serializeMedia = serializeMedia;
exports.mapPromotion = mapPromotion;
exports.mapModRemove = mapModRemove;
exports.mapUserUpdate = mapUserUpdate;
exports.mapChatDelete = mapChatDelete;
exports.mapExtendedRoom = mapExtendedRoom;
exports.mapHistoryEntry = mapHistoryEntry;
exports.mapFriendRequest = mapFriendRequest;
exports.mapRoomNameUpdate = mapRoomNameUpdate;
exports.mapChatLevelUpdate = mapChatLevelUpdate;
exports.serializeMediaObjects = serializeMediaObjects;
exports.mapRoomWelcomeUpdate = mapRoomWelcomeUpdate;
exports.mapRoomDescriptionUpdate = mapRoomDescriptionUpdate;
