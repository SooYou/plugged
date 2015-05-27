plugged
==========
plugged is a (v|f)ast JavaScript API for the plug.dj service.

Installation
==========
`npm install plugged`

How to use
==========
plugged is relatively easy to use. Most functions are exposed via events, thus it's easy to check for certain data.

To start with a simple bot, do this:

```javascript
var Plugged = require("plugged");
var plug = new Plugged();

// log into the service
plug.login({ email: "examplemail@examplehost.com", password: "examplepassword" });

plug.on(plug.LOGIN_SUCCESS, function _loginSuccess() {
    plug.cacheChat(true);
    plug.connect("exampleroom");
});

plug.on(plug.JOINED_ROOM, function _joinedRoom() {
    plug.on(plug.ADVANCE, function() {
        //WOOT!
        plug.woot();
    });
});
```

Events
==========
Most functionality is exposed via [Events](https://github.com/SooYou/plugged/wiki/Events). The wiki describes how to use what events when.

Server calls
==========
Sometimes you need to call data from the server, for example if you want to get your current playlist, add a new media file or get a certain list of rooms based on a search string.
All Server calls are described in the [wiki](https://github.com/SooYou/plugged/wiki)

Facebook login
==========
Some people might prefer taking the oauth route and use their fb login for plug. So this is possible since plugged@2.0.0 as well. All you have to do is to replace the login object with this one:

```JavaScript
...
plug.login({
    userID: "your ID here",
    accessToken: "your access token here"
});
...
```

to keep the behaivour clear, if you enter both email and facebook login credentials plug will return an "malformed credentials" error.


Restart without the whole login procedure
==========
To save some time you can restart your application without logging back in. All you have to do is to save the cookie jar and the auth token and return them to plugged once you start your application again.

getting the necessary data:

```JavaScript
plug.getAuthToken(function (err, token) {
    // save the token
});

plug.getJar();
```

putting it back in:

```JavaScript
var token = null;
var jar = null;

// read token and jar from DB, file, etc.

plug.setJar(jar);

// the token has a higher priority
plug.login({ ... }, token);
```

How you save it and what you want to do with it is up to you. There's a multitude of ways to save this and it's probably better that you do that since you know best how your application should behave and under which conditions like os, environment, etc.

Remember, both, the facebook token and the auth token are not meant forever. So you should keep this in mind while developing your application.
