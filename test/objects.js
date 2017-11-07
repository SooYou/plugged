const chai = require("chai");
const expect = chai.expect;

const testUser = (parse, user) => {
    expect(user).to.contain.all.keys([
        "username",
        "avatarID",
        "language",
        "guest",
        "slug",
        "joined",
        "level",
        "gRole",
        "sub",
        "id"
    ]);

    expect(user.username).to.be.a("string");
    expect(user.avatarID).to.be.a("string");
    expect(user.language).to.be.a("string");
    expect(user.slug).to.be.a("string");
    expect(user.joined).to.be.a("string");
    expect(user.level).to.be.a("number");
    expect(user.gRole).to.be.a("number");
    expect(user.sub).to.be.a("number");
    expect(user.id).to.be.a("number");

    if (parse) {
        expect(user).to.contain.all.keys([
            "blurb",
            "role",
            "silver"
        ]);

        expect(user.blurb).to.be.a("string");
        expect(user.role).to.be.a("number");
        expect(user.silver).to.be.a("boolean");
    }
};


const testMedia = (parse, media) => {
    expect(media).to.have.all.keys([
        "author",
        "title",
        "image",
        "format",
        "duration",
        "cid",
        "id"
    ]);

    expect(media.author).to.be.a("string");
    expect(media.title).to.be.a("string");
    expect(media.image).to.be.a("string");
    expect(media.format).to.be.a("number");
    expect(media.duration).to.be.a("number");
    expect(media.cid).to.be.a("string");
    expect(media.id).to.be.a("number");
};

const testRoom = (parse, room) => {
    expect(room).to.have.all.keys([
        "booth",
        "fx",
        "grabs",
        "meta",
        "playback",
        "role",
        "users",
        "votes"
    ]);

    if (parse) {
        expect(room.grabs).to.be.an("array");
        expect(room.votes).to.be.an("array");
    } else {
        expect(room).to.contain.all.keys(["mutes"]);
        expect(room.grabs).to.be.an("object");
        expect(room.votes).to.be.an("object");
    }

    expect(room.booth).to.be.an("object");
    expect(room.fx).to.be.an("array");
    expect(room.meta).to.be.an("object");
    expect(room.playback).to.be.an("object");
    expect(room.role).to.be.a("number");
    expect(room.users).to.be.an("array");
};

const testExtendedRoom = (parse, room) => {
    expect(room).to.have.all.keys([
        "capacity",
        "cid",
        "dj",
        "favorite",
        "format",
        "host",
        "id",
        "image",
        "media",
        "name",
        "nsfw",
        "guests",
        "population",
        "private",
        "slug"
    ]);

    if(typeof room.dj !== "string") {
        expect(room.dj).to.be.an("object");
        testUser(room.dj);
    }

    if(parse) {
        expect(room.capacity).to.be.a("number");
        expect(room.population).to.be.a("number");
        expect(room.format).to.be.a("number");
    } else {
        expect(room.population).to.be.a("string");
        expect(room.format).to.be.a("string");
    }

    expect(room.favorite).to.be.a("boolean");
    expect(room.host).to.be.a("string");
    expect(room.cid).to.be.a("string");
    expect(room.id).to.be.a("number");
    expect(room.image).to.be.a("string");
    expect(room.media).to.be.a("string");
    expect(room.name).to.be.a("string");
    expect(room.private).to.be.a("boolean");
    expect(room.slug).to.be.a("string");
};

const testPlaylist = (parse, playlist) => {
    expect(playlist).to.have.all.keys([
        "active",
        "count",
        "id",
        "name"
    ]);

    expect(playlist.active).to.be.a("boolean");
    expect(playlist.count).to.be.a("number");
    expect(playlist.id).to.be.a("number");
    expect(playlist.name).to.be.a("string");
};

const testSelf = (parse, self) => {
    testUser(true, self);

    expect(self).to.contain.all.keys([
        "notifications",
        "settings",
        "ignores",
        "friends",
        "pw",
        "xp",
        "pp"
    ]);

    expect(self.notifications).to.be.an("array");
    expect(self.settings).to.be.an("object");
    expect(self.ignores).to.be.an("array");
    expect(self.friends).to.be.an("array");
    expect(self.pw).to.be.a("boolean");
    expect(self.xp).to.be.a("number");
    expect(self.pp).to.be.a("number");
};

const testMute = (parse, mute) => {
    expect(mute).to.contain.all.keys([
        "expires",
        "moderator",
        "moderatorID",
        "reason",
        "username"
    ]);

    expect(mute.expires).to.be.a("string");
    expect(mute.moderator).to.be.a("string");
    expect(mute.moderatorID).to.be.a("number");
    expect(mute.reason).to.be.a("number");
    expect(mute.username).to.be.a("string");
};

const testGifted = (parse, gift) => {
    if (parse) {
        expect(gift).to.contain.all.keys([
            "sender",
            "recipient"
        ]);

        expect(gift.sender).to.be.a("string");
        expect(gift.recipient).to.be.a("string");
    } else {
        expect(gift).to.contain.all.keys([
            "s",
            "r"
        ]);

        expect(gift.s).to.be.a("string");
        expect(gift.r).to.be.a("string");
    }
};

const testModAddDJ = (parse, add) => {
    if (parse) {
        expect(add).to.contain.all.keys([
            "moderator",
            "moderatorID",
            "username"
        ]);

        expect(add.moderator).to.be.a("string");
        expect(add.moderatorID).to.be.a("number");
        expect(add.username).to.be.a("string");
    } else {
        expect(add).to.contain.all.keys([
            "m",
            "mi",
            "t"
        ]);

        expect(add.m).to.be.a("string");
        expect(add.mi).to.be.a("string");
        expect(add.t).to.be.a("string");
    }
};

const testModMove = (parse, move) => {
    if (parse) {
        expect(move).to.contain.all.keys([
            "moderator",
            "moderatorID",
            "username",
            "oldIndex",
            "newIndex"
        ]);

        expect(move.moderator).to.be.a("string");
        expect(move.moderatorID).to.be.a("number");
        expect(move.username).to.be.a("string");
        expect(move.oldIndex).to.be.a("number");
        expect(move.newIndex).to.be.a("number");
    } else {
        expect(move).to.contain.all.keys([
            "m",
            "mi",
            "u",
            "o",
            "n"
        ]);

        expect(move.m).to.be.a("string");
        expect(move.mi).to.be.a("number");
        expect(move.u).to.be.a("string");
        expect(move.o).to.be.a("number");
        expect(move.n).to.be.a("number");
    }
};

const testNotify = (parse, notify) => {
    expect(notify).to.contain.all.keys([
        "action",
        "id",
        "timestamp",
        "value"
    ]);

    expect(notify.action).to.be.a("string");
    expect(notify.id).to.be.a("number");
    expect(notify.timestamp).to.be.a("string");
    expect(notify.value).to.be.a("string");
};

const testPlayback = (parse, playback) => {
    expect(playback).to.contain.all.keys([
        "media",
        "historyID",
        "playlistID",
        "startTime"
    ]);

    expect(playback.media).to.be.an("object");
    testMedia(parse, playback.media);
    expect(playback.historyID).to.be.a("string");
    expect(playback.playlistID).to.be.a("number");
    expect(playback.startTime).to.be.a("string");
};

const testHistoryEntry = (parse, entry) => {
    expect(entry).to.contain.all.keys([
        "id",
        "media",
        "room",
        "score",
        "timestamp",
        "user"
    ]);

    expect(entry.id).to.be.a("string");
    expect(entry.media).to.be.an("object");
    expect(entry.room).to.be.an("object");
    expect(entry.score).to.be.an("object");
    expect(entry.timestamp).to.be.a("string");
    expect(entry.user).to.be.an("object");

    expect(entry.room).to.contain.all.keys([
        "name",
        "private",
        "slug"
    ]);

    expect(entry.room.name).to.be.a("string");
    expect(entry.room.private).to.be.a("boolean");
    expect(entry.room.slug).to.be.a("string");

    testMedia(parse, entry.media);
    testScore(parse, entry.score);

    expect(entry.timestamp).to.be.a("string");

    expect(entry.user).to.contain.all.keys([
        "id",
        "username"
    ]);

    expect(entry.user.id).to.be.a("number");
    expect(entry.user.username).to.be.a("string");
};

const testScore = (parse, score) => {
    expect(score).to.contain.all.keys([
        "grabs",
        "listeners",
        "negative",
        "positive",
        "skipped"
    ]);

    expect(score.grabs).to.be.a("number");
    expect(score.listeners).to.be.a("number");
    expect(score.negative).to.be.a("number");
    expect(score.positive).to.be.a("number");
    expect(score.skipped).to.be.a("number");
};

const testFriendRequest = (parse, request) => {
    expect(request).to.contain.all.keys([
        "username",
        "avatarID",
        "timestamp",
        "joined",
        "status",
        "gRole",
        "level",
        "id"
    ]);

    expect(request.username).to.be.a("string");
    expect(request.avatarID).to.be.a("string");
    expect(request.timestamp).to.be.a("string");
    expect(request.joined).to.be.a("string");
    expect(request.status).to.be.a("number");
    expect(request.gRole).to.be.a("number");
    expect(request.level).to.be.a("number");
    expect(request.id).to.be.a("number");
};

const testVote = (parse, vote) => {
    if (parse) {
        expect(vote).to.contain.all.keys([
            "id",
            "direction"
        ]);

        expect(vote.id).to.be.a("number");
        expect(vote.direction).to.be.a("number");
    } else {
        expect(vote).to.contain.all.keys([
            "i",
            "v"
        ]);

        expect(vote.i).to.be.a("number");
        expect(vote.v).to.be.a("number");
    }
};

const testSettings = settings => {
    expect(settings).to.contain.all.keys([
        "volume",
        "avatarcap",
        "dancing",
        "streamDisabled",
        "chatSound",
        "chatTranslation",
        "chatTimestamps",
        "emoji",
        "notifyDJ",
        "notifyFriendJoin",
        "notifyScore",
        "tooltips",
        "videoOnly"
    ]);

    expect(settings.volume).to.be.a("number");
    expect(settings.avatarcap).to.be.a("number");
    expect(settings.dancing).to.be.a("number");
    expect(settings.streamDisabled).to.be.a("number");
    expect(settings.chatSound).to.be.a("number");
    expect(settings.chatTranslation).to.be.a("number");
    expect(settings.chatTimestmaps).to.be.a("number");
    expect(settings.emoji).to.be.a("number");
    expect(settings.notifyDJ).to.be.a("number");
    expect(settings.notifyFriendJoin).to.be.a("number");
    expect(settings.notifyScore).to.be.a("number");
    expect(settings.tooltips).to.be.a("number");
    expect(settings.videoOnly).to.be.a("number");
};

const testTransaction = (parse, transaction) => {
    expect(transaction).to.contain.all.keys([
        "id",
        "item",
        "pp",
        "cash",
        "timestamp",
        "type"
    ]);

    expect(transaction.id).to.be.a("string");
    expect(transaction.item).to.be.a("string");
    expect(transaction.pp).to.be.a("number");
    expect(transaction.cash).to.be.a("number");
    expect(transaction.timestamp).to.be.a("string");
    expect(transaction.type).to.be.a("string");

    testTimestamp(transaction.timestamp);
};

const testMeta = (parse, meta) => {
    expect(meta).to.contain.all.keys([
        "description",
        "favorite",
        "hostID",
        "hostName",
        "id",
        "minChatLevel",
        "name",
        "population",
        "slug",
        "guests",
        "welcome"
    ]);

    expect(meta.description).to.be.a("string");
    expect(meta.favorite).to.be.a("boolean");
    expect(meta.hostID).to.be.a("number");
    expect(meta.hostName).to.be.a("string");
    expect(meta.id).to.be.a("number");
    expect(meta.name).to.be.a("string");
    expect(meta.population).to.be.a("number");
    expect(meta.slug).to.be.a("string");
    expect(meta.guests).to.be.a("number");
    expect(meta.welcome).to.be.a("string");

    if (parse) {
        expect(meta.minChatLevel).to.be.a("number");
    } else {
        expect(meta.minChatLevel).to.be.a("string");
    }
};

const testBooth = (parse, booth) => {
    if (parse) {
        expect(booth).to.contain.all.keys([
            "dj",
            "isLocked",
            "shouldCycle",
            "waitlist"
        ]);

        expect(booth.dj).to.be.a("number");
        expect(booth.isLocked).to.be.a("boolean");
        expect(booth.waitlist).to.be.an("array");
    } else {
        expect(booth).to.contain.all.keys([
            "currentDJ",
            "isLocked",
            "shouldCycle",
            "waitingDJs"
        ]);

        expect(booth.currentDJ).to.be.a("number");
        expect(booth.isLocked).to.be.a("boolean");
        expect(booth.waitingDJs).to.be.an("array");
    }

    expect(booth.shouldCycle).to.be.a("boolean");
};

const testModBan = (parse, ban) => {
    if (parse) {
        expect(ban).to.contain.all.keys([
            "moderator",
            "moderatorID",
            "username",
            "duration"
        ]);

        expect(ban.moderator).to.be.a("string");
        expect(ban.moderatorID).to.be.a("number");
        expect(ban.username).to.be.a("string");
        expect(ban.duration).to.be.a("string");
    } else {
        expect(ban).to.contain.all.keys([
            "m",
            "mi",
            "t",
            "d"
        ]);

        expect(ban.m).to.be.a("string");
        expect(ban.mi).to.be.a("number");
        expect(ban.t).to.be.a("string");
        expect(ban.d).to.be.a("string");
    }
};

const testModWaitlistBan = (parse, ban) => {
    if (parse) {
        expect(ban).to.contain.all.keys([
            "moderator",
            "moderatorID",
            "username",
            "userID",
            "duration"
        ]);

        expect(ban.moderator).to.be.a("string");
        expect(ban.moderatorID).to.be.a("number");
        expect(ban.username).to.be.a("string");
        expect(ban.userID).to.be.a("number");
        expect(ban.duration).to.be.a("string");

        testTimestmap(ban.t);
    } else {
        expect(ban).to.contain.all.keys([
            "m",
            "mi",
            "t",
            "ti",
            "d"
        ]);

        expect(ban.m).to.be.a("string");
        expect(ban.mi).to.be.a("number");
        expect(ban.t).to.be.a("string");
        expect(ban.ti).to.be.a("number");
        expect(ban.d).to.be.a("string");
    }
};

const testModRemove = (parse, remove) => {
    if (parse) {
        expect(remove).to.contain.all.keys([
            "moderator",
            "moderatorID",
            "username",
            "wasPlaying"
        ]);

        expect(remove.moderator).to.be.a("string");
        expect(remove.moderatorID).to.be.a("number");
        expect(remove.username).to.be.a("string");
        expect(remove.wasPlaying).to.be.a("boolean");
    } else {
        expect(remove).to.contain.all.keys([
            "m",
            "mi",
            "t",
            "d"
        ]);

        expect(remove.m).to.be.a("string");
        expect(remove.mi).to.be.a("number");
        exepct(remove.t).to.be.a("string");
        expect(remove.d).to.be.a("boolean");
    }
};

const testModSkip = (parse, skip) => {
    if (parse) {
        expect(skip).to.contain.all.keys([
            "moderator",
            "moderatorID"
        ]);

        expect(skip.moderator).to.be.a("string");
        expect(skip.moderatorID).to.be.a("number");
    } else {
        expect(skip).to.contain.all.keys([
            "m",
            "mi"
        ]);

        expect(skip.m).to.be.a("string");
        expect(skip.mi).to.be.a("number");
    }
};

const testOwnBan = (parse, ban) => {
    if (parse) {
        expect(ban).to.contain.all.keys([
            "reason",
            "duration"
        ]);

        expect(ban.reason).to.be.a("number");
        expect(ban.duration).to.be.a("string");
    } else {}
};

const testBan = (parse, ban) => {
    expect(ban).to.contain.all.keys([
        "id",
        "reason",
        "duration",
        "username",
        "moderator",
        "timestamp"
    ]);

    expect(ban.id).to.be.a("number");
    expect(ban.reason).to.be.a("number");
    expect(ban.duration).to.be.a("string");
    expect(ban.username).to.be.a("string");
    expect(ban.moderator).to.be.a("string");
    expect(ban.timestamp).to.be.a("string");

    if (parse)
        testTimestamp(ban.timestamp);
};

const testCycle = (parse, cycle) => {
    if (parse) {
        expect(cycle).to.contain.all.keys([
            "shouldCycle",
            "moderator",
            "moderatorID"
        ]);

        expect(cycle.shouldCycle).to.be.a("boolean");
        expect(cycle.moderator).to.be.a("string");
        expect(cycle.moderatorID).to.be.a("number");
    } else {
        expect(cycle).to.contain.all.keys([
            "f",
            "m",
            "mi"
        ]);

        expect(cycle.f).to.be.a("boolean");
        expect(cycle.m).to.be.a("string");
        expect(cycle.mi).to.be.a("number");
    }
};

const testPlaylistCycle = cycle => {
    expect(cycle).to.be.a("number");
};

const testLevelUp = level => {
    expect(level).to.be.a("number");
};

const testLock = (parse, lock) => {
    if (parse) {
        expect(lock).to.contain.all.keys([
            "clearWaitlist",
            "isLocked",
            "moderator",
            "moderatorID"
        ]);

        expect(lock.clearWaitlist).to.be.a("boolean");
        expect(lock.isLocked).to.be.a("boolean");
        expect(lock.moderator).to.be.a("string");
        expect(lock.moderatorID).to.be.a("number");
    } else {
        expect(lock).to.contain.all.keys([
            "c",
            "f",
            "m",
            "mi"
        ]);

        expect(lock.c).to.be.a("boolean");
        expect(lock.f).to.be.a("boolean");
        expect(lock.m).to.be.a("string");
        expect(lock.mi).to.be.a("number");
    }
};

const testPromotions = (parse, promotions) => {
    expect(promotions).to.be.an("array");

    if (Array.isArray(promotions) && promotions.length > 0) {
        const promotion = promotions[0];

        if (parse) {
            expect(promotion).to.contain.all.keys([
                "moderator",
                "moderatorID",
                "username",
                "id",
                "role"
            ]);

            expect(promotion.moderator).to.be.a("string"),
            expect(promotion.moderatorID).to.be.a("number");
            expect(promotion.username).to.be.a("string");
            expect(promotion.id).to.be.a("number");
            expect(promotion.role).to.be.a("number");
        } else {
            expect(promotion).to.contain.all.keys([
                "m",
                "mi",
                "u"
            ]);

            expect(promotion.m).to.be.a("string");
            expect(promotion.mi).to.be.a("number");
            expect(promotion.u).to.be.an("array");

            if (Array.isArray(promotion.u) && promotion.u.length > 0) {
                const user = promotion.u[0];

                expect(user).to.contain.all.keys([
                    "n",
                    "i",
                    "p"
                ]);

                expect(user.n).to.be.a("string");
                expect(user.i).to.be.a("number");
                expect(user.p).to.be.a("number");
            }
        }
    }
};

const testXP = xp => {
    expect(xp).to.contain.all.keys([
        "xp",
        "pp",
        "level"
    ]);

    expect(xp.xp).to.be.a("number");
    expect(xp.pp).to.be.a("number");
    expect(xp.level).to.be.a("number");
};

const testChat = (parse, chat) => {
    if (parse) {
        expect(chat).to.contain.all.keys([
            "message",
            "username",
            "cid",
            "id",
            "sub"
        ]);

        expect(chat.username).to.be.a("string");
        expect(chat.id).to.be.a("number");
    } else {
        expect(chat).to.contain.all.keys([
            "message",
            "un",
            "cid",
            "uid",
            "sub"
        ]);

        expect(chat.un).to.be.a("string");
        expect(chat.uid).to.be.a("number");
    }

    expect(chat.message).to.be.a("string");
    expect(chat.cid).to.be.a("string");
    expect(chat.sub).to.be.a("number");
};

const testChatDelete = (parse, chat) => {
    if (parse) {
        expect(chat).to.contain.all.keys([
            "moderatorID",
            "cid"
        ]);

        expect(chat.moderatorID).to.be.a("number");
        expect(chat.cid).to.be.a("string");
    } else {
        expect(chat).to.contain.all.keys([
            "mi",
            "c"
        ]);

        expect(chat.mi).to.be.a("number");
        expect(chat.c).to.be.a("string");
    }
};

const testState = state => {
    expect(state).to.contain.all.keys([
        "self",
        "room",
        "usercache",
        "chatcache"
    ]);

    expect(state.self).to.be.an("object");
    expect(state.room).to.be.an("object");
    expect(chat.usercache).to.be.an("array");
    expect(chat.chatcache).to.be.an("array");

    testSelf(state.self);
    testRoom(self.room);
}

const testRoomNameUpdate = (parse, update) => {
    if (parse) {
        expect(update).to.contain.all.keys([
            "name",
            "moderatorID"
        ]);

        expect(update.name).to.be.a("string");
        expect(update.moderatorID).to.be.a("number");
    } else {
        expect(update).to.contain.all.keys([
            "n",
            "u"
        ]);

        expect(update.n).to.be.a("string");
        expect(update.u).to.be.a("number");
    }
};

const testRoomDescriptionUpdate = (parse, update) => {
    if (parse) {
        expect(update).to.contain.all.keys([
            "description",
            "moderatorID"
        ]);

        expect(update.description).to.be.a("string");
        expect(update.moderatorID).to.be.a("number");
    } else {
        expect(update).to.contain.all.keys([
            "d",
            "u"
        ]);

        expect(update.d).to.be.a("string");
        expect(update.u).to.be.a("number");
    }
};

const testRoomWelcomeUpdate = (parse, update) => {
    if (parse) {
        expect(update).to.contain.all.keys([
            "welcome",
            "moderatorID"
        ]);

        expect(update.welcome).to.be.a("string");
        expect(update.moderatorID).to.be.a("number");
    } else {
        expect(update).to.contain.all.keys([
            "w",
            "u"
        ]);

        expect(update.w).to.be.a("string");
        expect(update.u).to.be.a("number");
    }
};

const testChatLevelUpdate = (parse, update) => {
    if (parse) {
        expect(update).to.contain.all.keys([
            "chatLevel",
            "moderatorID"
        ]);

        expect(update.chatLevel).to.be.a("number");
        expect(update.moderatorID).to.be.a("number");
    } else {
        expect(update).to.contain.all.keys([
            "m",
            "u"
        ]);

        expect(update.m).to.be.a("number");
        expect(update.u).to.be.a("number");
    }
};

exports.testUser = testUser;
exports.testMedia = testMedia;
exports.testRoom = testRoom;
exports.testExtendedRoom = testExtendedRoom;
exports.testPlaylist = testPlaylist;
exports.testSelf = testSelf;
exports.testMute = testMute;
exports.testGifted = testGifted;
exports.testModAddDJ = testModAddDJ;
exports.testModMove = testModMove;
exports.testNotify = testNotify;
exports.testPlayback = testPlayback;
exports.testHistoryEntry = testHistoryEntry;
exports.testFriendRequest = testFriendRequest;
exports.testVote = testVote;
exports.testSettings = testSettings;
exports.testTransaction = testTransaction;
exports.testMeta = testMeta;
exports.testBooth = testBooth;
exports.testModBan = testModBan;
exports.testModWaitlistBan = testModWaitlistBan;
exports.testModRemove = testModRemove;
exports.testModSkip = testModSkip;
exports.testOwnBan = testOwnBan;
exports.testBan = testBan;
exports.testCycle = testCycle;
exports.testPlaylistCycle = testPlaylistCycle;
exports.testLevelUp = testLevelUp;
exports.testLock = testLock;
exports.testPromotions = testPromotions;
exports.testXP = testXP;
exports.testChat = testChat;
exports.testChatDelete = testChatDelete;
exports.testState = testState;
exports.testRoomNameUpdate = testRoomNameUpdate;
exports.testRoomDescriptionUpdate = testRoomDescriptionUpdate;
exports.testRoomWelcomeUpdate = testRoomWelcomeUpdate;
exports.testChatLevelUpdate = testChatLevelUpdate;
