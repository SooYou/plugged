[![](https://nodei.co/npm/plugged.png?downloadRank=true)](https://npmjs.com/package/plugged)

[![](https://travis-ci.org/SooYou/plugged.svg)](https://travis-ci.org/SooYou/plugged) [![](https://david-dm.org/SooYou/plugged.svg)](https://david-dm.org/SooYou/plugged)

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
const Plugged = require("plugged");
const plugged = new Plugged();

const joined = function(err, room) {
    if (!err) {
        plugged.on(plugged.ADVANCE, function _advance() {
            //WOOT!
            plugged.woot();
        });
    }
    else
    {
        console.log(err);
    }
};

const loggedIn = function(err, me) {
    if (!err) {
        plugged.cacheChat(true);
        plugged.connect("exampleroom", joined.bind(this));
    }
    else
    {
        console.log(err);
    }
}

// log into the service
plugged.login({ email: "examplemail@examplehost.com", password: "examplepassword" }, loggedIn.bind(this));
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
plugged.login({
    userID: "your ID here",
    accessToken: "your access token here"
});
...
```

to keep the behaivour clear, if you enter both email and facebook login credentials plug will return an "malformed credentials" error.


Restart without the whole login procedure
==========
To save some time you can restart your application without going through the whole login procedure. All you have to do is to save the cookie jar and the auth token and return them to plugged once you start your application again.

getting the necessary data:

```JavaScript
plugged.getAuthToken(function (err, token) {
    // save the token
});

plugged.getJar();
```

putting it back in:

```JavaScript
var token = null;
var jar = null;

// read token and jar from DB, file, etc.

plugged.setJar(jar);

// the token has a higher priority
plugged.login({ ... }, token);
```

How you save it and what you want to do with it is up to you. There's a multitude of ways to save this and it's probably better that you do that since you know best how your application should behave and under which conditions like os, environment, etc.

Remember, both, the facebook token and the auth token are not meant forever. So you should keep this in mind while developing your application.
