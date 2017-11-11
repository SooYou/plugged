const isTravis = process.env.TRAVIS || false;

const testLogin = (isTravis ? {
    "email": process.env.EMAIL,
    "password": process.env.PASSWORD,
    "room": process.env.ROOM,
    "usernameToBuy": "",
    "parse": true
} : require("./test.json"));

// id needed for ban test
let _id = null;
// playlist id
let _playlist = null;
let _media = null;
let _room = null;
let _store = null;


const Plugged = require("../plugged");
const Query = require("../query");
const types = require("../types");

const helper = require("./helper");
const objects = require("./objects");
const functions = require("./functions");

const chai = require("chai");
const expect = chai.expect;
const client = new Plugged({
    test: !testLogin.parse,
    verbosity: 5,
    log: (msg) => {
        console.log(msg);
    }
});

client.cacheChat(true);
client.cacheUser(true);

// gets all users that are not you
function getUsers() {
    const users = client.getUsers();
    const filtered = [];

    for(let i = 0, l = users.length; i < l; i++) {
        if(users[i].role < client.getSelf().role) {
            filtered.push(users[i]);
        }
    }

    return filtered;
}

function extendedTestCheck(requiredUsers = 0, done) {
    const users = getUsers();

    if (!users || users.length < requiredUsers) {
        console.log(`could not run test since it requires ${requiredUsers} \
        ${requiredUsers > 1 ? "users" : "user"} for this to pass. skipping.`);
        if (done)
            done();

        return false;
    }

    return true;
}

function skipIfTravis(travis) {
    return travis ? describe.skip : describe;
}

describe("Check basic functions", () => {
    describe("#Utils", () => {
        describe("#waterfall", () => {
            it("should call functions asynchronously one after another", done => {
                functions.testWaterfall(() => {
                    done();
                });
            });
        });

        describe("#splitTitle", () => {
            it("should split a string into two, defining an author and a title", () => {
                functions.testSplitTitle();
            });
        });

        describe("#convertPlugTimeToDate", () => {
            it("should convert the time given by the plug servers to unix standard time", () => {
                functions.testConvertPlugTimeToDate();
            });
        });

        describe("#decode", () => {
            it("should decode a message", () => {
                functions.testDecode();
            });
        });
    });

    describe("#types", () => {
        describe("#RequestError", () => {
            it("should accept a message, a status code and an error code", () => {
                const msg = "example error message";
                const err = new types.RequestError(msg, 0, -1);

                expect(err.code).to.be.a("number").and.equal(-1);
                expect(err.status).to.be.a("number").and.equal(0);
                expect(err.message).to.be.a("string").and.equal(msg);
                expect(err.name).to.be.a("string").and.equal("RequestError");
            });

            it("should be able to create an empty error", () => {
                const err = new types.RequestError();

                expect(err.code).to.be.a("null").and.equal(null);
                expect(err.status).to.be.a("null").and.equal(null);
                expect(err.message).to.be.a("string").and.equal("no data returned");
                expect(err.name).to.be.a("string").and.equal("RequestError");
            });
        });
    });

    describe("#query", () => {
        const query = new Query();
        describe("#setEncoding", () => {
            it("should default to utf-8 when calling setEncoding without a parameter", () => {
                query.setEncoding();

                expect(query.getEncoding()).to.be.a("string").and.equal("utf8");
            });

            it ("should be able to accept any encoding as a string parameter", () => {
                query.setEncoding("pseudo");
                expect(query.getEncoding()).to.be.a("string").and.equal("pseudo");

                query.setEncoding("utf8");
                expect(query.getEncoding()).to.be.a("string").and.equal("utf8");
            });
        });

        describe("#getEncoding", () => {
            it("should return the saved encoding", () => {
                expect(query.getEncoding()).to.be.a("string").and.equal("utf8");
            });
        });

        describe("#setJar", () => {
            it("should accept a cookie jar given by request", () => {
                query.setJar(null, null);

                expect(query.getJar()).to.be.an("object");
            });

            it("should accept a storage like FileCookieStore", () => {
                query.setJar(null, null);

                expect(query.getJar()).to.be.an("object");
            });
        });

        describe("#getJar", () => {
            it("should return the saved jar", () => {
                expect(query.getJar()).to.be.an("object");
            });
        });

        describe("#setAccept", () => {
            it("should set the accepting type of content", () => {
                let accept = query.getAccept();

                query.setAccept("application/text");
                expect(query.getAccept()).to.be.equal("application/text");
                query.setAccept(accept);
            });
        });

        describe("#getAccept", () => {
            it("should get the accepting type of content", () => {
                expect(query.getAccept().indexOf("application/json")).to.not.equal(-1);
            });
        });

        describe("#setContentType", () => {
            it("should set the content type awaited for the response", () => {
                let type = query.getContentType();

                query.setContentType("application/text");
                expect(query.getContentType()).to.equal("application/text");
                query.setContentType(type);
            });
        });

        describe("#getContentType", () => {
            it("should get the content type awaited for the response", () => {
                expect(query.getContentType().indexOf("application/json")).to.not.equal(-1);
            });
        });

        describe("#query", () => {
            it("should be able to retrieve a message from a server", done => {
                let accept = query.getAccept();
                let type = query.getContentType();

                query.setAccept("text/html");
                query.setContentType("text/html");

                query.query(types.VERBS.GET, "https://www.google.com", null, (err, ret) => {
                    expect(err).to.equal(null);

                    query.setAccept(accept);
                    query.setContentType(type);
                    done();
                });
            });

            it("should be able to query multiple requests", done => {
                done();
            });
        });

        describe("#flush", () => {
            it("should be able to clear the queue", () => {
                query.flushQueue();
            });
        });
    });
});

describe("Login", () => {
    describe("#_getCSRF", () => {
        it("should retrieve the cross site request forgery token", done => {
            client._getCSRF(null, (err, c, csrf) => {
                expect(err).to.be.equal(null);
                expect(csrf).to.be.a("string").and.have.length.above(0);

                done();
            });
        });
    });

    describe("#login", () => {
        it("should return an error when called without credentials", done => {
            client.login(null, (err, self) => {
                expect(err).to.be.an("Error");
                expect(err.message).to.equal("credentials has to be of type object");
                done();
            });
        });

        it("should return an error when given mixed credentials", () => {
            try {
                client.login({
                    email: "examplemail@examplehost.com",
                    clientID: 0
                });
            } catch (err) {
                expect(err).to.be.an("Error");
                expect(err.message).to.be.equal("password missing");
            }
        });

        it("should log into plug without any issues", done => {
            client.login({email: testLogin.email, password: testLogin.password}, (err, self) => {
                expect(err).to.equal(null);
                expect(self).to.be.an("object");
                objects.testSelf(testLogin.parse, self);

                done();
            });
        });
    });
});

describe("Joining a room", () => {
    it("should return an error when given no room", done => {
        client.connect(null, (err, room) => {
            expect(err).to.not.equal(null);
            expect(err.message).to.equal("slug has to be defined");
            expect(room).to.equal(null);
            done();
        });
    });

    it("should return a room object with the current stats", done => {
        client.connect(testLogin.room, (err, room) => {
            expect(err).to.equal(null);
            expect(room).to.be.an("object");
            done();
        });
    });
});

describe("Chat", () => {
    // used to keep a reference so we can delete it in another test
    let _message;

    describe("#sendChat", () => {
        it("should send a message with the text 'test'", done => {

            const func = (msg) => {
                expect(msg).to.be.an("object");

                if(!testLogin.parse) {
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

    describe("#deleteChat", () => {
        it("should delete a message", done => {
            const funcDel = (msg) => {
                expect(msg).to.be.an("object");

                if(!testLogin.parse) {
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

describe("REST", () => {
    describe("#getNews", () => {
        it("should get an array of news objects", done => {
            client.getNews((err, news) => {
                expect(err).to.be.equal(null);
                expect(news).to.be.an("array");

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

    describe("#getAuthToken", () => {
        it("should retrieve the authentication token", done => {
            client.getAuthToken((err, token) => {
                expect(err).to.be.equal(null);
                expect(token).to.be.a("string");
                expect(token.length).to.be.above(0);
                done();
            });
        });
    });

    describe("#getRoomStats", () => {
        it("should return the room object of the currently joined room", done => {
            client.getRoomStats((err, room) => {
                expect(err).to.be.equal(null);
                objects.testRoom(testLogin.parse, room);
                _room = room;

                done();
            });
        });
    });

    describe("#findRooms", () => {
        it("should retrieve an array of room objects filtered by a keyword", done => {
            client.findRooms("", 0, 1, (err, rooms) => {
                expect(err).to.be.equal(null);
                expect(rooms).to.be.an("array");
                expect(rooms.length).to.be.equal(1);

                if (rooms.length > 0) {
                    expect(rooms[0]).to.be.an("object");
                    objects.testExtendedRoom(testLogin.parse, rooms[0]);
                }

                done();
            });
        });
    });

    describe("#getRoomList", () => {
        it("should retrieve an array of rooms objects", done => {
            client.getRoomList(0, 10, (err, rooms) => {
                expect(err).to.be.equal(null);
                expect(rooms).to.be.an("array");
                // server does not always return 10 rooms
                expect(rooms.length).to.be.greaterThan(0);

                if(rooms.length > 0) {
                    expect(rooms[0]).to.be.an("object");
                    objects.testExtendedRoom(testLogin.parse, rooms[0]);
                }

                done();
            });
        });
    });

    describe("#getStaff", () => {
        it("should retrieve all users online or not with a role > 0", done => {
            client.getStaff((err, staff) => {
                expect(err).to.be.equal(null);
                expect(staff).to.be.an("array").and.to.have.length.above(0);
                objects.testUser(testLogin.parse, staff[0]);

                expect(staff[0]).to.contain.key("role");
                expect(staff[0].role).to.be.a("number");

                done();
            });
        });
    });

    skipIfTravis(isTravis)("#getUser", () => {
        it("should retrieve the user object for a user", done => {
            if (!extendedTestCheck(1, done))
                return;

            let user = getUsers()[0];

            client.getUser(user.id, (err, user) => {
                expect(err).to.be.equal(null);
                expect(user).to.be.an("object");
                objects.testUser(testLogin.parse, user);

                done();
            });
        });
    });

    describe("#getRoomHistory", () => {
        it("should return an array of history objects", done => {
            client.getRoomHistory((err, history) => {
                expect(err).to.be.equal(null);
                expect(history).to.be.an("array");

                if(history.length > 0)
                    objects.testHistoryEntry(testLogin.parse, history[0]);

                done();
            });
        });
    });

    describe("#validateRoomName", () => {
        it("should return a validated room name based on the input", done => {
            client.validateRoomName("test!-_||%22D", (err, name) => {
                expect(err).to.be.equal(null);
                expect(name).to.be.a("string").and.have.length.above(0);
                done();
            });
        });
    });

    describe("#validateUsername", () => {
        it("should return a validated username based on the input", done => {
            client.validateUsername("test!-_||%22D", (err, name) => {
                expect(err).to.be.equal(null);
                expect(name).to.be.a("string").and.have.length.above(0);
                done();
            });
        });
    });

    describe("#saveSettings", () => {
        it("should save the settings object on the server", done => {
            client.saveSettings(err => {
                expect(err).to.be.equal(null);
                done();
            });
        });
    });

    describe("#setLock", () => {
        it("should unlock the waitlist", done => {
            client.setLock(false, false, done);
        });
    });

    describe("#setCycle", () => {
        it("should set if the waitlist should cycle", done => {
            client.setCycle(true, done);
        });
    });

    skipIfTravis(isTravis)("#addToWaitlist", () => {
        it("should add a user by their ID to the waitlist", done => {
            if (!extendedTestCheck(1, done))
                return;

            const user = getUsers()[0];

            client.addToWaitlist(user.id, err => {

                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("This request was understood but is forbidden.");
                }

                done();
            });
        });
    });

    skipIfTravis(isTravis)("#meh", () => {
        it("should meh a song", done => {
            client.meh(done);
        });
    });

    skipIfTravis(isTravis)("#woot", () => {
        it("should woot a song", done => {
            client.woot(done);
        });
    });

    describe("#addPlaylist", () => {
        it("should create a new playlist", done => {
            client.addPlaylist("testPlaylist", (err, playlist) => {
                expect(err).to.be.equal(null);
                expect(playlist).to.be.an("object");

                objects.testPlaylist(testLogin.parse, playlist);

                if(!err)
                    _playlist = playlist.id;
                else
                    console.log("couldn't assign playlist, all functions which require a playlist won't be tested");

                done();
            });
        });
    });

    skipIfTravis(isTravis)("#grab", () => {
        it("should grab a song", done => {
            if (_playlist)
                client.grab(_playlist, done);
            else
                console.log("playlist not set, skipping grab");
        });
    });

    describe("#addMedia", () => {
        it("a media file from youtube and soundcloud", done => {
            const ytObj = {
                "title": "Nightstep - Army Of Two",
                "id": "6DSOGA9HQM4",
                "thumbnails": {
                    "default": {
                        "url": "https://i.ytimg.com/vi/6DSOGA9HQM4/default.jpg"
                    }
                }
            };

            const sndObj = {
                "title": "Smosh - Legend of Zelda rap",
                "id": 30271545,
                "duration": 213475,
                "artwork_url": "https://i1.sndcdn.com/artworks-000015183915-7m8l9z-large.jpg"
            };

            if (_playlist)
                client.addMedia(_playlist, [ytObj, sndObj], true, done);
            else
                console.log("playlist not set, skipping addMedia");
        });
    });

    skipIfTravis(isTravis)("#skipDJ", () => {
        it("should skip the current DJ", done => {
            client.skipDJ(testLogin.parse ? client.getBooth().dj : client.getBooth().currentDJ, done);
        });
    });

    skipIfTravis(isTravis)("#moveDJ", () => {
        it("should move a DJ to a new position in the waitlist", done => {
            if (!extendedTestCheck(2, done))
                return;

            let waitlist = client.getWaitlist();
            client.moveDJ(waitlist[waitlist.length - 1], 0, done);
        });
    });

    describe("#createRoom", () => {
        it("should create a new room with a timestamp as the name", done => {
            const date = Date.now().toString();
            client.createRoom(date, true, (err, room) => {
                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("Host limit reached");
                } else {

                    expect(err).to.be.equal(null);
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

    describe("#updateRoomInfo", () => {
        it("should update the room description and welcome message", done => {
            client.updateRoomInfo("testName", "testDesc", "testWelcome", err => {
                const meta = client.getRoomMeta();

                expect(meta.description).to.be.equal("testDesc");
                expect(meta.welcome).to.be.equal("testWelcome");
                done();
            });
        });
    });

    skipIfTravis(isTravis)("#muteUser", () => {
        it("should mute a user", done => {
            if (!extendedTestCheck(1, done))
                return;

            const user = getUsers()[0];

            if (user) {
                client.muteUser(user.id, client.MUTEDURATION.SHORT, client.BANREASON.VIOLATING_COMMUNITY_RULES, err => {

                    if(err) {
                        if(err.code === 403)
                            expect(err.message).to.equal("This user cannot be muted");
                    } else {
                        expect(err).to.equal(null);
                    }

                    done();
                });
            }
        });
    });

    describe("#getMutes", () => {
        it("should retrieve an array of mute objects", done => {
            client.getMutes((err, mutes) => {
                expect(err).to.be.equal(null);
                expect(mutes).to.be.an("array");

                if (mutes.length > 0)
                    objects.testMute(testLogin.parse, mutes[0]);

                done();
            });
        });
    });

    describe("#setMinChatLevel", () => {
        it("should set the minimum chat level", done => {
            client.setMinChatLevel(3, () => {
                expect(client.getMinChatLevel()).to.be.a("number").and.equal(3);
                done();
            });
        });
    });

    skipIfTravis(isTravis)("#addStaff", () => {
        it("should add a user as staff", done => {
            if (!extendedTestCheck(1, done))
                return;

            const user = getUsers()[0];
            client.addStaff(user.id, client.USERROLE.BOUNCER, done);
        });
    });

    skipIfTravis(isTravis)("#ignoreUser", () => {
        it("should ignore a user", done => {
            if (!extendedTestCheck(1, done))
                return;

            const user = getUsers()[0];
            client.ignoreUser(user.id, done);
        });
    });

    describe("#getIgnores", () => {
        it("should get all ignored users", done => {
            client.getIgnores((err, ignores) => {
                expect(err).to.be.equal(null);
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

    skipIfTravis(isTravis)("#removeIgnore", () => {
        it("should remove the previously ignored user", done => {
            if (!extendedTestCheck(1, done))
                return;

            const user = getUsers()[0];

            client.removeIgnore(user.id, (err, ignore) => {
                expect(err).to.be.equal(null);

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

    skipIfTravis(isTravis)("#removeStaff", () => {
        it("should remove the previously added staff member", done => {
            if (!extendedTestCheck(1, done))
                return;

            const user = getUsers()[0];

            client.removeStaff(user.id, err => {

                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("Cannot change the permissions for a higher ranking user");
                }

                done();
            });
        });
    });

    skipIfTravis(isTravis)("#removeDJ", () => {
        it("should remove a DJ from the waitlist", done => {
            if (!extendedTestCheck(1, done))
                return;

            const users = getUsers();

            client.removeDJ(users[0].id, err => {
                expect(err).to.be.equal(null);
                done();
            });
        });
    });

    skipIfTravis(isTravis)("#unmuteUser", () => {
        it("should unmute the previously muted user", done => {
            if (!extendedTestCheck(1, done))
                return;

            const user = getUsers()[0];
            client.unmuteUser(user.id, done);
        });
    });

    skipIfTravis(isTravis)("#banUser", () => {
        it("should ban a user", done => {
            if (!extendedTestCheck(1, done))
                return;

            _id = getUsers()[0].id;
            expect(_id).to.be.a("number");

            client.banUser(_id, client.BANDURATION.SHORT, client.BANREASON.VIOLATING_COMMUNITY_RULES, err => {

                if(err) {
                    if(err.code === 403)
                        expect(err.message).to.equal("Cannot ban a higher ranking user");
                }

                done();
            });
        });
    });

    skipIfTravis(isTravis)("#unbanUser", () => {
        it("should unban the previously banned user", done => {
            client.unbanUser(_id, done);
        });
    });

    describe("#requestSelf", () => {
        it("should request its own user state from the server", done => {
            client.requestSelf((err, self) => {
                expect(err).to.be.equal(null);
                objects.testSelf(testLogin.parse, self);

                done();
            });
        });
    });

    describe("#getMyHistory", () => {
        it("should request its own history", done => {
            client.getMyHistory((err, history) => {
                expect(err).to.be.equal(null);
                expect(history).to.be.an("array");

                if(history.length > 0)
                    objects.testHistoryEntry(testLogin.parse, history[0]);

                done();
            });
        });
    });

    describe("#getFriends", () => {
        it("should request all friends from the server", done => {
            client.getFriends((err, friends) => {
                expect(err).to.be.equal(null);
                expect(friends).to.be.an("array");

                if(friends.length > 0)
                    objects.testUser(testLogin.parse, friends[0]);

                done();
            });
        });
    });

    describe("#findPlaylist", () => {
        it("should search for playlists by their name", done => {
            client.findPlaylist("a", (err, playlists) => {
                expect(err).to.be.equal(null);
                expect(playlists).to.be.an("array");

                if(playlists.length > 0)
                    objects.testPlaylist(testLogin.parse, playlists[0]);

                done();
            });
        });
    });

    describe("#findMediaPlaylist", () => {
        it("should search for media in a playlist filtered by a keyword", done => {
            if (_playlist) {
                client.findMediaPlaylist(_playlist, "a", (err, media) => {
                    expect(err).to.be.equal(null);
                    expect(media).to.be.an("array");

                    if(media.length > 0) {
                        objects.testMedia(testLogin.parse, media[0]);
                        _media = media[0];
                    }

                    done();
                });
            } else {
                console.log("playlist not set, skipping findMediaPlaylist");
            }
        });
    });

    describe("#getPlaylists", () => {
        it("should get all playlists", done => {
            client.getPlaylists((err, playlists) => {
                expect(err).to.be.equal(null);
                expect(playlists).to.be.an("array");

                if (playlists.length > 0)
                    objects.testPlaylist(testLogin.parse, playlists[0]);

                done();
            });
        });
    });

    describe("#getPlaylist", () => {
        it("should return a playlist", done => {
            if(_playlist) {
                client.getPlaylist(_playlist, (err, playlist) => {
                    expect(err).to.be.equal(null);
                    expect(playlist).to.be.an("array");

                    if(playlist.length > 0)
                        objects.testMedia(testLogin.parse, playlist[0]);

                    done();
                });
            } else {
                console.log("playlist not set, skipping getPlaylist");
            }
        });
    });

    describe("#getFavoriteRooms", () => {
        it("should get all favorited rooms", done => {
            client.getFavoriteRooms((err, rooms) => {
                expect(err).to.be.equal(null);
                expect(rooms).to.be.an("array");

                if(rooms.length > 0) {
                    expect(rooms[0]).to.be.an("object");
                    objects.testExtendedRoom(testLogin.parse, rooms[0]);
                }

                done();
            });
        });
    });

    describe("#setProfileMessage", () => {
        it("should change its profile message", done => {
            client.setProfileMessage("testProfileMessage", done);
        });
    });

    describe("#renamePlaylist", () => {
        it("should rename a playlist", done => {
            if (_playlist)
                client.renamePlaylist(_playlist, "testName", done);
            else
                console.log("playlist not set, skipping grab");
        });
    });

    describe("#setAvatar", () => {
        it("should set the avatar of itself to base01", done => {
            client.setAvatar("base01", done);
        });
    });

    skipIfTravis(isTravis)("#setBadge", () => {
        it("should set the badge of itself to bt-g", done => {
            client.setBadge("bt-g", done);
        });
    });

    describe("#setLanguage", () => {
        it("should set the language of itself to english (en)", done => {
            client.setLanguage("en", done);
        });
    });

    {
        let _request = null;

        skipIfTravis(isTravis)("#getFriendRequests", () => {
            it("should request all friend requests from the server", done => {
                client.getFriendRequests((err, requests) => {
                    expect(err).to.be.equal(null);
                    expect(requests).to.be.an("array");

                    if(requests.length > 0) {
                        _request = requests[0].id;
                        objects.testFriendRequest(testLogin.parse, requests[0]);
                    }

                    done();
                });
            });
        });

        skipIfTravis(isTravis)("#rejectFriendRequest", () => {
            it("should reject a friend request", done => {
                if (_request !== null) {
                    client.rejectFriendRequest(_request, err => {
                        expect(err).to.be.equal(null);
                        // plug doesn't reallyID check if stated ID ever sent you a request
                        // so we will just check if this endpoint is still available

                        done();
                    });
                } else {
                    console.log("no friend requests to reject");
                    done();
                }
            });
        });
    }

    describe("#activatePlaylist", () => {
        it("should activate a playlist", done => {
            if (_playlist) {
                client.activatePlaylist(_playlist, (err, status) => {
                    expect(err).to.be.equal(null);
                    expect(status).to.be.an("number");

                    done();
                });
            } else {
                console.log("playlist not set, skipping activatePlaylist");
            }
        });
    });

    describe("#joinWaitlist", () => {
        it("should join the waitlist", done => {
            client.joinWaitlist((err, waitlist) => {
                expect(err).to.be.equal(null);

                done();
            });
        });
    });

    describe("#leaveWaitlist", () => {
        it("should leave the waitlist", done => {
            client.leaveWaitlist((err, waitlist) => {
                expect(err).to.be.equal(null);

                done();
            });
        });
    });

    describe("#moveMedia", () => {
        it("should move a media entry to another position", done => {
            if (_playlist) {
                client.moveMedia(_playlist, [_media.id], _media.id, (err, playlist) => {

                    if(err) {
                        if(err.code === 400)
                            expect(err.message).to.equal("ids is required");
                    } else {
                        objects.testMedia(testLogin.parse, playlist[0]);
                    }

                    done();
                });
            } else {
                console.log("playlist not set, skipping moveMedia");
            }
        });
    });

    describe("#updateMedia", () => {
        it("should update the media title and author with testTitle and testAuthor", done => {
            if (_playlist)
                client.updateMedia(_playlist, _media.id, "testAuthor", "testTitle", done);
            else
                console.log("playlist not set, skipping updateMedia");
        });
    });

    describe("#shufflePlaylist", () => {
        it("should shuffle a playlist", done => {
            if (_playlist) {
                client.shufflePlaylist(_playlist, (err, playlist) => {
                    expect(err).to.be.equal(null);
                    expect(playlist).to.be.an("array");

                    if(playlist.length > 0)
                        objects.testMedia(testLogin.parse, playlist[0]);

                    done();
                });
            } else {
                console.log("playlist not set, skipping shufflePlaylist");
            }
        });
    });

    skipIfTravis(isTravis)("#addFriend", () => {
        it("should add a user as a friend", done => {
            const user = client.getUsers()[0];

            if (user)
                client.addFriend(user.id, done);
            else
                client._log(0, "could not test addFriend since user was not found in room");
        });
    });

    describe("#deleteMedia", () => {
        it("should delete a media object from a playlist", done => {
            if (_playlist) {
                client.deleteMedia(_playlist, [_media.id], (err, media) => {
                    expect(err).to.be.equal(null);
                    expect(media).to.be.an("array");

                    if(media.length > 0)
                        objects.testMedia(testLogin.parse, media[0]);

                    done();
                });
            } else {
                console.log("playlist not set, skipping deleteMedia");
            }
        });
    });

    describe("#deletePlaylist", () => {
        it("should delete a playlist", done => {
            if (_playlist)
                client.deletePlaylist(_playlist, done);
            else
                console.log("playlist not set, skipping deletePlaylist");
        });
    });

    describe("#favoriteRoom", () => {
        it("should favorite a room", done => {
            client.favoriteRoom(_room.meta.id, done);
        });
    });

    describe("#deleteNotification", () => {
        it("should delete a notification or error if no notification is available", done => {
            client.deleteNotification(329048, err => {
                expect(err).to.be.equal(null);
                // again plug doesn't tell us if that was successful or not
                // so we just check for the endpoint

                done();
            });
        });
    });

    skipIfTravis(isTravis)("#removeFriend", () => {
        it("should remove a user as a friend", done => {
            const user = client.getUsers()[0];

            if (user)
                client.removeFriend(user.id, done);
            else
                client._log(0, "could not test removeFriend since user was not found in room");
        });
    });

    describe("#getInventory", () => {
        it("should retrieve the inventory", done => {
            client.getInventory((err, inventory) => {
                expect(err).to.be.equal(null);
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

    describe("#getProducts", () => {
        it("should retrieve all the products of the base category", done => {
            client.getProducts("avatars", "base", (err, base) => {
                expect(err).to.be.equal(null);
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

    describe("#getTransactions", () => {
        it("should retrieve an array of transactions", done => {
            client.getTransactions((err, transactions) => {
                expect(err).to.be.equal(null);
                expect(transactions).to.be.an("array");

                if(transactions.length > 0)
                    objects.testTransaction(testLogin.parse, transactions[0]);

                done();
            });
        });
    });

    describe("#purchaseUsername", () => {
        it("should purchase a new username", done => {
            client.purchaseUsername(testLogin.usernameToBuy, (err, item) => {
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

    describe("#purchaseItem", () => {
        it("should buy an item from the store", done => {
            client.purchaseItem(_store.id, (err, item) => {
                if(err) {
                    expect(err.message).to.equal("owned");
                } else {
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
                }

                done();
            });
        });
    });
});

describe("Local", () => {

    describe("#getJar", () => {
        it("should return the jar used for http requests", () => {
            expect(client.getJar()).to.be.an("object");
        });
    });

    describe("#setJar", () => {
        it("should set the jar that is used for http requests", () => {
            const jar = client.getJar();
            client.setJar(jar);
            expect(client.getJar()).to.equal(jar);
        });
    });

    skipIfTravis(isTravis)("#getChatByUsername", () => {
        it("should get the messages written by a user", () => {
            const user = client.getSelf();

            let messages = client.getChatByUsername(user.username);

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

    describe("#getChat", () => {
        it("should get the whole chat", () => {
            expect(client.getChat()).to.be.an("array");
        });
    });

    skipIfTravis(isTravis)("#removeChatMessage", () => {
        it("should remove a chat message", () => {
            let chat = client.getChat();
            let length = chat.length;

            if(chat.length > 0) {
                client.removeChatMessage(chat[0].cid, false);
                expect(length).to.not.equal(chat.length);
            }
        });
    });

    skipIfTravis(isTravis)("#removeChatMessagesByUser", () => {
        it("should delete all messages of a user", () => {
            client.sendChat("test");
            const user = client.getSelf();

            if (user) {
                client.removeChatMessagesByUser(user.username, true);
                expect(client.getChatByUsername(user.username)).to.be.an("array").and.have.length(0);
            } else {
                client._log("could not test removeChatMessagesByUser since user was not found in room");
            }
        });
    });

    describe("#clearChatCache", () => {
        it("should clear the chat cache", () => {
            client.clearChatCache();
            expect(client.getChat()).to.have.length(0);
        });
    });

    describe("#watchUserCache", () => {
        it("should activate the user cache", () => {
            client.watchUserCache(true);
            expect(client.cleanCacheInterval).to.not.equal(-1);
        });
    });

    describe("#cacheChat", () => {
        it("should activate the chat cache", () => {
            client.cacheChat(true);
            expect(client.isChatCached()).to.equal(true);
        });
    });

    describe("#setChatCacheSize", () => {
        it("should set the chat cache size to 128", () => {
            expect(client.setChatCacheSize(128)).to.equal(128);
        });
    });

    describe("#cacheUserOnLeave", () => {
        it("should enable user caching for those who leave", () => {
            client.cacheUserOnLeave(true);
            expect(client.isUserCachedOnLeave()).to.equal(true);
        });
    });

    skipIfTravis(isTravis)("#clearUserFromLists", () => {
        it("should clear the user from the vote and grab list", () => {
            const user = client.getUsers()[0];

            if (user) {
                client.clearUserFromLists(user.id);
                let done = true;

                for(let i = 0, l = client.state.room.votes.length; i < l; i++) {
                    if(user.id == client.state.room.votes[i]) {
                        done = false;
                        break;
                    }
                }

                expect(done).to.equal(true);
            } else {
                client._log(0, "could not test clearUserFromLists since no user was found in room");
            }
        });
    });

    describe("#invokeLogger", () => {
        it("should invoke a logging function", () => {
            const logger = msg => {
                console.log(msg);
            };

            client.invokeLogger(logger);
            expect(client.log).to.equal(logger);
        });
    });

    describe("#getRoom", () => {
        it("should get the current room's stats", () => {
            const room = client.getRoom();

            objects.testRoom(testLogin.parse, room);
        });
    });

    skipIfTravis(isTravis)("#getUserByName", () => {
        it("should get a user by name", () => {
            const user = client.getUsers()[0];
            objects.testUser(testLogin.parse, client.getUserByName(user.username));
        });
    });

    skipIfTravis(isTravis)("#getUserById", () => {
        it("should get a user by their ID", () => {
            const user = client.getUsers()[0];
            objects.testUser(testLogin.parse, client.getUserById(user.id));
        });
    });

    skipIfTravis(isTravis)("#getUserRole", () => {
        it("should get a user's role", () => {
            const user = client.getUsers()[0];
            expect(client.getUserRole(user.id)).to.equal(user.role);
        });
    });

    describe("#getUsers", () => {
        it("should get all users that are currently in the room", () => {
            const users = client.getUsers();

            expect(users).to.be.an("array");

            if(users.length > 0)
                objects.testUser(testLogin.parse, users[0]);
        });
    });

    describe("#getSelf", () => {
        it("should get a representation of itself", () => {
            objects.testUser(testLogin.parse, client.getSelf());
        });
    });

    describe("#setSetting", () => {
        it("should change a setting and save it", done => {
            const chatImages = client.getSetting("chatImages");
            client.setSetting("chatImages", !chatImages, err => {
                expect(err).to.be.equal(null);
                expect(chatImages).to.not.equal(client.getSetting("chatImages"));
                done();
            });
        });
    });

    describe("#getSetting", () => {
        it("should return one setting (exp: chatImages)", () => {
            expect(client.getSetting("chatImages")).to.be.a("boolean");
        });
    });

    skipIfTravis(isTravis)("#isFriend", () => {
        it("should indicate whether a user is a friend or not", () => {
            if (!extendedTestCheck(1))
                return;

            const user = getUsers()[0];
            expect(client.isFriend(user.id)).to.be.a("boolean");
        });
    });

    skipIfTravis(isTravis)("#getDJ", () => {
        it("should get the current DJ playing", () => {
            const dj = client.getDJ();

            if(dj)
                objects.testUser(testLogin.parse, dj);
        });
    });

    skipIfTravis(isTravis)("#getMedia", () => {
        it("should return the current media object", () => {
            objects.testMedia(testLogin.parse, client.getMedia());
        });
    });

    describe("#getPlayback", () => {
        it("should get the playback object", () => {
            const playback = client.getPlayback();
            objects.testPlayback(testLogin.parse, playback);
        });
    });

    describe("getStartTime", () => {
        it("should get the start time from the playback object", () => {
            expect(client.getStartTime()).to.be.a("string");
        });
    });

    describe("#getBooth", () => {
        it("should get the booth", () => {
            const booth = client.getBooth();
            objects.testBooth(testLogin.parse, booth);
        });
    });

    describe("#getRoomMeta", () => {
        it("should get the metadata of the room", () => {
            const meta = client.getRoomMeta();
            objects.testMeta(testLogin.parse, meta);
        });
    });

    describe("#getFX", () => {
        it("should get the fx settings of the room", () => {
            expect(client.getFX()).to.be.an("array");
        });
    });

    skipIfTravis(isTravis)("#checkGlobalRole", () => {
        it("should give back the global role of a user", () => {
            const user = client.getUsers()[0];
            expect(client.checkGlobalRole(user.gRole)).to.be.a("number");
        });
    });

    describe("#getHostName", () => {
        it("should get the name of the host of the room", () => {
            expect(client.getHostName()).to.be.a("string");
        });
    });

    describe("#getHostID", () => {
        it("should get the ID of the host of the room", () => {
            expect(client.getHostID()).to.be.a("number");
        });
    });

    describe("#getPopulation", () => {
        it("should return the population of the room", () => {
            expect(client.getPopulation()).to.be.a("number").and.be.above(0);
        });
    });

    describe("#getGuests", () => {
        it("should return the amount of guests in the room", () => {
            expect(client.getGuests()).to.be.a("number");
        });
    });

    describe("#getMinChatLevel", () => {
        it("should return the minimum chat level needed to communicate", () => {
            expect(client.getMinChatLevel()).to.be.a("number");
        });
    });

    describe("#isFavorite", () => {
        it("should return if the current room is favorited", () => {
            expect(client.isFavorite()).to.be.a("boolean");
        });
    });

    describe("#getRoomName", () => {
        it("should return the room name", () => {
            expect(client.getRoomName()).to.be.a("string");
        });
    });

    describe("#getDescription", () => {
        it("should return the room description", () => {
            expect(client.getDescription()).to.be.a("string");
        });
    });

    describe("#getWelcomeMessage", () => {
        it("should return the welcome message of the room", () => {
            expect(client.getWelcomeMessage()).to.be.a("string");
        });
    });

    describe("#getSlug", () => {
        it("should return the URL conform name of the room", () => {
            expect(client.getSlug()).to.be.a("string");
        });
    });

    describe("#getWaitlist", () => {
        it("should return an array with IDs representing the waitlist", () => {
            expect(client.getWaitlist()).to.be.an("array");
        });
    });

    describe("#isWaitlistLocked", () => {
        it("should return a boolean indicating whether the waitlist is locked or not", () => {
            expect(client.isWaitlistLocked()).to.be.a("boolean");
        });
    });

    describe("#doesWaitlistCycle", () => {
        it("should return a boolean indicating whether the waitlist cycle is enabled or not", () => {
            expect(client.doesWaitlistCycle()).to.be.a("boolean");
        });
    });

    describe("#getVotes", () => {
        describe("withUserObject", () => {
            it("should return an array representing the current votes from their respective users", () => {
                const votes = client.getVotes(true);

                expect(votes).to.be.an("array");

                if (votes.length > 0) {
                    expect(votes[0]).to.be.an("object");
                    expect(votes[0]).to.have.all.keys([
                        "direction",
                        "user"
                    ]);

                    expect(votes[0].direction).to.be.a("number");
                    expect(votes[0].user).to.be.an("object");
                    objects.testUser(testLogin.parse, votes[0].user);
                }
            });
        });

        describe("withIDs", () => {
            it("should return an array representing the current votes", function() {
                const votes = client.getVotes();

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

    describe("#getGrabs", () => {
        describe("withUserObject", () => {
            it("should return an array representing the grabs with their respective users", () => {
                const grabs = client.getGrabs(true);

                expect(grabs).to.be.an("array");

                if(grabs.length > 0) {
                    expect(grabs[0]).to.be.an("object");
                    objects.testUser(testLogin.parse, grabs[0]);
                }
            });
        });

        describe("withoutUserObjects", () => {
            it("should return an array representing the grabs", () => {
                const grabs = client.getGrabs();

                expect(grabs).to.be.an("array");

                if(grabs.length > 0)
                    expect(grabs[0]).to.be.a("number");
            });
        });
    });

    skipIfTravis(isTravis)("#cacheUser", () => {
        it("should cache a user", () => {
            if (!extendedTestCheck(1))
                return;

            const user = getUsers()[0];
            const cache = client.getUserById(user.id, client.CACHE.ONLY);

            if (cache) {
                expect(cache.id).to.be.equal(user.id);
                expect(client.cacheUser(user)).to.be.a("boolean").and.equal(false);
            } else {
                expect(client.cacheUser(user)).to.be.a("boolean").and.equal(true);
            }
        });
    });

    skipIfTravis(isTravis)("#removeCachedUserById", () => {
        it("should remove a cached user by their ID", () => {
            if (!extendedTestCheck(1))
                return;

            const user = getUsers()[0];
            const cache = client.getUserById(user.id, client.CACHE.ONLY);

            if (cache)
                expect(client.cacheUser(user)).to.be.a("boolean").and.equal(true);

            expect(client.removeCachedUserById(user.id)).to.be.a("boolean").and.equal(true);
        });
    });

    skipIfTravis(isTravis)("#removeCachedUserByUsername", () => {
        it("should remove a cached user by their Name", () => {
            if (!extendedTestCheck(1))
                return;

            const user = getUsers()[0];
            const cache = client.getUserById(user.id, client.CACHE.ONLY);

            if (!cache)
                expect(client.cacheUser(user)).to.be.a("boolean").and.equal(true);

            expect(client.removeCachedUserByUsername(user.username)).to.be.a("boolean").and.equal(true);
        });
    });

    describe("#getStaffOnline", () => {
        it("should get the staff that is currently online", () => {
            const staff = client.getStaffOnline();

            expect(staff).to.be.an("array");

            if(staff.length > 0) {
                expect(staff[0]).to.be.an("object");
                objects.testUser(testLogin.parse, staff[0]);
            }
        });
    });

    describe("#getStaffOnlineByRole", () => {
        it("should get the staff with a rank higher or equal that of a co-host", () => {
            const staff = client.getStaffOnlineByRole(client.USERROLE.COHOST);

            expect(staff).to.be.an("array");

            if(staff.length > 0) {
                expect(staff[0]).to.be.an("object");
                objects.testUser(testLogin.parse, staff[0]);
            }
        });
    });

    describe("#getStaffByRole", () => {
        it("should get the staff filtered by a certain role (exp: CO-HOST)", done => {
            client.getStaffByRole(client.USERROLE.COHOST, (err, staff) => {
                expect(staff).to.be.an("array");

                if(staff.length > 0) {
                    expect(staff[0]).to.be.an("object");
                    expect(staff[0].role).to.be.equal(client.USERROLE.COHOST);
                    objects.testUser(testLogin.parse, staff[0]);
                }

                done();
            });
        });
    });
});
