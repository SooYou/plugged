const utils = require("./utils");

const serializeMedia = function(data = {}) {
    let flag = 0;
    flag |= data.hasOwnProperty("artwork_url") ? 1 << 0 : 0;
    flag |= data.hasOwnProperty("thumbnails") ? 1 << 1 : 0;
    flag |= data.hasOwnProperty("snippet") ? 1 << 2 : 0;

    if (flag === 0)
        return data;

    if (typeof data.id !== "string")
        data.id = String(data.id);

    const media = {
        id: 0,
        cid: data.id || "",
        author: "",
        title: "",
        duration: 0
    };

    if (flag > 1) {
        let title;

        if ((flag & 0x04) === 0x04) {
            data.id = data.id.videoId;
            title = utils.splitTitle(data.snippet.title);
        } else {
            title = utils.splitTitle(data.title);
        }

        media.author = title[0];
        media.title = title[1];
        media.format = 1;
        media.image = `https://i.ytimg.com/vi/${data.id}/default.jpg`;
    } else {
        const title = utils.splitTitle(data.title);

        media.author = title[0];
        media.title = title[1];
        media.format = 2;
        media.image = data.artwork_url || "";
        media.duration = Math.round((data.duration || 0) / 1000);
    }

    return media;
};

const serializeMediaObjects = function(data = {}) {
    const arr = [];

    for(let i = 0, l = data.length; i < l; i++)
        arr[i] = serializeMedia(data[i]);

    return arr;
};

let mapSelf = function(data = {}) {
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

const mapUser = function(data = {}) {
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

const mapUsers = function(data = {}) {
    const arr = [];

    for(let i = data.length-1; i >= 0; i--)
        arr.push(mapUser(data[i]));

    return arr;
};

const mapUserUpdate = function(data = {}) {
    return {
        id: data.i || -1,
        level: data.level || undefined,
        badge: data.badge || undefined,
        avatarID: data.avatarID || undefined,
        username: utils.decode(data.username) || undefined
    };
};

const mapMedia = function(data = {}) {
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

const mapMute = function(data = {}, expireDate) {
    return {
        username: utils.decode(data.username) || data.t || "",
        id: data.id || data.i || -1,
        moderator: utils.decode(data.moderator) || data.m || "",
        moderatorID: data.mi || -1,
        reason: data.reason || data.r || 1,
        expires: data.expires || expireDate || -1
    };
};

const mapGrabs = function(data = {}) {
    const arr = [];

    for(let key in data)
        arr.push(key);

    return arr;
};

const mapGifted = function (data = {}) {
    return {
        sender: utils.decode(data.s) || "",
        recipient: utils.decode(data.r) || ""
    };
};

const mapModAddDJ = function(data = {}) {
    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || ""
    };
};

const mapModMove = function(data = {}) {
    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.u) || "",
        oldIndex: data.o || 0,
        newIndex: data.n || 0
    };
};

const mapNotify = function(data = {}) {
    return {
        action: utils.decode(data.action) || "",
        id: data.id || -1,
        timestamp: utils.convertPlugTimeToDate(data.timestamp),
        value: utils.decode(data.value) || ""
    };
};

const mapPlayback = function(data = {}) {
    return {
        media: mapMedia(data.media),
        historyID: data.historyID || "",
        playlistID: data.playlistID || -1,
        startTime: utils.convertPlugTimeToDate(data.startTime)
    };
};

const mapHistoryEntry = function(data = {}) {
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

const mapFriendRequest = function(data = {}) {
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

const mapVotes = function(data = {}) {
    const arr = [];

    for(let key in data) {
        arr.push({
            id: key,
            direction: data[key]
        });
    }

    return arr;
};

const pushVote = function(vote = {}) {
    return {
        id: vote.i || -1,
        direction: vote.v || 1
    };
};

const mapSettings = function(data = {}) {
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

const mapTransaction = function(data = {}) {
    return {
        id: utils.decode(data.id) || "",
        item: utils.decode(data.item) || "",
        pp: data.pp || -1,
        cash: data.cash || -1,
        timestamp: utils.convertPlugTimeToDate(data.timestamp),
        type: utils.decode(data.type) || ""
    };
};

const mapExtendedRoom = function(data = {}) {
    return {
        cid: data.cid || "",
        dj: (typeof data.dj === "string" ?
                utils.decode(data.dj) :
                    typeof data.dj === "object" ?
                    mapUser(data.dj) :
                    ""
            ),
        favorite: data.favorite || false,
        format: parseInt(data.format, 10) || 1,
        guests: data.guests || 0,
        host: utils.decode(data.host) || "",
        id: data.id || -1,
        image: data.image || "",
        media: utils.decode(data.media) || "",
        name: utils.decode(data.name) || "",
        nsfw: data.nsfw || false,
        capacity: data.capacity || 5000,
        population: parseInt(data.population, 10) || 0,
        private: data.private || false,
        slug: data.slug || ""
    };
};

const mapRoom = function(data = {}) {
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

const mapMeta = function(data = {}) {
    return {
        description: utils.decode(data.description) || "",
        favorite: data.favorite || false,
        hostID: data.hostID || -1,
        hostName: utils.decode(data.hostName) || "",
        id: data.id || -1,
        minChatLevel: parseInt(data.minChatLevel, 10) || 0,
        name: utils.decode(data.name) || "",
        population: data.population || 0,
        slug: data.slug || undefined,
        guests: data.guests || 0,
        welcome: utils.decode(data.welcome) || ""
    };
};

const mapBooth = function(data = {}) {
    return {
        dj: data.currentDJ || -1,                                       // id of the active DJ
        isLocked: data.isLocked || false,                               // is waitlist locked?
        shouldCycle: "shouldCycle" in data ? data.shouldCycle : true,   // should it cycle?
        waitlist: data.waitingDJs || []                                 // array of IDs
    };
};

const mapModBan = function(data = {}) {
    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || "",
        duration: data.d || ''
    };
};

const mapModWaitlistBan = function(data = {}) {
    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || "",
        userID: data.ti || -1,
        duration: data.d || -1
    };
};

const mapModRemove = function(data = {}) {
    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1,
        username: utils.decode(data.t) || "",
        wasPlaying: data.d || false // TODO: that is not associated to whether they were playing or not.
    };
};

const mapModSkip = function(data = {}) {
    return {
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

const mapOwnBan = function(data = {}) {
    return {
        reason: data.r || 1,
        duration: data.l || ''
    };
};

const mapBan = function(data = {}) {
    return {
        id: data.id || -1,
        reason: data.reason || -1,
        duration: data.duration || '',
        username: utils.decode(data.username) || "",
        moderator: utils.decode(data.moderator) || "",
        timestamp: utils.convertPlugTimeToDate(data.timestamp)
    };
};

const mapCycle = function(data = {}) {
    return {
        shouldCycle: data.f || false,
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

const mapPlaylistCycle = function(data = null) {
    return data || -1;
}

const mapLevelUp = function(data = null) {
    return data || -1;
}

const mapLock = function(data = {}) {
    return {
        clearWaitlist: data.c || false,
        isLocked: data.f || false,
        moderator: utils.decode(data.m) || "",
        moderatorID: data.mi || -1
    };
};

const mapPromotions = function(data = {}) {
    let promotions = []

    for(let i = (data.hasOwnProperty('u') ? data.u.length - 1 : -1); i >= 0; i--) {
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

const mapXP = function(data = {}) {
    return {
        xp: data.xp || 0,
        pp: data.pp || 0,
        level: data.level || -1
    };
};

const mapChat = function(data = {}) {
    return {
        message: utils.decode(data.message) || "",
        username: utils.decode(data.un) || "",
        cid: data.cid || "",        //chat ID
        id: data.uid || -1,         //user ID
        sub: data.sub || 0          //subscription identification
    };
};

const mapChatDelete = function(data = {}) {
    return {
        moderatorID: data.mi || -1,     //ID of mod that issued the deletion
        cid: data.c || ""               //chat ID
    };
};

const createState = function(data = {}) {
    return {
        credentials: data.credentials || {},
        self: mapSelf(data.self),
        room: mapRoom(data.room),
        usercache: data.usercache || [],
        chatcache: data.chatcache || []
    };
};

const mapRoomNameUpdate = function(data = {}) {
    return {
        name: utils.decode(data.n) || "",
        moderatorID: data.u || -1
    };
};

const mapRoomDescriptionUpdate = function(data = {}) {
    return {
        description: utils.decode(data.d) || "",
        moderatorID: data.u || -1
    };
};

const mapRoomWelcomeUpdate = function(data = {}) {
    return {
        welcome: utils.decode(data.w) || "",
        moderatorID: data.u || -1
    };
};

const mapChatLevelUpdate = function(data = {}) {
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
exports.mapGifted = mapGifted;
exports.mapOwnBan = mapOwnBan;
exports.mapModBan = mapModBan;
exports.mapNotify = mapNotify;
exports.mapLevelUp = mapLevelUp;
exports.createState = createState;
exports.mapModMove = mapModMove;
exports.mapSettings = mapSettings;
exports.mapTransaction = mapTransaction;
exports.mapModAddDJ = mapModAddDJ;
exports.mapModSkip = mapModSkip;
exports.mapPlayback = mapPlayback;
exports.serializeMedia = serializeMedia;
exports.mapPromotions = mapPromotions;
exports.mapModRemove = mapModRemove;
exports.mapUserUpdate = mapUserUpdate;
exports.mapChatDelete = mapChatDelete;
exports.mapExtendedRoom = mapExtendedRoom;
exports.mapHistoryEntry = mapHistoryEntry;
exports.mapPlaylistCycle = mapPlaylistCycle;
exports.mapFriendRequest = mapFriendRequest;
exports.mapModWaitlistBan = mapModWaitlistBan;
exports.mapRoomNameUpdate = mapRoomNameUpdate;
exports.mapChatLevelUpdate = mapChatLevelUpdate;
exports.serializeMediaObjects = serializeMediaObjects;
exports.mapRoomWelcomeUpdate = mapRoomWelcomeUpdate;
exports.mapRoomDescriptionUpdate = mapRoomDescriptionUpdate;
