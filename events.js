const mapper = require("./mapper");
const utils = require("./utils");

const ack = function(state) {
    this.emit(state === "1" ? this.CONN_SUCCESS : this.CONN_ERROR);
}

const advance = function(data) {
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

const ban = function(data) {
    this.emit(this.BAN, mapper.mapOwnBan(data.p));
}

const banIP = function(data) {
    this.emit(this.BAN_IP);
}

const chat = function(data) {
    const chat = mapper.mapChat(data.p);

    if (this.chat.cached) {
        this.chat.cache.push(chat);

        if (this.chat.cache.length > this.chat.cacheSize)
            this.chat.cache.shift();
    }

    const deletionQueueLength = this.chat.deletionQueue.length;

    if (deletionQueueLength > 0) {
        for (let i = deletionQueueLength; i >= 0; i--) {
            if (this.chat.deletionQueue[i].msg === chat.message) {
                this.chat.deletionQueue[i].cid = chat.cid;
                break;
            }
        }
    }

    if (chat.message.indexOf('@' + this.state.self.username) > -1)
        this.emit(this.CHAT_MENTION, chat);
    else if (chat.message.charAt(0) == '/')
        this.emit(this.CHAT_COMMAND, chat);
    else
        this.emit(this.CHAT, chat);
}

const chatDelete = function(data) {
    const chat = mapper.mapChatDelete(data.p);

    if (this.chat.cached)
        this.removeChatMessage(chat.cid, true);

    this.emit(this.CHAT_DELETE, chat);
}

const chatRateLimit = function(data) {
    this.emit(this.CHAT_RATE_LIMIT);
}

const floodAPI = function(data) {
    this.emit(this.FLOOD_API);
}

const floodChat = function(data) {
    this.emit(this.FLOOD_CHAT);
}

const gifted = function(data) {
    const gifted = mapper.mapGifted(data.p || {});
    this.emit(this.GIFTED, gifted.sender, gifted.recipient);
}

const djListCycle = function(data) {
    this.state.room.booth.shouldCycle = data.p.f;
    this.emit(this.DJ_LIST_CYCLE, mapper.mapCycle(data.p));
}

const djListLocked = function(data) {
    this.state.room.booth.isLocked = data.p.f;
    this.emit(this.DJ_LIST_LOCKED, mapper.mapLock(data.p));
}

const earn = function(data) {
    this.state.self.xp = data.p.xp;
    this.state.self.pp = data.p.pp;
    this.state.self.level = data.p.level;
    this.emit(this.EARN, mapper.mapXP(data.p));
}

const friendRequest = function(data) {
    this.emit(this.FRIEND_REQUEST, utils.decode(data.p));
}

const friendAccept = function(data) {
    this.emit(this.FRIEND_ACCEPT, utils.decode(data.p));
}

const grab = function(data) {
    const uid = data.p || -1;

    if (uid !== -1) {
        for (let i = 0, l = this.state.room.grabs.length; i < l; i++) {
            if (this.state.room.grabs[i] == uid)
                return;
        }

        this.state.room.grabs.push(uid);
    }

    this.emit(this.GRAB, uid);
}

const killSession = function(data) {
    this.emit(this.KILL_SESSION, data.p);
}

const levelUp = function(data) {
    this.state.self.level++;
    this.emit(this.LEVEL_UP, mapper.mapLevelUp(data.p));
}

const modAddDJ = function(data) {
    this.emit(this.MOD_ADD_DJ, mapper.mapModAddDJ(data.p));
}

const maintenanceMode = function(data) {
    this.emit(this.MAINTENANCE_MODE);
}

const maintenanceModeAlert = function(data) {
    this.emit(this.MAINTENANCE_MODE_ALERT);
}

const modBan = function(data) {
    this.clearUserFromLists(data.p.i);
    this.state.room.meta.population--;
    this.emit(this.MOD_BAN, mapper.mapModBan(data.p));
}

const modMoveDJ = function(data) {
    this.emit(this.MOD_MOVE_DJ, mapper.mapModMove(data.p));
}

const modMute = function(data) {
    // TODO: was a break before
    if (!data)
        return;

    const time = (data.p.d === this.MUTEDURATION.SHORT ?
        15*60 : data.p.d === this.MUTEDURATION.MEDIUM ?
        30*60 : data.p.d === this.MUTEDURATION.LONG ?
        45*60 : 15*60);
    const mute = mapper.mapMute(data.p, time);

    this.emit(this.MOD_MUTE, mute, (data.p.d ? data.p.d : this.MUTEDURATION.NONE));
}

const modRemoveDJ = function(data) {
    this.emit(this.MOD_REMOVE_DJ, mapper.mapModRemove(data.p));
}

const modSkip = function(data) {
    this.emit(this.MOD_SKIP, mapper.mapModSkip(data.p));
}

const modStaff = function(data) {
    const promotions = mapper.mapPromotions(data.p);

    if (promotions.length === 2) {
        const host = this.getUserById(this.getHostID());

        for (let i = promotions.length - 1; i >= 0; i--) {
            if (promotions[i].id == host.id) {
                host.role = promotions.splice(i, 1)[0].role;

                if (this.removeCachedUserById(host.id))
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

            if (this.removeCachedUserById(this.state.room.users[i].id))
                this.cacheUser(this.state.room.users[i]);

            break;
        }
    }

    this.emit(this.MOD_STAFF, promotions);
}

const modWaitlistBan = function(data) {
    this.emit(this.MOD_WAITLIST_BAN, mapper.mapModWaitlistBan(data.p));
}

const nameChanged = function(data) {
    this.emit(this.NAME_CHANGED);
}

const notify = function(data) {
    this.emit(this.NOTIFY, mapper.mapNotify(data.p));
}

const playlistCycle = function(data) {
    this.emit(this.PLAYLIST_CYCLE, mapper.mapPlaylistCycle(data.p));
}

const plugMessage = function(data) {
    this.emit(this.PLUG_MESSAGE, utils.decode(data.p));
}

const plugUpdate = function(data) {
    this.emit(this.PLUG_UPDATE);
}

const roomDescriptionUpdate = function(data) {
    this.state.room.meta.description = utils.decode(data.p.d);
    this.emit(this.ROOM_DESCRIPTION_UPDATE, mapper.mapRoomDescriptionUpdate(data.p));
}

const roomNameUpdate = function(data) {
    this.state.room.meta.name = utils.decode(data.p.n);
    this.emit(this.ROOM_NAME_UPDATE, mapper.mapRoomNameUpdate(data.p));
}

const roomWelcomeUpdate = function(data) {
    this.state.room.meta.welcome = utils.decode(data.p.w);
    this.emit(this.ROOM_WELCOME_UPDATE, mapper.mapRoomWelcomeUpdate(data.p));
}

const roomMinChatLevelUpdate = function(data) {
    this.emit(this.ROOM_MIN_CHAT_LEVEL_UPDATE, mapper.mapChatLevelUpdate(data.p));
}

const skip = function(data) {
    this.emit(this.SKIP, data.p);
}

const userJoin = function(data) {
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

const userLeave = function(data) {
    let user = undefined;

    // it was just a guest leaving, nothing more to do here
    if (data.p === 0) {
        this.state.room.meta.guests--;
        this.emit(this.GUEST_LEAVE);
    }

    this.state.room.meta.population--;

    for (let i = this.state.room.users.length - 1; i >= 0; i--) {
        if (this.state.room.users[i].id == data.p) {
            this.clearUserFromLists(data.p);
            user = this.state.room.users.splice(i, 1)[0];

            if (this.sleave)
                this.cacheUser(user);
        }
    }

    this.emit(this.USER_LEAVE, user);
}

const userUpdate = function(data) {
    this.emit(this.USER_UPDATE, mapper.mapUserUpdate(data.p));
}

const vote = function(data) {
    const vote = mapper.pushVote(data.p);
    if (!this._checkForPreviousVote(vote))
        this.emit(this.VOTE, vote);
}

const waitlistUpdate = function(data) {
    this.emit(this.WAITLIST_UPDATE, data.p);
    this.state.room.booth.waitlist = data.p;
}

exports.ack = ack;
exports.advance = advance;
exports.ban = ban;
exports.banIP = banIP;
exports.chat = chat;
exports.chatDelete = chatDelete;
exports.chatRateLimit = chatRateLimit;
exports.floodAPI = floodAPI;
exports.floodChat = floodChat;
exports.gifted = gifted;
exports.djListCycle = djListCycle;
exports.djListLocked = djListLocked;
exports.earn = earn;
exports.friendRequest = friendRequest;
exports.friendAccept = friendAccept;
exports.grab = grab;
exports.killSession = killSession;
exports.levelUp = levelUp;
exports.modAddDJ = modAddDJ;
exports.maintenanceMode = maintenanceMode;
exports.maintenanceModeAlert = maintenanceModeAlert;
exports.modBan = modBan;
exports.modMoveDJ = modMoveDJ;
exports.modMute = modMute;
exports.modRemoveDJ = modRemoveDJ;
exports.modSkip = modSkip;
exports.modStaff = modStaff;
exports.modWaitlistBan = modWaitlistBan;
exports.nameChanged = nameChanged;
exports.notify = notify;
exports.playlistCycle = playlistCycle;
exports.plugMessage = plugMessage;
exports.plugUpdate = plugUpdate;
exports.roomDescriptionUpdate = roomDescriptionUpdate;
exports.roomNameUpdate = roomNameUpdate;
exports.roomWelcomeUpdate = roomWelcomeUpdate;
exports.roomMinChatLevelUpdate = roomMinChatLevelUpdate;
exports.skip = skip;
exports.userJoin = userJoin;
exports.userLeave = userLeave;
exports.userUpdate = userUpdate;
exports.vote = vote;
exports.waitlistUpdate = waitlistUpdate;
