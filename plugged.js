const EventEmitter = require("events").EventEmitter;
const WebSocket = require("ws");
const util = require("util");

const config = require("./conf/config");
const events = require("./events");
var mapper = require("./mapper");
const Query = require("./query");
const utils = require("./utils");

const baseURL = config.provider;

const endpoints = {
    /*--------------- GET ---------------*/
    CSRF: baseURL +         "/_/mobile/init",
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
    SOS: baseURL +          "/_/rooms/sos",
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

        this.log = options.log;
        this.messageProc = options.messageProc || this.defaultMessageProc;
        this.retryLogin = options.retryLogin || true;

        this._eventProcessor = this._eventProcessor.bind(this);
        this._keepAlive = this._keepAlive.bind(this);
        this.state = mapper.createState(options.state);
        this.query = new Query();
        this.chat = {
            queue: [],
            deletionQueue: [],
            cache: [],
            cacheSize: 256,
            cached: false,
            timeout: 0,
            id: -1
        };
        this.heartbeat = {
            rate: 20,
            timeout: 60,
            last: 0,
            id: -1
        };
        this.verbosity = options.verbosity || 0;
        this.cleanCacheInterval = -1;
        this.sock = null;
        this.auth = null;
        this.sleave = false;                    /* userleave cache toggle */

        this.BANREASON = {
            VIOLATING_COMMUNITY_RULES:  1,
            VERBAL_ABUSE:               2,
            SPAMMING:                   3,
            OFFENSIVE_LANGUAGE:         4,
            NEGATIVE_ATTITUDE:          5
        };

        this.BOOTHBANREASON = {
            SPAMMING:           1,
            VERBAL_ABUSE:       2,
            OFFENSIVE_VIDEOS:   3,
            INAPPROPIATE_GENRE: 4,
            NEGATIVE_ATTITUDE:  5
        };

        this.BANDURATION = {
            HOUR:   'h',
            DAY:    'd',
            PERMA:  'f'
        };

        this.BOOTHBANDURATION = {
            QUARTER:    's',
            HOUR:       'm',
            DAY:        'l',
            FOREVER:    'f'
        };

        this.MUTEDURATION = {
            NONE:   'o',
            SHORT:  's',
            MEDIUM: 'm',
            LONG:   'l'
        };

        this.USERROLE = {
            NONE:       0,
            RESIDENTDJ: 1000,
            BOUNCER:    2000,
            MANAGER:    3000,
            COHOST:     4000,
            HOST:       5000
        };

        this.GLOBALROLE = {
            NONE:               0,
            BRAND_AMBASSADOR:   3000,
            ADMIN:              5000
        };

        this.CACHE = {
            DISABLE:    0,
            ENABLE:     1,
            ONLY:       2
        };

        /*===== GENERAL EVENTS =====*/
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
        this.USER_LEAVE = "userLeave";
        this.FLOOD_CHAT = "floodChat";
        this.MOD_MOVE_DJ = "modMoveDJ";
        this.GUEST_LEAVE = "guestLeave";
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
        this.MOD_WAITLIST_BAN = "modWaitlistBan";
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
            this._log(1, "socket is not opened!");
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

                this._log(0, "couldn't send message. " + err.join(err.length > 1 ? ", " : ''));
            }
        }

        return false;
    }

    /**
     * @description check function that gets called to see if the connection to the server is still alive
     * if it detects that the server hasn't responded for a while it will fire a CONN_WARNING
     * This will happen 3 times before the CONN_PART event will be fired
     */
    _keepAlive() {
        if (Date.now() - this.heartbeat.last >= this.heartbeat.timeout * 1000) {
            // TODO: change style of messages
            this._log(1, `haven't received a heartbeat from host for more than ${this.heartbeat.timeout} seconds, is it on fire?`);
            // save meta information of the room since clearState erases all data
            const meta = this.getRoomMeta();
            this._clearState();
            this.emit(this.CONN_PART, meta);
        } else {
            clearTimeout(this.heartbeat.id);
            this.heartbeat.id = setTimeout(this._keepAlive, this.heartbeat.rate * 1000);

            if (Date.now() - this.heartbeat.last >= this.heartbeat.rate * 1000)
                this.emit(this.CONN_WARNING, (Date.now() - this.heartbeat.last) / 1000);
        }
    }

    /**
     * @description updates the heartbeat
     */
    _heartbeat() {
        this.heartbeat.last = Date.now();
        clearTimeout(this.heartbeat.id);
        this.heartbeat.id = setTimeout(this._keepAlive, this.heartbeat.rate * 1000);
    }

    /**
     * @description internal logging function that calls the invoked logger
     * @param {number} verbosity number defining the verbosity of the message
     * @param {*} msg the message to log
     */
    _log(verbosity, msg) {
        if (verbosity <= this.verbosity)
            this.log && this.log(msg);
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
        if (this.chat.id !== -1)
            return;

        if (this.chat.queue.length > 0) {
            if (lastMessage + this.chat.timeout <= Date.now()) {
                const msg = this.chat.queue.shift();

                if (msg.deleteTimeout > 0) {
                    this.chat.deletionQueue.push({
                        msg: msg.message,
                        cid: -1
                    });
                }

                if (!this._sendMessage("chat", msg.message)) {
                    this.chat.queue.unshift(msg);
                    this._log(1, "message was put back into the queue");

                    if (msg.deleteTimeout > 0)
                        this.chat.deletionQueue.pop();

                    return;
                } else {
                    if (msg.timeout >= 0) {
                        setTimeout(
                            this._removeChatMessageByDelay.bind(this),
                            msg.timeout,
                            msg.message
                        );
                    }

                    if (this.chat.timeout < CHAT_TIMEOUT_MAX)
                        this.chat.timeout += CHAT_TIMEOUT_INC;
                }
            }

            setTimeout(this._processChatQueue.bind(this), this.chat.timeout, Date.now());
        } else {
            this.chat.id = setTimeout(() => {
                this.chat.id = -1;

                if (this.chat.queue.length > 0)
                    this._processChatQueue();
                else
                    this.chat.timeout = 0;
            }, 200);
        }
    }

    /**
     * @description removes a chat message after a defined period of time
     * @param {string} message message to be send
     */
    _removeChatMessageByDelay(message) {
        if (typeof message !== "string") {
            this._log(2, `message \"${message}\" is not of type string`);
            return;
        }

        let deleted = this._removeChatMessage(msg => {
            return msg.message === message;
        }, false, 1);

        if (deleted > 0)
            this._log(1, `delayed deletion of message \"${message}\"`);
        else
            this._log(1, `could not delete message \"${message}\"`);
    }

    /**
     * @describe deletes chat messages biased on a compare function
     * @param {function} compare returns cid of message to be deleted
     * @param {string} identifier data to use for compare
     * @param {boolean} cacheOnly [cacheOnly=false] clears only the cache when true
     * @param {number=} count how many messages it should remove
     * @returns {number} the amount of deleted messages
     */
    _removeChatMessage(compare, cacheOnly = false, count = -1) {
        if (cacheOnly === this.CACHE.ONLY && !this.chat.cached) {
            this._log(1, "cache only does only work with enabled chat cache");
            return 0;
        }

        if (typeof compare !== "function") {
            this._log(1, "compare parameter has to be of type function");
            return 0;
        }

        let deletedMessages = 0;
        let cid = null;

        for (let i = this.chat.cache.length - 1; i >= 0; i--) {
            cid = compare(this.chat.cache[i]);

            if (cid) {
                this.deleteMessage();
                deletedMessages++;

                // boolean comparison ends early when count is -1
                // so it could be flatted to one if branch
                if (count > -1 && (--count) == 0)
                    break;
            }
        }

        return deletedMessages;
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
        this._clearHeartbeat();
        this.query.flushQueue();
        this.state = mapper.createState();

        this.sock.close();
        this.sock.removeAllListeners();

        this.sock = null;
        this.auth = null;
    }

    /**
     * @description clears the heartbeat state
     */
    _clearHeartbeat() {
        if (this.heartbeat.id !== -1)
            clearTimeout(this.heartbeat.id);

        this.heartbeat.id = -1;
        this.heartbeat.last = 0;
    }

    /**
     * @description gets the auth token from plug
     * @param {object} data placeholder
     * @param {function} callback function to be called on retrieval
     */
    _getAuthToken(data, callback) {
        this._log(1, "getting auth token...");
        this.getAuthToken(function(err, token) {
            if (!err)
                this.auth = token;

            callback && callback(err, token);
        });
    }

    /**
     * @description sets up the websocket and basic data
     */
    _loggedIn(callback) {
        this._connectSocket();
        this._log(1, "logged in");
        this.requestSelf(callback);
    }

    /**
     * @description login with the credentials and csrf token given
     * @param {object} credentials login data to use
     * @param {function} callback function to call when done
     * @param {number=} tries number of login tries
     */
    _login(credentials, callback, tries = 0) {
        const cb = err => {
            if (!err) {
                this._loggedIn(callback);
            } else {
                this._log(0, err);

                if (this.retryLogin && tries <= 2) {
                    this._log(0, "retrying now...");
                    this._login(credentials, callback, tries++);
                } else {
                    this._log(0, [
                        "failed to log in with \"",
                        (credentials.email || credentials.userID),
                        "\""
                    ].join(''));
                    callback(err);
                }
            }
        };

        utils.waterfall([
            this._getCSRF,
            this._setLogin,
            this._getAuthToken
        ], cb, this, null, credentials);
    }

    /**
     * @description initializes the socket connection and checks whether a connection has already been made
     */
    _connectSocket() {
        if (this.sock) {
            if (this.sock.readyState !== WebSocket.OPEN)
                this._log(1, "sock is already instantiated but not open");
            else
                this._log(1, "sock is already instantiated and open");

            return;
        }

        this.sock = new WebSocket(config.socket, {
            origin: "https://plug.dj"
        });

        /* SOCK OPENED */
        this.sock.on("open", () => {
            this._log(3, "socket opened");
            this.emit(this.SOCK_OPEN);
            this._sendMessage("auth", this.auth);
            this._heartbeat.call(this);
        });

        /* SOCK CLOSED */
        this.sock.on("close", () => {
            this._log(3, "sock closed");
            // make sure to clean up if the socket has been closed forcibly
            this._clearHeartbeat();

            this._log(3, "sock closed");
            this.emit(this.SOCK_CLOSED);
        });

        /* SOCK ERROR */
        this.sock.on("error", err => {
            this._log(3, "sock error");
            this.emit(this.SOCK_ERROR, err);
        });

        /* SOCK MESSAGE */
        this.sock.on("message", this._eventProcessor);
    }

    /**
     * @description processes the events received by the websocket
     * @param {string} msg message the server sent as a string
     * @param {string} flags flags sent with the packet
     */
    _eventProcessor(msg, flags) {
        if (typeof msg !== "string") {
            this._log(3, "socket received message that isn't a string");
            this._log(3, msg);
            return;
        }

        // can only occur when it's really a ping message
        if (msg.charAt(0) === 'h') {
            this._heartbeat();
            return;
        }

        const data = JSON.parse(msg)[0];

        if (events.hasOwnProperty(data.a)) {
            events[data.a].call(this, data);
        } else {
            this._log(
                0,
                "An unknown action appeared!\nPlease report this to https://www.github.com/SooYou/plugged\nit's super effective!"
            );
            this._log(0, data);
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
        this.chat.cache = [];
    }

    /**
     * @description clears the queue
     */
    clearChatQueue() {
        this.chat.queue = [];
    }

    /**
     * @description gets all messages of a user
     *
     * @param {string} username name of a user
     * @returns {string[]} list of all their messages
     */
    getChatByUsername(username) {
        if (!this.chat.cached) {
            this._log(1, "chat is not cached, nothing found!");
            return [];
        }

        const messages = [];
        username = username.toLowerCase();

        for (let i = this.chat.cache.length - 1; i >= 0; i--) {
            if (this.chat.cache[i].username.toLowerCase() === username)
                messages.push(this.chat.cache[i]);
        }

        return messages;
    }

    /**
     * @description gets chat log
     * @returns {string[]} time sorted array of all chat messages
     */
    getChat() {
        return this.chat.cache;
    }

    /**
     * @description removes all messages of a user
     * @param {string} username name of a user
     * @param {boolean} [cacheOnly=false] clears only the cache when true
     * @returns {boolean} true when messages have been deleted, false if none were found
     */
    removeChatMessagesByUser(username, cacheOnly = false) {
        if (!username) {
            this._log(1, "username has to be defined");
            return false;
        }

        if (typeof username !== "string") {
            this._log(1, "username needs to be a string");
            return false;
        }

        username = username.toLowerCase();

        let deletedMessages = this._removeChatMessage(msg => {
            return msg.username.toLowerCase() === username;
        }, cacheOnly);

        this._log(3, `deleted ${deletedMessages} messages from user ${username}`);

        return deletedMessages > 0 ? true : false;
    }

    /**
     * @description removes a message
     * @param {string} cid unique message ID
     * @param {boolean} [cacheOnly=false] clears only the log when true
     * @returns {boolean} true when messages have been deleted, false if none were found
     */
    removeChatMessage(cid, cacheOnly = false) {
        if (!cid) {
            this._log(1, "chat id has to be defined");
            return false;
        }

        if (typeof cid !== "string") {
            this._log(1, "chat id has to be of type string");
            return false;
        }

        let deletedMessages = this._removeChatMessage(msg => {
            return msg.cid === cid;
        }, cacheOnly, 1);

        this._log(3, `deleted ${deletedMessages} messages from user ${username}`);

        return deletedMessages > 0 ? true : false;
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
        return (this.chat.cache = enable);
    }

    /**
     * @description checks if chat is being cached
     * @returns {boolean} indicating status
     */
    isChatCached() {
        return this.chat.cache;
    }

    /**
     * @description sets the chat cache size. the default size is 256 messages
     * @param {number} size size of the cache in messages
     * @returns {number} the size of the cache
     */
    setChatCacheSize(size) {
        if (typeof size === "number" && size >= 0)
            return this.chat.cacheSize = size;
        else
            return this.chat.cacheSize;
    }

    /**
     * @returns the chat cache size
     */
    getChatCacheSize() {
        return this.chat.cacheSize;
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
     * @description sets the time in between heartbeats
     * @param {number} time amount of time per heartbeat in seconds
     * @throws {Error} if time is not of type number
     * @throws {Error} if number is not greater than zero
     */
    setHeartbeatRate(time) {
        if (typeof time !== "number")
            throw new Error("time has to be of type number");

        if (time <= 0)
            throw new Error("time has to be greater zero");

        this.heartbeat.rate = time;
    }

    /**
     * @description gets the time in between heartbeats
     * @returns {number} time in between heartbeats in seconds
     */
    getHeartbeatRate() {
        return this.heartbeat.rate;
    }

    /**
     * @description sets the maximum connection timeout
     * @param {number} time until connection is lost
     * @throws {Error} if time is not of type number
     * @throws {Error} if number is not greater than zero
     */
    setMaxTimeout(time) {
        if (typeof time !== "number")
            throw new Error("time has to be of type number");

        if (time <= 0)
            throw new Error("time has to be greater zero");

        this.heartbeat.timeout = time;
    }

    /**
     * @description gets the maximum time until the connection is lost
     * @returns {number} maximum time until the connection is lost in seconds
     */
    getMaxTimeout() {
        return this.heartbeat.timeout;
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
     * @param {number=} deleteTimeout delay in ms until message is deleted.
     * NOTE: a delay above 2 seconds is recommended.
     * @throws {Error} message must be of type string
     * @throws {Error} deleteTimeout must be of type number
     * @throws {Error} message processor must return an array of strings
     * @returns {string[]} the formatted message
     */
    sendChat(message, deleteTimeout = -1) {
        if (typeof message !== "string")
            throw new Error("message must be of type string");

        if (typeof deleteTimeout !== "number")
            throw new Error("deleteTimeout must be of type number");

        if (!message || message.length <= 0) {
            this._log(1, "no message given");
            return;
        }

        message = this.messageProc(message);

        if (!Array.isArray(message))
            throw new Error("messageprocessor does not return an array of strings!");

        for (let i = 0, l = message.length; i < l; i++) {
            this.chat.queue.push({
                message: message[i],
                timeout: deleteTimeout
            });
        }

        if (this.chat.timeout === 0)
            this._processChatQueue();

        return message;
    }

    /**
     * @description hooks up a logging library into plug
     * @param {function} log the function that receives the message as a parameter
     * @returns {boolean} true when logger has been registered
     */
    invokeLogger(log) {
        if (typeof log === "function") {
            this.log = log;
            return true;
        }

        return false;
    }

    /**
     * @description defines verbosity to use for logging
     * @param {number} verbosity sets verbosity
     */
    setVerbosity(verbosity) {
        if (typeof verbosity !== "number")
            throw new Error("verbosity has to be of type number");

        this.verbosity = verbosity;
    }

    /**
     * @returns {number} verbosity
     */
    getVerbosity() {
        return this.verbosity;
    }

    /**
     * @description log into https://www.plug.dj
     * @param {object} credentials formatted login info or session token
     * @param {function} callback called after logging in
     */
    login(credentials, callback) {
        if (typeof credentials !== "object" || credentials == null)
            return callback && callback(new Error("credentials has to be of type object"), null);

        if (!credentials.hasOwnProperty("session")) {
            const errorMsg = [];
            let flag = 0;

            flag |= (credentials.hasOwnProperty("email") ? 1 << 0 : 0);
            flag |= (credentials.hasOwnProperty("password") ? 1 << 1 : 0);
            flag |= (credentials.hasOwnProperty("accessToken") ? 1 << 2 : 0);
            flag |= (credentials.hasOwnProperty("userID") ? 1 << 3 : 0);

            const hasEmailCredentials = ((flag & 0x03) === 0x03);
            const hasFacebookCredentials = ((flag & 0x0C) === 0x0C);
            const partialEmail = (((flag & 0x03) !== 0x00) && ((flag & 0x03) !== 0x03));
            const partialFacebook = (((flag & 0x0C) !== 0x00) && ((flag & 0x0C) !== 0x0C));

            // doing this with hasOwnProperty would have been possible but would be a real mess
            // missing email but no facebook credentials
            if (partialEmail && !hasFacebookCredentials) {
                if (!(flag & 0x01))
                    errorMsg.push("email missing");

                if (!(flag & 0x02))
                    errorMsg.push("password missing");

            }
            // missing facebook but no email credentials
            else if (partialFacebook && !hasEmailCredentials) {
                if (!(flag & 0x04))
                    errorMsg.push("accessToken missing");

                if (!(flag & 0x08))
                    errorMsg.push("userID missing");
            }
            // credentials for both are set
            else {
                // nullify malformed email credentials
                if (partialEmail) {
                    delete credentials.email;
                    delete credentials.password;
                // nullify malformed facebook credentials
                } else if (partialFacebook) {
                    delete credentials.userID;
                    delete credentials.accessToken;
                }
                // both are malformed
                else if (partialEmail && partialFacebook) {
                    errorMsg.push("credentials are malformed");
                }
            }

            if (errorMsg.length > 0)
                return callback && callback(new Error(errorMsg.join(", ")), null);

            // requests a new cookie jar
            if (!this.getJar())
                this.setJar(null);

            this._log(2, `logging in with account: \"${(credentials.email || credentials.userID)}\"...`);

            this._login(credentials, callback);
        } else {
            this._log(2, "trying to resume session...");
            this.auth = credentials.session;
            this._loggedIn(callback);
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
                this._log(0, "you seem to be logged in already");
            else
                this._log(0, "the socket is already instantiated");
            return;
        }

        this._log(1, `Joining room \"${room}\" as a guest...`);
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
                        callback && callback(null, stats);
                    } else {
                        callback && callback(err);
                    }
                });
            } else {
                const err = new Error("couldn't join room \"" + room + "\" as a guest")
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
            this._log(1, "slug has to be defined");
            return callback && callback(new Error("slug has to be defined"), null);
        }

        if (!this.auth || this.state.self.guest) {
            this._log(1, "joining plug in guest mode, functions are highly limited!");
            return this.guest(slug, callback);
        }

        this.joinRoom(slug, function _joinedRoom(err) {
            if (!err) {
                this.getRoomStats(function(err, stats) {

                    if (!err) {
                        //clear all room related data
                        this.clearUserCache();
                        this.clearChatQueue();
                        this.clearChatCache();
                        this.query.flushQueue();

                        this.state.room = mapper.mapRoom(stats);
                        this.state.self.role = stats.role;
                        callback(null, this.state.room);
                    } else {
                        this.state.room = mapper.mapRoom();
                        this.state.self.role = USERROLE.NONE;
                        callback(err);
                    }
                });

            } else {
                this.state.room = mapper.mapRoom();
                this.state.self.role = USERROLE.NONE;
                callback(err);
            }
        });
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
        return this.getUserById(this.state.room.booth.dj, this.CACHE.DISABLE);
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
        if (typeof user === "object" && typeof this.getUserById(user.id, this.CACHE.ONLY) === null) {
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
    removeCachedUserById(id) {
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
    removeCachedUserByUsername(username) {
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
        query = query || "";

        if (typeof page === "function") {
            callback = page;
            page = 0;
        } else if (typeof limit === "function") {
            callback = limit;
            limit = 50;
        }

        if (typeof page !== "number")
            page = 0;

        if (typeof limit !== "number")
            limit = 50;

        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("GET", endpoints["ROOMS"] + `?q=${query}&page=${page}&limit=${limit}`, function _sanitizeRooms(err, rooms) {
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
        return this.findRooms("", page, limit, callback);
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
     * @param {object} credentials login data to use
     * @param {string} csrf cross site request forgery token
     * @param {function} callback called on retrieval
     */
    _setLogin(credentials, csrf, callback) {
        // POST /_/auth/login
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        this._log(1, "setting login data...");

        if (credentials.hasOwnProperty("email")) {
            this.query.query("POST", endpoints["LOGIN"], {
                "csrf": csrf,
                "email": credentials.email,
                "password": credentials.password
            }, callback);
        } else if (credentials.hasOwnProperty("accessToken")) {
            this.query.query("POST", endpoints["FACEBOOK"], {
                "csrf": csrf,
                "accessToken": credentials.accessToken,
                "userID": credentials.userID
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
        let _media;

        if (typeof media === "function") {
            callback = media.bind(this);
            media = null;
        }

        if (typeof media === "object" && media !== null) {
            _media = mapper.serializeMediaObjects(media);
        }

        this.query.query("POST", endpoints["PLAYLISTS"],
            { name: name, media: _media },
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
     * @description sends an SOS message to the admins and global moderators of plug.dj
     * @param {string} message send to the global moderators
     * @param {function} callback called on retrieval
     */
    sendSOS(message, callback) {
        // POST /_/rooms/sos
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["SOS"], {
            message: encodeURIComponent(message)
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
     * @description Bans a user from the booth
     * @param {number} userID user to ban
     * @param {enum} time duration of ban
     * @param {enum} reason why user was banned
     * @param {function} callback
     */
    banBooth(userID, time, reason, callback) {
        // POST /_/booth/waitlistban
        if (typeof reason === "function") {
            callback = reason;
            reason = 1;
        }

        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("POST", endpoints["MOD_WAITLIST_BAN"], {
            userID: userID,
            reason: reason,
            duration: time
        }, callback, true);
    }

    /**
     * @description removes a previously registered ban
     * @param {number} userID user to unban
     * @param {function} callback
     */
    deleteBanBooth(userID, callback) {
        // DELETE /_/booth/waitlistban

        callback = (typeof callback === "function" ? callback.bind(this) : undefined);
        this.query.query("DELETE", endpoints["MOD_WAITLIST_BAN"] + "/" + userID, callback, true);
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
                this._log(1, "Logged out.");
                callback && callback(null);
            } else {
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
     * @description gets playback
     * @returns playback object
     */
    getPlayback() {
        return this.state.room.playback;
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
     * @param {object} credentials login data to use
     * @param {function} callback called on retrieval
     */
    _getCSRF(credentials, callback) {
        // MitM protection, only available before login
        // GET plug.dj
        callback = (typeof callback === "function" ? callback.bind(this) : undefined);

        this.query.query("GET", endpoints["CSRF"], (err, data) => {
            if (!err) {
                if (typeof data !== "undefined" && typeof data.c !== "undefined") {
                    callback && callback(null, credentials, data.c);
                } else {
                    callback && callback(new Error("Couldn't get CSRF token"));
                }
            } else {
                callback && callback(err);
            }
        }, true);
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
    removeFriend(id, callback) {
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
        this.query.query("GET", endpoints["TRANSACTIONS"], (err, transactions) => {
            const ta = [];

            if (!err) {
                for (let i = 0; i < transactions.length; i++)
                    ta.push(mapper.mapTransaction(transactions[i]));

                callback && callback(null, ta);
            }
            else {
                callback && callback(err);
            }
        });
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
