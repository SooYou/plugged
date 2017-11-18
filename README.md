<p align="center">
    <a href="#">
        <img src="docs/.static/img/logo.svg" alt="" width=128 height=128>
    </a>

    <h3 align="center">Plugged</h3>
    <hr>
    <p align="center">
        plugged is a (v|f)ast JavaScript API for the plug.dj service
    </p>
</p>

Table of Contents
=================

- [Status](#status)
- [Documentation](https://sooyou.github.io/plugged)
- [Getting Started](#getting-started)
- [Running the tests](#running-the-tests)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Facebook login](#facebook-login)
- [Restart without logging in again](#restart-without-logging-in-again)
- [Versioning](#versioning)
- [Authors](#authors)
- [License](#license)


Status
======

[![](https://travis-ci.org/SooYou/plugged.svg)](https://travis-ci.org/SooYou/plugged) [![](https://david-dm.org/SooYou/plugged.svg)](https://david-dm.org/SooYou/plugged)

Getting started
===============
plugged is relatively easy to use. Here is a simple guide to get you started quick!

For a full tutorial on how to use plugged, please go to the [documentation page](https://sooyou.github.io/plugged/cookbook/quickstarts)

It is a good idea to check out the [documentation](https://sooyou.github.io/plugged) as well. It can be super useful for
your development! Otherwise there is still the [cookbook](https://sooyou.github.io/plugged/cookbook) but that is maybe something for after the
tutorial below.

Requirements
------------

Before we start let me get some requirements set, so you don't experience any
hiccups.

To finish this tutorial you should have:

1. A working Computer
2. [Node](https://nodejs.org) installed in version 6.6+
3. a cmd you like to use
4. an editor, personally I recommend
   [VS Code](https://code.visualstudio.com/)
   or [SublimeText](https://www.sublimetext.com/)
5. 20 minutes

Once we got that checked, let's go on.

Open up your favorite command line switch to the folder of your choice and type

```bash
    mkdir getplugged
    cd getplugged
```

Now you should be in your project directory. So the next up is that we
ask npm to initialize a new project for us, this can be done easily by entering:

```bash
    npm init
```

This will set up a basic project (npm package) for you

Now that you initialized the project we will need to pull in Plugged as a
dependency. We can do this by entering:

```bash
    npm install --save plugged
```

Next you should create a new file to create our bot in. In this example
we'll use the name *bot.js* for it.


An example
----------

Copy paste this into your bot.js file:

```JavaScript
const Plugged = require("plugged");

    class OurSuperAwesomeBot extends Plugged {
        constructor(options) {
            super(options);
        }

        greet(user) {
            this.sendChat(`Hi @${user.username}`);
        }
    }

    const bot = new OurSuperAwesomeBot();

    const loggedIn = function(err, self) {
        if (!err) {
            // change exampleroom into your room of choice
            bot.connect("exampleroom", joinedRoom);
        } else {
            console.log(err);
        }
    };

    const joinedRoom = function(err, room) {
        if (!err) {
            console.log("connected to room!");
            bot.on("USER_JOIN", user => bot.greet(user));
        } else {
            console.log(err);
        }
    }

    bot.login({
        email: "example@examplehost.moe",
        password: "examplepassword"
    }, loggedIn);
```

This is a simple bot which will greet users once they join your room. Please keep in mind
that you have to change the room in *bot.connect("exampleroom", joinedRoom)* to a room of
your liking, preferrable one that you own and also change *bot.login({...}) at the bottom
to your credentials.

That is all it takes to get a basic bot running with plugged!

Running the tests
=================

To run the tests all you need to do is type:

```bash
npm run test
```

This will run a basic test for you. To get a more elaborated test, you need to join the
room with two additional accounts to make it work. Usually it is enough to run the basic
test though.

Deployment
==========

Once you are done with your project you can just run it with

```bash
node app.js
```

if your bot index is called app.js. You can also publish your package on npm and hit me
up with a pull request on the dev branch to get your project highlighted in the notable
mentions!

Contributing
============

The rules to contribute are simple:

Keep in style with the code.
----------------------------

This makes it easier for others to read the whole codebase
since otherwise they need to concentrate on the style of the
code more than what it actually does.

Make reasonable changes
-----------------------

The code should stay clean and mostly general. Plugged is a toolbox, not a chair. So
changes that would only make sense for one very particular thing that is not in the
general sense of what you want to do with plug and can't be used without context of
the program you are using it in should not end up in Plugged itself.

Have fun and be positive
------------------------

This one should be obvious. This is an open source effort, driven by people who do this
out of the love for programming and the idea of a platform. This means first and foremost
that everyone should have fun. Otherwise this turns into a job and a job without getting
paid is slavory.

Changes should be PR'd on the dev branch
----------------------------------------

Just to keep the master branch clean.

Don't be shy to open a PR or issue
----------------------------------

Without voice, there is no change. I appreciate every effort to make this project better
for everyone!


Facebook login
==============

Some people might prefer taking the oauth route and use their fb login for plug. So this is possible since plugged@2.0.0 as well. All you have to do is to replace the login object with this one:

```JavaScript
...
plugged.login({
    userID: "your ID here",
    accessToken: "your access token here"
} callback);
...
```

to keep the behaivour clear, if you enter both email and facebook login credentials plug will return an "malformed credentials" error.


Restart without logging in again
================================

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


Versioning
==========

Plugged uses [SemVer](http://semver.org/) for versioning.

We are currently at *3.0.0*

[![](https://nodei.co/npm/plugged.png?downloadRank=true)](https://npmjs.com/package/plugged)


Authors
=======

[Sooyou](https://github.com/SooYou)


License
=======

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/SooYou/plugged/blob/master/LICENSE) for details.
