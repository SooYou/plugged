=========
CHANGELOG
=========

.. toctree::
   :maxdepth: 1

   changes


3.1.0
-----

    * remove request as a dependency and instead use needle


3.0.3
-----

    * fix removeChatMessage bug in which username was an undefined variable.
    * fix documentation of removeChatMessagesByUsername which was missing a letter.
    * fix chat message object documentation.
    * fix removeChatMessage in which message was never deleted when found.


3.0.0
-----

    * use the latest, stable es6 features
    * score now represents an actual model
    * updated getCSRF to use the new API endpoint
    * validateRoomName and validateUsername return the sanitized string now instead of an
      object
    * added data checks to GRAB event
    * added return value to clearUserFromLists
    * cacheChat now returns boolean value indicating if it was set
    * flattened the response of activatePlaylist to just return the playlist ID
    * refactored all models to use unix time now
    * refactored _connectSocket
    * refactored login
    * refactored keepAlive as well to better suit everyone's needs
    * refactored log
    * refactored _wsaprocessor and renamed to _eventProcessor
    * refactored chat into an object
    * refactored the removeChatMessage* functions
    * refactored query to hold all options in an object
    * refactored chat to hold all related data in an object
    * refactored all tests to adapt to the new code
    * fixed timing bug with query and chat
    * fixed bug in requestSelf

    + a new documentation (This should solve a lot of starter issues)
    + the previous model was added into the documentation
    + mapped PlaylistCycle
    + mapped LevelUp
    + mapped Transaction
    + added setHeartbeatRate function in action of refactoring keepAlive
    + added getHeartbeatRate function in action of refactoring keepAlive
    + added setVerbosity function in action of refactoring log
    + added getVerbosity function in action of refactoring log
    + added waitlistBan event
    + added sendSOS method
    + added _removeChatMessage
    + added setMaxTimeout
    + added getMaxTimeout
    + added _clearHeartbeat

    - removed logger from the package since it served its purpose
    - removed JOINED_ROOM and PLUG_ERROR were removed, you have to use a callback now
    - removed LOGIN_SUCCESSFULL, LOGOUT_SUCCESSFULL, LOGIN_ERROR and LOGOUT_ERROR
    - removed the previous waitlist from the waitlist event
    - removed insertMedia function
