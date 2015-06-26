var isTravis = process.env.TRAVIS || false;

var testLogin = (isTravis ? {
    "email": process.env.EMAIL,
    "password": process.env.PASSWORD,
    "room": process.env.ROOM,
    "usernameToBuy": "",
    "noParse": false
} : require("./test.json"));

var Plugged = require("../plugged");
var Logger = require("../logger");
var chai = require("chai");
var expect = chai.expect;
var client = new Plugged({
    test: testLogin.noParse
});

var logger = new Logger({
    verbosity: 5,
    inspect: true
});

var _playlists;
var _playlist;
var _message;
var _store;
var _media;
var _user;
var _room;

function execTest() {
    return isTravis ? describe.skip : describe;
}

function testUser(user) {
    expect(user).to.contain.all.keys([
        "username",
        "avatarID",
        "language",
        "slug",
        "joined",
        "level",
        "gRole",
        "badge",
        "sub",
        "id"
    ]);

    if(!testLogin.noParse)
        expect(user.badge).to.be.a("string");

    expect(user.username).to.be.a("string");
    expect(user.avatarID).to.be.a("string");
    expect(user.language).to.be.a("string");
    expect(user.slug).to.be.a("string");
    expect(user.joined).to.be.a("string");
    expect(user.level).to.be.a("number");
    expect(user.gRole).to.be.a("number");
    expect(user.sub).to.be.a("number");
    expect(user.id).to.be.a("number");
}

function testMedia(media) {
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
}

function testRoom(room) {
    if(testLogin.noParse) {
        expect(room).to.have.all.keys([
            "booth",
            "fx",
            "grabs",
            "meta",
            "playback",
            "role",
            "users",
            "votes",
            "mutes"
        ]);

        expect(room.grabs).to.be.an("object");
        expect(room.votes).to.be.an("object");
    } else {
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

        expect(room.grabs).to.be.an("array");
        expect(room.votes).to.be.an("array");
    }

    expect(room.booth).to.be.an("object");
    expect(room.fx).to.be.an("array");
    expect(room.meta).to.be.an("object");
    expect(room.playback).to.be.an("object");
    expect(room.role).to.be.a("number");
    expect(room.users).to.be.an("array");
}

function testExtendedRoom(room) {
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
        "population",
        "private",
        "slug"
    ]);
    
    if(typeof room.dj !== "string") {
        expect(room.dj).to.be.an("object");
        testUser(room.dj);
    }

    if(!testLogin.noParse) {
        expect(room.capacity).to.be.a("number");
        expect(room.population).to.be.a("number");
    }

    expect(room.favorite).to.be.a("boolean");
    expect(room.format).to.be.a("number");
    expect(room.host).to.be.a("string");
    expect(room.cid).to.be.a("string");
    expect(room.id).to.be.a("number");
    expect(room.image).to.be.a("string");
    expect(room.media).to.be.a("string");
    expect(room.name).to.be.a("string");
    expect(room.private).to.be.a("boolean");
    expect(room.slug).to.be.a("string");
}

function testPlaylist(playlist) {
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
}

function testHistoryObject(entry) {
    expect(entry).to.be.an("object");
    expect(entry).to.have.all.keys([
        "id",
        "media",
        "room",
        "score",
        "timestamp",
        "user"
    ]);

    expect(entry.id).to.be.a("string").and.have.length.above(0);
    expect(entry.media).to.be.an("object");
    expect(entry.media).to.have.all.keys([
        "cid",
        "title",
        "author",
        "image",
        "duration",
        "format",
        "id"
    ]);

    expect(entry.media.cid).to.be.a("string").and.have.length.above(0);
    expect(entry.media.title).to.be.a("string").and.have.length.above(0);
    expect(entry.media.author).to.be.a("string").and.have.length.above(0);
    expect(entry.media.image).to.be.a("string").and.have.length.above(0);
    expect(entry.media.duration).to.be.a("number").and.not.equal(0);
    expect(entry.media.format).to.be.a("number");
    expect(entry.media.id).to.be.a("number").and.not.equal(-1);

    expect(entry.room).to.be.an("object");
    expect(entry.room).to.have.all.keys([
        "name",
        "slug"
    ]);

    expect(entry.room.name).to.be.a("string").and.have.length.above(0);
    expect(entry.room.slug).to.be.a("string").and.have.length.above(0);

    expect(entry.score).to.be.an("object");
    expect(entry.score).to.have.all.keys([
        "grabs",
        "listeners",
        "negative",
        "positive",
        "skipped"
    ]);

    expect(entry.score.grabs).to.be.a("number");
    expect(entry.score.listeners).to.be.a("number");
    expect(entry.score.negative).to.be.a("number");
    expect(entry.score.positive).to.be.a("number");
    expect(entry.score.skipped).to.be.a("number");

    expect(entry.timestamp).to.be.a("string").and.have.length.above(0);
    expect(entry.user).to.be.an("object");
    expect(entry.user).to.have.all.keys([
        "id",
        "username"
    ]);

    expect(entry.user.id).to.be.a("number").and.not.equal(-1);
    expect(entry.user.username).to.be.a("string").and.have.length.above(0);
};

describe("Login", function () {
    describe("#getCSRF", function () {
        it("should retrieve the cross site request forgery token", function (done) {
            client.getCSRF(function (err, csrf) {
                expect(err).to.be.a("null");
                expect(csrf).to.be.a("string").and.have.length.above(0);

                done();
            });
        });
    });

    describe("#error", function () {
        it("should emit LOGIN_ERROR with error code 401", function (done) {
            client.login({email: "test@test.moe", password: "test"});

            client.on(client.LOGIN_ERROR, function (err) {
                expect(err).to.be.an("object");
                expect(err.code).to.equal(401);
                done();
            });
        });
    });

    describe("#success", function () {
        it("should emit LOGIN_SUCCESS without errors", function (done) {
            client.login({email: testLogin.email, password: testLogin.password});

            client.on(client.LOGIN_SUCCESS, function () {
                done();
            });
        });
    });
});

describe("Joining a room", function () {
    describe("#error", function () {
        it("should try to join a room and fail with code 404", function (done) {
            client.connect("-1");
            var func = function (err) {
                expect(err).to.be.an("object");
                expect(err.code).to.equal(404);
                client.removeListener(client.PLUG_ERROR, func);
                done();
            };

            client.on(client.PLUG_ERROR, func);
        });
    });

    describe("#success", function () {
        it("should return a room object with the current stats", function (done) {
            client.connect(testLogin.room);

            client.on(client.JOINED_ROOM, function (room) {
                expect(room).to.be.an("object");

                
                done();
            });
        });
    });
});

describe("Chat", function () {
    describe("#sendChat", function () {
        it("should send a message with the text 'test'", function (done) {
            
            var func = function (msg) {
                expect(msg).to.be.an("object");

                if(testLogin.noParse) {
                    expect(msg).to.have.all.keys([
                        "message",
                        "cid",
                        "uid",
                        "sub",
                        "un"
                    ]);

                    expect(msg.message).to.be.a("string");
                    expect(msg.cid).to.be.a("string");
                    expect(msg.uid).to.be.a("number");
                    expect(msg.sub).to.be.a("number");
                    expect(msg.un).to.be.a("string");
                } else {
                    expect(msg).to.have.all.keys([
                        "username",
                        "message",
                        "cid",
                        "sub",
                        "id"
                    ]);

                    expect(msg.username).to.be.a("string");
                    expect(msg.cid).to.be.a("string");
                    expect(msg.id).to.be.a("number");
                    expect(msg.message).to.be.a("string").and.equal("test");
                }

                _message = msg;

                client.removeListener(client.CHAT, func);
                done();
            };

            client.on(client.CHAT, func);
            client.sendChat("test");
        });
    });

    describe("#deleteChat", function () {
        it("should delete a message", function (done) {
            var funcDel = function (msg) {
                expect(msg).to.be.an("object");

                if(testLogin.noParse) {
                    expect(msg).to.have.all.keys([
                        "c",
                        "mi"
                    ]);
                    expect(msg.c).to.be.a("string");
                    expect(msg.mi).to.be.a("number");
                } else {
                    expect(msg).to.have.all.keys([
                        "cid",
                        "moderatorID"
                    ]);
                    expect(msg.cid).to.be.a("string");
                    expect(msg.moderatorID).to.be.a("number").and.not.equal(-1);
                }

                client.removeListener(client.CHAT_DELETE, funcDel);
                done();
            };

            client.on(client.CHAT_DELETE, funcDel);
            client.deleteMessage(_message.cid);
        });
    });
});

describe("REST", function () {
    describe("#getNews", function () {
        it("should get an array of news objects", function (done) {
            client.getNews(function (err, news) {
                expect(err).to.be.a("null");
                expect(news).to.be.an("array").and.to.have.length.above(0);

                if(news.length > 0) {
                    expect(news[0]).to.be.an("object");
                    expect(news[0]).to.have.all.keys([
                        "desc",
                        "href",
                        "title"
                    ]);

                    expect(news[0].desc).to.be.a("string");
                    expect(news[0].href).to.be.a("string");
                    expect(news[0].title).to.be.a("string");
                }
                done();
            });
        });
    });

    describe("#getAuthToken", function () {
        it("should retrieve the 152 character long authentication token", function (done) {
            client.getAuthToken(function (err, token) {
                expect(err).to.be.a("null");
                expect(token).to.be.a("string").and.to.have.length(172);
                done();
            });
        });
    });

    describe("#getRoomStats", function () {
        it("should return the room object of the currently joined room", function (done) {
            client.getRoomStats(function (err, room) {
                expect(err).to.be.a("null");
                expect(room).to.be.an("object");
                testRoom(room);

                // transform state when raw objects are enabled
                if(testLogin.noParse) {
                    client.state.room.votes = [];
                    client.state.room.grabs = [];
                }

                if(!_room)
                    _room = room;

                done();
            });
        });
    });

    execTest()("#findRooms", function () {
        it("should retrieve an array of room objects filtered by a keyword", function (done) {
            client.findRooms("kpop", 0, 2, function (err, rooms) {
                expect(err).to.be.a("null");
                expect(rooms).to.be.an("array");

                if(rooms.length > 0) {
                    expect(rooms[0]).to.be.an("object");
                    testExtendedRoom(rooms[0]);
                }

                done();
            });
        });
    });

    describe("#getRooms", function () {
        it("should retrieve an array of rooms objects", function (done) {
            client.getRooms(function (err, rooms) {
                expect(err).to.be.a("null");
                expect(rooms).to.be.an("array").and.to.have.length.above(0);
                expect(rooms[0]).to.be.an("object");

                if(!testLogin.noParse)
                    testExtendedRoom(rooms[0]);

                done();
            });
        });
    });

    execTest()("#getStaff", function () {
        it("should retrieve all users online or not with a role > 0", function (done) {
            client.getStaff(function (err, staff) {
                expect(err).to.be.a("null");
                expect(staff).to.be.an("array").and.to.have.length.above(0);
                testUser(staff[0]);

                expect(staff[0]).to.contain.key("role");
                expect(staff[0].role).to.be.a("number");

                done();
            });
        });
    });

    execTest()("#getUser", function () {
        it("should retrieve the user object for a user", function (done) {
            var users = client.getUsers();

            for(var i = 0, l = users.length; i < l; i++) {
                if(users[i].role < client.getSelf().role) {
                    _user = users[i];
                    break;
                }
            }

            client.getUser(_user.id, function (err, user) {
                expect(err).to.be.a("null");
                expect(user).to.be.an("object");
                testUser(user);

                done();
            });
        });
    });

    describe("#getRoomHistory", function () {
        it("should return an array of history objects", function (done) {
            client.getRoomHistory(function (err, history) {
                expect(err).to.be.a("null");
                expect(history).to.be.an("array");

                if(history.length > 0)
                    testHistoryObject(history[0]);
                
                done();
            });
        });
    });

    describe("#validateRoomName", function () {
        it("should return a validated room name based on the input", function (done) {
            client.validateRoomName("test!-_||%22D", function (err, name) {
                expect(err).to.be.a("null");
                expect(name).to.be.an("object").and.to.contain.key("slug");
                expect(name.slug).to.be.a("string").and.have.length.above(0);
                done();
            });
        });
    });

    describe("#validateUsername", function () {
        it("should return a validated username based on the input", function (done) {
            client.validateUsername("test!-_||%22D", function (err, name) {
                expect(err).to.be.a("null");
                expect(name).to.be.an("object").and.to.contain.key("slug");
                expect(name.slug).to.be.a("string").and.have.length.above(0);
                done();
            });
        });
    });

    describe("#saveSettings", function () {
        it("should save the settings object on the server", function (done) {
            client.saveSettings(done);
        });
    });

    describe("#setLock", function () {
        it("should unlock the waitlist", function (done) {
            client.setLock(false, false, done);
        });
    });

    describe("#setCycle", function () {
        it("should set if the waitlist should cycle", function (done) {
            client.setCycle(true, done);
        });
    });

    execTest()("#addToWaitlist", function () {
        it("should add a user by their ID to the waitlist", function (done) {
            client.addToWaitlist(_user.id, function (err) {
                
                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("This request was understood but is forbidden.");
                }

                done();
            });
        });
    });

    execTest()("#meh", function () {
        it("should meh a song", function (done) {
            client.meh(done);
        });
    });

    execTest()("#woot", function () {
        it("should woot a song", function (done) {
            client.woot(done);
        });
    });

    describe("#addPlaylist", function () {
        it("should create a new playlist", function (done) {
            client.addPlaylist("testPlaylist", function (err, playlist) {
                expect(err).to.be.a("null");
                expect(playlist).to.be.an("object");

                testPlaylist(playlist);

                if(!err)
                    _playlist = playlist.id;

                done();
            });
        });
    });

    execTest()("#grab", function () {
        it("should grab a song", function (done) {
            client.grab(_playlist, done);
        });
    });

    describe("#addMedia", function () {
        it("a media file from youtube and soundcloud", function (done) {
            var ytObj = {
                "title": "Nightstep - Army Of Two",
                "id": "6DSOGA9HQM4",
                "thumbnails": {
                    "default": {
                        "url": "https://i.ytimg.com/vi/6DSOGA9HQM4/default.jpg"
                    }
                }
            };

            var sndObj = {
                "title": "Smosh - Legend of Zelda rap",
                "id": 30271545,
                "duration": 213475,
                "artwork_url": "https://i1.sndcdn.com/artworks-000015183915-7m8l9z-large.jpg"
            };

            client.addMedia(_playlist, [ytObj, sndObj], true, done);
        });
    });

    execTest()("#skipDJ", function () {
        it("should skip the current DJ", function (done) {
            client.skipDJ(testLogin.noParse ? client.getBooth().currentDJ : client.getCurrentDJ().id, done);
        });
    });

    execTest()("#moveDJ", function () {
        it("should move a DJ to a new position in the waitlist", function (done) {
            var waitlist = client.getWaitlist();
            client.moveDJ(waitlist[waitlist.length - 1], 0, done);
        });
    });

    describe("#createRoom", function () {
        it("should create a new room with a timestamp as the name", function (done) {
            var date = Date.now().toString();
            client.createRoom(date, true, function (err, room) {
                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("Host limit reached");
                } else {

                    expect(err).to.be.a("null");
                    expect(room).to.be.an("object");
                    expect(room).to.have.all.keys([
                        "id",
                        "name",
                        "slug"
                    ]);

                    expect(room.id).to.be.a("number");
                    expect(room.name).to.be.a("string").and.to.equal(date);
                    expect(room.slug).to.be.a("string");
                }

                done();
            });
        });
    });

    describe("#updateRoomInfo", function () {
        it("should update the room description and welcome message", function (done) {
            client.updateRoomInfo("testName", "testDesc", "testWelcome", function (err) {
                var meta = client.getCurrentRoomStats().meta;

                expect(meta.description).to.be.equal("testDesc");
                expect(meta.welcome).to.be.equal("testWelcome");
                done();
            });
        });
    });

    execTest()("#muteUser", function () {
        it("should mute a user", function (done) {
            client.muteUser(_user.id, client.MUTEDURATION.SHORT, client.BANREASON.VIOLATING_COMMUNITY_RULES, function (err) {

                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("This user cannot be muted");
                }

                done();
            });
        });
    });

    describe("#getMutes", function () {
        it("should retrieve an array of mute objects", function (done) {
            client.getMutes(function (err, mutes) {
                expect(err).to.be.a("null");
                expect(mutes).to.be.an("array");

                if(mutes.length > 0) {
                    expect(mutes[0]).to.be.an("object");
                    expect(mutes[0]).to.have.all.keys([
                        "moderator",
                        "username",
                        "expires",
                        "reason",
                        "id"
                    ]);

                    expect(mutes[0].moderator).to.be.a("string");
                    expect(mutes[0].username).to.be.a("string");
                    expect(mutes[0].expires).to.be.a("number");
                    expect(mutes[0].reason).to.be.a("number");
                    expect(mutes[0].id).to.be.a("number");
                }

                done();
            });
        });
    });

    execTest()("#addStaff", function () {
        it("should add a user as staff", function (done) {
            client.addStaff(_user.id, client.USERROLE.BOUNCER, done);
        });
    });

    execTest()("#ignoreUser", function () {
        it("should ignore a user", function (done) {
            client.ignoreUser(_user.id, done);
        });
    });

    describe("#getIgnores", function () {
        it("should get all ignored users", function (done) {
            client.getIgnores(function (err, ignores) {
                expect(err).to.be.a("null");
                expect(ignores).to.be.an("array");

                if(ignores.length > 0) {
                    expect(ignores[0]).to.be.an("object");
                    expect(ignores[0]).to.have.all.keys([
                        "id",
                        "username"
                    ]);

                    expect(ignores[0].id).to.be.a("number");
                    expect(ignores[0].username).to.be.a("string");
                }

                done();
            });
        });
    });

    execTest()("#removeIgnore", function () {
        it("should remove the previously ignored user", function (done) {
            client.removeIgnore(_user.id, function (err, ignore) {
                expect(err).to.be.a("null");

                expect(ignore).to.be.an("object");
                expect(ignore).to.have.all.keys([
                    "id",
                    "username"
                ]);

                expect(ignore.id).to.be.a("number");
                expect(ignore.username).to.be.a("string");

                done();
            });
        });
    });

    execTest()("#removeStaff", function () {
        it("should remove the previously added staff member", function (done) {
            client.removeStaff(_user.id, function (err) {

                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("Cannot change the permissions for a higher ranking user");
                }

                done();
            });
        });
    });

    execTest()("#removeDJ", function () {
        it("should remove a DJ from the waitlist", function (done) {
            var user = client.getWaitlist()[0];
            client.removeDJ(user, function (err) {
                expect(err).to.be.a("null");

                client.addToWaitlist(user, done);
            });
        });
    });

    describe("#leaveWaitlist", function () {
        it("should leave the waitlist", function (done) {
            client.leaveWaitlist(function (err, wl) {
                expect(err).to.be.a("null");

                done();
            });
        });
    });

    execTest()("#unmuteUser", function () {
        it("should unmute the previously muted user", function (done) {
            client.unmuteUser(_user.id, done);
        });
    });

    execTest()("#banUser", function () {
        it("should ban a user", function (done) {
            client.banUser(_user.id, client.BANDURATION.SHORT, client.BANREASON.VIOLATING_COMMUNITY_RULES, function (err) {

                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("Cannot ban a higher ranking user");
                }

                done();
            })
        });
    });

    execTest()("#unbanUser", function () {
        it("should unban the previously banned user", function (done) {
            client.unbanUser(_user.id, done);
        });
    });

    describe("#requestSelf", function () {
        it("should request its own user state from the server", function (done) {
            client.requestSelf(function (err, self) {
                expect(err).to.be.a("null");
                testUser(self);

                expect(self).to.contain.keys([
                    "notifications",
                    "settings",
                    "ignores",
                    "friends",
                    "pw",
                    "pp",
                    "xp"
                    ]);

                expect(Object.keys(self).length).to.equal(testLogin.noParse ? 18 : 19);
                expect(self.notifications).to.be.an("array");
                expect(self.ignores).to.be.an("array");
                expect(self.friends).to.be.an("array");
                expect(self.xp).to.be.a("number");

                done();
            });
        });
    });

    describe("#getMyHistory", function () {
        it("should request its own history", function (done) {
            client.getMyHistory(function (err, history) {
                expect(err).to.be.a("null");
                expect(history).to.be.an("array");

                if(history.length > 0) {
                    expect(history[0]).to.have.all.keys([
                        "id",
                        "media",
                        "room",
                        "score",
                        "timestamp",
                        "user"
                    ]);

                    expect(history[0].id).to.be.a("string").and.have.length.above(0);

                    expect(history[0].media).to.be.an("object");
                    expect(history[0].media).to.have.all.keys([
                        "author",
                        "cid",
                        "duration",
                        "format",
                        "id",
                        "image",
                        "title"
                    ]);

                    expect(history[0].media.author).to.be.a("string");
                    expect(history[0].media.cid).to.be.a("string");
                    expect(history[0].media.duration).to.be.a("number");
                    expect(history[0].media.format).to.be.a("number");
                    expect(history[0].media.id).to.be.a("number");
                    expect(history[0].media.image).to.be.a("string");
                    expect(history[0].media.title).to.be.a("string");

                    expect(history[0].room).to.be.an("object");
                    expect(history[0].room).to.have.all.keys([
                        "name",
                        "slug"
                    ]);

                    expect(history[0].room.name).to.be.a("string");
                    expect(history[0].room.slug).to.be.a("string");

                    expect(history[0].score).to.be.an("object");
                    expect(history[0].score).to.have.all.keys([
                        "grabs",
                        "listeners",
                        "negative",
                        "positive",
                        "skipped"
                    ]);

                    expect(history[0].score.grabs).to.be.a("number");
                    expect(history[0].score.listeners).to.be.a("number");
                    expect(history[0].score.negative).to.be.a("number");
                    expect(history[0].score.positive).to.be.a("number");
                    expect(history[0].score.skipped).to.be.a("number");

                    expect(history[0].timestamp).to.be.a("string");

                    expect(history[0].user).to.be.an("object");
                    expect(history[0].user).to.have.all.keys([
                        "id",
                        "username"
                    ]);
                    expect(history[0].user.id).to.be.a("number");
                    expect(history[0].user.username).to.be.a("string");
                }

                done();
            });
        });
    });

    describe("#getFriends", function () {
        it("should request all friends from the server", function (done) {
            client.getFriends(function (err, friends) {
                expect(err).to.be.a("null");
                expect(friends).to.be.an("array");

                if(friends.length > 0)
                    testUser(friends[0]);

                done();
            });
        });
    });

    describe("#getFriendRequests", function () {
        it("should request all friend requests from the server", function (done) {
            client.getFriendRequests(function (err, requests) {
                expect(err).to.be.a("null");
                expect(requests).to.be.an("array");

                if(requests.length > 0) {
                    expect(requests[0]).to.be.an("object");
                    expect(requests[0]).to.have.all.keys([
                        "avatarID",
                        "gRole",
                        "id",
                        "joined",
                        "level",
                        "status",
                        "timestamp",
                        "username"
                    ]);

                    expect(requests[0].avatarID).to.be.a("string");
                    expect(requests[0].gRole).to.be.a("number");
                    expect(requests[0].id).to.be.a("number");
                    expect(requests[0].joined).to.be.a("string");
                    expect(requests[0].level).to.be.a("number");
                    expect(requests[0].status).to.be.a("number");
                    expect(requests[0].timestamp).to.be.a("string");
                    expect(requests[0].username).to.be.a("string");
                }

                done();
            });
        });
    });

    describe("#searchMediaPlaylist", function () {
        it("should search for media in a playlist filtered by a keyword", function (done) {
            client.searchMediaPlaylist(_playlist, "a", function (err, media) {
                expect(err).to.be.a("null");
                expect(media).to.be.an("array");

                if(media.length > 0) {
                    testMedia(media[0]);
                    _media = media[0];
                }

                done();
            });
        });
    });

    describe("#getPlaylist", function () {
        it("should return a playlist", function (done) {
            client.getPlaylist(_playlist, function (err, playlist) {
                expect(err).to.be.a("null");
                expect(playlist).to.be.an("array");

                if(playlist.length > 0)
                    testMedia(playlist[0]);

                done();
            });
        });
    });

    describe("#getPlaylists", function () {
        it("should get all playlists", function (done) {
            client.getPlaylists(function (err, playlists) {
                expect(err).to.be.a("null");
                expect(playlists).to.be.an("array");

                if(playlists.length > 0) {
                    testPlaylist(playlists[0]);
                    _playlists = playlists;
                }

                done();
            });
        });
    });

    describe("#getFavoriteRooms", function () {
        it("should get all favorited rooms", function (done) {
            client.getFavoriteRooms(function (err, rooms) {
                expect(err).to.be.a("null");
                expect(rooms).to.be.an("array");

                if(rooms.length > 0) {
                    expect(rooms[0]).to.be.an("object");
                    testExtendedRoom(rooms[0]);
                    expect(rooms[0].dj).to.be.an("object");
                    testUser(rooms[0].dj);
                }

                done();
            });
        });
    });

    describe("#setProfileMessage", function () {
        it("should change its profile message", function (done) {
            client.setProfileMessage("testProfileMessage", done);
        });
    });

    describe("#renamePlaylist", function () {
        it("should rename a playlist", function (done) {
            client.renamePlaylist(_playlist, "testName", done);
        });
    });

    describe("#setAvatar", function () {
        it("should set the avatar of itself to base01", function (done) {
            client.setAvatar("base01", done);
        });
    });

    describe("#setLanguage", function () {
        it("should set the language of itself to english (en)", function (done) {
            client.setLanguage("en", done);
        });
    });

    describe("#rejectFriendRequest", function () {
        it("should reject a friend request", function (done) {
            client.rejectFriendRequest(329048, function (err) {
                expect(err).to.be.a("null");
                // plug doesn't reallyID check if stated ID ever sent you a request
                // so we will just check if this endpoint is still available

                done();
            });
        });
    });

    describe("#activatePlaylist", function () {
        it("should activate a playlist", function (done) {
            client.activatePlaylist(_playlist, function (err, status) {
                expect(err).to.be.a("null");
                expect(status).to.be.an("object");
                expect(status).to.have.all.keys([
                    "activated",
                    "deactivated"
                ]);

                expect(status.activated).to.be.a("number");
                expect(status.deactivated).to.be.a("number");

                done();
            });
        });
    });

    describe("#moveMedia", function () {
        it("should move a media entry to another position", function (done) {
            client.moveMedia(_playlist, [_media.id], _media.id, function (err, playlist) {

                if(err) {
                    if(err.code === 400)
                        expect(err.message).to.equal("ids is required");
                } else {
                    testMedia(playlist[0]);
                }

                done();
            });
        });
    });

    describe("#updateMedia", function () {
        it("should update the media title and author with testTitle and testAuthor", function (done) {
            client.updateMedia(_playlist, _media.id, "testAuthor", "testTitle", done);
        });
    });

    describe("#shufflePlaylist", function () {
        it("should shuffle a playlist", function (done) {
            client.shufflePlaylist(_playlist, function (err, playlist) {
                expect(err).to.be.a("null");
                expect(playlist).to.be.an("array");

                if(playlist.length > 0)
                    testMedia(playlist[0]);

                done();
            });
        });
    });

    execTest()("#addFriend", function () {
        it("should add a user as a friend", function (done) {
            client.addFriend(_user.id, done);
        });
    });

    describe("#insertMedia", function () {
        it("should add a media object to a playlist", function (done) {
            client.insertMedia(_playlist, [_media], true, function (err, status) {
                if(err) {
                    if(err.code === 400)
                        expect(err.message).to.equal("media is required");
                } else {
                    expect(status).to.be.an("array");

                    if(status.length > 0) {
                        expect(status[0]).to.have.all.keys([
                            "count",
                            "id"
                        ]);
                        expect(status[0].count).to.be.a("number");
                        expect(status[0].id).to.be.a("number");
                    }
                }

                done();
            });
        });
    });

    describe("#deleteMedia", function () {
        it("should delete a media object from a playlist", function (done) {
            client.deleteMedia(_playlist, [_media.id], function (err, media) {
                expect(err).to.be.a("null");
                expect(media).to.be.an("array");
                
                if(media.length > 0)
                    testMedia(media[0]);

                done();
            });
        });
    });

    describe("#deletePlaylist", function () {
        it("should delete a playlist", function (done) {
            client.deletePlaylist(_playlist, done);
        });
    });

    describe("#favoriteRoom", function () {
        it("should favorite a room", function (done) {
            client.favoriteRoom(_room.meta.id, done);
        });
    });

    describe("#deleteNotification", function () {
        it("should delete a notification or error if no notification is available", function (done) {
            client.deleteNotification(329048, function (err) {
                expect(err).to.be.a("null");
                // again plug doesn't tell us if that was successful or not
                // so we just check for the endpoint

                done();
            });
        });
    });

    execTest()("#removeFriend", function () {
        it("should remove a user as a friend", function (done) {
            client.removeFriend(_user.id, done);
        });
    });

    describe("#getInventory", function () {
        it("should retrieve the inventory", function (done) {
            client.getInventory(function (err, inventory) {
                expect(err).to.be.a("null");
                expect(inventory).to.be.an("array");

                if(inventory.length > 0) {
                    expect(inventory[0]).to.have.all.keys([
                        "category",
                        "id",
                        "type"
                    ]);

                    expect(inventory[0].category).to.be.a("string");
                    expect(inventory[0].id).to.be.a("string");
                    expect(inventory[0].type).to.be.a("string");
                }

                done();
            });
        });
    });

    describe("#getProducts", function () {
        it("should retrieve all the products of the base category", function (done) {
            client.getProducts("avatars", "base", function (err, base) {
                expect(err).to.be.a("null");
                expect(base).to.be.an("array");

                if(base.length > 0) {
                    expect(base[0]).to.have.all.keys([
                        "category",
                        "id",
                        "level",
                        "name",
                        "pp",
                        "tier_name",
                        "type"
                    ]);

                    expect(base[0].category).to.be.a("string");
                    expect(base[0].id).to.be.a("number");
                    expect(base[0].level).to.be.a("number");
                    expect(base[0].name).to.be.a("string");
                    expect(base[0].pp).to.be.a("number");
                    expect(base[0].tier_name).to.be.a("string");
                    expect(base[0].type).to.be.a("string");

                    _store = base[0];
                }

                done();
            });
        });
    });

    describe("#getTransactions", function () {
        it("should retrieve an array of transactions", function (done) {
            client.getTransactions(function (err, transactions) {
                expect(err).to.be.a("null");
                expect(transactions).to.be.an("array");

                if(transactions.length > 0) {
                    expect(transactions[0]).to.have.all.keys([
                        "id",
                        "item",
                        "pp",
                        "timestamp",
                        "type"
                    ]);

                    expect(transactions[0].id).to.be.a("string");
                    expect(transactions[0].item).to.be.a("string");
                    expect(transactions[0].pp).to.be.a("number");
                    expect(transactions[0].timestamp).to.be.a("string");
                    expect(transactions[0].type).to.be.a("string");
                }

                done();
            });
        });
    });

    describe("#purchaseUsername", function () {
        it("should purchase a new username", function (done) {
            client.purchaseUsername(testLogin.usernameToBuy, function (err, item) {
                if(item) {
                    expect(item).to.be.an("object");
                    expect(item).to.have.all.keys([
                        "count",
                        "name",
                        "pp"
                    ]);

                    expect(item.count).to.be.a("number");
                    expect(item.name).to.be.a("string").and.equal("username");
                    expect(item.pp).to.be.a("number");
                }

                done();
            });
        });
    });

    describe("#purchaseItem", function () {
        it("should buy an item from the store", function (done) {
            client.purchaseItem(_store.id, function (err, item) {
                if(item) {
                    expect(item).to.be.an("object");
                    expect(item).to.have.all.keys([
                        "count",
                        "name",
                        "pp"
                    ]);

                    expect(item.count).to.be.a("number");
                    expect(item.name).to.be.a("string").and.equal(_store.name);
                    expect(item.pp).to.be.a("number");
                }

                done();
            });
        });
    });
});

describe("Local", function () {
    if(testLogin.noParse) {
        console.log("Object test is running. Local state functions will be skipped.");
        return;
    }

    describe("#getJar", function () {
        it("should return the jar used for http requests", function() {
            expect(client.getJar()).to.be.an("object");
        });
    });

    describe("#setJar", function () {
        it("should set the jar that is used for http requests", function () {
            var jar = client.getJar();
            client.setJar(jar);
            expect(client.getJar()).to.equal(jar);
        });
    });

    execTest()("#getChatByUser", function () {
        it("should get the messages written by a user", function () {
            _user = client.getUsers()[0];
            var messages = client.getChatByUser(_user.username);

            expect(messages).to.be.an("array");

            if(messages.length > 0) {
                expect(messages[0]).to.be.an("object");
                expect(messages[0]).to.have.all.keys([
                    "message",
                    "username",
                    "cid",
                    "id",
                    "sub"
                ]);

                expect(messages[0].message).to.be.a("string");
                expect(messages[0].username).to.be.a("string");
                expect(messages[0].cid).to.be.a("string");
                expect(messages[0].id).to.be.a("number");
                expect(messages[0].sub).to.be.a("number");
            }
        });
    });

    describe("#getChat", function () {
        it("should get the whole chat", function () {
            expect(client.getChat()).to.be.an("array");
        });
    });

    execTest()("#removeChatMessage", function () {
        it("should remove a chat message", function () {
            var chat = client.getChat();
            var length = chat.length;

            if(chat.length > 0) {
                client.removeChatMessage(chat[0].cid, false);
                expect(length).to.not.equal(chat.length);
            }
        });
    });

    execTest()("#removeChatMessagesByUser", function () {
        it("should delete all messages of a user", function () {
            client.removeChatMessagesByUser(_user.username, true);
            expect(client.getChatByUser(_user.username)).to.be.an("array").and.have.length(0);
        });
    });

    describe("#clearChatCache", function () {
        it("should clear the chat cache", function () {
            client.clearChatCache();
            expect(client.getChat()).to.have.length(0);
        });
    });

    describe("#watchUserCache", function () {
        it("should activate the user cache", function () {
            client.watchUserCache(true);
            expect(client.cleanCacheInterval).to.not.equal(-1);
        });
    });

    describe("#cacheChat", function () {
        it("should activate the chat cache", function () {
            client.cacheChat(true);
            expect(client.isChatCached()).to.equal(true);
        });
    });

    describe("#setChatCacheSize", function () {
        it("should set the chat cache size to 128", function () {
            expect(client.setChatCacheSize(128)).to.equal(128);
        });
    });

    describe("#cacheUserOnLeave", function () {
        it("should enable user caching for those who leave", function () {
            client.cacheUserOnLeave(true);
            expect(client.isUserCachedOnLeave()).to.equal(true);
        });
    });

    execTest()("#clearUserFromLists", function () {
        it("should clear the user from the vote and grab list", function () {
            client.clearUserFromLists(_user.id);
            var done = true;

            for(var i = 0, l = client.state.room.votes.length; i < l; i++) {
                if(_user.id == client.state.room.votes[i]) {
                    done = false;
                    break;
                }
            }

            expect(done).to.equal(true);
        });
    });

    describe("#invokeLogger", function () {
        it("should invoke a logging function", function () {
            client.invokeLogger(logger);
            expect(client.log).to.equal(logger);
        });
    });

    describe("#getCurrentRoomStats", function () {
        it("should get the current room stats", function () {
            var room = client.getCurrentRoomStats();

            testRoom(room);
        });
    });

    execTest()("#getUserByName", function () {
        it("should get a user by name", function () {
            testUser(client.getUserByName(_user.username));
        });
    });

    execTest()("#getUserByID", function () {
        it("should get a user by their ID", function () {
            testUser(client.getUserByID(_user.id));
        });
    });

    execTest()("#getUserRole", function () {
        it("should get a user's role", function () {
            expect(client.getUserRole(_user.id)).to.equal(_user.role);
        });
    });

    describe("#getUsers", function () {
        it("should get all users that are currently in the room", function () {
            var users = client.getUsers();

            expect(users).to.be.an("array");

            if(users.length > 0)
                testUser(users[0]);
        });
    });

    describe("#getSelf", function () {
        it("should get a representation of itself", function () {
            testUser(client.getSelf());
        });
    });

    describe("#setSetting", function () {
        it("should change a setting and save it", function (done) {
            var chatImages = client.getSetting("chatImages");
            client.setSetting("chatImages", !chatImages, function (err) {
                expect(err).to.be.a("null");
                expect(chatImages).to.not.equal(client.getSetting("chatImages"));
                done();
            });
        });
    });

    describe("#getSetting", function () {
        it("should return one setting (exp: chatImages)", function () {
            expect(client.getSetting("chatImages")).to.be.a("boolean");
        });
    });

    execTest()("#isFriend", function () {
        it("should indicate whether a user is a friend or not", function () {
            expect(client.isFriend(_user.id)).to.be.a("boolean");
        });
    });

    execTest()("#getCurrentDJ", function () {
        it("should get the current DJ playing", function () {
            var dj = client.getCurrentDJ();

            if(dj)
                testUser(dj);
        });
    });

    execTest()("#getCurrentMedia", function () {
        it("should return the current media object", function () {
            testMedia(client.getCurrentMedia());
        });
    });

    describe("#getPlayback", function () {
        it("should get the playback object", function () {
            var playback = client.getPlayback();

            expect(playback).to.be.an("object");
            expect(playback).to.have.all.keys([
                "media",
                "historyID",
                "playlistID",
                "startTime"
            ]);

            testMedia(playback.media);
            expect(playback.historyID).to.be.a("string");
            expect(playback.playlistID).to.be.a("number");
            expect(playback.startTime).to.be.a("string");
        });
    });

    describe("getStartTime", function () {
        it("should get the start time from the playback object", function () {
            expect(client.getStartTime()).to.be.a("string");
        });
    });

    describe("#getBooth", function () {
        it("should get the booth", function () {
            var booth = client.getBooth();

            expect(booth).to.be.an("object");
            expect(booth).to.have.all.keys([
                "dj",
                "isLocked",
                "shouldCycle",
                "waitlist"
            ]);

            expect(booth.dj).to.be.a("number");
            expect(booth.isLocked).to.be.a("boolean");
            expect(booth.shouldCycle).to.be.a("boolean");
            expect(booth.waitlist).to.be.an("array");
        });
    });

    describe("#getRoomMeta", function () {
        it("should get the metadata of the room", function () {
            var meta = client.getRoomMeta();

            expect(meta).to.be.an("object");
            expect(meta).to.have.all.keys([
                "description",
                "favorite",
                "hostID",
                "hostName",
                "id",
                "minChatLevel",
                "name",
                "population",
                "slug",
                "welcome"
            ]);

            expect(meta.description).to.be.a("string");
            expect(meta.favorite).to.be.a("boolean");
            expect(meta.hostID).to.be.a("number");
            expect(meta.hostName).to.be.a("string");
            expect(meta.id).to.be.a("number");
            expect(meta.minChatLevel).to.be.a("number");
            expect(meta.name).to.be.a("string");
            expect(meta.population).to.be.a("number");
            expect(meta.slug).to.be.a("string");
            expect(meta.welcome).to.be.a("string");
        });
    });

    describe("#getFX", function () {
        it("should get the fx settings of the room", function () {
            expect(client.getFX()).to.be.an("array");
        });
    });

    execTest()("#checkGlobalRole", function () {
        it("should give back the global role of a user", function () {
            expect(client.checkGlobalRole(_user.gRole)).to.be.a("number");
        });
    });

    describe("#getHostName", function () {
        it("should get the name of the host of the room", function () {
            expect(client.getHostName()).to.be.a("string");
        });
    });

    describe("#getHostID", function () {
        it("should get the ID of the host of the room", function () {
            expect(client.getHostID()).to.be.a("number");
        });
    });

    describe("#getPopulation", function () {
        it("should return the population of the room", function () {
            expect(client.getPopulation()).to.be.a("number").and.be.above(0);
        });
    });

    describe("#getMinChatLevel", function () {
        it("should return the minimum chat level needed to communicate", function () {
            expect(client.getMinChatLevel()).to.be.a("number");
        });
    });

    describe("#isFavorite", function () {
        it("should return if the current room is favorited", function () {
            expect(client.isFavorite()).to.be.a("boolean");
        });
    });

    describe("#getRoomName", function () {
        it("should return the room name", function () {
            expect(client.getRoomName()).to.be.a("string");
        });
    });

    describe("#getDescription", function () {
        it("should return the room description", function () {
            expect(client.getDescription()).to.be.a("string");
        });
    });

    describe("#getWelcomeMessage", function () {
        it("should return the welcome message of the room", function () {
            expect(client.getWelcomeMessage()).to.be.a("string");
        });
    });

    describe("#getSlug", function () {
        it("should return the URL conform name of the room", function () {
            expect(client.getSlug()).to.be.a("string");
        });
    });

    describe("#getWaitlist", function () {
        it("should return an array with IDs representing the waitlist", function () {
            expect(client.getWaitlist()).to.be.an("array");
        });
    });

    describe("#isWaitlistLocked", function () {
        it("should return a boolean indicating whether the waitlist is locked or not", function () {
            expect(client.isWaitlistLocked()).to.be.a("boolean");
        });
    });

    describe("#doesWaitlistCycle", function () {
        it("should return a boolean indicating whether the waitlist cycle is enabled or not", function () {
            expect(client.doesWaitlistCycle()).to.be.a("boolean");
        });
    });

    describe("#getVotes", function () {
        describe("withUserObject", function () {
            it("should return an array representing the current votes from their respective users", function() {
                var votes = client.getVotes(true);

                expect(votes).to.be.an("array");

                if (votes.length > 0) {
                    expect(votes[0]).to.be.an("object");
                    expect(votes[0]).to.have.all.keys([
                        "direction",
                        "user"
                    ]);

                    expect(votes[0].direction).to.be.a("number");
                    expect(votes[0].user).to.be.an("object");
                    testUser(votes[0].user);
                }
            });
        });

        describe("withIDs", function () {
            it("should return an array representing the current votes", function() {
                var votes = client.getVotes();

                expect(votes).to.be.an("array");

                if (votes.length > 0) {
                    expect(votes[0]).to.be.an("object");
                    expect(votes[0]).to.have.all.keys([
                        "direction",
                        "id"
                    ]);

                    expect(votes[0].direction).to.be.a("number");
                    expect(votes[0].id).to.be.a("number");
                }
            });
        });
    });

    describe("#getGrabs", function () {
        describe("withUserObject", function () {
            it("should return an array representing the grabs with their respective users", function () {
                var grabs = client.getGrabs(true);

                expect(grabs).to.be.an("array");

                if(grabs.length > 0) {
                    expect(grabs[0]).to.be.an("object");
                    testUser(grabs[0]);
                }
            });
        });

        describe("withoutUserObjects", function () {
            it("should return an array representing the grabs", function () {
                var grabs = client.getGrabs();

                expect(grabs).to.be.an("array");

                if(grabs.length > 0)
                    expect(grabs[0]).to.be.a("number");
            });
        });
    });

    execTest()("#cacheUser", function () {
        it("should cache a user", function () {
            expect(client.cacheUser(_user)).to.be.a("boolean").and.equal(true);
        });
    });

    execTest()("#removeCachedUserByID", function () {
        it("should remove a cached user by their ID", function () {
            expect(client.removeCachedUserByID(_user.id)).to.be.a("boolean").and.equal(true);
        });
    });

    execTest()("#removeCachedUserByName", function () {
        it("should remove a cached user by their Name", function () {
            client.cacheUser(_user);
            expect(client.removeCachedUserByName(_user.username)).to.be.a("boolean").and.equal(true);
        });
    });

    describe("#getStaffOnline", function () {
        it("should get the staff that is currently online", function () {
            var staff = client.getStaffOnline();

            expect(staff).to.be.an("array");

            if(staff.length > 0) {
                expect(staff[0]).to.be.an("object");
                testUser(staff[0]);
            }
        });
    });

    describe("#getStaffOnlineByRole", function () {
        it("should get the staff with a rank higher or equal that of a co-host", function () {
            var staff = client.getStaffOnlineByRole(client.USERROLE.COHOST);

            expect(staff).to.be.an("array");

            if(staff.length > 0) {
                expect(staff[0]).to.be.an("object");
                testUser(staff[0]);
            }
        });
    });

    describe("#getStaffByRole", function () {
        it("should get the staff filtered by a certain role (exp: CO-HOST)", function (done) {
            client.getStaffByRole(client.USERROLE.COHOST, function (err, staff) {
                expect(staff).to.be.an("array");

                if(staff.length > 0) {
                    expect(staff[0]).to.be.an("object");
                    expect(staff[0].role).to.be.equal(client.USERROLE.COHOST);
                    testUser(staff[0]);
                }

                done();
            });
        });
    });
});
