=======
Changes
=======

Major changes with 3.0.0
########################

use the latest, stable es6 features
-----------------------------------

The code is now updated to the ECMA2015 standard, also known as ES6.
This allows for a much cleaner codebase as well as some nifty and logical updates
that were much needed.

score now represents an actual model
------------------------------------

Score is now represented by an actual model... yes, ain't nothin more to it.

updated getCSRF to use the new API endpoint
-------------------------------------------

getCSRF was pretty flaky before because it had to receive the plug.dj landing page first
and then had to parse the token out of the head of the page. This was quite a bit of data
to be processed and understood by the function. Ever since plug.dj set out to make their
mobile client, they have an endpoint to receive the token. Obviously this was the perfect
opportunity to make use of it.
A thank you goes to `Nodle <https://github.com/Nodle>`. Who notified me about the endpoint
being available in #22

validateRoomName and validateUsername return the sanitized string now instead of an object
------------------------------------------------------------------------------------------

validateRoomName and validateUsername both returned an object which encapsuled the actual
string again. This was pretty useless since every developer who wanted to make use of that
function had to extract the string before using it. This is now a thing of the past.
To all developers using it, please remember to change that in your codebase, thank you!

added data checks to GRAB event
-------------------------------

The grab event was parsed without many checks about the what and when, this also is fixed
with this version. So better behave, data. We are onto you!

added return value to clearUserFromLists
----------------------------------------

clearUserFromLists had no return value before, so you couldn't know for sure whether the
user was cleared from the list or not. It was just a guess kind of thing. Now whenever the
user is found and cleared from the lists, the function will tell you so.

cacheChat now returns boolean value indicating if it was set
------------------------------------------------------------

Same goes for cacheChat, it returns its set value now, so you can save it if needed.

flattened the response of activatePlaylist to just return the playlist ID
-------------------------------------------------------------------------

Quite like validateRoomName and validateUsername and validateRoomName. Now returns the
plain number of the activated playlist.

refactored all models to use unix time now
------------------------------------------

This was done before, but not for all models. Plug has some really awkward way of
representing the current time. `schrobby <https://github.com/schrobby>` and I fixed that
early in development. Now all models used in plugged that hold a date or time will
give you the proper unix representation.

refactored _connectSocket
-------------------------

connectSocket was kind of messy. I would like to write more about it but that's pretty
much it. It is cleaner now, everybody likes neat, clean stuff am I right? right.

refactored login
----------------

Login was kind of messy for others to read and open source is all about fun, contribution
and openness. I want to appeal to a lot of people who want to dive into making their room
a special place on plug.dj. So making it easy for people to know how the interface they
want to use works, is one of the uppermost priorities of this project. This is why the
refactor was long overdue. I hope this makes it a bit more readable for everybody.

refactored keepAlive as well to better suit everyone's needs
------------------------------------------------------------

keepAlive was not as much of a problem of readability but much more of the way it was
handled. It had a lot of magic values and fixed constants to work. This is now all
customizable if wanted by the following functions:

    * setMaxTimeout
    * getMaxTimeout
    * setHeartbeatRate
    * getHeartbeatRate

Otherwise the default max timeout is 60 seconds and the heartbeat rate is 20 seconds.

refactored log
--------------

Log was kind of off putting. It didn't really fit in, it was kind of an early development
thing that was carried around for longer than it should. This is why the logger got
pulled completely and the log function internally got refactored.
You can just invoke your own logger and set the verbosity needed for your application now.
Everything else is done internally and you'll get notified whether the verbosity is
satisfied.
I hope that makes life easier for everybody!

refactored _wsaprocessor and renamed to _eventProcessor
-------------------------------------------------------

_connectSocket was a huge switch statement which did hold all websocket events before.
Now, with some javascript object "trickery" and the _call_ function, this has been reduced
to a mere couple of lines. The work to be done on the event is now outsourced into
functions which reside in events.js

refactored chat into an object
------------------------------

All chat related functionality was directly added to the Plugged class. To group things
up a bit and make it easier to read I put every chat related member into an object
literal.

refactored the removeChatMessage* functions
-------------------------------------------

The removeChatMessage* functions were a bit messy and all over the place, now they share
the important parts and use a comparator function instead. If this goes on I should just
call 3.0 "Squeaky clean" but then again we don't want to go down that road of naming major
releases, do we?

refactored query to hold all options in an object
-------------------------------------------------

Like with chat, but it is requests!

refactored all tests to adapt to the new code
---------------------------------------------

Obligatory refactor of all tests


fixed timing bug with query and chat
------------------------------------

Both query and chat had a bug which allowed to spam requests in a way that would trigger
the floodAPI event. It was enough to do request in recurring order without enough time
in between. This is now fixed and instead, the requests will be slowed down earlier, but
allow you to code your requests freely without having to check not to flood the API.
If this should in any case be a problem for someone's program, please contact me, this
either needs to be adjusted then or a different fix must be found.

fixed bug in requestSelf
------------------------

Before, when requestSelf was called, the self object was updated with it as well, this
allowed for some inconsistencies on your account object when you are in a room while
calling it.

a new documentation (This should solve a lot of starter issues)
---------------------------------------------------------------

Oi, you are reading this right now mate. At long last, plugged gets a proper, not awfully
written, not hard to navigate and actual full documentation. Which is also included in the
code itself! So if you are using a neat editor like Visual Studio Code or any other which
allows for JSDoc to be parsed, you are good to go!

I hope this makes everyones lives easier.

the previous model was added into the documentation
---------------------------------------------------

Previous is now a model, end of message.

mapped PlaylistCycle
--------------------

PlaylistCycle was just passed as is from the websocket. Which was a no go in case plug.dj
changes the model. So now it gets mapped. hurray for standardized models!

mapped LevelUp
--------------

Also LevelUp is mapped now as well as...

mapped Transaction
------------------

the Transaction model!

added setHeartbeatRate function in action of refactoring keepAlive
------------------------------------------------------------------

Comes in pair with getHeartbeatRate. Which means you can now set how often plugged should
check if the websocket connection is still alive.

added getHeartbeatRate function in action of refactoring keepAlive
------------------------------------------------------------------

See above.

added setVerbosity function in action of refactoring log
--------------------------------------------------------

Comes in pair with getVerbosity. Which means you can now set the verbosity of the log
function! The higher the value, the more info you get from plugged!

added getVerbosity function in action of refactoring log
--------------------------------------------------------

See above.

added waitlistBan event
-----------------------

A new functionality that was added by plug.dj, so obviously it is now available in plugged
as well.

added sendSOS method
--------------------

Allows to send an SOS message to the global mods. Please only use it if absolutely
necessary.

added _removeChatMessage
------------------------

Internal function which basically allows for both removeChatMessage* functions to share
most of their code.

added setMaxTimeout
-------------------

Similar to heartbeatRate, except that this sets how long plugged should wait before it
declares the websocket connection as lost.

added getMaxTimeout
-------------------

See above.

added _clearHeartbeat
---------------------

Clears the heartbeat. An internal function which gets used mostly by _clearState.

removed logger from the package since it served its purpose
-----------------------------------------------------------

As describe earlier, logger is now gone. Please revert to using a different logging
library or write your own.

removed JOINED_ROOM and PLUG_ERROR were removed, you have to use a callback now
-------------------------------------------------------------------------------

This is one of the most important changes for all plugged users out there!!!

In light of the situation and how it was implemented, it was kind of out of place for
what it did. almost as if unnecessary. Which is why it was removed. You now have to use
the callback to retrieve the result.

removed LOGIN_SUCCESSFULL, LOGOUT_SUCCESSFULL, LOGIN_ERROR and LOGOUT_ERROR
---------------------------------------------------------------------------

It showed over time that these events were mostly unnecessary and the more logical
thing was to use callbacks.

removed the previous waitlist from the waitlist event
-----------------------------------------------------

I don't know if someone really needed this but it was kind not really needed and it case
it actually was, you can probably implement it within seconds in your own program.


removed insertMedia function
----------------------------

Also a function that was weirdly implemented and not needed at all.
