==========
Quickstart
==========

This tutorial will help you do your first steps with a simple example app.
Once you are done you should be able to understand the basic functionality
of Plugged and how it works on the surface. From there you can start your
project and keep the :doc:`reference</reference/index>` up to help you
with functions.


Requirements
------------

Before we start let me get some requirements set, so you don't experience any
hiccups.

To finish this tutorial you should have:

    1. A working Computer
    2. `Node <https://nodejs.org>`_ installed in version 6.6+
    3. a cmd you like to use
    4. an editor, personally I recommend
       `VS Code <https://code.visualstudio.com/>`_
       or `SublimeText <https://www.sublimetext.com/>`_
    5. 20 minutes

Once we got that checked, let's go on.


Getting started
---------------

To get you started without much hassle, we first need to determine which
operating system you use. So just click on one of the listed below so we
can get to the meat.

To start you should first open PowerShell (if you're using windows) or bash.
Now you should be in your home directory, so you start by creating a folder by
entering the following two lines:

.. code-block:: Bash

    mkdir getplugged
    cd getplugged


Now you should be in your project directory. So the next up is that we
ask npm to initialize a new project for us, this can be done easily by entering:

.. code-block:: Bash

    npm init


Now you will be asked a few questions about your project. Most information on
the questions can be found out by checking out google real quick. Now I would
do a walkthrough to that too, but npm might change over time and has already
changed a lot in between node versions so I will just stay quiet and wait for
you here. Yes, go on, no haste.

Now that you initialized the project we will need to pull in Plugged as a
dependency. We can do this by entering:

.. code-block:: Bash

    npm install --save plugged


The *--save* is there to add a line in your dependencies object in package.json

Next you should create a new file to create our bot in. In this example
we'll use the name *bot.js* for it.


Getting to code
---------------

Alright, on to the good part. Now we start programming our example. First off
we need to get access to our Plugged dependency. This is done by writing:

.. code-block:: JavaScript

    const Plugged = require("plugged");


Perfect! Now we need to create our bot class, we do this by writing down the
following lines:

.. code-block:: JavaScript

    class Bot extends Plugged {
        constructor(options={}) {
            super(options);
        }
    }

    module.exports = Bot;


Now that we got this set, I'll explain some things. What we did here is to
inherit Plugged into our bot class. So we have access to all its functions
through *this*... t.. the keyword, I mean.

the options argument passed in the constructor enables you to pass several 
startup settings to Plugged as shown :doc:`here</datatypes/index>` .

The last line is just us using CommonJS to export our class so we can pull it
in with require later.

Next we should flesh out our Bot class so that it is able to greet people.
For that we need something to make it say something and, as we all know, What
is better for that than a function? Time to extend our class!

.. code-block:: JavaScript

    class Bot extends Plugged {
        constructor(options={}) {
            super(options);
        }
        
        // here we add our new code
        greet(user) {
            this.sendChat(`Hi, @${user.username}`);
        }
    }


The greet function will accept a :doc:`user</datatypes/user>` object as
parameter. We will use this to identicate the user we want to greet.

The next line uses the :doc:`sendChat</reference/sendChat>` function to send
a message in chat. As parameter, we define a template string in which we use the
user object to identify who we want to greet. While the *${*...*}* is syntax
relevant to implement a variable in a template string, the @ is not. It is just
there to make plug notify the user about our message.

And thus, we're done with our bot class! Yes, that's it, but don't wipe your
sweat so soon. There's one part remaining, The wire up!

You probably figured that something is still missing and thought:
*"but we need to call that function somewhere"* yes, you are
absolutely right! We will come to this now.

To get a little more precise about it, we need to think about what we want to
achieve in this last part, to summarize our problem we stand in front of:

*how do we figure out when a new user joins the room, also how do we connect to
plug.dj and a room*

This is relatively easy thanks to Plugged! Which is also why we are already done
with our bot class. Remember that we inherited Plugged into our class?
We inherited all functionality of Plugged with it into our Bot class, so our
bot class is not just *one* function big, but it has **plenty** of functionality
already built in thanks to this inheritation of which we will make use now!

So hit up your editor and create a new file called *app.js* and write down
the following code:

.. code-block:: JavaScript

    const OurSuperAwesomeBot = require("./bot");
    const bot = new OurSuperAwesomeBot();
    
    /**
    * NOTE: you need to change the email and password to your own,
    * it has to be a second account.
    * Otherwise you won't see the message in the end!
    */
    bot.login({
        email: "example@examplehost.moe",
        password: "examplepassword"
    });


Alright to explain this part, in the first line we do what we did in bot.js
already with Plugged. We pull in a reference to our bot class. The next
line creates a new instance of our super awesome bot class.

Since we created a new instance of our bot we are now able to use its
functionality which will help us solve one of our problems directly.

The :doc:`login</reference/login>` function logs us with our credentials into
plug, after that we're able to join rooms and use other non room related
functions.

Next we need to wire everything to the respective events. Plugged
uses **a lot** of events. I am not kidding. There's plenty of actions that erupt
as events, but that's a topic for another time, so we'll just need 3 events
which are:

* :doc:`LOGIN_SUCCESSFUL</events/LOGIN_SUCCESSFUL>`
* :doc:`ROOM_CONNECTED</events/ROOM_CONNECTED>`
* :doc:`USER_JOIN</events/USER_JOIN>`

Using these events is as simple as using the functions *on* and *once*

.. code-block:: JavaScript

    const OurSuperAwesomeBot = require("./bot");
    const bot = new OurSuperAwesomeBot();
    
    bot.login({
        email: "example@examplehost.moe",
        password: "examplepassword"
    });

    // new code here!
    bot.once("LOGIN_SUCCESSFUL", () => {
        console.log("connected to plug!");
        // NOTE: also change this to a room >>you own<<!
        bot.connect("exampleroom");
    });

    bot.once("ROOM_CONNECTED", () => {
        console.log("connected to room!");
        bot.on("USER_JOIN", user => bot.greet(user));
    });



To explain the last part, what we did here is to register a function once on
the *LOGIN_SUCCESSFUL* event which will, once emitted, log to our console
that it actually connected successfully so that we know it actually did work!

In the next line we use :doc:`connect</reference/connect>` to connect to a room,
the parameter we gave it is the name of the room we want to connect to.

The second function we register once is on the *ROOM_CONNECTED* event, which
will be emitted once we are connected to the room.


.. hint::

   As you might notice I used the word once in both cases. This identifies a
   good reason why we use the once function instead of the on function. For our
   case, it does not make sense to leave those two functions registered since
   those two events will only be called once and that's it. For this exact
   reason it is good practice to leave the cleanup to the system and not let us
   bother about it.

In this function we once again log an output to the console so we know we are
actually connected to our room. The last new part includes the registration
of the our greet function on the *USER_JOIN* event, which passes a
:doc:`user</datatypes/user>` object to the function.

And we're done! Yep, that's it! Time to let it run and see how it does.
Save your files and open a commandline window, now type

.. code-block:: Bash

    cd path/to/our/bot
    node app.js


this will start up our bot, next up is to go to the room you passed in as a
parameter on :doc:`connect</reference/connect>` and you should see your bot
greeting you by your username!

Congratulations, you just wrote your first bot for plug.dj!


Where to go from here
---------------------

I hope I could fire you a bit up for your own steps into this and get all tingly
for a project. In case you haven't had any ideas yet, you should check out the
:doc:`notable mentions</guide/notablementions>` page. It contains some of the
projects that use Plugged. Also there's the possibility for you to check out
the :doc:`cookbook</cookbook/index>` which contains examples for various use
cases as well as best practices for Plugged.

PS: :doc:`this</reference/index>` will likely become your new best friend on
your journey
