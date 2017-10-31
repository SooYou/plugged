=================
Private Functions
=================

.. role:: dt
   :class: datatype


This document will help you understand what the private functions of plugged do
so you can better understand what when happens, certainly not a must read but a
nice to have.


Functions
---------

_checkForPreviousVote
#####################

   Checks if a vote has changed. This prevents the system from adding multiple
   votes to the state by a single user.

   **Parameters**:

      * **vote**: :doc:`Vote</datatypes/vote>` checks if a User's vote has changed

   **Return Value**:

      :dt:`Boolean` true when the vote hasn't changed or is new, false otherwise


_clearState
###########

   Resets the internal state.

   **Parameters**:

      * :dt:`undefined`

   **Return Value**:

      :dt:`undefined`


_cleanUserCache
###############

   Removes all expired users from cache. Every user is cached for 5 minutes
   before their object will be disposed from cache, this is triggering a
   cleanup.

   **Parameters**:

      * :dt:`undefined`

   **Return Value**:

      :dt:`undefined`


_connectSocket
##############

   Connects to the WebSocket.

   **Parameters**:

      * :dt:`undefined`

   **Fires**:

      * :ev:`SOCK_OPEN`
      * :ev:`SOCK_CLOSED`
      * :ev:`SOCK_ERROR`

   **Return Value**:

      :dt:`undefined`


_getAuthToken
#############

   Retrieves auth token.

   **Parameters**:

      * **data**: :dt:`Object` placeholder
      * **callback**: :dt:`Function`

   **Return Value**:

      :dt:`undefined`


_getCSRF
#######

   Gets csrf token.

   .. note::

      This is one form of a prevention for a Man in the Middle Attack
      (short MitM). This token is only relevant for login, after that you'll not
      need it anymore which is the reason why this call is only successful
      before you logged in.


   **Parameters**:

      * **credentials**: :dt:`Object` login data to use.
      * **callback**: :dt:`function` called on retrieval.

   **callback**:

      * **err**: :dt:`String` possible error returned.
      * **credentials**: :dt:`Object` login data to use.
      * **csrf**: :dt:`String` the token.

   **Return Value**:

      * :dt:`undefined`


_keepAlive
##############

   Function that gets called by :ref:`_heartbeat</heartbeat>` to
   check if the connection to the server is still open. The check happens by a
   constant delta offset. If the server hasn't responded after 4 checks the
   connection will be reset by the client.

   **Parameters**:

      :dt:`undefined`

   **Fires**:

      * :ev:`CONN_WARNING` after every failed check
      * :ev:`CONN_PART` after 6 consequent fails

   **Return Value**:

      :dt:`undefined`


_heartbeat
##############

   Calls _keepAlive for consequent checks of an etablished server connection.

   **Parameters**:

      * :dt:`undefined`

   **Return Value**:

      :dt:`undefined`


_log
#########################

   Internal logging function that calls the invoked logger.

   **Parameters**:

      * :dt:`number` verbosity level of message |br|
      * :dt:`string` message to be logged

   **Return Value**:

      :dt:`undefined`


_loggedIn
#########################

   Last step in the login chain, this finally sets up the WebSocket connection
   and sets the initial state.

   **Parameters**:

      * :dt:`function` callback

   **Return Value**:

      :dt:`undefined`


_login
######

   Logs user in with the given credentials.

   **Parameters**:

      * **credentials** :dt:`Object` account information
      * **callback** :dt:`Function` callback
      * **tries** :dt:`Number` amount of unsuccessful tries

   **Return Value**:

      :dt:`undefined`


_processChatQueue
#################

   Processes a chat message from the buffer and sends it off to the server with
   some delay. The delay is set after the amount of messages that was sent in
   the past few seconds. If no messages were sent for a while, the delay will
   be reset to zero.

   **Parameters**:

      * **lastMessage**: :dt:`Number` unix time when last message was sent.

   **Return Value**:

      :dt:`undefined`


_removeChatMessageByDelay
#########################

   Delete a chat message based on its body. This is used by _processChatQueue
   when a message has the removal tag set.

   **Parameters**:

      * **message**: :dt:`String` message to delete

   **Return Value**:

      :dt:`undefined`


_removeChatMessage
#########################

   Delete a chat message. This is the core function of all chat deletion methods.
   It takes a function (comparator) which decides whether a message should be deleted or
   not.

   **Parameters**:

      * **compare**: :dt:`Function` comparing function to decide whether a message should
      be deleted. The passed argument is the chat message object
      * **cacheOnly**: :dt:`Boolean` if the message should only be deleted in cache
      * **count**: :dt:`Number` how many messages should be removed before the function
      quits. If not set, it will run through the whole chat cache.

   **Return Value**:

      :dt:`Number` amount of messages deleted


_sendMessage
############

   Sends a message to the server via WebSocket.

   **Parameters**:

      * **type**: :dt:`String` message type
      * **data**: :dt:`String|Number` JSON encoded data

   **Return Value**:

      :dt:`Boolean` true when the message was sent successfully


_setLogin
########

   Logs an account in.

   **Parameters**:

      * **credentials**: :dt:`Object` login data to use.
      * **csrf**: :dt:`String` cross site request forgery token.
      * **callback**: :dt:`function` called on retrieval.

   **callback**:

      * **err**: :dt:`String` possible error returned.

   **Return Value**:

      * :dt:`undefined`


_eventProcessor
#############

   It processes every message received by the
   WebSocket and turns them into events and data.

   **Parameters**:

      * **msg** :dt:`String` JSON encoded message as String
      * **flags** :dt:`Object` contains two Boolean options, binary and masked

   **Fires**:

      * :ev:`ADVANCE`
      * :ev:`BAN`
      * :ev:`BAN_IP`
      * :ev:`CHAT`
      * :ev:`CHAT_COMMAND`
      * :ev:`CHAT_DELETE`
      * :ev:`CHAT_MENTION`
      * :ev:`CHAT_RATE_LIMIT`
      * :ev:`CONN_SUCCESS`
      * :ev:`CONN_ERROR`
      * :ev:`DJ_LIST_CYCLE`
      * :ev:`DJ_LIST_LOCKED`
      * :ev:`EARN`
      * :ev:`FLOOD_API`
      * :ev:`FLOOD_CHAT`
      * :ev:`FRIEND_ACCEPT`
      * :ev:`FRIEND_JOIN`
      * :ev:`FRIEND_REQUEST`
      * :ev:`GIFTED`
      * :ev:`GRAB`
      * :ev:`GUEST_JOIN`
      * :ev:`GUEST_LEAVE`
      * :ev:`KILL_SESSION`
      * :ev:`LEVEL_UP`
      * :ev:`MAINTENANCE_MODE`
      * :ev:`MAINTENANCE_MODE_ALERT`
      * :ev:`MOD_ADD_DJ`
      * :ev:`MOD_BAN`
      * :ev:`MOD_MOVE_DJ`
      * :ev:`MOD_MUTE`
      * :ev:`MOD_REMOVE_DJ`
      * :ev:`MOD_SKIP`
      * :ev:`MOD_STAFF`
      * :ev:`NAME_CHANGED`
      * :ev:`NOTIFY`
      * :ev:`PLAYLIST_CYCLE`
      * :ev:`ROOM_DESCRIPTION_UPDATE`
      * :ev:`ROOM_MIN_CHAT_LEVEL_UPDATE`
      * :ev:`ROOM_NAME_UPDATE`
      * :ev:`ROOM_WELCOME_UPDATE`
      * :ev:`SKIP`
      * :ev:`USER_JOIN`
      * :ev:`USER_LEAVE`
      * :ev:`VOTE`
      * :ev:`WAITLIST_UPDATE`

   **Return Value**:

      :dt:`undefined`

