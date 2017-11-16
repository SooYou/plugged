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


ACK
##########

   Emitted when the server acknowledged the connection request.

   **Parameters**:

      :dt:`undefined`


.. _advance:

ADVANCE
#######

   Emitted when the next media is played.

   **Parameters**:

      **booth**: :doc:`Booth</datatypes/booth>`

      **playback**: :doc:`Playback</datatypes/playback>`

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


.. _chat-delete:

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


CONN_PART
#########

   Emitted on loss of connection.

   **Parameters**:

      **meta**: :doc:`Meta</datatypes/meta>`


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

   .. note:

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


.. _mod-ban:

MOD_BAN
#######

   Emitted when a mod bans a user from a room.

   **Parameters**:

      **modban**: :doc:`ModBan</datatypes/modban>`


MOD_WAITLIST_BAN
################

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

      **duration**: :doc:`MuteDuration</datatypes/muteduration>`


MOD_SKIP
########

   Emitted when a moderator skips the current media.

   **Parameters**:

      **skip**: :doc:`ModSkip</datatypes/modskip>`


MOD_STAFF
#########

   Emitted when a user gets promoted

   .. note:

   The promotion argument is always an array since it can happen that the staff
   level of two users is changed, namely when the host is giving his position to
   another user.


   **Parameters**:

      **promotions**: :doc:`[Promotion]</datatypes/promotion>`


NOTIFY
######

   Emitted when you receive a notification from plug for example when your
   level raises.

   **Parameters**:

      **notification**: :doc:`Notification</datatypes/notification>`


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


.. _room-description-update:

ROOM_DESCRIPTION_UPDATE
#######################

   Emitted when the room's description was updated.

   **Parameters**:

      **update**: :doc:`RoomUpdate</datatypes/roomupdate>`


.. _min-chat-level-update:

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


SOCK_CLOSED
###########

   Emitted when socket is closed

   **Parameters**:

      :dt:`undefined`


SOCK_ERROR
##########

   Emitted on failure of etablishing a websocket connection to plug.

   **Parameters**:

      **err**: :dt:`String` containing the error message.


SOCK_OPEN
#########

   Emitted on successfully etablishing a websocket connection to plug.

   **Parameters**:

      :dt:`undefined`


.. _user-join:

USER_JOIN
#########

   Emitted when a user joins the room you are connected to.

   **Parameters**:

      **user**: :doc:`User</datatypes/user>`


.. _user-leave:

USER_LEAVE
##########

   Emitted when a user leaves the room.

   **Parameters**:

      **user**: :doc:`User</datatypes/user>`


.. _user-update:

USER_UPDATE
###########

   Emitted when a user updates anything about their profile.

   **Parameters**:

      **user**: :doc:`UserUpdate</datatypes/userupdate>`


VOTE
####

   Emitted when someone presses the woot or meh button.

   **Parameters**:

      **vote**: :doc:`Vote</datatypes/vote>`


.. _waitlist-update:

WAITLIST_UPDATE
###############

   Emitted when a user joins or leaves the waitlist, or right after the advance
   event was fired.

   **Parameters**:

      **waitlist**: :dt:`[Number]` waitlist with user IDs
