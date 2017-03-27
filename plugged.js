var EventEmitter = require("events").EventEmitter;
var WebSocket = require("ws");
var util = require("util");

var config = require("./conf/config");
var mapper = require("./mapper");
var Query = require("./query");
var utils = require("./utils");

var baseURL = config.provider;

var endpoints = {
    /*--------------- GET ---------------*/
    CSRF: baseURL,
    NEWS: baseURL +         "/_/news",
    BANS: baseURL +         "/_/bans",
    STAFF: baseURL +        "/_/staff",
    ROOMS: baseURL +        "/_/rooms",
    MUTES: baseURL +        "/_/mutes",
    TOKEN: baseURL +        "/_/auth/token",
    FRIENDS: baseURL +      "/_/friends",
    HISTORY: baseURL +      "/_/rooms/history",
    IGNORES: baseURL +      "/_/ignores",
    INVITES: baseURL +      "/_/friends/invites",
    PRODUCTS: baseURL +     "/_/store/products",
    INVENTORY: baseURL +    "/_/store/inventory",
    ROOMSTATS: baseURL +    "/_/rooms/state",
    USERSTATS: baseURL +    "/_/users/",
    PLAYLISTS: baseURL +    "/_/playlists",
    USERHISTORY: baseURL +  "/_/users/me/history",
    TRANSACTIONS: baseURL + "/_/users/me/transactions",
    FAVORITEROOM: baseURL + "/_/rooms/favorites",
    VALIDATEUSER: baseURL + "/_/users/validate/",
    VALIDATEROOM: baseURL + "/_/rooms/validate/",
    /*--------------- PUT ---------------*/
    LOCK: baseURL +         "/_/booth/lock",
    BLURB: baseURL +        "/_/profile/blurb",
    CYCLE: baseURL +        "/_/booth/cycle",
    LOGIN: baseURL +        "/_/auth/login",
    BADGE: baseURL +        "/_/users/badge",
    AVATAR: baseURL +       "/_/users/avatar",
    SETTINGS: baseURL +     "/_/users/settings",
    LANGUAGE: baseURL +     "/_/users/language",
    IGNOREFRIEND: baseURL + "/_/friends/ignore",
    /*--------------- POST --------------*/
    GRABS: baseURL +        "/_/grabs",
    VOTES: baseURL +        "/_/votes",
    RESET: baseURL +        "/_/auth/reset/me",
    PURCHASE: baseURL +     "/_/store/purchase",
    FACEBOOK: baseURL +     "/_/auth/facebook",
    JOINROOM: baseURL +     "/_/rooms/join",
    ADDBOOTH: baseURL +     "/_/booth/add",
    BULKUSERS: baseURL +    "/_/users/bulk",
    JOINBOOTH: baseURL +    "/_/booth",
    SKIPBOOTH: baseURL +    "/_/booth/skip",
    MOVEBOOTH: baseURL +    "/_/booth/move",
    CREATEROOM: baseURL +   "/_/rooms",
    UPDATEROOM: baseURL +   "/_/rooms/update",
    UPDATESTAFF: baseURL +  "/_/staff/update",
    /*-------------- DELETE -------------*/
    CHAT: baseURL +         "/_/chat/",
    SESSION: baseURL +      "/_/auth/session",
    REMOVEBOOTH: baseURL +  "/_/booth/remove/",
    NOTIFICATION: baseURL + "/_/notifications/"
};

/*
chat offset incrementation idea by
https://github.com/welovekpop/SekshiBot/blob/master/src/Sekshi.js
*/
var CHAT_TIMEOUT_INC = 70;
var CHAT_TIMEOUT_MAX = 700;

function Plugged(options) {
    Plugged.super_.call(this);

    options = options || {};

    if(options.test)
        mapper = require("./test/raw.js");

    this.log = options.log || function() {};
    this.messageProc = options.messageProc || this.defaultMessageProc;
    this.retryLogin = options.retryLogin || true;

    this._wsaprocessor = this._wsaprocessor.bind(this);
    this._keepAlive = this._keepAlive.bind(this);
    this.state = mapper.createState(options.state);
    this.query = new Query();
    this.chatQueue = [];
    this.chatTimeout = 0;
    this.cleanCacheInterval = -1;
    this.chatcachesize = 256;
    this.keepAliveTries = 0;
    this.keepAliveID = -1;
    this.credentials = null;
    this.sock = null;
    this.auth = null;
    this.sleave = false;                    /* userleave cache toggle */
    this.ccache = false;                    /* chatcache toggle */
}

util.inherits(Plugged, EventEmitter);

Plugged.prototype.BANREASON = {
    VIOLATING_COMMUNITY_RULES:  1,
    VERBAL_ABUSE:               2,
    SPAMMING:                   3,
    OFFENSIVE_LANGUAGE:         4,
    NEGATIVE_ATTITUDE:          5
};

Plugged.prototype.BANDURATION = {
    HOUR:   'h',
    DAY:    'd',
    PERMA:  'f'
};

Plugged.prototype.MUTEDURATION = {
    NONE:   'o',
    SHORT:  's',
    MEDIUM: 'm',
    LONG:   'l'
};

Plugged.prototype.USERROLE = {
    NONE:       0,
    RESIDENTDJ: 1,
    BOUNCER:    2,
    MANAGER:    3,
    COHOST:     4,
    HOST:       5
};

Plugged.prototype.GLOBALROLE = {
    NONE:               0,
    BRAND_AMBASSADOR:   3,
    ADMIN:              5
};

Plugged.prototype.CACHE = {
    DISABLE:    0,
    ENABLE:     1,
    ONLY:       2
};

/*===== GENERAL EVENTS =====*/
/* LOGIN BASED EVENTS */
Plugged.prototype.LOGIN_ERROR = "loginError";
Plugged.prototype.LOGIN_SUCCESS = "loginSuccess";

Plugged.prototype.LOGOUT_ERROR = "logoutError";
Plugged.prototype.LOGOUT_SUCCESS = "logoutSuccess";

/* SOCKET RELATED */
Plugged.prototype.CONN_PART = "connPart";
Plugged.prototype.CONN_ERROR = "connError";
Plugged.prototype.CONN_WARNING = "connWarning";
Plugged.prototype.CONN_SUCCESS = "connSuccess";

/* CORE SOCKET EVENTS */
Plugged.prototype.SOCK_OPEN = "sockOpen";
Plugged.prototype.SOCK_ERROR = "sockError";
Plugged.prototype.SOCK_CLOSED = "sockClosed";

/*===== PLUG EVENTS =====*/
Plugged.prototype.BAN = "ban";
Plugged.prototype.ACK = "ack";
Plugged.prototype.CHAT = "chat";
Plugged.prototype.VOTE = "vote";
Plugged.prototype.GRAB = "grab";
Plugged.prototype.EARN = "earn";
Plugged.prototype.SKIP = "skip";
Plugged.prototype.BAN_IP = "banIP";
Plugged.prototype.NOTIFY = "notify";
Plugged.prototype.GIFTED = "gifted";
Plugged.prototype.MOD_BAN = "modBan";
Plugged.prototype.ADVANCE = "advance";
Plugged.prototype.LEVEL_UP = "levelUp";
Plugged.prototype.MOD_SKIP = "modSkip";
Plugged.prototype.MOD_MUTE = "modMute";
Plugged.prototype.MOD_STAFF = "modStaff";
Plugged.prototype.USER_JOIN = "userJoin";
Plugged.prototype.FLOOD_API = "floodAPI";
Plugged.prototype.MOD_ADD_DJ = "modAddDJ";
Plugged.prototype.GUEST_JOIN = "guestJoin";
Plugged.prototype.PLUG_ERROR = "plugError";
Plugged.prototype.USER_LEAVE = "userLeave";
Plugged.prototype.FLOOD_CHAT = "floodChat";
Plugged.prototype.MOD_MOVE_DJ = "modMoveDJ";
Plugged.prototype.GUEST_LEAVE = "guestLeave";
Plugged.prototype.JOINED_ROOM = "joinedRoom";
Plugged.prototype.USER_UPDATE = "userUpdate";
Plugged.prototype.CHAT_DELETE = "chatDelete";
Plugged.prototype.FRIEND_JOIN = "friendJoin";
Plugged.prototype.PLUG_UPDATE = "plugUpdate";
Plugged.prototype.CHAT_MENTION = "chatMention";
Plugged.prototype.KILL_SESSION = "killSession";
Plugged.prototype.NAME_CHANGED = "nameChanged";
Plugged.prototype.PLUG_MESSAGE = "plugMessage";
Plugged.prototype.CHAT_COMMAND = "chatCommand";
Plugged.prototype.CHAT_RATE_LIMIT = "rateLimit";
Plugged.prototype.DJ_LIST_CYCLE = "djListCycle";
Plugged.prototype.MOD_REMOVE_DJ = "modRemoveDJ";
Plugged.prototype.FRIEND_ACCEPT = "friendAccept";
Plugged.prototype.DJ_LIST_LOCKED = "djListLocked";
Plugged.prototype.PLAYLIST_CYCLE = "playlistCycle";
Plugged.prototype.FRIEND_REQUEST = "friendRequest";
Plugged.prototype.WAITLIST_UPDATE = "djListUpdate";
Plugged.prototype.ROOM_NAME_UPDATE = "roomNameUpdate";
Plugged.prototype.MAINTENANCE_MODE = "plugMaintenance";
Plugged.prototype.ROOM_WELCOME_UPDATE = "roomWelcomeUpdate";
Plugged.prototype.MAINTENANCE_MODE_ALERT = "plugMaintenanceAlert";
Plugged.prototype.ROOM_DESCRIPTION_UPDATE = "roomDescriptionUpdate";
Plugged.prototype.ROOM_MIN_CHAT_LEVEL_UPDATE = "roomMinChatLevelUpdate";

/*================== Private Functions ==================*/
Plugged.prototype._sendMessage = function(type, data) {
    if(!this.sock || this.sock.readyState !== WebSocket.OPEN) {
        this._log("socket is not opened!", 1, "red");
    } else {
        if(typeof type === "string" && (typeof data === "string" || typeof data === "number")) {
            this.sock.send(JSON.stringify({
                a: type,
                p: data,
                t: Date.now()
            }));

            return true;
        } else {
            var err = [];

            if(typeof type === "undefined")
                err.push("message type definition is undefined");
            else if(typeof type !== "string")
                err.push("message type definition is not of type string");

            if(typeof data === "undefined")
                err.push("no data was defined");
            else if(!(typeof data === "string") || !(typeof data === "string"))
                err.push("data was not of type string or number");

            this._log("couldn't send message. " + err.join(err.length > 1 ? ", " : ''));
        }
    }

    return false;
};

Plugged.prototype._keepAlive = function() {
    if(this.keepAliveTries >= 6) {
        this._log("haven't received a keep alive message from host for more than 3 minutes, is it on fire?", 1, "red");
        // save meta information of the room since clearState erases all data
        var meta = this.getRoomMeta();
        this._clearState();
        this.emit(this.CONN_PART, meta);
    } else {
        this.keepAliveTries++;
        clearTimeout(this.keepAliveID);
        this.keepAliveID = setTimeout(this._keepAlive, 30*1000);

        if(this.keepAliveTries > 1)
            this.emit(this.CONN_WARNING, this.keepAliveTries);
    }
};

Plugged.prototype._keepAliveCheck = function() {
    // the hiccup counter gets set back to zero
    this.keepAliveTries = 0;
    clearTimeout(this.keepAliveID);
    this.keepAliveID = setTimeout(this._keepAlive, 30*1000);
};

Plugged.prototype._log = function(msg, verbosity, type) {
    if(typeof this.log === "object") {
        switch(type) {
            case "magenta":
                type = "debug";
                break;
            case "red":
                type = "error";
                break;
            case "yellow":
                type = "warn";
                break;
            default:
                type = "info";
                break;
        }

        this.log[type] && this.log[type](msg);
    } else if(typeof this.log === "function") {
        this.log(msg, verbosity, type);
    }
};

Plugged.prototype._cleanUserCache = function() {
    for(var i = this.state.usercache.length - 1; i >= 0; i--) {
        if(Date.now() - this.state.usercache[i].timestamp > 5*60*1000)
            this.state.usercache.splice(i, 1);
    }
};

Plugged.prototype._processChatQueue = function(lastMessage) {
    lastMessage = lastMessage || 0;

    if(this.chatQueue.length > 0) {
        if(lastMessage + this.chatTimeout <= Date.now()) {
            var msg = this.chatQueue.shift();
            if(!this._sendMessage("chat", msg.message)) {
                this.chatQueue.unshift(msg);
                this._log("message was put back into the queue", 1, "white");

                return;
            } else {
                // timeouts can't get lower than 4ms but anything below 1000ms is ridiculous anyway
                if(msg.timeout >= 0) {
                    setTimeout(
                        this._removeChatMessageByDelay.bind(this),
                        msg.timeout,
                        msg.message
                    );
                }

                if(this.chatTimeout < CHAT_TIMEOUT_MAX)
                    this.chatTimeout += CHAT_TIMEOUT_INC;
            }
        }

        setTimeout(this._processChatQueue.bind(this), this.chatTimeout, Date.now());
    } else {
        this.chatTimeout = 0;
    }
};

Plugged.prototype._removeChatMessageByDelay = function(message) {
    if(typeof message !== "string") {
        this._log("message \"" + message + "\" is not of type string", 2, "red");

        return;
    }

    for(var i = this.state.chatcache.length - 1; i >= 0; i--) {
        if(this.state.chatcache[i].username !== this.state.self.username)
            continue;

        if(this.state.chatcache[i].message === message) {
            this.removeChatMessage(this.state.chatcache[i].cid);
            break;
        }
    }
};

Plugged.prototype._checkForPreviousVote = function(vote) {
    for(var i = this.state.room.votes.length - 1; i >= 0; i--) {
        if(this.state.room.votes[i].id == vote.id) {
            // only return true if vote direction hasn't changed
            if(this.state.room.votes[i].direction !== vote.direction) {
                this.state.room.votes[i].direction = vote.direction;

                return false;
            } else {
                return true;
            }
        }
    }

    this.state.room.votes.push(vote);
    return false;
};

Plugged.prototype._clearState = function() {
    this.watchUserCache(false);
    this.clearUserCache();
    this.clearChatQueue();
    this.clearChatCache();
    this.query.flushQueue();
    this.state = mapper.createState();

    clearTimeout(this.keepAliveID);
    this.keepAliveID = -1;

    this.sock.close();
    this.sock.removeAllListeners();

    this.sock = null;
    this.auth = null;
    this.keepAliveTries = 0;
};

Plugged.prototype._getAuthToken = function(data, callback) {
    this._log("getting auth token...", 1, "white");
    this.getAuthToken(function(err, token) {
        if(!err)
            this.auth = token;

        callback && callback(err, token);
    });
};

Plugged.prototype._loggedIn = function() {
    this._connectSocket();
    this._log("logged in", 1, "green");
    this.requestSelf(function _requestSelfLogin(err, self) {
        if(!err)
            this.emit(this.LOGIN_SUCCESS, self);
        else
            this.emit(this.LOGIN_ERROR, err);
    });
};

Plugged.prototype._login = function(tries) {
    tries = tries || 0;

    utils.waterfall([
        this.getCSRF,
        this.setLogin,
        this._getAuthToken
    ], function _callback(err) {
        if(!err) {
            this._loggedIn();
        } else {
            this._log(
                err && err.hasOwnProperty("message") ?
                err.message :
                "An unrecorded error occured while trying to log in",
                0, "red"
            );

            if(this.retryLogin && tries <= 2) {
                this._log("retrying now...", 0, "white");
                this._login(tries++);
            } else {
                this._log([
                    "failed to log in with \"",
                    (this.credentials.email || this.credentials.accessToken),
                    "\""
                ].join(''));
                this.emit(this.LOGIN_ERROR, err);
            }
        }
    }, this);
};

/*================== WebSocket ==================*/
Plugged.prototype._connectSocket = function() {
    if(this.sock) {
        if(this.sock.readyState !== WebSocket.OPEN)
            this._log("sock is already instantiated but not open", 1, "red");
        else
            this._log("sock is already instantiated and open", 1, "yellow");

        return;
    }

    var self = this;
    this.sock = new WebSocket(config.socket, {
        origin: "https://plug.dj"
    });

    /* SOCK OPENED */
    this.sock.on("open", function _sockOpen() {
        self._log("socket opened", 3, "magenta");
        self.emit(self.SOCK_OPEN, self);
        self._sendMessage("auth", self.auth);
        self._keepAliveCheck.call(self);
    });

    /* SOCK CLOSED */
    this.sock.on("close", function _sockClose() {
        self._log("sock closed", 3, "magenta");
        if(self.keepAliveTries < 6 && self.keepAliveID !== -1) {
            self.keepAliveTries = 6;
            self._keepAlive();
        }

        self._log("sock closed", 3, "magenta");
        self.emit(self.SOCK_CLOSED, self);
    });

    /* SOCK ERROR */
    this.sock.on("error", function _sockError(err) {
        self._log("sock error", 3, "magenta");
        self.emit(self.SOCK_ERROR, self, err);
    });

    /* SOCK MESSAGE */
    this.sock.on("message", self._wsaprocessor);
};

/*============== Action Processor ===============*/
Plugged.prototype._wsaprocessor = function(msg, flags) {
    if(typeof msg !== "string") {
        this._log("socket received message that isn't a string", 3, "yellow");
        this._log(msg, 3, "yellow");
        return;
    }

    // can only occur when it's really a ping message
    if(msg.charAt(0) === 'h') {
        this._keepAliveCheck();
        return;
    }

    var data = JSON.parse(msg)[0];

    switch(data.a) {
        case this.ACK:
            this.emit((data.p === "1" ? this.CONN_SUCCESS : this.CONN_ERROR), data.p);
            break;

        case this.ADVANCE:
            var previous = {
                historyID: this.state.room.playback.historyID,
                playlistID: this.state.room.playback.playlistID,
                media: this.state.room.playback.media,
                dj: this.getUserByID(this.state.room.booth.dj, this.CACHE.ENABLED),
                score: {
                    positive: 0,
                    negative: 0,
                    grabs: this.state.room.grabs.length
                }
            };

            for(var i = this.state.room.votes.length - 1; i >= 0; i--) {
                if(this.state.room.votes[i].direction > 0)
                    previous.score.positive++;
                else
                    previous.score.negative++;
            }

            this.state.room.booth.dj = data.p.c;
            this.state.room.booth.waitlist = data.p.d;
            this.state.room.grabs = [];
            this.state.room.votes = [];

            this.state.room.playback.media = mapper.mapMedia(data.p.m);
            this.state.room.playback.historyID = data.p.h;
            this.state.room.playback.playlistID = data.p.p;
            this.state.room.playback.startTime = data.p.t;

            this.emit(this.ADVANCE, this.state.room.booth, this.state.room.playback, previous);
            break;

        case this.CHAT:
            var chat = mapper.mapChat(data.p);

            if(this.ccache) {
                this.state.chatcache.push(chat);

                if(this.state.chatcache.length > this.chatcachesize)
                    this.state.chatcache.shift();
            }

            if(chat.message.indexOf('@' + this.state.self.username) > -1)
                this.emit(this.CHAT_MENTION, chat);
            else if(chat.message.charAt(0) == '/')
                this.emit(this.CHAT_COMMAND, chat);
            else
                this.emit(this.CHAT, chat);
            break;

        case this.CHAT_DELETE:
            var chat = mapper.mapChatDelete(data.p);

            if(this.ccache)
                this.removeChatMessage(chat.cid, true);

            this.emit(this.CHAT_DELETE, chat);
            break;

        case this.NOTIFY:
            this.emit(this.NOTIFY, data.p);
            break;

        case this.GIFTED:
            var sender = this.getUserByName(data.p.s);
            var recipient = this.getUserByName(data.p.r);
            this.emit(this.GIFTED, sender || data.p.s, recipient || data.p.r);
            break;

        case this.PLAYLIST_CYCLE:
            this.emit(this.PLAYLIST_CYCLE, data.p);
            break;

        case this.DJ_LIST_CYCLE:
            this.state.room.booth.shouldCycle = data.p.f;
            this.emit(this.DJ_LIST_CYCLE, mapper.mapCycle(data.p));
            break;

        case this.DJ_LIST_LOCKED:
            this.state.room.booth.isLocked = data.p.f;
            this.emit(this.DJ_LIST_LOCKED, mapper.mapLock(data.p));
            break;

        case this.WAITLIST_UPDATE:
            this.emit(this.WAITLIST_UPDATE, this.state.room.booth.waitlist, data.p);
            this.state.room.booth.waitlist = data.p;
            break;

        case this.EARN:
            this.state.self.xp = data.p.xp;
            this.emit(this.EARN, mapper.mapXP(data.p));
            break;

        case this.LEVEL_UP:
            this.state.self.level++;
            this.emit(this.LEVEL_UP, data.p);
            break;

        case this.GRAB:

            for(var i = 0, l = this.state.room.grabs.length; i < l; i++) {
                if(this.state.room.grabs[i] == data.p)
                    return;
            }

            this.state.room.grabs.push(data.p);
            this.emit(this.GRAB, data.p);
            break;

        case this.MOD_BAN:
            this.clearUserFromLists(data.p.i);
            this.state.room.meta.population--;
            this.emit(this.MOD_BAN, mapper.mapModBan(data.p));
            break;

        case this.MOD_MOVE_DJ:
            this.emit(this.MOD_MOVE_DJ, mapper.mapModMove(data.p));
            break;

        case this.MOD_REMOVE_DJ:
            this.emit(this.MOD_REMOVE_DJ, mapper.mapModRemove(data.p));
            break;

        case this.MOD_ADD_DJ:
            this.emit(this.MOD_ADD_DJ, mapper.mapModAddDJ(data.p));
            break;

        case this.MOD_MUTE:
            if(!data)
                break;

            var time = (data.p.d === this.MUTEDURATION.SHORT ?
                15*60 : data.p.d === this.MUTEDURATION.MEDIUM ?
                30*60 : data.p.d === this.MUTEDURATION.LONG ?
                45*60 : 15*60);
            var mute = mapper.mapMute(data.p, time);

            this.emit(this.MOD_MUTE, mute, (data.p.d ? data.p.d : this.MUTEDURATION.NONE));
            break;

        case this.MOD_STAFF:
            var promotions = mapper.mapPromotions(data.p);

            if (promotions.length === 2) {
                var host = this.getUserByID(this.getHostID());

                for (var i = promotions.length - 1; i >= 0; i--) {
                    if(promotions[i].id == host.id) {
                        host.role = promotions.splice(i, 1)[0].role;

                        if(this.removeCachedUserByID(host.id))
                            this.cacheUser(host);

                        this.state.room.meta.hostID = promotions[0].id;
                        this.state.room.meta.hostName = promotions[0].username;

                        break;
                    }
                }
            }

            for(var i = this.state.room.users.length - 1; i >= 0; i--) {
                if(this.state.room.users[i].id == promotions[0].id) {
                    this.state.room.users[i].role = promotions[0].role;

                    if(this.removeCachedUserByID(this.state.room.users[i].id))
                        this.cacheUser(this.state.room.users[i]);

                    break;
                }
            }

            this.emit(this.MOD_STAFF, promotions);
            break;

        case this.MOD_SKIP:
            this.emit(this.MOD_SKIP, mapper.mapModSkip(data.p));
            break;

        case this.SKIP:
            this.emit(this.SKIP, data.p);
            break;

        case this.ROOM_NAME_UPDATE:
            this.state.room.meta.name = utils.decode(data.p.n);
            this.emit(this.ROOM_NAME_UPDATE, mapper.mapRoomNameUpdate(data.p));
            break;

        case this.ROOM_DESCRIPTION_UPDATE:
            this.state.room.meta.description = utils.decode(data.p.d);
            this.emit(this.ROOM_DESCRIPTION_UPDATE, mapper.mapRoomDescriptionUpdate(data.p));
            break;

        case this.ROOM_WELCOME_UPDATE:
            this.state.room.meta.welcome = utils.decode(data.p.w);
            this.emit(this.ROOM_WELCOME_UPDATE, mapper.mapRoomWelcomeUpdate(data.p));
            break;

        case this.ROOM_MIN_CHAT_LEVEL_UPDATE:
            this.emit(this.ROOM_MIN_CHAT_LEVEL_UPDATE, mapper.mapChatLevelUpdate(data.p));
            break;

        case this.USER_LEAVE:
            var user = undefined;

            // it was just a guest leaving, nothing more to do here
            if(data.p === 0) {
                this.state.room.meta.guests--;
                this.emit(this.GUEST_LEAVE, data.p);
                break;
            }

            this.state.room.meta.population--;

            for(var i = this.state.room.users.length - 1; i >= 0; i--) {
                if(this.state.room.users[i].id == data.p) {
                    this.clearUserFromLists(data.p);
                    user = this.state.room.users.splice(i, 1)[0];

                    if(this.sleave)
                        this.cacheUser(user);

                    break;
                }
            }

            this.emit(this.USER_LEAVE, user);
            break;

        case this.USER_JOIN:
            var user = mapper.mapUser(data.p);

            if(user.guest) {
                this.state.room.meta.guests++;

                user.joined = new Date().toISOString();
                this.emit(this.GUEST_JOIN, user);
            } else {
                this.state.room.users.push(user);
                this.state.room.meta.population++;

                if(this.isFriend(user.id))
                    this.emit(this.FRIEND_JOIN, user);
                else
                    this.emit(this.USER_JOIN, user);
            }
            break;

        case this.USER_UPDATE:
            this.emit(this.USER_UPDATE, mapper.mapUserUpdate(data.p));
            break;

        case this.FRIEND_REQUEST:
            var user = this.getUserByName(data.p);
            this.emit(this.FRIEND_REQUEST, user ? user : utils.decode(data.p));
            break;

        case this.FRIEND_ACCEPT:
            var user = this.getUserByName(data.p);
            this.emit(this.FRIEND_ACCEPT, user ? user : utils.decode(data.p));
            break;

        case this.VOTE:
            var vote = mapper.pushVote(data.p);
            if(!this._checkForPreviousVote(vote))
                this.emit(this.VOTE, vote);
            break;

        case this.CHAT_RATE_LIMIT:
            this.emit(this.CHAT_RATE_LIMIT);
            break;

        case this.FLOOD_API:
            this.emit(this.FLOOD_API);
            break;

        case this.FLOOD_CHAT:
            this.emit(this.FLOOD_CHAT);
            break;

        case this.KILL_SESSION:
            this.emit(this.KILL_SESSION, data.p);
            break;

        case this.PLUG_UPDATE:
            this.emit(this.PLUG_UPDATE);
            break;

        case this.PLUG_MESSAGE:
            this.emit(this.PLUG_MESSAGE, utils.decode(data.p));
            break;

        case this.MAINTENANCE_MODE:
            this.emit(this.MAINTENANCE_MODE);
            break;

        case this.MAINTENANCE_MODE_ALERT:
            this.emit(this.MAINTENANCE_MODE_ALERT, data.p);
            break;

        case this.BAN_IP:
            this.emit(this.BAN_IP);
            break;

        case this.BAN:
            this.emit(this.BAN, mapper.mapOwnBan(data.p));
            break;

        case this.NAME_CHANGED:
            this.emit(this.NAME_CHANGED);
            break;

        default:
            this._log(
                "An unknown action appeared!\nPlease report this to https://www.github.com/SooYou/plugged\nit's super effective!",
                1,
                "magenta"
            );
            this._log(data, 1, "magenta")
            break;
    }
};

Plugged.prototype.clearUserCache = function() {
    this.state.usercache = [];
};

Plugged.prototype.clearChatCache = function() {
    this.state.chatcache = [];
};

Plugged.prototype.clearChatQueue = function() {
    this.chatQueue = [];
};

Plugged.prototype.getChatByUser = function(username) {
    var messages = [];
    username = username.toLowerCase();

    for(var i = this.state.chatcache.length - 1; i >= 0; i--) {
        if(this.state.chatcache[i].username.toLowerCase() === username)
            messages.push(this.state.chatcache[i]);
    }

    return messages;
};

Plugged.prototype.getChat = function() {
    return this.state.chatcache;
};

Plugged.prototype.removeChatMessagesByUser = function(username, cacheOnly) {
    cacheOnly = cacheOnly || false;
    username = username.toLowerCase();

    for(var i = this.state.chatcache.length - 1; i >= 0; i--) {
        if(this.state.chatcache[i].username.toLowerCase() === username) {
            if(!cacheOnly)
                this.deleteMessage(this.state.chatcache[i].cid);

            this.state.chatcache.splice(i, 1);
        }
    }
};

Plugged.prototype.removeChatMessage = function(cid, cacheOnly) {
    cacheOnly = cacheOnly || false;

    for(var i = this.state.chatcache.length - 1; i >= 0; i--) {
        if(this.state.chatcache[i].cid === cid) {
            if(!cacheOnly)
                this.deleteMessage(this.state.chatcache[i].cid);

            this.state.chatcache.splice(i, 1);
            break;
        }
    }
};

// keeps the usercache clean by deleting invalidate objects
// objects invalidate by staying in cache for more than 5 minutes
Plugged.prototype.watchUserCache = function(enabled) {
    clearInterval(this.cleanCacheInterval);

    if(enabled) {
        this.cleanCacheInterval = setInterval(this._cleanUserCache.bind(this), 5*60*1000);
    } else {
        this.cacheUserOnLeave(false);
        this.cleanCacheInterval = -1;
        this.clearUserCache();
    }
};

Plugged.prototype.cacheChat = function(enabled) {
    this.ccache = enabled;
};

Plugged.prototype.isChatCached = function() {
    return this.ccache;
};

Plugged.prototype.setChatCacheSize = function(size) {
    if(typeof size === "number" && size >= 0)
        return this.chatcachesize = size;
    else
        return this.chatcachesize;
};

Plugged.prototype.getChatCacheSize = function() {
    return this.chatcachesize;
};

Plugged.prototype.cacheUserOnLeave = function(enabled) {
    if(this.cleanCacheInterval !== -1)
        this.sleave = enabled;
    return this.sleave;
};

Plugged.prototype.isUserCachedOnLeave = function() {
    return this.sleave;
};

Plugged.prototype.clearUserFromLists = function(id) {
    for(var i = 0, l = this.state.room.votes; i < l; i++) {
        if(this.state.room.votes[i].id == id) {
            this.state.room.votes.splice(i, 1);
            break;
        }
    }

    for(var i = 0, l = this.state.room.grabs; i < l; i++) {
        if(this.state.room.grabs[i] == id) {
            this.state.room.grabs.splice(i, 1);
            break;
        }
    }
};

Plugged.prototype.getJar = function() {
    return this.query.getJar();
};

Plugged.prototype.setJar = function(jar, storage) {
    this.query.setJar(jar, storage);
};

Plugged.prototype.defaultMessageProc = function(message) {
    var msgs = [];

    // 256 is the max length a chat message can have,
    // but the chat window caps the message at 250.
    for(var i = 0, l = Math.ceil(message.length/250); i < l; i++)
        msgs.push(message.slice(i*250, (i+1)*250));

    return msgs;
};

Plugged.prototype.setMessageProcessor = function(func) {
    if(typeof func === "function") {
        this.messageProc = func;
        return true;
    }

    return false;
};

Plugged.prototype.sendChat = function(message, deleteTimeout) {
    deleteTimeout = deleteTimeout || -1;

    if(!message || message.length <= 0) {
        this._log("no message given", 1, "yellow");
        return;
    }

    message = this.messageProc(message);

    if(Array.isArray(message)) {
        for(var i = 0, l = message.length; i < l; i++) {
            // timeout: pass a timeout for the last message only
            this.chatQueue.push({
                message: message[i],
                timeout: (l - 1 === i ? deleteTimeout : -1)
            });
        }
    } else if(typeof message === "string") {
        this.chatQueue.push({
            message: message,
            timeout: deleteTimeout
        });
    }

    if(this.chatTimeout === 0)
        this._processChatQueue();

    return message;
};

Plugged.prototype.invokeLogger = function(logfunc) {
    if(typeof logfunc === "function" ||
        (!Array.isArray(logfunc) && typeof logfunc === "object")) {
        this.log = logfunc;
        return true;
    }

    return false;
};

Plugged.prototype.login = function(credentials, authToken, callback) {
    if(typeof authToken === "function") {
        callback = authToken;
        authToken = null;
    }

    if(!authToken) {
        if(typeof credentials !== "object")
            throw new Error("credentials has to be of type object");

        var errorMsg = [];
        var flag = 0;

        flag |= (!credentials.hasOwnProperty("email") ? 1 << 0 : 0);
        flag |= (!credentials.hasOwnProperty("password") ? 1 << 1 : 0);
        flag |= (!credentials.hasOwnProperty("accessToken") ? 1 << 2 : 0);
        flag |= (!credentials.hasOwnProperty("userID") ? 1 << 3 : 0);

        // doing this with hasOwnProperty would have been possible but would be a real mess
        if(flag & 0x03 && ((flag & 0x0C) === 0x0C)) {           // missing email but no facebook credentials
            if(flag & 0x01)
                errorMsg.push("email missing");

            if(flag & 0x02)
                errorMsg.push("password missing");

        } else if(flag & 0x0C && ((flag & 0x03) === 0x03)) {    // missing facebook but no email credentials
            if(flag & 0x04)
                errorMsg.push("accessToken missing");

            if(flag & 0x08)
                errorMsg.push("userID missing");
        } else {                                                // credentials for both are set
            if(flag & 0x03 && !(flag & 0x0C)) {                 // nullify malformed email credentials
                delete credentials.email;
                delete credentials.password;
            // same for
            } else if(flag & 0x0C && !(flag & 0x03)) {          // nullify malformed facebook credentials
                delete credentials.accessToken;
                delete credentials.userID;
            } else {                                            // both are malformed
                errorMsg.push("credentials are malformed");
            }
        }

        if(errorMsg.length > 0)
            throw new Error(errorMsg.join(", "));

        this.credentials = credentials;

        // requests a new cookie jar
        if(!this.getJar())
            this.setJar(null);

        this._log("logging in with account: " + (credentials.email || credentials.userID) + "...", 2, "white");

        this._login();
    } else {
        this._log("trying to resume session...", 2, "white");
        this.auth = authToken;
        this._loggedIn();
    }

    if(callback) {
        var onSuccess = function(self) {
            this.removeListener(this.LOGIN_ERROR, onError);
            callback(null, self);
        };

        var onError = function(err) {
            this.removeListener(this.LOGIN_SUCCESS, onSuccess);
            callback(err);
        };

        this.once(this.LOGIN_SUCCESS, onSuccess);
        this.once(this.LOGIN_ERROR, onError);
    }
};

Plugged.prototype.guest = function(room, callback) {
    if(this.sock) {
        if(this.sock.readyState === WebSocket.OPEN)
            this._log("you seem to be logged in already", 0, "yellow");
        else
            this._log("the socket is already instantiated", 0, "red");
        return;
    }

    this._log("Joining room \"" + room + "\" as a guest...", 1, "white");
    this.query.query("GET", baseURL + '/' + room, function _guestRoom(err, data) {
        // get auth token directly from the page
        var idx = data.indexOf("_jm=\"") + 5;
        var auth = data.substr(idx, data.indexOf('"', idx) - idx);

        if(auth.length === 172) {
            this.auth = auth;

            this.state.self = mapper.mapSelf({
                joined: new Date().toISOString(),
                guest: true
            });

            this._connectSocket();
            this.getRoomStats(function(err, stats) {
                if(!err) {
                    this.emit(this.JOINED_ROOM, stats);
                    callback && callback(null, stats);
                } else {
                    this.emit(this.PLUG_ERROR, err);
                    callback && callback(err);
                }
            });
        } else {
            var err = new Error("couldn't join room \"" + room + "\" as a guest")
            this.emit(this.PLUG_ERROR, err);
            callback && callback(err);
        }
    }.bind(this), false, true);
};

Plugged.prototype.connect = function(room, callback) {
    if(!room) {
        this._log("room has to be defined", 1, "red");
        return;
    }

    if(!this.auth || this.state.self.guest) {
        this._log("joining plug in guest mode, functions are highly limited!", 1, "yellow");
        this.guest(room);
        return;
    }

    this.joinRoom(room, function _joinedRoom(err) {
        if(!err) {
            this.watchUserCache(true);
            this.clearUserCache();
            this.clearChatCache();

            this.getRoomStats(function(err, stats) {

                if(!err) {
                    this.state.room = stats;
                    this.state.self.role = stats.role;
                    this.emit(this.JOINED_ROOM, this.state.room);
                } else {
                    this.state.room = mapper.mapRoom();
                    this.state.self.role = 0;
                    this.emit(this.PLUG_ERROR, err);
                }
            });

        } else {
            this.state.room = mapper.mapRoom();
            this.state.self.role = 0;
            this.emit(this.PLUG_ERROR, err);
        }
    });

    if(callback) {
        var onSuccess = function(state) {
            this.removeListener(this.PLUG_ERROR, onError);
            callback(null, state);
        };
        var onError = function(err) {
            this.removeListener(this.JOINED_ROOM, onSuccess);
            callback(err);
        };

        this.once(this.JOINED_ROOM, onSuccess);
        this.once(this.PLUG_ERROR, onError);
    }
};

/*================ ROOM CALLS ================*/

Plugged.prototype.getUserByID = function(id, cache) {
    cache = cache || this.CACHE.DISABLE;

    if(cache === true)
        cache = this.CACHE.ENABLE;

    if(id == this.state.self.id)
        return this.state.self;

    for(var i = 0, l = this.state.room.users.length, m = (cache !== this.CACHE.ONLY); m && i < l; i++) {
        if(this.state.room.users[i].id == id)
            return this.state.room.users[i];
    }

    for(var i = 0, l = this.state.usercache.length, m = (cache !== this.CACHE.DISABLE); m && i < l; i++) {
        if(this.state.usercache[i].id == id)
            return this.state.usercache[i];
    }

    return undefined;
};

Plugged.prototype.getUserByName = function(username, cache) {
    cache = cache || this.CACHE.DISABLE;
    username = username.toLowerCase();

    if(cache === true)
        cache = this.CACHE.ENABLE;

    if(this.state.self.username.toLowerCase() === username)
        return this.state.self;

    for(var i = 0, l = this.state.room.users.length, m = (cache !== this.CACHE.ONLY); m && i < l; i++) {
        if(this.state.room.users[i].username.toLowerCase() === username)
            return this.state.room.users[i];
    }

    for(var i = 0, l = this.state.usercache.length, m = (cache !== this.CACHE.DISABLE); m && i < l; i++) {
        if(this.state.usercache[i].username.toLowerCase() === username)
            return this.state.usercache[i];
    }

    return undefined;
};

Plugged.prototype.getUserRole = function(id) {
    for(var i = 0, l = this.state.room.users.length; i < l; i++) {
        if(this.state.room.users[i].id == id)
            return this.state.room.users[i].role;
    }

    return undefined;
};

Plugged.prototype.getUsers = function() {
    return this.state.room.users;
};

Plugged.prototype.getSelf = function() {
    return this.state.self;
};

Plugged.prototype.setSetting = function(setting, value, callback) {
    if(this.state.self.settings.hasOwnProperty(setting)) {
        this.state.self.settings[setting] = value;

        this.saveSettings(callback);
        return true;
    }
    callback && callback(null, false);
    return false;
};

Plugged.prototype.getSetting = function(setting) {
    if(this.state.self.settings.hasOwnProperty(setting))
        return this.state.self.settings[setting];
    return null;
};

Plugged.prototype.getSettings = function() {
    return this.state.self.settings;
};

Plugged.prototype.isFriend = function(userID) {
    for(var i = 0, l = this.state.self.friends.length; i < l; i++) {
        if(this.state.self.friends[i] == userID)
            return true;
    }

    return false;
};

Plugged.prototype.getCurrentDJ = function() {
    this._log("getCurrentDJ has been deprecated, please use getDJ now", 0, "yellow");
    return this.getUserByID(this.state.room.booth.dj);
};

Plugged.prototype.getDJ = function() {
    return this.getUserByID(this.state.room.booth.dj, this.CACHE.DISABLE);
};

Plugged.prototype.getCurrentMedia = function() {
    this._log("getCurrentMedia has been deprecated, please use getMedia now", 0, "yellow");
    return this.state.room.playback.media;
};

Plugged.prototype.getMedia = function() {
    return this.state.room.playback.media;
};

Plugged.prototype.getPlayback = function() {
    return this.state.room.playback;
};

Plugged.prototype.getStartTime = function() {
    return this.state.room.playback.startTime;
};

Plugged.prototype.getBooth = function() {
    return this.state.room.booth;
};

Plugged.prototype.getCurrentRoomStats = function() {
    this._log("getCurrentRoomStats has been deprecated, please use getRoom now", 0, "yellow");
    return this.state.room;
};

Plugged.prototype.getRoom = function() {
    return this.state.room;
};

Plugged.prototype.getRoomMeta = function() {
    return this.state.room.meta;
};

Plugged.prototype.getRoomName = function() {
    return this.state.room.meta.name;
};

Plugged.prototype.getFX = function() {
    return this.state.room.fx;
};

Plugged.prototype.checkGlobalRole = function(gRole) {
    return (gRole === 5 ?
                this.GLOBALROLE.ADMIN :
                (gRole > 0 && gRole < 5 ?
                        this.GLOBALROLE.BRAND_AMBASSADOR :
                        this.GLOBALROLE.NONE
                )
    );
};

Plugged.prototype.getHostName = function() {
    return this.state.room.meta.hostName;
};

Plugged.prototype.getHostID = function() {
    return this.state.room.meta.hostID;
};

Plugged.prototype.getPopulation = function() {
    return this.state.room.meta.population;
};

Plugged.prototype.getGuests = function() {
    return this.state.room.meta.guests;
};

Plugged.prototype.getMinChatLevel = function() {
    return this.state.room.meta.minChatLevel;
};

Plugged.prototype.isFavorite = function() {
    return this.state.room.meta.favorite;
};

Plugged.prototype.getDescription = function() {
    return this.state.room.meta.description;
};

Plugged.prototype.getWelcomeMessage = function() {
    return this.state.room.meta.welcome;
};

Plugged.prototype.getSlug = function() {
    return this.state.room.meta.slug;
};

Plugged.prototype.getWaitlist = function() {
    return this.state.room.booth.waitlist;
};

Plugged.prototype.isWaitlistLocked = function() {
    return this.state.room.booth.isLocked;
};

Plugged.prototype.doesWaitlistCycle = function() {
    return this.state.room.booth.shouldCycle;
};

Plugged.prototype.getVotes = function(withUserObject) {
    withUserObject = withUserObject || false;

    if(withUserObject) {
        var voters = [];

        for(var i = 0, l = this.state.room.votes.length; i < l; i++) {
            for(var j = 0, m = this.state.room.users.length; j < m; j++) {
                if(this.state.room.votes[i].id == this.state.room.users[j].id)
                    voters.push({ user: this.state.room.users[j], direction: this.state.room.votes[i].direction });
            }
        }

        return voters;
    } else {
        return this.state.room.votes;
    }
};

Plugged.prototype.getGrabs = function(withUserObject) {
    if(withUserObject) {
        var grabbers = [];

        for(var i = 0, l = this.state.room.grabs.length; i < l; i++) {
            for(var j = 0, m = this.state.room.users.length; j < m; j++) {
                if(this.state.room.grabs[i] == this.state.room.users[j].id)
                    grabbers.push(this.state.room.users[j]);
            }
        }

        return grabbers;
    } else {
        return this.state.room.grabs;
    }
};

Plugged.prototype.cacheUser = function(user) {
    if(typeof user === "object" && typeof this.getUserByID(user.id, this.CACHE.ONLY) === "undefined") {
        this.state.usercache.push({ user: user, timestamp: Date.now() });
        return true;
    }
    return false;
};

Plugged.prototype.removeCachedUserByID = function(id) {
    for(var i = 0, l = this.state.usercache.length; i < l; i++) {
        if(this.state.usercache[i].user.id == id) {
            this.state.usercache.splice(i, 1);
            return true;
        }
    }
    return false;
};

Plugged.prototype.removeCachedUserByName = function(username) {
    username = username.toLowerCase();

    for(var i = 0, l = this.state.usercache.length; i < l; i++) {
        if(this.state.usercache[i].user.username.toLowerCase() === username) {
            this.state.usercache.splice(i, 1);
            return true;
        }
    }
    return false;
};

Plugged.prototype.getStaffOnline = function() {
    var staff = [];

    for(var i = 0, l = this.state.room.users.length; i < l; i++) {
        if(this.state.room.users[i].role > this.USERROLE.NONE)
            staff.push(this.state.room.users[i]);
    }

    return staff;
};

Plugged.prototype.getStaffOnlineByRole = function(role) {
    var staff = [];

    for(var i = 0, l = this.state.room.users.length; i < l; i++) {
        if(this.state.room.users[i].role == role)
            staff.push(this.state.room.users[i]);
    }

    return staff;
};

Plugged.prototype.getStaffByRole = function(role, callback) {
    this.getStaff(function(err, staff) {
        if(!err) {
            var filteredStaff = [];

            for(var i = 0, l = staff.length; i < l; i++) {
                if(staff[i].role == role)
                    filteredStaff.push(mapper.mapUser(staff[i]));
            }

            callback && callback(null, filteredStaff);
        } else {
            callback && callback(err);
        }
    });
};

// GET plug.dj/_/news
Plugged.prototype.getNews = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["NEWS"], callback);
};

// GET plug.dj/_/auth/token
Plugged.prototype.getAuthToken = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["TOKEN"], callback, true);
};

// GET plug.dj/_/rooms/state
Plugged.prototype.getRoomStats = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["ROOMSTATS"], function _sanitizeRoomStats(err, stats) {
        callback && callback(err, mapper.mapRoom(stats));
    }, true);
};

// GET plug.dj/_/rooms?q=<query>&page=<page:0>&limit=<limit:50>
Plugged.prototype.findRooms = function(query, page, limit, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) :
        typeof limit === "function" ? limit :
        typeof page === "function" ? page : undefined);
    query = query || "";

    if(typeof page !== "number")
        page = 0;

    if(typeof limit !== "number")
        limit = 50;

    this.query.query("GET", [endpoints["ROOMS"], "?q=", query, "&page=", page, "&limit=", limit].join(''), function _sanitizeFoundRooms(err, rooms) {

        callback && callback(err, (!err && rooms ? rooms.map(function(room) {
            return mapper.mapExtendedRoom(room);
        }) : []));
    });
};

// GET plug.dj/_/rooms?q=<query>&page=<page:0>&limit=<limit:50>
Plugged.prototype.getRoomList = function(page, limit, callback) {
    if(typeof page === "function") {
        callback = page;
        page = 0;
    } else if(typeof limit === "function") {
        callback = limit;
        limit = 50;
    }

    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["ROOMS"] + "?q=&page=0&limit=50", function _sanitizeRooms(err, rooms) {
        callback && callback(err, (!err && rooms ? rooms.map(function(room) {
            return mapper.mapExtendedRoom(room);
        }) : []));
    });
};

// GET plug.dj/_/staff
Plugged.prototype.getStaff = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["STAFF"], function _sanitizeStaff(err, staff) {
        callback && callback(err, (!err && staff ? staff.map(function(staffEntry) {
            return mapper.mapUser(staffEntry);
        }) : []));
    });
};

// GET plug.dj/_/users/<id>
Plugged.prototype.getUser = function(id, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["USERSTATS"] + id, function _sanitizeUser(err, user) {
        callback && callback(err, mapper.mapUser(user));
    }, true);
};

// GET plug.dj/_/rooms/history
Plugged.prototype.getRoomHistory = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["HISTORY"], function _sanitizeHistory(err, history) {
        callback && callback(err, (!err && history ? history.map(function(historyEntry) {
            return mapper.mapHistoryEntry(historyEntry);
        }) : []));
    });
};

// GET plug.dj/_/rooms/validate/<name>
Plugged.prototype.validateRoomName = function(name, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["VALIDATEROOM"] + name, callback, true);
};

// GET plug.dj/_/users/validate/<name>
Plugged.prototype.validateUsername = function(name, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["VALIDATEUSER"] + name, callback, true);
};

// GET plug.dj/_/mutes
Plugged.prototype.getMutes = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["MUTES"], function _sanitizeMutes(err, mutes) {
        callback && callback(err, (!err && mutes ? mutes.map(function (mute) {
            return mapper.mapMute(mute);
        }) : []));
    });
};

// GET plug.dj/_/bans
Plugged.prototype.getBans = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["BANS"], function _sanitizeBans(err, bans) {
        callback && callback(err, (!err && bans ? bans.map(function (ban) {
            return mapper.mapBan(ban);
        }) : []));
    });
};

// PUT plug.dj/_/users/settings
Plugged.prototype.saveSettings = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["SETTINGS"], this.state.self.settings, callback);
};

// PUT plug.dj/_/booth/lock
Plugged.prototype.setLock = function(lock, removeAllDJs, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["LOCK"], {
        isLocked: lock,
        removeAllDJs: removeAllDJs
    }, callback);
};

// PUT plug.dj/_/booth/cycle
Plugged.prototype.setCycle = function(shouldCycle, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["CYCLE"], { shouldCycle: shouldCycle }, callback);
};

// POST plug.dj/_/auth/login
Plugged.prototype.setLogin = function(csrf, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);

    this._log("setting login data...", 1, "white");

    if(this.credentials.hasOwnProperty("email")) {
        this.query.query("POST", endpoints["LOGIN"], {
            "csrf": csrf,
            "email": this.credentials.email,
            "password": this.credentials.password
        }, callback);
    } else if(this.credentials.hasOwnProperty("accessToken")) {
        this.query.query("POST", endpoints["FACEBOOK"], {
            "csrf": csrf,
            "accessToken": this.credentials.accessToken,
            "userID": this.credentials.userID
        }, callback);
    };
};

// POST plug.dj/_/auth/reset/me
Plugged.prototype.resetPassword = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["RESET"], callback);
};

// POST plug.dj/_/users/bulk
Plugged.prototype.requestUsers = function(ids, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["BULKUSERS"], { ids: ids }, callback);
};

// POST plug.dj/_/rooms/join
Plugged.prototype.joinRoom = function(slug, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["JOINROOM"], { slug: slug }, callback);
};

// POST plug.dj/_/booth
Plugged.prototype.joinWaitlist = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["JOINBOOTH"], callback);
};

// POST plug.dj/_/booth/add
Plugged.prototype.addToWaitlist = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["ADDBOOTH"], { id: userID }, callback);
};

// POST plug.dj/_/playlists
Plugged.prototype.addPlaylist = function(name, media, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);

    if(typeof media === "function") {
        callback = media.bind(this);
        media = null;
    }

    this.query.query("POST", endpoints["PLAYLISTS"],
        { name: name, media: mapper.serializeMediaObjects(media) },
        callback, true);
};

// POST plug.dj/_/grabs
Plugged.prototype.grab = function(playlistID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);

    for(var i = 0, l = this.state.room.grabs.length; i < l; i++) {
        if(this.state.room.grabs[i] == this.state.self.id)
            return 0;
    }

    this.query.query("POST", endpoints["GRABS"], {
        playlistID: playlistID,
        historyID: this.state.room.playback.historyID
    }, callback, true);

    return 1;
};

// POST plug.dj/_/booth/skip
Plugged.prototype.skipDJ = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);

    if(typeof userID === "function") {
        callback = userID;
        userID = this.state.room.booth.dj;
    }

    // fallback in case that plug failed at assigning a valid history ID
    if(!this.state.room.playback.historyID) {
        this.removeDJ(userID, function(err) {
            if(!err)
                this.addToWaitlist(userID, callback);

            callback && callback(err);
        });
    } else {

        if(userID == this.state.self.id)
            this.query.query("POST", endpoints["SKIPBOOTH"] + "/me", callback);
        else
            this.query.query("POST", endpoints["SKIPBOOTH"], {
                userID: userID,
                historyID: this.state.room.playback.historyID
            }, callback);
    }
};

// POST plug.dj/_/booth/move
Plugged.prototype.moveDJ = function(userID, position, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["MOVEBOOTH"], {
        userID: userID,
        position: position
    }, callback);
};

// POST plug.dj/_/rooms
Plugged.prototype.createRoom = function(name, private, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["CREATEROOM"], {
        name: name,
        private: private
    }, callback, true);
};

// POST plug.dj/_/rooms/update
Plugged.prototype.updateRoomInfo = function(name, description, welcome, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["UPDATEROOM"], {
        name: name,
        description: description,
        welcome: welcome
    }, callback);
};

// POST plug.dj/_/rooms/update
Plugged.prototype.setMinChatLevel = function(level, callback) {
    level = (typeof level === "string" ? parseInt(level, 10) : level);
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["UPDATEROOM"], {
        minChatLevel: level
    }, function(err) {
        if (!err)
            this.state.room.meta.minChatLevel = level;

        callback && callback(err);
    }.bind(this));
};

// POST plug.dj/_/bans/add
Plugged.prototype.banUser = function(userID, time, reason, callback) {
    if(typeof reason === "function") {
        callback = reason;
        reason = 1;
    }

    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["BANS"] + "/add", {
        userID: userID,
        reason: reason,
        duration: time
    }, callback);
};

// POST plug.dj/_/mutes
Plugged.prototype.muteUser = function(userID, time, reason, callback) {
    if(typeof reason === "function") {
        callback = reason;
        reason = 1;
    }

    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["MUTES"], {
        userID: userID,
        reason: reason,
        duration: time
    }, callback);
};

// POST plug.dj/_/staff/update
Plugged.prototype.addStaff = function(userID, role, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["STAFF"] + "/update", {
        userID: userID,
        roleID: role
    }, callback, true);
};

// POST plug.dj/_/ignores
Plugged.prototype.ignoreUser = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["IGNORES"], { id: userID }, function(err, data) {
        if(!err && data) {

            if(data.id && data.username) {
                this.state.self.ignores.push({
                    id: data.id,
                    username: data.username
                });
            }

        }
        callback && callback(err);
    }.bind(this), true);
};

// DELETE plug.dj/_/playlists/<id>
Plugged.prototype.deletePlaylist = function(playlistID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["PLAYLISTS"] + '/' + playlistID, callback, true);
};

// DELETE plug.dj/_/ignores/<userID>/
Plugged.prototype.removeIgnore = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["IGNORES"] + '/' + userID, function(err, data) {
        if(!err && data) {
            for(var i = 0, l = this.state.self.ignores.length; i < l; i++) {
                if(this.state.self.ignores[i].id == userID) {
                    this.state.self.ignores.splice(i, 1);
                    break;
                }
            }
        }

        callback && callback(err, data);
    }.bind(this), true);
};

// DELETE plug.dj/_/staff/<userID>
Plugged.prototype.removeStaff = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["STAFF"] + '/' + userID, callback);
};

// DELETE plug.dj/_/booth/remove/<userID>
Plugged.prototype.removeDJ = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["REMOVEBOOTH"] + userID, callback, true);
};

// DELETE plug.dj/_/booth
Plugged.prototype.leaveWaitlist = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["JOINBOOTH"], callback);
};

// DELETE plug.dj/_/bans/<userID>
Plugged.prototype.unbanUser = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["BANS"] + '/' + userID, callback);
};

// DELETE plug.dj/_/mutes/<userID>
Plugged.prototype.unmuteUser = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["MUTES"] + '/' + userID, callback);
};

// DELETE plug.dj/_/chat/<cid>
Plugged.prototype.deleteMessage = function(chatID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["CHAT"] + chatID, callback);
};

// DELETE plug.dj/_/auth/session
Plugged.prototype.logout = function(callback) {
    this.query.query("DELETE", endpoints["SESSION"], function _loggedOut(err, body) {
        this._clearState();
        if(!err) {
            this._log("Logged out.", 1, "magenta");
            this.emit(this.LOGOUT_SUCCESS);
            callback && callback(null);
        } else {
            this.emit(this.LOGOUT_ERROR, err);
            callback && callback(err);
        }
    }.bind(this));
};

/*================ USER CALLS ================*/

// GET plug.dj/_/users/me
Plugged.prototype.requestSelf = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    var self = this;

    this.query.query("GET", endpoints["USERSTATS"] + "me", function _requestedSelf(err, data) {
        if(!err && data) {
            self.state.self = mapper.mapSelf(data);

            self.getFriends(function(err, data) {
                if(!err && data) {
                    for(var i = 0, l = data.length; i < l; i++)
                        self.state.self.friends.push(data[i].id);
                }

                callback && callback(err, self.state.self);
            });
        } else {
            callback && callback(err);
        }
    }, true);
};

// GET plug.dj/_/users/me/history
Plugged.prototype.getMyHistory = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["USERHISTORY"], callback);
};

// GET plug.dj/_/friends
Plugged.prototype.getFriends = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["FRIENDS"], function _sanitizeFriends(err, friends) {
        callback && callback(err, (!err && friends ? friends.map(function(friend) {
            return mapper.mapUser(friend);
        }) : []));
    });
};

// GET plug.dj/_/friends/invites
Plugged.prototype.getFriendRequests = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["INVITES"], function _sanitizeFriendRequests(err, requests) {
        callback && callback(err, (!err && requests ? requests.map(function(request) {
            return mapper.mapFriendRequest(request);
        }) : []));
    });
};

Plugged.prototype.findPlaylist = function(query, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["PLAYLISTS"], function _findPlaylist(err, playlists) {
        var regex = null;
        var result = [];

        try {
            if(query instanceof RegExp) {
                regex = query;
            } else {
                query = encodeURIComponent(query);
                regex = new RegExp('(' + query.replace(/%20/, '|') + ')', 'i');
            }
        } catch(err) {
            return callback && callback(err);
        }

        for(var i = (!err ? playlists.length - 1 : 0); i >= 0; i--) {
            if(playlists[i].name && playlists[i].name.match(regex))
                result.push(playlists[i]);
        }

        callback && callback(err, result);
    })
};

Plugged.prototype.findMedia = function(query, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);

    this.getPlaylists(function(err, playlists) {
        if(err)
            return callback && callback(err);

        var media = [];
        var pending = playlists.length;
        var cb = function(err, mediaArray) {
            if(err)
                return callback && callback(err, media);
            else(Array.isArray(mediaArray) && mediaArray.length > 0)
                media = media.concat(mediaArray);

            pending--;
            if(pending === 0)
                callback && callback(null, media);
        };

        for(var i = pending - 1; i >= 0; i--)
            this.findMediaPlaylist(playlists[i].id, query, cb);
    });
};

// GET plug.dj/_/playlists/<id>/media
Plugged.prototype.findMediaPlaylist = function(playlistID, query, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", [endpoints["PLAYLISTS"], '/', playlistID, "/media"].join(''), function(err, data) {
        if(err || !data || data.length === 0)
            return callback && callback(err);

        var result = [];
        var regex = null;

        try {
            if(query instanceof RegExp) {
                regex = query;
            } else {
                query = encodeURIComponent(query);
                regex = new RegExp('(' + query.replace(/%20/, '|') + ')', 'i');
            }
        } catch(err) {
            return callback && callback(err);
        }

        for(var i = (!err ? data.length - 1 : 0); i >= 0; i--) {
            if(data[i].title && data[i].title.match(regex) || data[i].author && data[i].author.match(regex))
                result.push(data[i]);
        }

        callback && callback(err, result);
    });
};

// GET plug.dj/_/playlists/<id>/media
Plugged.prototype.getPlaylist = function(playlistID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", [endpoints["PLAYLISTS"], '/', playlistID, "/media"].join(''), callback);
};

// GET plug.dj/_/playlists
Plugged.prototype.getPlaylists = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["PLAYLISTS"], callback);
};

// GET plug.dj/_/ignores
Plugged.prototype.getIgnores = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["IGNORES"], callback);
};

// GET plug.dj/_/favorites
Plugged.prototype.getFavoriteRooms = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["FAVORITEROOM"], function(err, rooms) {
        if(!err) {
            callback && callback(err, (!err && rooms ? rooms.map(function(room) {
                return mapper.mapExtendedRoom(room);
            }) : []));
        } else {
            callback && callback(err);
        }
    });
};

// MitM protection, only available before login
// GET plug.dj
Plugged.prototype.getCSRF = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);

    this.query.query("GET", endpoints["CSRF"], function _gotCSRF(err, body) {
        if(!err) {
            var idx = body.indexOf("_csrf") + 9;

            body = body.substr(idx, body.indexOf('\"', idx) - idx);

            if(body.length === 60) {
                this._log("CSRF token: " + body, 2, "magenta");
                callback && callback(null, body);
            } else {
                callback && callback(new Error("Couldn't find CSRF token in body, are you logged in already?"));
            }

        } else {
            callback && callback(err);
        }
    }.bind(this));
};

// PUT plug.dj/_/blurb
Plugged.prototype.setProfileMessage = function(message, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["BLURB"], { blurb: message }, function(err) {
        if(!err)
            this.state.self.blurb = message;

        callback && callback(err);
    }.bind(this), true);
};

// PUT plug.dj/_/playlists/<id>/rename
Plugged.prototype.renamePlaylist = function(playlistID, name, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", [endpoints["PLAYLISTS"], '/', playlistID, '/rename'].join(''), { name: name }, callback);
};

// PUT plug.dj/_/avatar
Plugged.prototype.setAvatar = function(avatarID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["AVATAR"], { id: avatarID }, function(err) {
        if(!err)
            this.state.self.avatarID = avatarID;

        callback && callback(err);
    }.bind(this), true);
};

// PUT plug.dj/_/users/badge
Plugged.prototype.setBadge = function(badgeID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["BADGE"], { id: badgeID }, function(err) {
        if(!err)
            this.state.self.badge = badgeID;

        callback && callback(err);
    }.bind(this), true);
};

// PUT plug.dj/_/users/language
Plugged.prototype.setLanguage = function(language, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["LANGUAGE"], { language: language }, callback);
};

// PUT plug.dj/_/friends/ignore
Plugged.prototype.rejectFriendRequest = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["IGNOREFRIEND"], { id: userID }, callback);
};

// PUT plug.dj/_/playlists/<id>
Plugged.prototype.activatePlaylist = function(playlistID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["PLAYLISTS"] + '/' + playlistID + "/activate", callback, true);
};

// PUT plug.dj/_/playlists/<id>/media/move
Plugged.prototype.moveMedia = function(playlistID, mediaArray, beforeID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/move",
        { ids: mediaArray, beforeID: beforeID }, callback);
};

// PUT plug.dj/_/playlists/<id>/media/update
Plugged.prototype.updateMedia = function(playlistID, mediaID, author, title, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/update",
        { id: mediaID, author: author, title: title }, callback);
};

// PUT plug.dj/_/playlists/<id>/shuffle
Plugged.prototype.shufflePlaylist = function(playlistID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["PLAYLISTS"] + '/' + playlistID + "/shuffle", callback);
};

// POST plug.dj/_/friends
Plugged.prototype.addFriend = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["FRIENDS"], { id: userID }, function(err, data) {
        if(!err)
            this.state.self.friends.push(userID);

        callback && callback(err);
    }.bind(this));
};

// POST plug.dj/_/playlists/<id>/media/delete
Plugged.prototype.deleteMedia = function(playlistID, mediaIDs, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/delete",
        { ids: mediaIDs },
        callback);
};

// POST plug.dj/_/playlists/<id>/media/insert
Plugged.prototype.addMedia = function(playlistID, mediaObjects, append, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/insert",
        { media: mapper.serializeMediaObjects(mediaObjects), append: append },
        callback);
};

// POST plug.dj/_/playlists/<id>/media/insert
Plugged.prototype.insertMedia = function(playlistID, media, append, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/insert",
        { media: mapper.serializeMediaObjects(media), append: append },
        callback);
};

// POST plug.dj/_/votes
Plugged.prototype.woot = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["VOTES"], {
        direction: 1,
        historyID: this.state.room.playback.historyID
    }, callback);
};

// POST plug.dj/_/votes
Plugged.prototype.meh = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["VOTES"], {
        direction: -1,
        historyID: this.state.room.playback.historyID
    }, callback);
};

// POST plug.dj/_/favorites
Plugged.prototype.favoriteRoom = function(roomID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["FAVORITEROOM"], { id: roomID }, callback, true);
};

// DELETE plug.dj/_/notifications
Plugged.prototype.deleteNotification = function(id, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["NOTIFICATION"] + id, callback);
};

// DELETE plug.dj/_/friends
Plugged.prototype.removeFriend = function(userID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["FRIENDS"] + '/' + userID, function(err, data) {
        if(!err) {
            for(var i = 0, l = this.state.self.friends.length; i < l; i++) {
                if(this.state.self.friends[i].id == userID) {
                    this.state.self.friends.splice(i, 1);
                    break;
                }
            }
        }

        callback && callback(err);
    }.bind(this));
};

/*================ STORE CALLS ================*/

// GET plug.dj/_/inventory
Plugged.prototype.getInventory = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["INVENTORY"], callback);
};

// GET plug.dj/_/products
Plugged.prototype.getProducts = function(type, category, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", [endpoints["PRODUCTS"], '/', type, '/', category].join(''), callback);
};

// GET plug.dj/_/users/me/transactions
Plugged.prototype.getTransactions = function(callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["TRANSACTIONS"], callback);
};

// POST plug.dj/_/store/purchase/username
Plugged.prototype.purchaseUsername = function(username, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["PURCHASE"] + "/username", { id: 454, username: username }, callback);
};

// POST plug.dj/_/store/purchase
Plugged.prototype.purchaseItem = function(itemID, callback) {
    callback = (typeof callback === "function" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["PURCHASE"], { id: itemID }, callback, true);
};

module.exports = Plugged;
