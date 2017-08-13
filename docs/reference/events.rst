======
Events
======

.. role:: dt
   :class: datatype


Plugged works with a wide variety of events to emit information throughout the
system. This site lists all events that are emitted and what they do.

For further information about the events and how to use them you should consider
hitting up the cookbook.


Events
-------

   * CONN_ERROR_.
   * CONN_PART_.
   * CONN_SUCCESS_.
   * CONN_WARNING_.
   * LOGOUT_ERROR_.
   * LOGOUT_SUCCESS_.
   * LOGIN_ERROR_.
   * LOGIN_SUCCESS_.
   * SOCK_ERROR_.
   * SOCK_OPEN_.
   * BAN_.
   * CHAT_.
   * VOTE_.
   * GRAB_.
   * EARN_.
   * BAN_.
   * CHAT_.
   * VOTE_.
   * EARN_.
   * SKIP_.
   * BAN_IP_.
   * NOTIFY_.
   * GIFTED_.
   * MOD_BAN_.
   * MOD_WAITLIST_BAN_.
   * ADVANCE_.
   * LEVEL_UP_.
   * MOD_SKIP_.
   * MOD_MUTE_.
   * MOD_STAFF_.
   * USER_JOIN_.
   * FLOOD_API_.
   * MOD_ADD_DJ_.
   * GUEST_JOIN_.
   * USER_LEAVE_.
   * FLOOD_CHAT_.
   * MOD_MOVE_DJ_.
   * GUEST_LEAVE_.
   * USER_UPDATE_.
   * CHAT_DELETE_.
   * FRIEND_JOIN_.
   * PLUG_UPDATE_.
   * CHAT_COMMAND_.
   * CHAT_RATE_LIMIT_.
   * DJ_LIST_CYCLE_.
   * PLAYLIST_CYCLE_.
   * FRIEND_REQUEST_.
   * FRIEND_ACCEPT_.
   * WAITLIST_UPDATE_.
   * ROOM_NAME_UPDATE_.
   * MAINTENANCE_MODE_.
   * ROOM_WELCOME_UPDATE_.
   * MAINTENANCE_MODE_ALERT_.
   * ROOM_DESCRIPTION_UPDATE_.
   * ROOM_MIN_CHAT_LEVEL_UPDATE_.


ACK
##########

   Emitted when the server acknowledged the connection request.

   **Parameters**:

      :dt:`undefined`


ADVANCE
#######

   Emitted when the next media is played.

   **Parameters**:

      **booth**: :doc:`Booth</datatypes/booth>`

      **playback**: :doc:`Playback</datatypes/playback>

      **previous**: :doc:`Previous</datatypes/previous>`


BAN
###

   Emitted when you get banned from a room.

   **Parameters**:

      **ban**: :doc:`Ban</datatypes/ban>`


BAN_IP
######

   Emitted when you receive an IP Ban from plug.

   **Parameters**:

      :dt:`undefined`


CHAT
####

   Emitted when someone sent a chat message in the room you are connected to.

   **Parameters**:

      **chat**: :doc:`Chat</datatypes/chat>`


CHAT_DELETE
###########

   Emitted when a staff member deletes a chat message.

   **Parameters**:

      **chat**: :doc:`ChatDelete</datatypes/chatdelete>` deleted Chat object.


CHAT_COMMAND
############

   Emitted when someone issues a chat command.

   **Parameters**:

      **chat**: :doc:`Chat</datatypes/chat>`


CHAT_RATE_LIMIT
###############

   Emitted when chat enters slow mode.

   **Parameters**:

      :dt:`undefined`


CONN_ERROR
##########

   Emitted on failure of etablishing a connection to plug.

   **Parameters**:

      :dt:`undefined`


CONN_PART
#########

   Emitted on loss of connection.

   **Parameters**:

      **meta**: :doc:`Meta</datatypes/meta>`


CONN_SUCCESS
############

   Emitted on successfully etablishing a connection.

   **Parameters**:

      :dt:`undefined`


CONN_WARNING
############

   Emitted when server is not exchanging any information with us for a longer
   period of time.

   **Parameters**:

      **time**: :dt:`Number` Time in seconds since the last message. This has an
      incrementation rate of 30 seconds per call. The client will close the
      connection after 6 emitted warnings, or 3 minutes of no connection.


DJ_LIST_CYCLE
#############

   Emitted when a staff member changes the state of the waitlist cycle.

   **Parameters**:

      **Cycle**: :doc:`Cycle</datatypes/cycle>`


EARN
####

   Emitted when you earn XP. This also includes your Plug points as well as
   your current level.

   **Parameters**:

      **Level**: :doc:`Earn</datatypes/earn>`


FLOOD_API
#########

   Emitted when you send too many requests to the API at a time.

   .. note::

      Plugged takes care of the effect of rate limiters in plug so that
      you don't have to care about this happening.


   **Parameters**:

      :dt:`undefined`


FLOOD_CHAT
##########

   Emitted when you send too many chat messages at once.

   .. note::

   Plugged takes care of this as well as it does for FLOOD_API. In a
   default environment, this event will never fire.


   **Parameters**:

      :dt:`undefined`


FRIEND_ACCEPT
##############

   Emitted when someone accepted your friend request.

   **Parameters**:

      **user**: :dt:`String` username.


FRIEND_JOIN
###########

   Emitted when a friend joins the room you are in.

   **Parameters**:

      **user**: :doc:`User</datatypes/user>`


FRIEND_REQUEST
##############

   Emitted when you receive a friend request.

   **Parameters**:

      **user**: :dt:`String` username.


GIFTED
######

   Emitted when someone sends a gift to another user.

   **Parameters**:

      **sender**: :dt:`String` sender's name.
      **recipient**: :dt:`String` recipient's name.


GRAB
####

   Emitted when someone saves the current media.

   **Parameters**:

      **grab**: :dt:`Number` User's ID.


GUEST_JOIN
##########

   Emitted when a guest joins the room.

   **Parameters**:

      :dt:`undefined`


GUEST_LEAVE
###########

   Emitted when a guest leaves the room.

   **Parameters**:

      :dt:`undefined`


LEVEL_UP
########

   Emitted when you gained enough XP to level up.

   **Parameters**:

      **level**: :dt:`Number` your new level.


LOGIN_ERROR
###########

   Emitted on failure of logging in.

   **Parameters**:

      **err**: :dt:`String` containing the error message.


LOGIN_SUCCESS
#############

   Emitted on successful login.

   **Parameters**:

      **self**: :doc:`Self</datatypes/modelself>`


LOGOUT_ERROR
############

   Emitted on failure of logging out.

   .. note::

      This only happens when the server is failing to return a proper response
      when logging out.


   **Parameters**:

      **err**: :dt:`String` containing the error message.


LOGOUT_SUCCESS
##############

   Emitted on successful logout.

   **Parameters**:

      :dt:`undefined`


MAINTENANCE_MODE
################

   Emitted when plug enters maintenance mode.

   **Parameters**:

      :dt:`undefined`


MAINTENANCE_MODE_ALERT
######################

   Emitted when plug is about to enter maintenance mode.

   **Parameters**:

      :dt:`undefined`


MOD_ADD_DJ
##########

   Emitted when a mod adds a user to the waitlist.

   **Parameters**:

      **modadd**: :doc:`ModAddDJ</datatypes/modadddj>`


MOD_BAN
#######

   Emitted when a mod bans a user from a room.

   **Parameters**:

      **modban**: :doc:`ModBan</datatypes/modban>`


MOD_WAITLIST_BAN
#######

   Emitted when a mod bans a user from the booth.

   **Parameters**:

      **modwaitlistban**: :doc:`ModWaitlistBan</datatypes/modwaitlistban>`


MOD_MOVE_DJ
###########

   Emitted when a moderator moves a user in othe waitlist to another position.

   **Parameters**:

      **modmove**: :doc:`ModMove</datatypes/modmove>`


MOD_MUTE
########

   Emitted when a moderator mutes a user.

   **Parameters**:

      **mute**: :doc:`Mute</datatypes/mute>`


MOD_SKIP
########

   Emitted when a moderator skips the current media.

   **Parameters**:

      **skip**: :dt:`Object` Skip object containing information about the skip.


MOD_STAFF
#########

   Emitted when a user gets promoted

   .. NOTE::

   The promotion argument is always an array since it can happen that the staff
   level of two users is changed, namely when the host is giving his position to
   another user.


   **Parameters**:

      **promotion**: :doc:`[Promotion]</datatypes/promotion>`


NOTIFY
######

   Emitted when you receive a notification from plug for example when your
   level raises.

   **Parameters**:

      **notification**: :doc:`[Notification]</datatypes/notification`


PLAYLIST_CYCLE
##############

   Emitted when you finish playing a song.

   **Parameters**:

      **Cycle**: :dt:`Number` playlist ID.


PLUG_UPDATE
###########

   Emitted when plug was updated. This enforces a refresh on the web app.

   **Parameters**:

      :dt:`undefined`


ROOM_DESCRIPTION_UPDATE
#######################

   Emitted when the room's description was updated.

   **Parameters**:

      **update**: :doc:`RoomUpdate</datatypes/roomupdate>`


ROOM_MIN_CHAT_LEVEL_UPDATE
##########################

   Emitted when the room's minimum chat level was updated.

   **Parameters**:

      **update**: :doc:`MinChatLevel</datatypes/minchatlevel>`


ROOM_NAME_UPDATE
################

   Emitted when the room name was updated.

   **Parameters**:

      **update**: :doc:`RoomUpdate</datatypes/roomupdate>`


ROOM_WELCOME_UPDATE
###################

   Emitted when the room's welcome message was updated.

   **Parameters**:

      **update**: :doc:`RoomUpdate</datatypes/roomupdate>`


SKIP
####

   Emitted when a user skips their play.

   **Parameters**:

      **userid**: :dt:`Number` User's ID.


SOCK_ERROR
##########

   Emitted on failure of etablishing a websocket connection to plug.

   **Parameters**:

      **err**: :dt:`String` containing the error message.
      **self**: :dt:`Object` Self object containing account information.


SOCK_OPEN
#########

   Emitted on successfully etablishing a websocket connection to plug.

   **Parameters**:

      **self**: :dt:`Object` Self object containing account information.


USER_JOIN
#########

   Emitted when a user joins the room you are connected to.

   **Parameters**:

      **user**: :doc:`User</datatypes/user>`


USER_LEAVE
##########

   Emitted when a user leaves the room.

   **Parameters**:

      **user**: :doc:`User</datatypes/user>`


USER_UPDATE
###########

   Emitted when a user updates anything about their profile.

   **Parameters**:

      **user**: :doc:`UserUpdate</datatypes/userupdate>` User object.


VOTE
####

   Emitted when someone presses the woot or meh button.

   **Parameters**:

      **vote**: :doc:`Vote</datatypes/vote>`


WAITLIST_UPDATE
###############

   Emitted when a user joins or leaves the waitlist, or right after the advance
   event was fired.

   **Parameters**:

      **waitlist**: :dt:`[Number]` waitlist with user IDs
