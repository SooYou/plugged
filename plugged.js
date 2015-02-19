var EventEmitter = require("events").EventEmitter;
var models = require("./state");
var Query = require("./query");
var WebSocket = require("ws");
var async = require("async");
var util = require("util");

var baseURL = "https://plug.dj";

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
    PURCHASES: baseURL +    "/_/users/me/purchase",
    USERHISTORY: baseURL +  "/_/users/me/history",
    FAVORITEROOM: baseURL + "/_/rooms/favorites",
    VALIDATEROOM: baseURL + "/_/rooms/validate/",
    /*--------------- PUT ---------------*/
    LOCK: baseURL +         "/_/booth/lock",
    BLURB: baseURL +        "/_/profile/blurb",
    CYCLE: baseURL +        "/_/booth/cycle",
    LOGIN: baseURL +        "/_/auth/login", 
    BADGE: baseURL +        "/_/users/badge",
    AVATAR: baseURL +       "/_/users/avatar",
    STATUS: baseURL +       "/_/users/status",
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

WebSocket.prototype.sendMessage = function(type, data, offset) {
    offset = offset || 0;

    if(typeof type === "string" && (typeof data === "string" || typeof data === "number")) {
        this.send([
            '{"a":"', type, '","p":"', data, 
            '","t":', Date.now() - offset, '}'
            ].join(''));
    }
};

function setErrorMessage(statusCode, msg) {
    return {
        code: statusCode,
        message: msg
    };
}

function loginClient(client, tries) {
    async.waterfall([
        client.getCSRF.bind(client),
        client.setLogin.bind(client),
        client.getAuthAndServerTime.bind(client)
    ], function _loggedIn(err) {
        if(!err) {
            client.connectSocket();
            client.requestSelf(function _requestSelfLogin(err) {
                if(!err)
                    client.emit(client.LOGIN_SUCCESS);
                else
                    client.emit(client.LOGIN_ERROR, err);
            });

        } else {

            if(tries < 2) {
                client.log("an error occured while trying to log in", 0, "red");
                client.log("err: " + err.code, 1, "red");
                client.log("trying to reconnect...", 0);
                loginClient(client, ++tries);
            } else {
                client.log("couldn't log in.", 0, "red");
                client.emit(client.LOGIN_ERROR, "couldn't log in");
            }

        }
    });
}

function Plugged() {
    Plugged.super_.call(this);
    
    this.log = function() {};
    this.state = models.createState();
    this.query = new Query();
    this.cleanCacheInterval = -1;
    this.chatcachesize = 256;
    this.keepAliveTries = 0;
    this.keepAliveID = -1;
    this.offset = 0;
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

Plugged.prototype.USERSTATUS = {
    AVAILABLE:  1,
    AWAY:       2,
    WORKING:    3,
    GAMING:     4
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
Plugged.prototype.MOD_BAN = "modBan";
Plugged.prototype.ADVANCE = "advance";
Plugged.prototype.LEVEL_UP = "levelUp";
Plugged.prototype.MOD_SKIP = "modSkip";
Plugged.prototype.MOD_MUTE = "modMute";
Plugged.prototype.MOD_STAFF = "modStaff";
Plugged.prototype.USER_JOIN = "userJoin";
Plugged.prototype.FLOOD_API = "floodAPI";
Plugged.prototype.MOD_ADD_DJ = "modAddDJ";
Plugged.prototype.PLUG_ERROR = "plugError";
Plugged.prototype.USER_LEAVE = "userLeave";
Plugged.prototype.FLOOD_CHAT = "floodChat";
Plugged.prototype.MOD_MOVE_DJ = "modMoveDJ";
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
Plugged.prototype.DJ_LIST_LOCKED = "djListLocked";
Plugged.prototype.PLAYLIST_CYCLE = "playlistCycle";
Plugged.prototype.FRIEND_REQUEST = "friendRequest";
Plugged.prototype.WAITLIST_UPDATE = "djListUpdate";
Plugged.prototype.ROOM_NAME_UPDATE = "roomNameUpdate";
Plugged.prototype.MAINTENANCE_MODE = "plugMaintenance";
Plugged.prototype.ROOM_WELCOME_UPDATE = "roomWelcomeUpdate";
Plugged.prototype.ROOM_DESCRIPTION_UPDATE = "roomDescriptionUpdate";

Plugged.prototype._keepAlive = function() {
    if(this.keepAliveTries >= 6) {
        this.log("haven't received a keep alive message from host for more than 3 minutes, is it on fire?", 1, "red");
        this.emit(this.CONN_PART, this.getRoomMeta());
        clearInterval(this.keepAliveID);
        this.keepAliveID = -1;
    } else {
        this.keepAliveTries++;

        if(this.keepAliveTries > 1)
            this.emit(this.CONN_WARNING, this.keepAliveTries);
    }
};

Plugged.prototype._muteExpired = function(mute) {
    for(var i = this.state.room.mutes.length - 1; i >= 0; i--) {
        if(this.state.room.mutes[i].id == mute.id) {
            clearTimeout(this.state.room.mutes[i].interval);
            this.state.room.mutes.splice(i, 1);
            break;
        }
    }
};

Plugged.prototype.getAuthAndServerTime = function(data, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});

    // the endpoint is the same but the site's content has changed due
    // to the user being logged in.
    this.query.query("GET", endpoints["CSRF"], function _gotAuthToken(err, body) {
        if(!err) {
            var idx = body.indexOf("_jm=\"") + 5;
            var token;
            var time;

            token = body.substr(idx, body.indexOf("\"", idx) - idx);
            idx = body.indexOf("_st=\"") + 5;
            time = body.substr(idx, body.indexOf("\"", idx) - idx);

            time = Date.parse(time);

            // a valid token is always 128 characters in length
            if(token.length == 128 && !isNaN(time)) {
                this.log("auth token: " + token, 2, "yellow");
                this.log("time: " + time, 2, "yellow");
                this.offset = Date.now() - time;
                this.auth = token;

                callback(null, token, time);
            } else {
                callback(setErrorMessage(200, "couldn't fetch auth token or servertime"));
            }

        } else {
            callback(err);
        }
    }.bind(this));
};

/*================== WebSocket ==================*/
Plugged.prototype.connectSocket = function() {
    if(this.sock)
        return "sock is already open!";

    var self = this;
    this.sock = new WebSocket("wss://godj.plug.dj:443/socket");

    /*================= SOCK OPENED =================*/
    this.sock.on("open", function _sockOpen() {
        self.log("socket opened", 3, "magenta");
        self.emit(self.SOCK_OPEN, self);
        this.sendMessage("auth", self.auth, self.offset);
        self.keepAliveCheck.call(self);
    });

    /*================= SOCK CLOSED =================*/
    this.sock.on("close", function _sockClose() {
        self.log("sock closed", 3, "magenta");
        self.emit(self.SOCK_CLOSED, self);
    })

    /*================= SOCK ERROR ==================*/
    this.sock.on("error", function _sockError(err) {
        self.log("sock error!", 3, "magenta");
        self.log(err, 3, "red");
        self.emit(self.SOCK_ERROR, self, err);
    });

    /*================= SOCK MESSAGE =================*/
    this.sock.on("message", function _receivedMessage(msg) {
        if(typeof msg !== "string")
            return;

        if(msg.charAt(0) === 'h')
            self.keepAliveCheck.call(self);
        else
            self.wsaprocessor(self, msg);
    });
};

Plugged.prototype.clearMutes = function() {
    for(var i = 0, l = this.state.room.mutes.length; i < l; i++)
        clearTimeout(this.state.room.mutes[i].interval);

    this.state.room.mutes = [];
};

Plugged.prototype.clearMute = function(id) {
    for(var i = 0, l = this.state.room.mutes.length; i < l; i++) {
        if(this.state.room.mutes[i].id == id) {
            clearTimeout(this.state.room.mutes[i].interval);
            this.state.room.mutes.splice(i, 1);
            break;
        }
    }
};

Plugged.prototype.clearUserCache = function() {
    this.state.usercache = [];
};

Plugged.prototype.cleanUserCache = function() {
    for(var i = this.state.usercache.length - 1; i >= 0; i--) {
        if(Date.now() - this.state.usercache[i].timestamp > 5*60*1000)
            this.state.usercache.splice(i, 1);
    }
};

Plugged.prototype.getChatByUser = function(username) {
    var messages = [];

    for(var i = this.state.chatcache.length - 1; i >= 0; i--) {
        if(this.state.chatcache[i].username === username)
            messages.push(this.state.chatcache[i]);
    }

    return messages;
};

Plugged.prototype.getChat = function() {
    return this.state.chatcache;
};

Plugged.prototype.removeChatByUser = function(username, cacheOnly) {
    cacheOnly = cacheOnly || false;

    for(var i = this.state.chatcache.length - 1; i >= 0; i--) {
        if(this.state.chatcache[i].username === username) {
            if(!cacheOnly)
                this.deleteMessage(this.state.chatcache[i].cid);

            this.state.chatcache.splice(i, 1);
        }
    } 
};

/*TODO: experimental*/
Plugged.prototype.removeChatByBody = function(messages, cacheOnly) {
    cacheOnly = cacheOnly || false;

    //wrap it into an array so we can streamline the code instead of branching it and
    //creating needless redundancy
    if(!Array.isArray(messages))
        messages = [messages];

    if(typeof messages.length <= 0)
        return;

    for(var i = this.state.chatcache.length - 1; i >= 0; i--) {
        if(messages.length <= 0)
            break;

        for(var l = messages.length - 1; 0 <= l; l--) {
            if(typeof messages[l] === "string" && typeof this.state.chatcache[i] !== "undefined" &&
                this.state.self.username === this.state.chatcache[i].username &&
                this.state.chatcache[i].message === messages[l]) {
                
                if(!cacheOnly)
                    this.deleteMessage(this.state.chatcache[i].cid);

                this.state.chatcache.splice(i, 1);
                messages.splice(l, 1);
                break;
            }
        }
    }
};

Plugged.prototype.removeChat = function(cid, cacheOnly) {
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

Plugged.prototype.clearChatCache = function() {
    this.state.chatcache = [];
};

Plugged.prototype.flushQuery = function() {
    this.query.flushQueue();
};

// keeps the usercache clean by deleting invalidate objects
// objects invalidate by staying in cache for more than 5 minutes
Plugged.prototype.watchUserCache = function(enabled) {
    clearInterval(this.cleanCacheInterval);

    if(enabled)
        this.cleanCacheInterval = setInterval(this.cleanUserCache.bind(this), 5*60*1000);
    else
        this.cleanCacheInterval = -1;
};

Plugged.prototype.cacheChat = function(enabled) {
    this.ccache = enabled;
};

Plugged.prototype.setChatCacheSize = function(size) {
    if(typeof size === "number")
        return this.chatcachesize = size;
    else
        return this.chatcachesize;
};

Plugged.prototype.cacheUserOnLeave = function(enabled) {
    this.sleave = enabled;
};

Plugged.prototype.clearUserFromLists = function(id) {
    for(var i = 0, l = this.state.room.votes; i < l; i++) {
        if(this.state.room.votes[i].id === id) {
            this.state.room.votes.splice(i, 1);
            break;
        }
    }

    for(var i = 0, l = this.state.room.grabs; i < l; i++) {
        if(this.state.room.grabs[i] === id) {
            this.state.room.grabs.splice(i, 1);
            break;
        }
    }
};

Plugged.prototype.checkForPreviousVote = function(vote) {
    for(var i = 0, l = this.state.room.votes.length; i < l; i++) {
        if(this.state.room.votes[i].id == vote.id) {
            //only return true if vote direction hasn't changed
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

// WebSocket action processor
Plugged.prototype.wsaprocessor = function(self, msg) {
    var data = JSON.parse(msg)[0];
    
    switch(data.a) {
        case self.ACK:
            self.emit((data.p === "1" ? self.CONN_SUCCESS : self.CONN_ERROR), data.p);
            break;

        case self.ADVANCE:
            var previous = {
                // standard plug.dj ADVANCE event properties
                media: self.getCurrentMedia(),
                dj: self.getCurrentDJ(),
                score: {
                    positive: 0,
                    negative: 0,
                    grabs: self.getGrabs().length,
                    listeners: self.getUsers().length
                },
                // goodies
                historyID: self.getPlayback().historyID,
                playlistID: self.getPlayback().playlistID,
                startTime: self.getStartTime()
            };

            var votesMap = self.getVotes().reduce(function (votesMap, vote) {
                votesMap[vote.id] = vote.direction;
                return votesMap;
            }, {});
            for (var uid in votesMap) {
                if (votesMap[uid] === 1) previous.positive++;
                if (votesMap[uid] === -1) previous.negative++;
            }

            self.state.room.booth.dj = data.p.c;
            self.state.room.booth.waitlist = data.p.d;
            self.state.self.vote = 0;
            self.state.room.grabs = [];
            self.state.room.votes = [];

            self.state.room.playback.media = models.parseMedia(data.p.m);
            self.state.room.playback.historyID = data.p.h;
            self.state.room.playback.playlistID = data.p.p;
            self.state.room.playback.startTime = data.p.t;

            self.emit(self.ADVANCE, self.state.room.booth, self.state.room.playback, previous);
            break;

        case self.CHAT:
            var chat = models.parseChat(data.p);

            if(self.ccache) {
                self.state.chatcache.push(chat);

                if(self.state.chatcache.length > self.chatcachesize)
                    self.state.chatcache.shift();
            }

            if(chat.message.indexOf('@' + self.state.self.username) > -1)
                self.emit(self.CHAT_MENTION, chat);
            else if(chat.message.charAt(0) == '/')
                self.emit(self.CHAT_COMMAND, chat);
        
            self.emit(self.CHAT, chat);
            break;

        case self.CHAT_DELETE:
            var chat = models.parseChatDelete(data.p);

            if(self.ccache)
                self.removeChat(chat.cid);

            self.emit(self.CHAT_DELETE, chat);
            break;

        case self.PLAYLIST_CYCLE:
            self.emit(self.PLAYLIST_CYCLE, data.p);
            break;

        case self.DJ_LIST_CYCLE:
            self.state.room.booth.shouldCycle = data.p.f;
            self.emit(self.DJ_LIST_CYCLE, models.parseCycle(data.p));
            break;

        case self.DJ_LIST_LOCKED:
            self.state.room.booth.isLocked = data.p.f;
            self.emit(self.DJ_LIST_LOCKED, models.parseLock(data.p));
            break;

        case self.WAITLIST_UPDATE:
            self.emit(self.WAITLIST_UPDATE, self.state.room.booth.waitlist, data.p);
            self.state.room.booth.waitlist = data.p;
            break;

        case self.EARN:
            self.state.self.xp = data.p.xp;
            self.state.self.ep = data.p.ep;
            self.emit(self.EARN, models.parseXP(data.p));
            break;

        case self.LEVEL_UP:
            self.state.self.level++;
            self.emit(self.LEVEL_UP, data.p);
            break;

        case self.GRAB:

            for(var i = 0, l = self.state.room.grabs.length; i < l; i++) {
                if(self.state.room.grabs[i] == data.p)
                    return;
            }

            self.state.room.grabs.push(data.p);
            self.emit(self.GRAB_UPDATE, data.p);
            break;

        case self.MOD_BAN:
            self.clearUserFromLists(data.p.i);
            self.state.room.meta.population--;
            self.emit(self.MOD_BAN, models.parseModBan(data.p));
            break;

        case self.MOD_MOVE_DJ:
            self.emit(self.MOD_MOVE_DJ, models.parseModMove(data.p));
            break;

        case self.MOD_REMOVE_DJ:
            self.emit(self.MOD_REMOVE_DJ, models.parseModRemove(data.p));
            break;

        case self.MOD_ADD_DJ:
            self.emit(self.MOD_ADD_DJ, models.parseModAddDJ(data.p));
            break;

        case self.MOD_MUTE:
            var mute = models.parseMute(data.p);
            var time = (mute.duration === self.MUTEDURATION.SHORT ? 
                15*60*1000 : mute.duration === self.MUTEDURATION.MEDIUM ? 
                30*60*1000 : mute.duration === self.MUTEDURATION.LONG ? 
                45*60*1000 : 15*60*1000);

            if(mute.duration === self.MUTEDURATION.NONE)
                self.clearMute(mute.id);
            else
                self.state.room.mutes.push({id: mute.id, time: mute.duration, interval: setTimeout(self._muteExpired, time, mute) });
        
            self.emit(self.MOD_MUTE, mute);
            break;

        case self.MOD_STAFF:
            var promotion = models.parsePromotion(data.p);

            if(self.state.self.id == promotion.id)
                self.state.self.role = promotion.role;

            for(var i = self.state.room.users.length - 1; i >= 0; i--) {
                if(self.state.room.users[i].id == promotion.id) {
                    self.state.room.users[i].role = promotion.role;

                    if(self.removeCachedUserByID(self.state.room.users[i].id))
                        self.cacheUser(self.state.room.users[i]);

                    break;
                }
            }

            self.emit(self.MOD_STAFF, promotion);
            break;

        case self.MOD_SKIP:
            self.emit(self.MOD_SKIP, data.p);
            break;

        case self.SKIP:
            self.emit(self.SKIP, data.p);
            break;

        case self.ROOM_NAME_UPDATE:
            self.state.room.meta.name = data.p.n;
            self.emit(self.ROOM_NAME_UPDATE, models.parseRoomNameUpdate(data.p));
            break;

        case self.ROOM_DESCRIPTION_UPDATE:
            self.state.room.meta.description = data.p.d;
            self.emit(self.ROOM_DESCRIPTION_UPDATE, models.parseRoomDescriptionUpdate(data.p));
            break;

        case self.ROOM_WELCOME_UPDATE:
            self.state.room.meta.welcome = data.p.w;
            self.emit(self.ROOM_WELCOME_UPDATE, models.parseRoomWelcomeUpdate(data.p));
            break;

        case self.USER_LEAVE:
            var user = undefined;
            self.state.room.meta.population--;

            for(var i = self.state.room.users.length - 1; i >= 0; i--) {
                if(self.state.room.users[i].id == data.p) {
                    self.clearUserFromLists(data.p);
                    user = self.state.room.users.splice(i, 1)[0];

                    if(self.sleave)
                        self.cacheUser(user);

                    break;
                }
            }

            self.emit(self.USER_LEAVE, user);
            break;

        case self.USER_JOIN:
            var user = models.parseUser(data.p)
            self.state.room.users.push(user);
            self.state.room.meta.population++;

            self.removeCachedUserByID(user.id);

            if(self.isFriend(user.id))
                self.emit(self.FRIEND_JOIN, user);
            else
                self.emit(self.USER_JOIN, user);
            break;

        case self.USER_UPDATE:
            self.emit(self.USER_UPDATE, models.parseUserUpdate(data.p));
            break;

        case self.FRIEND_REQUEST:
            var user = self.getUserByName(data.p);
            self.emit(self.FRIEND_REQUEST, user ? user : data.p);
            break;

        case self.VOTE:
            var vote = models.pushVote(data.p);
            if(!self.checkForPreviousVote(vote))
                self.emit(self.VOTE, vote);
            break;

        case self.CHAT_RATE_LIMIT:
            self.emit(self.CHAT_RATE_LIMIT);
            break;

        case self.FLOOD_API:
            self.emit(self.FLOOD_API);
            break;

        case self.FLOOD_CHAT:
            self.emit(self.FLOOD_CHAT);
            break;

        case self.KILL_SESSION:
            self.emit(self.KILL_SESSION, data.p);
            break;

        case self.PLUG_UPDATE:
            self.emit(self.PLUG_UPDATE);
            break;

        case self.PLUG_MESSAGE:
            self.emit(self.PLUG_MESSAGE, data.p);
            break;

        case self.MAINTENANCE_MODE:
            self.emit(self.MAINTENANCE_MODE);
            break;

        case self.BAN_IP:
            self.emit(self.BAN_IP);
            break;

        case self.BAN:
            self.emit(self.BAN, models.parseBan(data.p));
            break;

        case self.NAME_CHANGED:
            self.emit(self.NAME_CHANGED);
            break;

        default:
            self.log("unknown action: " + data.a, 1, "white");
            break;
    }
};

Plugged.prototype.keepAliveCheck = function() {
    this.keepAliveTries = 0;

    if(this.keepAliveID < 0)
        this.keepAliveID = setInterval(this._keepAlive.bind(this), 30*1000);
};

Plugged.prototype.sendChat = function(message, deleteTimeout) {
    deleteTimeout = deleteTimeout || -1;

    if(typeof message !== "string")
        message = message.toString();

    if(message.indexOf('"') >= 0)
        message = message.replace(/"/g, "'");

    if(message.length <= 255) {
        this.sock.sendMessage("chat", message, this.offset);

        if(deleteTimeout > 0)
            setTimeout(this.removeChatByBody.bind(this), deleteTimeout, message);

    } else {
        var splits = Math.floor(message.length / 255);

        var _multiMessageFunc = function(self, msg, splits, currentSplit, msgArray) {
            var hsplit = msg.slice(currentSplit*255, (currentSplit+1)*255);

            msgArray.push(hsplit);
            self.sock.sendMessage("chat", hsplit);

            if(currentSplit < splits) {
                setTimeout(_multiMessageFunc, 600, self, msg, splits, ++currentSplit, msgArray);
            } else {
                if(deleteTimeout > 0)
                    setTimeout(self.removeChatByBody.bind(self), deleteTimeout, msgArray);
            }
        };

        _multiMessageFunc(this, message, splits, 0, []);
    }
};

Plugged.prototype.invokeLogger = function(logfunc) {
    logfunc = logfunc || function(msg, verbosity) { if(verbosity <= 1) console.log(msg); };
    this.log = logfunc;
};

Plugged.prototype.login = function(credentials) {
    if(typeof credentials !== "object")
        throw new Error("credentials has to be of type object");

    if(!credentials.hasOwnProperty("email") || !credentials.hasOwnProperty("password"))
        throw new Error("property email or password are not defined");

    this.credentials = credentials;

    this.log("logging in with account: " + credentials.email, 2, "yellow");

    // 0 indicating the amount of tries
    loginClient(this, 0);
};

Plugged.prototype.connect = function(room) {
    if(!room)
        throw new Error("room has to be defined");

    var self = this;

    this.joinRoom(room, function _joinedRoom(err) {
        if(!err) {
            self.watchUserCache(true);
            self.clearUserCache();
            self.clearChatCache();
            self.clearMutes();

            self.getRoomStats(function(err, stats) {

                if(!err)
                    self.state.room = models.parseRoom(stats);

                self.emit(self.JOINED_ROOM, err);
            });

        } else {
            self.emit(self.PLUG_ERROR, err.message);
        }
    });
};

/*================ ROOM CALLS ================*/

Plugged.prototype.getCurrentRoomStats = function() {
    return this.state.room;
};

Plugged.prototype.getUserByID = function(id, checkCache) {
    checkCache = checkCache || false;

    if(id == this.state.self.id)
        return this.state.self;

    for(var i = 0, l = this.state.room.users.length; i < l; i++) {
        if(this.state.room.users[i].id == id)
            return this.state.room.users[i];
    }

    for(var i = 0, l = this.state.usercache.length; checkCache && i < l; i++) {
        if(this.state.usercache[i].id == id)
            return this.state.usercache[i];
    }

    return undefined;
};

Plugged.prototype.getUserByName = function(username, checkCache) {
    checkCache = checkCache || false;

    if(username === this.state.self.username)
        return this.state.self;
    
    for(var i = 0, l = this.state.room.users.length; i < l; i++) {
        if(this.state.room.users[i].username === username)
            return this.state.room.users[i];
    }

    for(var i = 0, l = this.state.usercache.length; checkCache && i < l; i++) {
        if(this.state.usercache[i].username === username)
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

Plugged.prototype.isFriend = function(userID) {
    for(var i = 0, l = this.state.self.friends.length; i < l; i++) {
        if(this.state.self.friends[i] == userID)
            return true;
    }

    return false;
};

Plugged.prototype.getCurrentDJ = function() {
    return this.getUserByID(this.state.room.booth.dj);
};

Plugged.prototype.getCurrentMedia = function() {
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

Plugged.prototype.getRoomMeta = function() {
    return this.state.room.meta;
};

Plugged.prototype.getFX = function() {
    return this.state.room.fx;
};

Plugged.prototype.checkGlobalRole = function(gRole) {
    return (gRole === 5 ?
                        this.GLOBALROLE.ADMIN
                        :
                        (gRole > 0 && gRole < 5 ?
                                     this.GLOBALROLE.BRAND_AMBASSADOR
                                     :
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

Plugged.prototype.isFavorite = function() {
    return this.state.room.meta.favorite;
};

Plugged.prototype.getRoomName = function() {
    return this.state.room.meta.name;
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
    if(typeof user === "object")
        this.state.usercache.push({ user: user, timestamp: Date.now() });
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
    for(var i = 0, l = this.state.usercache.length; i < l; i++) {
        if(this.state.usercache[i].user.username === username) {
            this.state.usercache.splice(i, 1);
            break;
        }
    }
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
    if(typeof callback !== "function")
        return;

    var self = this;

    this.getStaff(function(err, staff) {
        if(!err) {
            var filteredStaff = [];

            for(var i = 0, l = staff.length; i < l; i++) {
                if(staff[i].role == role)
                    filteredStaff.push(models.parseUser(staff[i]));
            }

            callback.call(self, null, filteredStaff);
        } else {
            callback.call(self, err);
        }
    });
};

Plugged.prototype.getNews = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["NEWS"], callback);
};

Plugged.prototype.getAuthToken = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["TOKEN"], callback);
};

Plugged.prototype.getRoomStats = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["ROOMSTATS"], callback, true);
};

Plugged.prototype.findRooms = function(name, limit, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : 
        typeof page === "function" ? page : 
        typeof limit === "function" ? limit : undefined);

    if(typeof page !== "Number")
        page = 0;

    if(typeof limit !== "Number")
        limit = 100;

    this.query.query("GET", [endpoints["ROOMS"], "?q=", name, "&page=", page, "&limit=", limit].join(''), callback);
};

Plugged.prototype.getRooms = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["ROOMS"] + "?q=&page=0&limit=100", callback);
};

Plugged.prototype.getStaff = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["STAFF"], callback);
};

Plugged.prototype.getUser = function(id, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["USERSTATS"] + '/' + id, callback, true);
};

Plugged.prototype.getRoomHistory = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["HISTORY"], callback);
};

Plugged.prototype.validateRoomName = function(name, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["VALIDATEROOM"] + name, callback, true);
};

Plugged.prototype.getMutes = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["MUTES"], callback);
};

// here's some work needed to set the data properly
Plugged.prototype.setLock = function(lock, removeAllDJs, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["LOCK"], { 
        isLocked: lock, 
        removeAllDJs: removeAllDJs 
    }, callback);
};

Plugged.prototype.setCycle = function(shouldCycle, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["CYCLE"], { shouldCycle: shouldCycle }, callback);
};

Plugged.prototype.setLogin = function(csrf, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["LOGIN"], {
        "csrf": csrf,
        "email": this.credentials.email,
        "password": this.credentials.password
    }, callback);
};

Plugged.prototype.joinRoom = function(slug, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["JOINROOM"], { slug: slug }, callback);
};

Plugged.prototype.joinWaitlist = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["JOINBOOTH"], callback);
};

Plugged.prototype.addToWaitlist = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["ADDBOOTH"], { id: userID }, callback);
};

Plugged.prototype.grab = function(playlistID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);

    for(var i = 0, l = self.state.room.grabs.length; i < l; i++) {
        if(self.state.room.grabs[i] == self.state.self.id)
            return -1;
    }

    this.query.query("POST", endpoints["GRABS"], {
        playlistID: playlistID,
        historyID: this.state.room.playback.historyID
    }, callback, true);

    return 0;
};

Plugged.prototype.skipDJ = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});

    //fallback in case that plug failed at assigning a valid history ID
    if(!this.state.room.playback.historyID) {
        this.removeDJ(userID, function(err) {
            if(!err)
                this.addToWaitlist(userID, callback);
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

Plugged.prototype.moveDJ = function(userID, position, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["MOVEBOOTH"], {
        userID: userID,
        position: position
    }, callback);
};

Plugged.prototype.createRoom = function(name, private, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["CREATEROOM"], { 
        name: name, 
        private: private 
    }, callback, true);
};

Plugged.prototype.updateRoomInfo = function(name, description, welcome, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["UPDATEROOM"], { 
        name: name, 
        description: description, 
        welcome: welcome 
    }, callback);
};

Plugged.prototype.banUser = function(userID, time, reason, callback) {
    if(typeof reason === "function") {
        callback = reason;
        reason = 1;
    }

    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["BANS"] + "/add", { 
        userID: userID, 
        reason: 1,
        duration: time
    }, callback);
};

Plugged.prototype.muteUser = function(userID, time, reason, callback) {
    if(typeof reason === "function") {
        callback = reason;
        reason = 1;
    }

    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["MUTES"], { 
        userID: userID, 
        reason: reason || 1,
        duration: time
    }, callback);
};

Plugged.prototype.addStaff = function(userID, role, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["STAFF"] + "/update", { 
        userID: userID, 
        roleID: role 
    }, callback, true);
};

Plugged.prototype.ignoreUser = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("POST", endpoints["IGNORES"], { id: userID }, function(err, data) {
        if(!err && data) {

            if(data.id && data.username) {
                this.state.self.ignores.push({
                    id: data.id,
                    username: data.username
                });
            }

        }
        callback(err);
    }.bind(this), true);
};

Plugged.prototype.deletePlaylist = function(playlistID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("DELETE", endpoints["PLAYLISTS"] + '/' + playlistID, callback);
};

Plugged.prototype.removeIgnore = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("DELETE", endpoints["IGNORES"] + '/' + userID, function(err, data) {
        if(!err && data) {
            for(var i = 0, l = this.state.self.ignores.length; i < l; i++) {
                if(this.state.self.ignores[i].id == userID) {
                    this.state.self.ignores.splice(i, 1);
                    break;
                }
            }
        }

        callback(err, data);
    }.bind(this), true);
};

Plugged.prototype.removeStaff = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["STAFF"] + '/' + userID, callback);
};

Plugged.prototype.removeDJ = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["REMOVEBOOTH"] + '/' + userID, callback);
};

Plugged.prototype.leaveWaitlist = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["JOINBOOTH"], callback);
};

Plugged.prototype.unbanUser = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["BANS"] + '/' + userID, callback);
};

Plugged.prototype.unmuteUser = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["MUTES"] + '/' + userID, callback);
};

Plugged.prototype.deleteMessage = function(chatID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["CHAT"] + chatID, callback);
};

Plugged.prototype.logout = function() {
    this.query.query("DELETE", endpoints["SESSION"], function _loggedOut(err, body) {
        if(!err) {
            this.watchUserCache(false);
            this.clearMutes();
            this.clearUserCache();
            this.clearChatCache();
            this.flushQuery();
            clearTimeout(this.keepAliveID);

            this.sock.close();
            this.sock.removeAllListeners();

            this.log("Logged out.", 1, "green");

            this.sock = null;
            this.auth = null;
            this.offset = 0;
            this.keepAliveTries = 0;
            this.keepAliveID = -1;

            this.emit(this.LOGOUT_SUCCESS);
        } else {
            this.emit(this.LOGOUT_ERROR, err);
        }
    }.bind(this));
};

/*================ USER CALLS ================*/

Plugged.prototype.requestSelf = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function () {});
    var self = this;
    this.query.query("GET", endpoints["USERSTATS"] + "me", function _requestedSelf(err, data) {
        if(!err && data) {
            self.state.self = models.parseSelf(data);

            self.getFriends(function(err, data) {
                if(!err && data) {
                    for(var i = 0, l = data.length; i < l; i++)
                        self.state.self.friends.push(data[i].id);
                }

                callback(err, data);
            };
        } else {
            callback(err);
        }
    }, true);
};

Plugged.prototype.getMyHistory = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["USERHISTORY"], callback);
};

Plugged.prototype.getFriends = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["FRIENDS"], callback);
};

Plugged.prototype.getFriendRequests = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["INVITES"], callback);
};

Plugged.prototype.searchMediaPlaylist = function(playlistID, query, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", [endpoints["PLAYLISTS"], '/', playlistID, "/media"].join(''), function(err, data) {
        if(!err && data) {
            var result = [];
            query = encodeURIComponent(query);
            query = query.replace(/%20/, '|');
            var regex = new RegExp('(' + query + ')', 'i');

            for(var i = 0, l = data.length; i < l; i++) {
                if(data[i].title && data[i].title.match(regex) || data[i].author && data[i].author.match(regex))
                    result.push(data[i]);
            }

            callback(err, result);
        } else {
            callback(err);
        }
    });
};

Plugged.prototype.getPlaylist = function(playlistID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", [endpoints["PLAYLISTS"], '/', playlistID, "/media"].join(''), callback, true);
};

Plugged.prototype.getPlaylists = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["PLAYLISTS"], callback);
};

Plugged.prototype.getHistory = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["USERHISTORY"], callback);
};

Plugged.prototype.getIgnores = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["IGNORES"], callback);
};

Plugged.prototype.getFavoriteRooms = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["FAVORITEROOM"], function(err, data) {
        if(!err) {
            var results = [];

            for(var i = 0, l = data.length; i < l; i++)
                results.push(models.parseExtendedRoom(data[i]));

            callback(err, results);
        } else {
            callback(err);
        }
    });
};

Plugged.prototype.getCSRF = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});

    this.query.query("GET", endpoints["CSRF"], function _gotCSRF(err, body) {
        if(!err) {
            var idx = body.indexOf("_csrf") + 9;

            body = body.substr(idx, body.indexOf('\"', idx) - idx);

            if(body.length == 60) {
                this.log("CSRF token: " + body, 2, "yellow");
                callback(null, body);
            } else {
                callback(setErrorMessage(200, "CSRF token was not found"));
            }

        } else {
            callback(err);
        }
    }.bind(this));
};

Plugged.prototype.setProfileMessage = function(message, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("PUT", endpoints["BLURB"], { blurb: message }, function(err) {
        if(!err)
            this.state.self.blurb = message;

        callback(err);
    }.bind(this), true);
};

Plugged.prototype.setAvatar = function(avatarID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("PUT", endpoints["AVATAR"], { id: avatarID }, function(err) {
        if(!err)
            this.state.self.avatarID = avatarID;

        callback(err);
    }.bind(this), true);
};

Plugged.prototype.setStatus = function(status, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("PUT", endpoints["STATUS"], { status: status }, function(err) {
        if(!err)
            this.state.self.status = status;

        callback(err);
    }.bind(this));
};

Plugged.prototype.setLanguage = function(language, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["LANGUAGE"], { language: language }, callback);
};

Plugged.prototype.rejectFriendRequest = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["IGNOREFRIEND"], { id: userID }, callback);
};

Plugged.prototype.activatePlaylist = function(playlistID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["PLAYLISTS"] + '/' + playlistID + "/activate", callback, true);
};

Plugged.prototype.moveMedia = function(playlistID, mediaArray, beforeID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT", 
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/move", 
        { ids: mediaArray, beforeID: beforeID }, callback);
};

Plugged.prototype.updateMedia = function(playlistID, mediaID, author, title, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/update",
        { id: mediaID, author: author, title: title }, callback);
};

Plugged.prototype.shufflePlaylist = function(playlistID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("PUT", endpoints["PLAYLISTS"] + '/' + playlistID + "/shuffle", callback);
};

Plugged.prototype.addFriend = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("POST", endpoints["FRIENDS"], { id: userID }, function(err, data) {
        if(!err)
            this.state.self.friends.push(userID);

        callback(err);
    }.bind(this));
};

Plugged.prototype.deleteMedia = function(playlistID, mediaIDs, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/delete",
        { ids: mediaIDs },
        callback);
};

Plugged.prototype.insertMedia = function(playlistID, mediaIDs, append, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST",
        endpoints["PLAYLISTS"] + '/' + playlistID + "/media/insert",
        { ids: mediaIDs, append: append },
        callback);
};

Plugged.prototype.woot = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.state.self.vote = 1;
    this.query.query("POST", endpoints["VOTES"], { 
        direction: 1, 
        historyID: this.state.room.playback.historyID 
    }, callback);
};

Plugged.prototype.meh = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.state.self.vote = -1;
    this.query.query("POST", endpoints["VOTES"], { 
        direction: -1,
        historyID: this.state.room.playback.historyID
    }, callback);
};

Plugged.prototype.favoriteRoom = function(roomID) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["FAVORITEROOM"], { id: roomID }, callback);
};

Plugged.prototype.deleteNotification = function(id, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("DELETE", endpoints["NOTIFICATION"] + id, callback);
};

Plugged.prototype.removeFriend = function(userID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : function() {});
    this.query.query("DELETE", endpoints["FRIENDS"] + '/' + userID, function(err, data) {
        if(!err) {
            for(var i = 0, l = this.state.self.friends.length; i < l; i++) {
                if(this.state.self.friends[i].id == userID) {
                    this.state.self.friends.splice(i, 1);
                    break;
                }
            }
        }

        callback(err);
    }.bind(this));
};

/*================ STORE CALLS ================*/

Plugged.prototype.getInventory = function(callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["INVENTORY"], callback);
};

Plugged.prototype.getProducts = function(category, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("GET", endpoints["PRODUCTS"] + "/avatars/" + category, callback);
};

Plugged.prototype.purchaseItem = function(itemID, callback) {
    callback = (typeof callback !== "undefined" ? callback.bind(this) : undefined);
    this.query.query("POST", endpoints["PURCHASE"], { id: itemID }, callback);
};

module.exports = Plugged;
