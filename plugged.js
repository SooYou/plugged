const EventEmitter = require("events").EventEmitter;
const WebSocket = require("ws");
const util = require("util");

const config = require("./conf/config");
const mapper = require("./mapper");
const Query = require("./query");
const utils = require("./utils");

const baseURL = config.provider;

const endpoints = {
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

const CHAT_TIMEOUT_INC = 70;
const CHAT_TIMEOUT_MAX = 700;

class Plugged extends EventEmitter {
    /**
     * @param {object=} options multiple parameters can be set up at
     * construction, see Options in docs.
     */
    constructor(options = {}) {
        super();

        if (options.test)
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

        this.BANREASON = {
            VIOLATING_COMMUNITY_RULES:  1,
            VERBAL_ABUSE:               2,
            SPAMMING:                   3,
            OFFENSIVE_LANGUAGE:         4,
            NEGATIVE_ATTITUDE:          5
        };

        this.BANDURATION = {
            HOUR:   'h',
            DAY:    'd',
            PERMA:  'f'
        };

        this.MUTEDURATION = {
            NONE:   'o',
            SHORT:  's',
            MEDIUM: 'm',
            LONG:   'l'
        };

        this.USERROLE = {
            NONE:       0,
            RESIDENTDJ: 1,
            BOUNCER:    2,
            MANAGER:    3,
            COHOST:     4,
            HOST:       5
        };

        this.GLOBALROLE = {
            NONE:               0,
            BRAND_AMBASSADOR:   3,
            ADMIN:              5
        };

        this.CACHE = {
            DISABLE:    0,
            ENABLE:     1,
            ONLY:       2
        };

        /*===== GENERAL EVENTS =====*/
        /* LOGIN BASED EVENTS */
        this.LOGIN_ERROR = "loginError";
        this.LOGIN_SUCCESS = "loginSuccess";

        this.LOGOUT_ERROR = "logoutError";
        this.LOGOUT_SUCCESS = "logoutSuccess";

        /* SOCKET RELATED */
        this.CONN_PART = "connPart";
        this.CONN_ERROR = "connError";
        this.CONN_WARNING = "connWarning";
        this.CONN_SUCCESS = "connSuccess";

        /* CORE SOCKET EVENTS */
        this.SOCK_OPEN = "sockOpen";
        this.SOCK_ERROR = "sockError";
        this.SOCK_CLOSED = "sockClosed";

        /*===== PLUG EVENTS =====*/
        this.BAN = "ban";
        this.ACK = "ack";
        this.CHAT = "chat";
        this.VOTE = "vote";
        this.GRAB = "grab";
        this.EARN = "earn";
        this.SKIP = "skip";
        this.BAN_IP = "banIP";
        this.NOTIFY = "notify";
        this.GIFTED = "gifted";
        this.MOD_BAN = "modBan";
        this.ADVANCE = "advance";
        this.LEVEL_UP = "levelUp";
        this.MOD_SKIP = "modSkip";
        this.MOD_MUTE = "modMute";
        this.MOD_STAFF = "modStaff";
        this.USER_JOIN = "userJoin";
        this.FLOOD_API = "floodAPI";
        this.MOD_ADD_DJ = "modAddDJ";
        this.GUEST_JOIN = "guestJoin";
        this.PLUG_ERROR = "plugError";
        this.USER_LEAVE = "userLeave";
        this.FLOOD_CHAT = "floodChat";
        this.MOD_MOVE_DJ = "modMoveDJ";
        this.GUEST_LEAVE = "guestLeave";
        this.JOINED_ROOM = "joinedRoom";
        this.USER_UPDATE = "userUpdate";
        this.CHAT_DELETE = "chatDelete";
        this.FRIEND_JOIN = "friendJoin";
        this.PLUG_UPDATE = "plugUpdate";
        this.CHAT_MENTION = "chatMention";
        this.KILL_SESSION = "killSession";
        this.NAME_CHANGED = "nameChanged";
        this.PLUG_MESSAGE = "plugMessage";
        this.CHAT_COMMAND = "chatCommand";
        this.CHAT_RATE_LIMIT = "rateLimit";
        this.DJ_LIST_CYCLE = "djListCycle";
        this.MOD_REMOVE_DJ = "modRemoveDJ";
        this.FRIEND_ACCEPT = "friendAccept";
        this.DJ_LIST_LOCKED = "djListLocked";
        this.PLAYLIST_CYCLE = "playlistCycle";
        this.FRIEND_REQUEST = "friendRequest";
        this.WAITLIST_UPDATE = "djListUpdate";
        this.ROOM_NAME_UPDATE = "roomNameUpdate";
        this.MAINTENANCE_MODE = "plugMaintenance";
        this.ROOM_WELCOME_UPDATE = "roomWelcomeUpdate";
        this.MAINTENANCE_MODE_ALERT = "plugMaintenanceAlert";
        this.ROOM_DESCRIPTION_UPDATE = "roomDescriptionUpdate";
        this.ROOM_MIN_CHAT_LEVEL_UPDATE = "roomMinChatLevelUpdate";
    }

    /**
     * @description sends a message to the WebSocket
     * @param {string} type message type
     * @param {string|number} data string of JSON encoded data
     * @returns {boolean} false when a message is malformed, for further information read the log
     */
    _sendMessage(type, data) {
        if (!this.sock || this.sock.readyState !== WebSocket.OPEN) {
            this._log("socket is not opened!", 1, "red");
        } else {
            if (typeof type === "string" && (typeof data === "string" || typeof data === "number")) {
                this.sock.send(JSON.stringify({
                    a: type,
                    p: data,
                    t: Date.now()
                }));

                return true;
            } else {
                const err = [];

                if (typeof type === "undefined")
                    err.push("message type definition is undefined");
                else if (typeof type !== "string")
                    err.push("message type definition is not of type string");

                if (typeof data === "undefined")
                    err.push("no data was defined");
                else if (!(typeof data === "string") || !(typeof data === "string"))
                    err.push("data was not of type string or number");

                this._log("couldn't send message. " + err.join(err.length > 1 ? ", " : ''));
            }
        }

        return false;
    }

    /**
     * @description check function that gets called every 30 seconds to see if the connection to the server is still alive
     * if it detects that the server hasn't responded for a while it will fire a CONN_WARNING
     * This will happen 5 times before the CONN_PART event will be fired
     */
    _keepAlive() {
        // TODO: make the amount of tries before the connection will be identified as dead customizable
        if (this.keepAliveTries >= 6) {
            // TODO: change style of messages
            this._log("haven't received a keep alive message from host for more than 3 minutes, is it on fire?", 1, "red");
            // save meta information of the room since clearState erases all data
            const meta = this.getRoomMeta();
            this._clearState();
            this.emit(this.CONN_PART, meta);
        } else {
            this.keepAliveTries++;
            clearTimeout(this.keepAliveID);
            // TODO: make the alive timer customizable
            this.keepAliveID = setTimeout(this._keepAlive, 30*1000);

            if (this.keepAliveTries > 1)
                this.emit(this.CONN_WARNING, this.keepAliveTries * 30);
        }
    }

    /**
     * @description resets the keep alive counter
     */
    _keepAliveCheck() {
        // the hiccup counter gets set back to zero
        this.keepAliveTries = 0;
        clearTimeout(this.keepAliveID);
        // TODO: same as above, the time needs to be customizable
        this.keepAliveID = setTimeout(this._keepAlive, 30*1000);
    }

    // TODO: remove function
    _log(msg, verbosity, type) {
        if (typeof this.log === "object") {
            switch (type) {
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
        } else if (typeof this.log === "function") {
            this.log(msg, verbosity, type);
        }
    }

    /**
     * @description removes all expired users from cache
     */
    _cleanUserCache() {
        for (let i = this.state.usercache.length - 1; i >= 0; i--) {
            if (Date.now() - this.state.usercache[i].timestamp > 5*60*1000)
                this.state.usercache.splice(i, 1);
        }
    }

    /**
     * @description sends the queued chat messages to the server
     * @param {number=} lastMessage UNIX time stamp in ms when the last message was sent
     */
    _processChatQueue(lastMessage = 0) {
        if (this.chatQueue.length > 0) {
            if (lastMessage + this.chatTimeout <= Date.now()) {
                const msg = this.chatQueue.shift();
                if (!this._sendMessage("chat", msg.message)) {
                    this.chatQueue.unshift(msg);
                    this._log("message was put back into the queue", 1, "white");

                    return;
                } else {
                    if (msg.timeout >= 0) {
                        setTimeout(
                            this._removeChatMessageByDelay.bind(this),
                            msg.timeout,
                            msg.message
                        );
                    }

                    if (this.chatTimeout < CHAT_TIMEOUT_MAX)
                        this.chatTimeout += CHAT_TIMEOUT_INC;
                }
            }

            setTimeout(this._processChatQueue.bind(this), this.chatTimeout, Date.now());
        } else {
            this.chatTimeout = 0;
        }
    }

    /**
     * @description removes a chat message after a defined period of time
     * @param {string} message message to be send
     */
    _removeChatMessageByDelay(message) {
        if (typeof message !== "string") {
            this._log("message \"" + message + "\" is not of type string", 2, "red");

            return;
        }

        for (let i = this.state.chatcache.length - 1; i >= 0; i--) {
            if (this.state.chatcache[i].username !== this.state.self.username)
                continue;

            if (this.state.chatcache[i].message === message) {
                this.removeChatMessage(this.state.chatcache[i].cid);
                break;
            }
        }
    }

    /**
     * @description checks the vote list for a Users ID
     * @param {object} vote see Models#Vote
     * @returns {boolean} false when vote has changed or is new vote
     */
    _checkForPreviousVote(vote) {
        for (let i = this.state.room.votes.length - 1; i >= 0; i--) {
            if (this.state.room.votes[i].id == vote.id) {
                // only return true if vote direction hasn't changed
                if (this.state.room.votes[i].direction !== vote.direction) {
                    this.state.room.votes[i].direction = vote.direction;

                    return false;
                } else {
                    return true;
                }
            }
        }

        this.state.room.votes.push(vote);
        return false;
    }

    /**
     * @description clears all state related data to the default and closes the socket connection
     */
    _clearState() {
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
    }

    /**
     * @description gets the auth token from plug
     * @param {object} data placeholder
     * @param {function} callback function to be called on retrieval
     */
    _getAuthToken(data, callback) {
        this._log("getting auth token...", 1, "white");
        this.getAuthToken(function(err, token) {
            if (!err)
                this.auth = token;

            callback && callback(err, token);
        });
    }

    /**
     * @description sets up the websocket and basic data
     */
    _loggedIn() {
        this._connectSocket();
        this._log("logged in", 1, "green");
        this.requestSelf(function _requestSelfLogin(err, self) {
            if (!err)
                this.emit(this.LOGIN_SUCCESS, self);
            else
                this.emit(this.LOGIN_ERROR, err);
        });
    }

    /**
     * @description login with the credentials and csrf token given
     * @param {number=} tries number of login tries
     */
    _login(tries = 0) {
        utils.waterfall([
            this.getCSRF,
            this.setLogin,
            this._getAuthToken
        ], function _callback(err) {
            if (!err) {
                this._loggedIn();
            } else {
                this._log(
                    err && err.hasOwnProperty("message") ?
                    err.message :
                    "An unrecorded error occured while trying to log in",
                    0, "red"
                );

                if (this.retryLogin && tries <= 2) {
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
    }

    /**
     * @description initializes the socket connection and checks whether a connection has already been made
     */
    _connectSocket() {
            if (this.sock) {
            if (this.sock.readyState !== WebSocket.OPEN)
                this._log("sock is already instantiated but not open", 1, "red");
            else
                this._log("sock is already instantiated and open", 1, "yellow");

            return;
        }

        const self = this;
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
            // make sure to clean up if the socket has been closed forcibly
            if (self.keepAliveTries < 6 && self.keepAliveID !== -1) {
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
    }

    /**
     * @description processes the messages received by the websocket
     * @param {string} msg message the server sent as a string
     * @param {string} flags flags sent with the packet
     */
    _wsaprocessor(msg, flags) {
        if (typeof msg !== "string") {
            this._log("socket received message that isn't a string", 3, "yellow");
            this._log(msg, 3, "yellow");
            return;
        }

        // can only occur when it's really a ping message
        if (msg.charAt(0) === 'h') {
            this._keepAliveCheck();
            return;
        }

        const data = JSON.parse(msg)[0];

        switch (data.a) {
            case this.ACK: {
                this.emit((data.p === "1" ? this.CONN_SUCCESS : this.CONN_ERROR));
            }
            break;

            case this.ADVANCE: {
                const previous = {
                    historyID: this.state.room.playback.historyID,
                    playlistID: this.state.room.playback.playlistID,
                    media: this.state.room.playback.media,
                    dj: this.getUserById(this.state.room.booth.dj, this.CACHE.ENABLED),
                    score: {
                        positive: 0,
                        negative: 0,
                        listeners: this.getUsers().length,
                        skipped: 0,
                        grabs: this.state.room.grabs.length
                    }
                };

                for (let i = this.state.room.votes.length - 1; i >= 0; i--) {
                    if (this.state.room.votes[i].direction > 0)
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
                this.state.room.playback.startTime = utils.convertPlugTimeToDate(data.p.t);

                this.emit(this.ADVANCE, this.state.room.booth, this.state.room.playback, previous);
            }
            break;

            case this.CHAT: {
                const chat = mapper.mapChat(data.p);

                if (this.ccache) {
                    this.state.chatcache.push(chat);

                    if (this.state.chatcache.length > this.chatcachesize)
                        this.state.chatcache.shift();
                }

                if (chat.message.indexOf('@' + this.state.self.username) > -1)
                    this.emit(this.CHAT_MENTION, chat);
                else if (chat.message.charAt(0) == '/')
                    this.emit(this.CHAT_COMMAND, chat);
                else
                    this.emit(this.CHAT, chat);
            }
            break;

            case this.CHAT_DELETE: {
                const chat = mapper.mapChatDelete(data.p);

                if (this.ccache)
                    this.removeChatMessage(chat.cid, true);

                this.emit(this.CHAT_DELETE, chat);
            }
            break;

            case this.NOTIFY:
                this.emit(this.NOTIFY, data.p);
                break;

            case this.GIFTED: {
                // TODO: only send names now.
                const sender = this.getUserByName(data.p.s);
                const recipient = this.getUserByName(data.p.r);
                this.emit(this.GIFTED, sender || data.p.s, recipient || data.p.r);
            }
            break;

            case this.PLAYLIST_CYCLE:
                this.emit(this.PLAYLIST_CYCLE, mapper.mapPlaylistCycle(data.p));
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
                this.state.self.pp = data.p.pp;
                this.state.self.level = data.p.level;
                this.emit(this.EARN, mapper.mapXP(data.p));
                break;

            case this.LEVEL_UP:
                this.state.self.level++;
                this.emit(this.LEVEL_UP, data.p);
                break;

            case this.GRAB:

                for (let i = 0, l = this.state.room.grabs.length; i < l; i++) {
                    if (this.state.room.grabs[i] == data.p)
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

            case this.MOD_MUTE: {
                if (!data)
                    break;

                const time = (data.p.d === this.MUTEDURATION.SHORT ?
                    15*60 : data.p.d === this.MUTEDURATION.MEDIUM ?
                    30*60 : data.p.d === this.MUTEDURATION.LONG ?
                    45*60 : 15*60);
                const mute = mapper.mapMute(data.p, time);

                this.emit(this.MOD_MUTE, mute, (data.p.d ? data.p.d : this.MUTEDURATION.NONE));
            }
            break;

            case this.MOD_STAFF: {
                const promotions = mapper.mapPromotions(data.p);

                if (promotions.length === 2) {
                    const host = this.getUserByID(this.getHostID());

                    for (let i = promotions.length - 1; i >= 0; i--) {
                        if (promotions[i].id == host.id) {
                            host.role = promotions.splice(i, 1)[0].role;

                            if (this.removeCachedUserByID(host.id))
                                this.cacheUser(host);

                            this.state.room.meta.hostID = promotions[0].id;
                            this.state.room.meta.hostName = promotions[0].username;

                            break;
                        }
                    }
                }

                for (let i = this.state.room.users.length - 1; i >= 0; i--) {
                    if (this.state.room.users[i].id == promotions[0].id) {
                        this.state.room.users[i].role = promotions[0].role;

                        if (this.removeCachedUserByID(this.state.room.users[i].id))
                            this.cacheUser(this.state.room.users[i]);

                        break;
                    }
                }

                this.emit(this.MOD_STAFF, promotions);
            }
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

            case this.USER_LEAVE: {
                let user = undefined;

                // it was just a guest leaving, nothing more to do here
                if (data.p === 0) {
                    this.state.room.meta.guests--;
                    this.emit(this.GUEST_LEAVE);
                    break;
                }

                this.state.room.meta.population--;

                for (let i = this.state.room.users.length - 1; i >= 0; i--) {
                    if (this.state.room.users[i].id == data.p) {
                        this.clearUserFromLists(data.p);
                        user = this.state.room.users.splice(i, 1)[0];

                        if (this.sleave)
                            this.cacheUser(user);

                        break;
                    }
                }

                this.emit(this.USER_LEAVE, user);
            }
            break;

            case this.USER_JOIN: {
                const user = mapper.mapUser(data.p);

                if (user.guest) {
                    this.state.room.meta.guests++;

                    this.emit(this.GUEST_JOIN);
                } else {
                    this.state.room.users.push(user);
                    this.state.room.meta.population++;

                    if (this.isFriend(user.id))
                        this.emit(this.FRIEND_JOIN, user);
                    else
                        this.emit(this.USER_JOIN, user);
                }
            }
            break;

            case this.USER_UPDATE:
                this.emit(this.USER_UPDATE, mapper.mapUserUpdate(data.p));
                break;

            case this.FRIEND_REQUEST: {
                this.emit(this.FRIEND_REQUEST, utils.decode(data.p));
            }
            break;

            case this.FRIEND_ACCEPT: {
                this.emit(this.FRIEND_ACCEPT, utils.decode(data.p));
            }
            break;

            case this.VOTE: {
                const vote = mapper.pushVote(data.p);
                if (!this._checkForPreviousVote(vote))
                    this.emit(this.VOTE, vote);
            }
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
                this.emit(this.MAINTENANCE_MODE_ALERT);
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
    }

    /**
     * @description clears the usercache
     */
    clearUserCache() {
        this.state.usercache = [];
    }

    /**
     * @description clears the log
     */
    clearChatCache() {
        this.state.chatcache = [];
    }

    /**
     * @description clears the queue
     */
    clearChatQueue() {
        this.chatQueue = [];
    }

    /**
     * @description gets all messages of a user
     *
     * @param {string} username name of a user
     * @returns {string[]} list of all their messages
     */
    getChatByUsername(username) {
        const messages = [];
        username = username.toLowerCase();

        for (let i = this.state.chatcache.length - 1; i >= 0; i--) {
            if (this.state.chatcache[i].username.toLowerCase() === username)
                messages.push(this.state.chatcache[i]);
        }

        return messages;
    }

    /**
     * @description gets chat log
     * @returns {string[]} time sorted array of all chat messages
     */
    getChat() {
        return this.state.chatcache;
    }

    /**
     * @description removes all messages of a user
     * @param {string} username name of a user
     * @param {boolean} [cacheOnly=false] clears only the cache when true
     */
    removeChatMessagesByUser(username, cacheOnly = false) {
        username = username.toLowerCase();

        for (let i = this.state.chatcache.length - 1; i >= 0; i--) {
            if (this.state.chatcache[i].username.toLowerCase() === username) {
                if (!cacheOnly)
                    this.deleteMessage(this.state.chatcache[i].cid);

                this.state.chatcache.splice(i, 1);
            }
        }
    }

    /**
     * @description removes a message
     * @param {string} cid unique message ID
     * @param {boolean} [cacheOnly=false] clears only the log when true
     */
    removeChatMessage(cid, cacheOnly = false) {
        for (let i = this.state.chatcache.length - 1; i >= 0; i--) {
            if (this.state.chatcache[i].cid === cid) {
                if (!cacheOnly)
                    this.deleteMessage(this.state.chatcache[i].cid);

                this.state.chatcache.splice(i, 1);
                break;
            }
        }
    }

    /**
     * @description enables time based cleanup of cached users
     * @param {boolean} enable
     */
    watchUserCache(enable) {
        clearInterval(this.cleanCacheInterval);

        if (enable) {
            this.cleanCacheInterval = setInterval(this._cleanUserCache.bind(this), 5*60*1000);
        } else {
            this.cacheUserOnLeave(false);
            this.cleanCacheInterval = -1;
            this.clearUserCache();
        }
    }

    /**
     * @description sets chat caching. It's enabled by default
     * @param {boolean} enable
     */
    cacheChat(enable) {
        return (this.ccache = enable);
    }

    /**
     * @description checks if chat is being cached
     * @returns {boolean} indicating status
     */
    isChatCached() {
        return this.ccache;
    }

    /**
     * @description sets the chat cache size. the default size is 256 messages
     * @param {number} size size of the cache in messages
     * @returns {number} the size of the cache
     */
    setChatCacheSize(size) {
        if (typeof size === "number" && size >= 0)
            return this.chatcachesize = size;
        else
            return this.chatcachesize;
    }

    /**
     * @returns the chat cache size
     */
    getChatCacheSize() {
        return this.chatcachesize;
    }

    /**
     * @description caches users when they leave the room
     *
     * @param {boolean} toggle when true caches users
     * @returns {boolean} the current state
     */
    cacheUserOnLeave(toggle) {
        if (this.cleanCacheInterval !== -1)
            this.sleave = toggle;
        return this.sleave;
    }

    /**
     * @description checks if users are cached when they leave the room
     * @returns {boolean} the current state
     */
    isUserCachedOnLeave() {
        return this.sleave;
    }

    /**
     * @description clears a user from the voting and grab list
     * @param {number} ID of a user
     * @returns {boolean} true when user was found and cleared, false otherwise
     */
    clearUserFromLists(id) {
        let cleared = false;

        for (let i = 0, l = this.state.room.votes; i < l; i++) {
            if (this.state.room.votes[i].id == id) {
                this.state.room.votes.splice(i, 1);
                cleared = true;
                break;
            }
        }

        for (let i = 0, l = this.state.room.grabs; i < l; i++) {
            if (this.state.room.grabs[i] == id) {
                this.state.room.grabs.splice(i, 1);
                cleared = true;
                break;
            }
        }

        return cleared;
    }

    /**
     * @description gets the currently used jar
     * @returns {object} the cookie jar
     */
    getJar() {
        return this.query.getJar();
    }

    /**
     * @description sets another cookie jar or creates a new one based on a storage object
     * @param {object} jar cookie jar to use
     * @param {object=} storage can be used to create a cookie jar, null otherwise
     */
    setJar(jar, storage=null) {
        this.query.setJar(jar, storage);
    }

    /**
     * @description the default message processor used for chat messages, this function can be
     * overridden or exchanged, see Options
     * @param {string} message chat message
     * @returns {string[]} msgs formatted message
     */
    defaultMessageProc(message) {
        const msgs = [];

        // 256 is the max length a chat message can have,
        // but the chat window caps the message at 250.
        for (let i = 0, l = Math.ceil(message.length/250); i < l; i++)
            msgs.push(message.slice(i*250, (i+1)*250));

        return msgs;
    }

    /**
     * @description exchanges the message processor dynamically at runtime
     * @param {string} func message processor function
     * @returns {boolean} true when function was set
     */
    setMessageProcessor(func) {
        if (typeof func === "function") {
            this.messageProc = func;
            return true;
        }

        return false;
    }

    /**
     * @description sends a chat message
     * @param {string} message message to send
     * @param {number=} deleteTimeout delay in ms until message is deleted
     * @throws {Error} message must be of type string
     * @throws {Error} deleteTimeout must be of type number
     * @throws {Error} message processor must return an array of strings
     * @returns {string[]} the formatted message
     */
    sendChat(message, deleteTimeout = -1) {
        if (typeof message !== "string")
            throw Error("message must be of type string");

        if (typeof deleteTImeout !== "number")
            throw Error("deleteTimeout must be of type number");

        if (!message || message.length <= 0) {
            this._log("no message given", 1, "yellow");
            return;
        }

        message = this.messageProc(message);

        if (!Array.isArray(message))
            throw Error("messageprocessor does not return an array of strings!");

        for (let i = 0, l = message.length; i < l; i++) {
            this.chatQueue.push({
                message: message[i],
                timeout: deleteTimeout
            });
        }

        if (this.chatTimeout === 0)
            this._processChatQueue();

        return message;
    }

    /**
     * @description hooks up a logging library into plug
     * @returns {boolean} true when logger has been registered
     */
    invokeLogger(logfunc) {
        if (typeof logfunc === "function" ||
            (!Array.isArray(logfunc) && typeof logfunc === "object")) {
            this.log = logfunc;
            return true;
        }

        return false;
    }

    // TODO: streamline error messages
    /**
     * @description log into https://www.plug.dj
     * @param {object} credentials formatted login info
     * @param {string} authToken last session token
     * @param {function} callback called after logging in
     */
    login(credentials, authToken, callback) {
        if (typeof authToken === "function") {
            callback = authToken;
            authToken = null;
        }

        if (!authToken) {
            if (typeof credentials !== "object")
                throw new Error("credentials has to be of type object");

            const errorMsg = [];
            let flag = 0;

            flag |= (!credentials.hasOwnProperty("email") ? 1 << 0 : 0);
            flag |= (!credentials.hasOwnProperty("password") ? 1 << 1 : 0);
            flag |= (!credentials.hasOwnProperty("accessToken") ? 1 << 2 : 0);
            flag |= (!credentials.hasOwnProperty("userID") ? 1 << 3 : 0);

            // doing this with hasOwnProperty would have been possible but would be a real mess
            if (flag & 0x03 && ((flag & 0x0C) === 0x0C)) {           // missing email but no facebook credentials
                if (flag & 0x01)
                    errorMsg.push("email missing");

                if (flag & 0x02)
                    errorMsg.push("password missing");

            } else if (flag & 0x0C && ((flag & 0x03) === 0x03)) {    // missing facebook but no email credentials
                if (flag & 0x04)
                    errorMsg.push("accessToken missing");

                if (flag & 0x08)
                    errorMsg.push("userID missing");
            } else {                                                // credentials for both are set
                if (flag & 0x03 && !(flag & 0x0C)) {                 // nullify malformed email credentials
                    delete credentials.email;
                    delete credentials.password;
                // same for
                } else if (flag & 0x0C && !(flag & 0x03)) {          // nullify malformed facebook credentials
                    delete credentials.accessToken;
                    delete credentials.userID;
                } else {                                            // both are malformed
                    errorMsg.push("credentials are malformed");
                }
            }

            if (errorMsg.length > 0)
                throw new Error(errorMsg.join(", "));

            this.credentials = credentials;

            // requests a new cookie jar
            if (!this.getJar())
                this.setJar(null);

            this._log("logging in with account: " + (credentials.email || credentials.userID) + "...", 2, "white");

            this._login();
        } else {
            this._log("trying to resume session...", 2, "white");
            this.auth = authToken;
            this._loggedIn();
        }

        if (callback) {
            const onSuccess = function(self) {
                this.removeListener(this.LOGIN_ERROR, onError);
                callback(null, self);
            };

            const onError = function(err) {
                this.removeListener(this.LOGIN_SUCCESS, onSuccess);
                callback(err);
            };

            this.once(this.LOGIN_SUCCESS, onSuccess);
            this.once(this.LOGIN_ERROR, onError);
        }
    }

    // TODO: streamline errors
    /**
     * @description logs into a room as a guest
     * @param {string} room room slug
     * @param {function} callback called after entering
     */
    guest(room, callback) {
        if (this.sock) {
            if (this.sock.readyState === WebSocket.OPEN)
                this._log("you seem to be logged in already", 0, "yellow");
            else
                this._log("the socket is already instantiated", 0, "red");
            return;
        }

        this._log("Joining room \"" + room + "\" as a guest...", 1, "white");
        this.query.query("GET", baseURL + '/' + room, function _guestRoom(err, data) {
            // get auth token directly from the page
            const idx = data.indexOf("_jm=\"") + 5;
            const auth = data.substr(idx, data.indexOf('"', idx) - idx);

            if (auth.length === 172) {
                this.auth = auth;

                this.state.self = mapper.mapSelf({
                    joined: new Date().toISOString(),
                    guest: true
                });

                this._connectSocket();
                this.getRoomStats(function(err, stats) {
                    if (!err) {
                        this.emit(this.JOINED_ROOM, stats);
                        callback && callback(null, stats);
                    } else {
                        this.emit(this.PLUG_ERROR, err);
                        callback && callback(err);
                    }
                });
            } else {
                const err = new Error("couldn't join room \"" + room + "\" as a guest")
                this.emit(this.PLUG_ERROR, err);
                callback && callback(err);
            }
        }.bind(this), false, true);
    }

    /**
     * @description connects to a room
     * @param {string} slug room name
     * @param {function} callback called after entering
     */
    connect(slug, callback) {
        if (!slug) {
            this._log("slug has to be defined", 1, "red");
            return;
        }

        if (!this.auth || this.state.self.guest) {
            this._log("joining plug in guest mode, functions are highly limited!", 1, "yellow");
            this.guest(slug);
            return;
        }

        this.joinRoom(slug, function _joinedRoom(err) {
            if (!err) {
                this.watchUserCache(true);
                this.clearUserCache();
                this.clearChatCache();

                this.getRoomStats(function(err, stats) {

                    if (!err) {
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

        if (callback) {
            const onSuccess = function(state) {
                this.removeListener(this.PLUG_ERROR, onError);
                callback(null, state);
            };
            const onError = function(err) {
                this.removeListener(this.JOINED_ROOM, onSuccess);
                callback(err);
            };

            this.once(this.JOINED_ROOM, onSuccess);
            this.once(this.PLUG_ERROR, onError);
        }
    }

    /**
     * @description gets a user by their ID
     * @param {number} ID user ID
     * @param {enum} cache choose cache option
     * @returns {object} user when found, null otherwise
     */
    getUserById(id, cache = this.CACHE.DISABLE) {
        if (cache === true)
            cache = this.CACHE.ENABLE;

        if (id == this.state.self.id)
            return this.state.self;

        for (let i = 0, l = this.state.room.users.length, m = (cache !== this.CACHE.ONLY); m && i < l; i++) {
            if (this.state.room.users[i].id == id)
                return this.state.room.users[i];
        }

        for (let i = 0, l = this.state.usercache.length, m = (cache !== this.CACHE.DISABLE); m && i < l; i++) {
            if (this.state.usercache[i].id == id)
                return this.state.usercache[i];
        }

        return null;
    }

    /**
     * @description gets a user by their name
     * @param {string} username
     * @param {object} cache choose cache option
     * @returns {object} user when found, null otherwise
     */
    getUserByName(username, cache = this.CACHE.DISABLE) {
        username = username.toLowerCase();

        if (cache === true)
            cache = this.CACHE.ENABLE;

        if (this.state.self.username.toLowerCase() === username)
            return this.state.self;

        for (let i = 0, l = this.state.room.users.length, m = (cache !== this.CACHE.ONLY); m && i < l; i++) {
            if (this.state.room.users[i].username.toLowerCase() === username)
                return this.state.room.users[i];
        }

        for (let i = 0, l = this.state.usercache.length, m = (cache !== this.CACHE.DISABLE); m && i < l; i++) {
            if (this.state.usercache[i].username.toLowerCase() === username)
                return this.state.usercache[i];
        }

        return null;
    }

    // TODO: decide if it is really a good idea to return undefined here
    /**
     * @description gets user by role
     * @param {number} ID user ID
     * @returns {enum} role when found, null otherwise
     */
    getUserRole(id) {
        for (let i = 0, l = this.state.room.users.length; i < l; i++) {
            if (this.state.room.users[i].id == id)
                return this.state.room.users[i].role;
        }

        return null;
    }

    /**
     * @description gets all users in a room
     * @returns {object[]}
     */
    getUsers() {
        return this.state.room.users;
    }

    // TODO: add further explanation
    /**
     * @description gets account object
     * @returns {object} account
     */
    getSelf() {
        return this.state.self;
    }

    // TODO: might as well remove the boolean return value
    /**
     * @description sets a personal setting
     * @param {string} key setting name
     * @param {*} value setting value
     * @param {function} callback called when saved
     * @returns {boolean} true when setting was saved, false otherwise
     */
    setSetting(key, value, callback) {
        if (this.state.self.settings.hasOwnProperty(key)) {
            this.state.self.settings[key] = value;

            this.saveSettings(callback);
            return true;
        }
        callback && callback(null, false);
        return false;
    }

    /**
     * @description gets a personal setting
     * @param {string} key setting name
     * @returns {*} value in its type
     */
    getSetting(key) {
        if (this.state.self.settings.hasOwnProperty(key))
            return this.state.self.settings[key];
        return null;
    }

    /**
     * @description gets all personal settings
     * @returns {object}
     */
    getSettings() {
        return this.state.self.settings;
    }

    /**
     * @description checks if user is a friend
     * @param {number} ID user ID
     * @returns {boolean} true when befriended, false otherwise
     */
    isFriend(id) {
        for (let i = 0, l = this.state.self.friends.length; i < l; i++) {
            if (this.state.self.friends[i] == id)
                return true;
        }

        return false;
    }

    /**
     * @description gets the dj
     * @returns {object} user
     */
    getDJ() {
        return this.getUserByID(this.state.room.booth.dj, this.CACHE.DISABLE);
    }

    /**
     * @description gets the Media
     * @returns {object} media
     */
    getMedia() {
        return this.state.room.playback.media;
    }

    /**
     * @description gets the Media start time
     * @returns {number} start time
     */
    getStartTime() {
        return this.state.room.playback.startTime;
    }

    /**
     * @description gets the Booth
     * @returns {object} Booth
     */
    getBooth() {
        return this.state.room.booth;
    }

    /**
     * @description gets the Room
     * @returns {object} Room
     */
    getRoom() {
        return this.state.room;
    }

    /**
     * @description gets the Metadata of a Room
     * @returns {object} Metadata
     */
    getRoomMeta() {
        return this.state.room.meta;
    }

    /**
     * @description gets the name of a Room
     * @returns {string} room name
     */
    getRoomName() {
        return this.state.room.meta.name;
    }

    /**
     * @description gets FX data
     * @returns {string[]} enabled effects
     */
    getFX() {
        return this.state.room.fx;
    }

    /**
     * @description checks what level the global role represents
     * @param {number} gRole global role as a number
     * @returns {enum} GLOBALROLE
     */
    checkGlobalRole(gRole) {
        return (gRole === 5 ?
            this.GLOBALROLE.ADMIN :
            (gRole > 0 && gRole < 5 ?
                this.GLOBALROLE.BRAND_AMBASSADOR :
                this.GLOBALROLE.NONE
            )
        );
    }

    /**
     * @descriptions gets host name
     * @returns {string} name of the host
     */
    getHostName() {
        return this.state.room.meta.hostName;
    }

    /**
     * @description gets host ID
     * @returns {number} user ID of host
     */
    getHostID() {
        return this.state.room.meta.hostID;
    }

    /**
     * @description gets population of a room
     * @returns {number} users connected
     */
    getPopulation() {
        return this.state.room.meta.population;
    }

    /**
     * @description gets the number of guests
     * @returns {number} guests connected
     */
    getGuests() {
        return this.state.room.meta.guests;
    }

    /**
     * @description gets the minimum chat level
     * @returns {number} chat level needed
     */
    getMinChatLevel() {
        return this.state.room.meta.minChatLevel;
    }

    /**
     * @description checks if room is favorited
     * @returns {boolean} true when room is favorited, false otherwise
     */
    isFavorite() {
        return this.state.room.meta.favorite;
    }

    /**
     * @description gets the description
     * @returns {string} room description
     */
    getDescription() {
        return this.state.room.meta.description;
    }

    /**
     * @description gets the welcome message
     * @returns {string} room welcome message
     */
    getWelcomeMessage() {
        return this.state.room.meta.welcome;
    }

    /**
     * @description gets the slug
     * @returns {string} room slug
     */
    getSlug() {
        return this.state.room.meta.slug;
    }

    /**
     * @description gets the waitlist
     * @returns {number[]} waitlist in ascending order
     */
    getWaitlist() {
        return this.state.room.booth.waitlist;
    }

    /**
     * @description checks if the waitlist is locked
     * @returns {boolean} true when waitlist is locked, false otherwise
     */
    isWaitlistLocked() {
        return this.state.room.booth.isLocked;
    }

    /**
     * @description checks if the waitlist cycles
     * @returns {boolean} true when waitlist cycles, false otherwise
     */
    doesWaitlistCycle() {
        return this.state.room.booth.shouldCycle;
    }

    // TODO: rename withUserObject, it sounds just plain stupid
    /**
     * @description gets all votes
     * @param {boolean} withUserObject replaces IDs with User objects
     * @returns {number[]|object[]} number array when param is false, object array otherwise
     */
    getVotes(withUserObject = false) {
        if (withUserObject) {
            const voters = [];

            for (let i = 0, l = this.state.room.votes.length; i < l; i++) {
                for (let j = 0, m = this.state.room.users.length; j < m; j++) {
                    if (this.state.room.votes[i].id == this.state.room.users[j].id)
                        voters.push({ user: this.state.room.users[j], direction: this.state.room.votes[i].direction });
                }
            }

            return voters;
        } else {
            return this.state.room.votes;
        }
    }

    /**
     * @description gets all grabs
     * @param {boolean} withUserObject replaces IDs with User objects
     * @returns {number[]|object[]} number array when param is false, object array otherwise
     */
    getGrabs(withUserObject = false) {
        if (withUserObject) {
            const grabbers = [];

            for (let i = 0, l = this.state.room.grabs.length; i < l; i++) {
                for (let j = 0, m = this.state.room.users.length; j < m; j++) {
                    if (this.state.room.grabs[i] == this.state.room.users[j].id)
                        grabbers.push(this.state.room.users[j]);
                }
            }

            return grabbers;
        } else {
            return this.state.room.grabs;
        }
    }

    /**
     * @description saves a User
     * @param {object} user User object
     * @returns {boolean} true when saved, false otherwise
     */
    cacheUser(user) {
        if (typeof user === "object" && typeof this.getUserByID(user.id, this.CACHE.ONLY) === "undefined") {
            this.state.usercache.push({ user: user, timestamp: Date.now() });
            return true;
        }
        return false;
    }

    /**
     * @description removes a User from cache
     * @param {number} ID user ID
     * @returns {boolean} true when the user was found and removed, false otherwise
     */
    removeCachedUserByID(id) {
        for (let i = 0, l = this.state.usercache.length; i < l; i++) {
            if (this.state.usercache[i].user.id == id) {
                this.state.usercache.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * @description removes a User from cache
     * @param {string} username
     * @returns {boolean} true when the user was found and removed, false otherwise
     */
    removeCachedUserByName(username) {
        username = username.toLowerCase();

        for (let i = 0, l = this.state.usercache.length; i < l; i++) {
            if (this.state.usercache[i].user.username.toLowerCase() === username) {
                this.state.usercache.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    // TODO: check if user object or IDs
    /**
     * @description gets staff online
     * @returns {object[]} staff currently online
     */
    getStaffOnline() {
        const staff = [];

        for (let i = 0, l = this.state.room.users.length; i < l; i++) {
            if (this.state.room.users[i].role > this.USERROLE.NONE)
                staff.push(this.state.room.users[i]);
        }

        return staff;
    }

    // TODO: same as above
    /**
     * @description gets staff by role
     * @param {enum} role staff by role
     * @returns {object[]} staff currently online with role specified
     */
    getStaffOnlineByRole(role) {
        const staff = [];

        for (let i = 0, l = this.state.room.users.length; i < l; i++) {
            if (this.state.room.users[i].role == role)
                staff.push(this.state.room.users[i]);
        }

        return staff;
    }

    /**
     * @description gets all staff by role
     * @param {number} role role of staff
     * @param {function} callback called on retrieval
     */
    getStaffByRole(role, callback) {
        this.getStaff(function(err, staff) {
            if (!err) {
                const filteredStaff = [];

                for (let i = 0, l = staff.length; i < l; i++) {
                    if (staff[i].role == role)
                        filteredStaff.push(mapper.mapUser(staff[i]));
                }

                callback && callback(null, filteredStaff);
            } else {
                callback && callback(err);
            }
        });
    }

    /**
     * @description gets news
     * @param {function} callback called on retrieval
     */
    getNews(callback) {
        // GET /_/news
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["NEWS"], callback);
    }

    /**
     * @description gets auth token
     * @param {function} callback called on retrieval
     */
    getAuthToken(callback) {
        // GET /_/rooms/state
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["TOKEN"], callback, true);
    }

    /**
     * @description gets room stats
     * @param {function} callback called on retrieval
     */
    getRoomStats(callback) {
        // GET /_/rooms/state
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["ROOMSTATS"], function _sanitizeRoomStats(err, stats) {
            callback && callback(err, mapper.mapRoom(stats));
        }, true);
    }

    /**
     * @description finds paginated results of rooms
     * @param {number} page zero based, indexed start
     * @param {number} limit amount of rooms per page
     * @param {function} callback called on retrieval
     */
    findRooms(query, page, limit, callback) {
        // GET /_/rooms?q=<query>&page=<page:0>&limit=<limit:50>
        callback = (typeof callback === "function" ? callback.bind(this) :
            typeof limit === "function" ? limit :
            typeof page === "function" ? page : undefined);
        query = query || "";

        if (typeof page !== "number")
            page = 0;

        if (typeof limit !== "number")
            limit = 50;

        this.query.query("GET", [endpoints["ROOMS"], "?q=", query, "&page=", page, "&limit=", limit].join(''), function _sanitizeFoundRooms(err, rooms) {

            callback && callback(err, (!err && rooms ? rooms.map(function(room) {
                return mapper.mapExtendedRoom(room);
            }) : []));
        });
    }

    /**
     * @description gets unfiltered paginated results of rooms
     * @param {number} page zero based, indexed start
     * @param {number} limit amount of rooms per page
     * @param {function} callback called on retrieval
     */
    getRoomList(page, limit, callback) {
        // GET /_/rooms?q=<query>&page=<page:0>&limit=<limit:50>
        if (typeof page === "function") {
            callback = page;
            page = 0;
        } else if (typeof limit === "function") {
            callback = limit;
            limit = 50;
        }

        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["ROOMS"] + "?q=&page=0&limit=50", function _sanitizeRooms(err, rooms) {
            callback && callback(err, (!err && rooms ? rooms.map(function(room) {
                return mapper.mapExtendedRoom(room);
            }) : []));
        });
    }

    /**
     * @description gets staff members
     * @param {function} callback called on retrieval
     */
    getStaff(callback) {
        // GET /_/staff
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["STAFF"], function _sanitizeStaff(err, staff) {
            callback && callback(err, (!err && staff ? staff.map(function(staffEntry) {
                return mapper.mapUser(staffEntry);
            }) : []));
        });
    }

    /**
     * @description gets a user
     * @param {number} ID user ID
     * @param {function} callback called on retrieval
     */
    getUser(id, callback) {
        // GET /_/users/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["USERSTATS"] + id, function _sanitizeUser(err, user) {
            callback && callback(err, mapper.mapUser(user));
        }, true);
    }

    /**
     * @description gets room history
     * @param {function} callback called on retrieval
     */
    getRoomHistory(callback) {
        // GET /_/rooms/history
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["HISTORY"], function _sanitizeHistory(err, history) {
            callback && callback(err, (!err && history ? history.map(function(historyEntry) {
                return mapper.mapHistoryEntry(historyEntry);
            }) : []));
        });
    }

    /**
     * @description validates a room name
     * @param {string} name name to be validated
     * @param {function} callback called on retrieval
     */
    validateRoomName(name, callback) {
        // GET /_/rooms/validate/<name>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["VALIDATEROOM"] + name, (err, name) => callback(err, name.slug), true);
    }

    /**
     * @description validates a username
     * @param {string} name name to be validated
     * @param {function} callback called on retrieval
     */
    validateUsername(name, callback) {
        // GET /_/users/validate/<name>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["VALIDATEUSER"] + name, (err, name) => callback(err, name.slug), true);
    }

    /**
     * @description gets mutes
     * @param {function} callback called on retrieval
     */
    getMutes(callback) {
        // GET /_/mutes
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["MUTES"], function _sanitizeMutes(err, mutes) {
            callback && callback(err, (!err && mutes ? mutes.map(function (mute) {
                return mapper.mapMute(mute);
            }) : []));
        });
    }

    /**
     * @description gets bans
     * @param {function} callback called on retrieval
     */
    getBans(callback) {
        // GET /_/bans
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["BANS"], function _sanitizeBans(err, bans) {
            callback && callback(err, (!err && bans ? bans.map(function (ban) {
                return mapper.mapBan(ban);
            }) : []));
        });
    }

    /**
     * @description saves settings
     * @param {function} callback called on retrieval
     */
    saveSettings(callback) {
        // PUT /_/users/settings
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["SETTINGS"], this.state.self.settings, callback);
    }

    /**
     * @description sets up a lock
     * @param {boolean} lock should waitlist be locked?
     * @param {boolean} removeAllDJs remove all users in waitlist?
     * @param {function} callback called on retrieval
     */
    setLock(lock, removeAllDJs, callback) {
        // PUT /_/booth/lock
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["LOCK"], {
            isLocked: lock,
            removeAllDJs: removeAllDJs
        }, callback);
    }

    /**
     * @description decides cycle mode
     * @param {boolean} shouldCycle should waitlist cycle?
     * @param {function} callback called on retrieval
     */
    setCycle(shouldCycle, callback) {
        // PUT /_/booth/cycle
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["CYCLE"], { shouldCycle: shouldCycle }, callback);
    }

    /**
     * @description logs an account in
     * @param {string} csrf cross site request forgery token
     * @param {function} callback called on retrieval
     */
    setLogin(csrf, callback) {
        // POST /_/auth/login
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        this._log("setting login data...", 1, "white");

        if (this.credentials.hasOwnProperty("email")) {
            this.query.query("POST", endpoints["LOGIN"], {
                "csrf": csrf,
                "email": this.credentials.email,
                "password": this.credentials.password
            }, callback);
        } else if (this.credentials.hasOwnProperty("accessToken")) {
            this.query.query("POST", endpoints["FACEBOOK"], {
                "csrf": csrf,
                "accessToken": this.credentials.accessToken,
                "userID": this.credentials.userID
            }, callback);
        };
    }

    /**
     * @description sends a request to the server to reset the account's password
     * @param {function} callback called on retrieval
     */
    resetPassword(callback) {
        // POST /_/auth/reset/me
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["RESET"], callback);
    }

    /**
     * @description gets users in bulk
     * @param {number[]} IDs user IDs
     * @param {function} callback called on retrieval
     */
    requestUsers(ids, callback) {
        // POST /_/users/bulk
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["BULKUSERS"], { ids: ids }, callback);
    }

    /**
     * @description joins a room
     * @param {string} slug room slug
     * @param {function} callback called on retrieval
     */
    joinRoom(slug, callback) {
        // POST /_/rooms
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["JOINROOM"], { slug: slug }, callback);
    }

    /**
     * @description joins the waitlist
     * @param {function} callback called on retrieval
     */
    joinWaitlist(callback) {
        // POST /_/booth
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["JOINBOOTH"], callback);
    }

    /**
     * @description adds a user to the waitlist
     * @param {number} ID user ID
     * @param {function} callback called on retrieval
     */
    addToWaitlist(id, callback) {
        // POST /_/booth/add
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["ADDBOOTH"], { id: id }, callback);
    }

    /**
     * @description creates a new playlist with media objects
     * @param {string} name playlist name
     * @param {object[]} media media to add
     * @param {function} callback called on retrieval
     */
    addPlaylist(name, media, callback) {
        // POST /_/playlists
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        if (typeof media === "function") {
            callback = media.bind(this);
            media = null;
        }

        this.query.query("POST", endpoints["PLAYLISTS"],
            { name: name, media: mapper.serializeMediaObjects(media) },
            callback, true);
    }

    /**
     * @description grabs media
     * @param {number} ID playlist ID
     * @param {function} callback called on retrieval
     */
    grab(id, callback) {
        // POST /_/grabs
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        for (let i = 0, l = this.state.room.grabs.length; i < l; i++) {
            if (this.state.room.grabs[i] == this.state.self.id)
                return 0;
        }

        this.query.query("POST", endpoints["GRABS"], {
            playlistID: id,
            historyID: this.state.room.playback.historyID
        }, callback, true);

        return 1;
    }

    /**
     * @description skips the DJ
     * @param {number} ID user ID
     * @param {function} callback called on retrieval
     */
    skipDJ(id, callback) {
        // POST /_/booth/skip
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        if (typeof id === "function") {
            callback = id;
            id = this.state.room.booth.dj;
        }

        // fallback in case that plug failed at assigning a valid history ID
        if (!this.state.room.playback.historyID) {
            this.removeDJ(id, function(err) {
                if (!err)
                    this.addToWaitlist(id, callback);

                callback && callback(err);
            });
        } else {

            if (id == this.state.self.id)
                this.query.query("POST", endpoints["SKIPBOOTH"] + "/me", callback);
            else
                this.query.query("POST", endpoints["SKIPBOOTH"], {
                    userID: id,
                    historyID: this.state.room.playback.historyID
                }, callback);
        }
    }

    /**
     * @description moves a user in the waitlist
     * @param {number} ID user ID
     * @param {number} position zero based index in waitlist
     * @param {function} callback called on retrieval
     */
    moveDJ(id, position, callback) {
        // POST /_/booth/move
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["MOVEBOOTH"], {
            userID: id,
            position: position
        }, callback);
    }

    /**
     * @description creates a new room
     * @param {string} name room name
     * @param {boolean} unlisted makes room private
     * @param {function} callback called on retrieval
     */
    createRoom(name, unlisted, callback) {
        // POST /_/rooms
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["CREATEROOM"], {
            name: name,
            private: unlisted
        }, callback, true);
    }

    /**
     * @description updates the room info
     * @param {string} name room name
     * @param {string} description room description
     * @param {string} welcome welcome message shown on entrance
     * @param {function} callback called on retrieval
     */
    updateRoomInfo(name, description, welcome, callback) {
        // POST /_/rooms/update
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["UPDATEROOM"], {
            name: name,
            description: description,
            welcome: welcome
        }, callback);
    }

    /**
     * @description sets the room's minimum chat level
     * @param {number} level required to chat
     * @param {function} callback called on retrieval
     */
    setMinChatLevel(level, callback) {
        // POST /_/rooms/update
        level = (typeof level === "string" ? parseInt(level, 10) : level);
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["UPDATEROOM"], {
            minChatLevel: level
        }, function(err) {
            if (!err)
                this.state.room.meta.minChatLevel = level;

            callback && callback(err);
        }.bind(this));
    }

    /**
     * @description bans a user
     * @param {number} ID user ID
     * @param {enum} time duration of ban
     * @param {enum} reason reason of ban
     * @param {function} callback called on retrieval
     */
    banUser(id, time, reason, callback) {
        // POST /_/bans/add
        if (typeof reason === "function") {
            callback = reason;
            reason = 1;
        }

        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["BANS"] + "/add", {
            userID: id,
            reason: reason,
            duration: time
        }, callback);
    }

    /**
     * @description mutes a user
     * @param {number} ID user ID
     * @param {enum} time time of mute
     * @param {enum} reason reason of mute
     * @param {function} callback called on retrieval
     */
    muteUser(id, time, reason, callback) {
        // POST /_/mutes
        if (typeof reason === "function") {
            callback = reason;
            reason = 1;
        }

        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["MUTES"], {
            userID: id,
            reason: reason,
            duration: time
        }, callback);
    }

    /**
     * @description adds a user to staff
     * @param {number} ID user ID
     * @param {enum} role role to give
     * @param {function} callback called on retrieval
     */
    addStaff(id, role, callback) {
        // POST /_/staff/update
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["STAFF"] + "/update", {
            userID: id,
            roleID: role
        }, callback, true);
    }

    /**
     * @description ignores a user
     * @param {number} ID user ID
     * @param {function} callback called on retrieval
     */
    ignoreUser(id, callback) {
        // POST /_/ignores
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["IGNORES"], { id: id }, function(err, data) {
            if (!err && data) {

                if (data.id && data.username) {
                    this.state.self.ignores.push({
                        id: data.id,
                        username: data.username
                    });
                }

            }
            callback && callback(err);
        }.bind(this), true);
    }

    /**
     * @description deletes a playlist
     * @param {number} ID playlist to delete
     * @param {function} callback called on retrieval
     */
    deletePlaylist(id, callback) {
        // DELETE /_/playlists/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["PLAYLISTS"] + '/' + id, callback, true);
    }

    /**
     * @description unignores a user
     * @param {number} ID user to unignore
     * @param {function} callback called on retrieval
     */
    removeIgnore(id, callback) {
        // DELETE /_/ignores/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["IGNORES"] + '/' + id, function(err, data) {
            if (!err && data) {
                for (let i = 0, l = this.state.self.ignores.length; i < l; i++) {
                    if (this.state.self.ignores[i].id == id) {
                        this.state.self.ignores.splice(i, 1);
                        break;
                    }
                }
            }

            callback && callback(err, data);
        }.bind(this), true);
    }

    /**
     * @description removes a user from staff
     * @param {number} ID user to remove
     * @param {function} callback called on retrieval
     */
    removeStaff(id, callback) {
        // DELETE /_/staff/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["STAFF"] + '/' + id, callback);
    }

    /**
     * @description removes a DJ
     * @param {number} ID user to remove
     * @param {function} callback called on retrieval
     */
    removeDJ(id, callback) {
        // DELETE /_/booth/remove/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["REMOVEBOOTH"] + id, callback, true);
    }

    /**
     * @description leaves the waitlist
     * @param {function} callback called on retrieval
     */
    leaveWaitlist(callback) {
        // DELETE /_/booth
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["JOINBOOTH"], callback);
    }

    /**
     * @description unbans a user
     * @param {number} ID user to unmute
     * @param {function} callback called on retrieval
     */
    unbanUser(id, callback) {
        // DELETE /_/bans/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["BANS"] + '/' + id, callback);
    }

    /**
     * @description unmutes a user
     * @param {number} ID user to unmute
     * @param {function} callback called on retrieval
     */
    unmuteUser(id, callback) {
        // DELETE /_/mutes/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["MUTES"] + '/' + id, callback);
    }

    /**
     * @description deletes a message
     * @param {cid} CID message ID
     * @param {function} callback called on retrieval
     */
    deleteMessage(cid, callback) {
        // DELETE /_/chat/<cid>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["CHAT"] + cid, callback);
    }

    /**
     * @description logs the account out
     * @param {function} callback called on retrieval
     */
    logout(callback) {
        // DELETE /_/auth/session
        this.query.query("DELETE", endpoints["SESSION"], function _loggedOut(err, body) {
            this._clearState();
            if (!err) {
                this._log("Logged out.", 1, "magenta");
                this.emit(this.LOGOUT_SUCCESS);
                callback && callback(null);
            } else {
                this.emit(this.LOGOUT_ERROR, err);
                callback && callback(err);
            }
        }.bind(this));
    }

    /**
     * @description request the account info
     * @param {function} callback called on retrieval
     */
    requestSelf(callback) {
        // GET /_/users/me
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        const self = this;

        this.query.query("GET", endpoints["USERSTATS"] + "me", function _requestedSelf(err, data) {
            if (!err && data) {
                self.state.self = mapper.mapSelf(data);

                self.getFriends(function(err, data) {
                    if (!err && data) {
                        for (let i = 0, l = data.length; i < l; i++)
                            self.state.self.friends.push(data[i].id);
                    }

                    callback && callback(err, self.state.self);
                });
            } else {
                callback && callback(err);
            }
        }, true);
    }

    /**
     * @description gets the account play history
     * @param {function} callback called on retrieval
     */
    getMyHistory(callback) {
        // GET /_/users/me/history
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["USERHISTORY"], callback);
    }

    /**
     * @description gets the account's friends
     * @param {function} callback called on retrieval
     */
    getFriends(callback) {
        // GET /_/friends
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["FRIENDS"], function _sanitizeFriends(err, friends) {
            callback && callback(err, (!err && friends ? friends.map(function(friend) {
                return mapper.mapUser(friend);
            }) : []));
        });
    }

    /**
     * @description gets the account's friend request
     * @param {function} callback called on retrieval
     */
    getFriendRequests(callback) {
        // GET /_/friends/invites
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["INVITES"], function _sanitizeFriendRequests(err, requests) {
            callback && callback(err, (!err && requests ? requests.map(function(request) {
                return mapper.mapFriendRequest(request);
            }) : []));
        });
    }

    /**
     * @description finds personal playlists
     * @param {string} query keywords to look for
     * @param {function} callback called on retrieval
     */
    findPlaylist(query, callback) {
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["PLAYLISTS"], function _findPlaylist(err, playlists) {
            let regex = null;
            const result = [];

            try {
                if (query instanceof RegExp) {
                    regex = query;
                } else {
                    query = encodeURIComponent(query);
                    regex = new RegExp('(' + query.replace(/%20/, '|') + ')', 'i');
                }
            } catch (err) {
                return callback && callback(err);
            }

            for (let i = (!err ? playlists.length - 1 : 0); i >= 0; i--) {
                if (playlists[i].name && playlists[i].name.match(regex))
                    result.push(playlists[i]);
            }

            callback && callback(err, result);
        })
    }

    /**
     * @description finds media in all playlists
     * @param {string} query keywords to look for
     * @param {function} callback called on retrieval
     */
    findMedia(query, callback) {
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        this.getPlaylists(function(err, playlists) {
            if (err)
                return callback && callback(err);

            const media = [];
            let pending = playlists.length;
            const cb = function(err, mediaArray) {
                if (err)
                    return callback && callback(err, media);
                else (Array.isArray(mediaArray) && mediaArray.length > 0)
                    media = media.concat(mediaArray);

                pending--;
                if (pending === 0)
                    callback && callback(null, media);
            };

            for (let i = pending - 1; i >= 0; i--)
                this.findMediaPlaylist(playlists[i].id, query, cb);
        });
    }

    /**
     * @description finds media in a playlist
     * @param {number} ID playlist to use for search
     * @param {string} query keywords to look for
     * @param {function} callback called on retrieval
     */
    findMediaPlaylist(id, query, callback) {
        // GET /_/playlists/<id>/media
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", [endpoints["PLAYLISTS"], '/', id, "/media"].join(''), function(err, data) {
            if (err || !data || data.length === 0)
                return callback && callback(err);

            const result = [];
            let regex = null;

            // TODO: I believe this is flawed
            try {
                if (query instanceof RegExp) {
                    regex = query;
                } else {
                    query = encodeURIComponent(query);
                    regex = new RegExp('(' + query.replace(/%20/, '|') + ')', 'i');
                }
            } catch (err) {
                return callback && callback(err);
            }

            for (let i = (!err ? data.length - 1 : 0); i >= 0; i--) {
                if (data[i].title && data[i].title.match(regex) || data[i].author && data[i].author.match(regex))
                    result.push(data[i]);
            }

            callback && callback(err, result);
        });
    }

    /**
     * @description gets playlist
     * @param {number} ID playlist to retrieve
     * @param {function} callback called on retrieval
     */
    getPlaylist(id, callback) {
        // GET /_/playlists/<id>/media
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", [endpoints["PLAYLISTS"], '/', id, "/media"].join(''), callback);
    }

    /**
     * @description gets all playlists
     * @param {function} callback called on retrieval
     */
    getPlaylists(callback) {
        // GET /_/playlists
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["PLAYLISTS"], callback);
    }

    /**
     * @description gets ignores
     * @param {function} callback called on retrieval
     */
    getIgnores(callback) {
        // GET /_/ignores
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["IGNORES"], callback);
    }

    /**
     * @description gets favorite rooms
     * @param {function} callback called on retrieval
     */
    getFavoriteRooms(callback) {
        // GET /_/rooms/favorites
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["FAVORITEROOM"], function(err, rooms) {
            if (!err) {
                // TODO: figure out what I meant back in the days.
                callback && callback(err, (!err && rooms ? rooms.map(function(room) {
                    return mapper.mapExtendedRoom(room);
                }) : []));
            } else {
                callback && callback(err);
            }
        });
    }

    /**
     * @description gets csrf token
     * @param {function} callback called on retrieval
     */
    getCSRF(callback) {
        // MitM protection, only available before login
        // GET plug.dj
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        this.query.query("GET", endpoints["CSRF"], function _gotCSRF(err, body) {
            if (!err) {
                const idx = body.indexOf("_csrf") + 9;

                body = body.substr(idx, body.indexOf('\"', idx) - idx);

                if (body.length === 60) {
                    this._log("CSRF token: " + body, 2, "magenta");
                    callback && callback(null, body);
                } else {
                    callback && callback(new Error("Couldn't find CSRF token in body, are you logged in already?"));
                }

            } else {
                callback && callback(err);
            }
        }.bind(this));
    }

    /**
     * @description sets profile message
     * @param {string} message profile message
     * @param {function} callback called on retrieval
     */
    setProfileMessage(message, callback) {
        // PUT /_/profile/blurb
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["BLURB"], { blurb: message }, function(err) {
            if (!err)
                this.state.self.blurb = message;

            callback && callback(err);
        }.bind(this), true);
    }

    /**
     * @description renames a playlist
     * @param {number} ID playlist to rename
     * @param {string} name new name
     * @param {function} callback called on retrieval
     */
    renamePlaylist(id, name, callback) {
        // PUT /_/playlist/<id>/rename
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", [endpoints["PLAYLISTS"], '/', id, '/rename'].join(''), { name: name }, callback);
    }

    /**
     * @description sets the avatar
     * @param {string} id avatar to set
     * @param {function} callback called on retrieval
     */
    setAvatar(id, callback) {
        // PUT /_/users/avatar
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["AVATAR"], { id: id }, function(err) {
            if (!err)
                this.state.self.avatarID = id;

            callback && callback(err);
        }.bind(this), true);
    }

    /**
     * @description sets the badge
     * @param {string} ID badge to set
     * @param {function} callback called on retrieval
     */
    setBadge(id, callback) {
        // PUT /_/users/badge
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["BADGE"], { id: id }, function(err) {
            if (!err)
                this.state.self.badge = id;

            callback && callback(err);
        }.bind(this), true);
    }

    /**
     * @description sets the language
     * @param {string} language ISO 3166-2 country code
     * @param {function} callback called on retrieval
     */
    setLanguage(language, callback) {
        // PUT /_/users/language
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["LANGUAGE"], { language: language }, callback);
    }

    /**
     * @description rejects a friend request
     * @param {number} ID user to reject
     * @param {function} callback called on retrieval
     */
    rejectFriendRequest(id, callback) {
        // PUT /_/friends/ignore
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["IGNOREFRIEND"], { id: id }, callback);
    }

    /**
     * @description activates a playlist
     * @param {number} ID playlist to set
     * @param {function} callback called on retrieval
     */
    activatePlaylist(id, callback) {
        // PUT /_/playlists/<id>
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["PLAYLISTS"] + '/' + id + "/activate", (err, playlist) => callback(err, playlist.activated), true);
    }

    /**
     * @description moves media in a playlist
     * @param {number} ID playlist in which the media resides
     * @param {object[]} media to sort
     * @param {number} beforeID where to insert the media at
     * @param {function} callback called on retrieval
     */
    moveMedia(id, media, beforeID, callback) {
        // PUT /_/playlists/<id>/media/move
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT",
            endpoints["PLAYLISTS"] + '/' + id + "/media/move",
            { ids: media, beforeID: beforeID }, callback);
    }

    /**
     * @description updates media info
     * @param {number} ID playlist in which the media resides
     * @param {number} mediaID media to edit
     * @param {string} author media author like artist
     * @param {string} title media title like song title
     * @param {function} callback called on retrieval
     */
    updateMedia(id, mediaID, author, title, callback) {
        // PUT /_/playlists/<id>/media/update
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT",
            endpoints["PLAYLISTS"] + '/' + id + "/media/update",
            { id: mediaID, author: author, title: title }, callback);
    }

    /**
     * @description shuffles a playlist
     * @param {number} ID playlist to shuffle
     * @param {function} callback called on retrieval
     */
    shufflePlaylist(id, callback) {
        // PUT /_/playlists/<id>/shuffle
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("PUT", endpoints["PLAYLISTS"] + '/' + id + "/shuffle", callback);
    }

    /**
     * @description adds a friend
     * @param {number} ID user to add as friend
     * @param {function} callback called on retrieval
     */
    addFriend(id, callback) {
        // POST /_/friends
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["FRIENDS"], { id: id }, function(err, data) {
            if (!err)
                this.state.self.friends.push(id);

            callback && callback(err);
        }.bind(this));
    }

    /**
     * @description deletes media
     * @param {number} ID playlist in which the media resides
     * @param {number[]} mediaIDs media to delete
     * @param {function} callback called on retrieval
     */
    deleteMedia(id, mediaIDs, callback) {
        // POST /_/playlists/<id>/media/delete
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST",
            endpoints["PLAYLISTS"] + '/' + id + "/media/delete",
            { ids: mediaIDs },
            callback);
    }

    /**
     * @description adds media to a playlist
     * @param {number} ID playlist to add the media to
     * @param {object[]} media media to add
     * @param {boolean} append append media to the end
     * @param {function} callback called on retrieval
     */
    addMedia(id, media, append, callback) {
        // POST /_/playlists/<id>/media/insert
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST",
            endpoints["PLAYLISTS"] + '/' + id + "/media/insert",
            { media: mapper.serializeMediaObjects(media), append: append },
            callback);
    }

    /**
     * @description woots a media (upvote)
     * @param {function} callback called on retrieval
     */
    woot(callback) {
        // POST /_/votes
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["VOTES"], {
            direction: 1,
            historyID: this.state.room.playback.historyID
        }, callback);
    }

    /**
     * @description mehs a media (downvote)
     * @param {function} callback called on retrieval
     */
    meh(callback) {
        // POST /_/votes
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["VOTES"], {
            direction: -1,
            historyID: this.state.room.playback.historyID
        }, callback);
    }

    /**
     * @description favorites a room
     * @param {number} ID room ID
     * @param {function} callback called on retrieval
     */
    favoriteRoom(id, callback) {
        // POST /_/rooms/favorites
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["FAVORITEROOM"], { id: id }, callback, true);
    }

    /**
     * @description deletes a notification
     * @param {number} id notification ID
     * @param {function} callback called on retrieval
     */
    deleteNotification(id, callback) {
        // DELETE /_/notifications
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["NOTIFICATION"] + id, callback);
    }

    /**
     * @description removes a friend
     * @param {number} ID user to remove
     * @param {function} callback called on retrieval
     */
    removeFriends(id, callback) {
        // DELETE /_/friends
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["FRIENDS"] + '/' + id, function(err, data) {
            if (!err) {
                for (let i = 0, l = this.state.self.friends.length; i < l; i++) {
                    if (this.state.self.friends[i].id == id) {
                        this.state.self.friends.splice(i, 1);
                        break;
                    }
                }
            }

            callback && callback(err);
        }.bind(this));
    }

    /**
     * @description retrieves the store inventory
     * @param {function} callback called on retrieval
     */
    getInventory(callback) {
        // GET /_/inventory
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["INVENTORY"], callback);
    }

    /**
     * @description retrieves all products of a type
     * @param {string} type type of product
     * @param {string} category product category
     * @param {function} callback called on retrieval
     */
    getProducts(type, category, callback) {
        // GET /_/products
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", [endpoints["PRODUCTS"], '/', type, '/', category].join(''), callback);
    }

    /**
     * @description retrieves all transactions
     * @param {function} callback called on retrieval
     */
    getTransactions(callback) {
        // GET /_/users/me/transactions
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["TRANSACTIONS"], callback);
    }

    /**
     * @description purchases a username
     * @param {string} username name to purchase
     * @param {function} callback called on retrieval
     */
    purchaseUsername(username, callback) {
        // POST /_/store/purchase/username
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["PURCHASE"] + "/username", { id: 454, username: username }, callback);
    }

    /**
     * @description purchases an item from the store
     * @param {number} ID item to purchase
     * @param {function} callback called on retrieval
     */
    purchaseItem(id, callback) {
        // POST /_/store/purchase
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["PURCHASE"], { id: id }, callback, true);
    }
}

module.exports = Plugged;
