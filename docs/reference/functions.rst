==========
Functions
==========

.. role:: dt
   :class: datatype


Plugged works with a wide variety of functions to provide you with a lot of
great functionality to interface with plug.dj
On this page you can find a quick summary about what each function does and how
you can interface with it.

All functions have certain levels at which they can be used. Two at pre login
level, quite a bit at global level and a whole lot at room level. All of them
have a set background as seen above to make it easier to indicate which function
can be accessed at which level.

For further information about the events and how to use them you should consider
hitting up the cookbook.


Functions
----------

clearChatCache
##############

   Clears the log.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`undefined`


clearChatQueue
##############

   Clears the queue.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`undefined`


clearUserCache
##############

   Clears the usercache.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`undefined`


deleteNotification
##################

   Deletes a notification received by plug.

   **Parameters**:

      **id**: :dt:`Number` notification ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


getChat
#######

   Gets chat log.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`[Object]` :doc:`Chat</datatypes/chat>` time sorted array of all chat messages.


getChatByUsername
#################

   Gets all messages of a user.

   **Parameters**:

      **username**: :dt:`String` name of a user.

   **Return Value**:

      :dt:`[Object]` :doc:`Chat</datatypes/chat>` list of all their messages.


getInventory
############

   Retrieves the items you own.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **inventory**: :doc:`[Inventory]</datatypes/inventory>`

   **Return Value**:

      :dt:`undefined`


getProducts
###########

   Retrieves all products of a type.

   **Parameters**:

      **type**: :dt:`String` type of product.

      **category**: :dt:`String` category of product.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **products**: :doc:`[Product]</datatypes/product>`

   **Return Value**:

      :dt:`undefined`


getTransactions
###############

   Retrieves all transactions made in the store.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **transactions**: :doc:`[Transaction]</datatypes/transaction>`

   **Return Value**:

      :dt:`undefined`


cacheChat
#########

   Sets chat caching. It's enabled by default.

   **Parameters**:

      **enable**: :dt:`Boolean` boolean value indicating state.

   **Return Value**:

      :dt:`Boolean` value that is now set.


isChatCached
############

   Checks if chat is being cached.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Boolean` indicating status.


.. _set-chat-cache-size:

setChatCacheSize
################

   Sets the chat cache size. the default size is 256 messages.

   **Parameters**:

      **size**: :dt:`Number` size of the cache in messages

   **Return Value**:

      :dt:`Number` size of the cache.


.. _get-chat-cache-size:

getChatCacheSize
################

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` the chat cache size.


cacheUserOnLeave
################

   Caches users when they leave the room.

   **Parameters**:

      **enable**: :dt:`Boolean` toggle when true caches users.

   **Return Value**:

      :dt:`Boolean` the current state.


isUserCachedOnLeave
###################

   Checks if users are cached when they leave the room.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Boolean` the current state.


clearUserFromLists
##################

   Clears a user from the voting and grab list.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

   **Return Value**:

      :dt:`Boolean` true when user was found and cleared, false otherwise


setJar
######

   Sets a cookie jar or creates a new one based on a storage object.

   **Parameters**:

      **jar**: :dt:`Object` cookie jar to use.

      **storage**: :dt:`Object` (optional) can create a cookie jar.

      .. note::

         jar will be ignored when storage is set.


   **Return Value**:

      :dt:`undefined`


getJar
######

   Gets the currently used jar.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` the cookie jar.


setHeartbeatRate
################

   Sets the time in between heartbeats in seconds

   **Parameters**:

      :dt:`Number` time in between heartbeats in seconds.

   **Return Value**:

      :dt:`undefined`


getHeartbeatRate
################

   Gets the time in between heartbeats in seconds.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` time in between heartbeats in seconds.


setMaxTimeout
################

   Sets the maximum connection timeout in seconds.

   **Parameters**:

      :dt:`Number` time in seconds until the connection is lost.

   **Return Value**:

      :dt:`undefined`


getMaxTimeout
################

   Gets the maximum connection timeout in seconds.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` time until the connection is lost in seconds.


defaultMessageProc
##################

   The default message processor used for chat messages, this function can be
   overridden or exchanged, see Options.

   **Parameters**:

      **message**: :dt:`String` chat message to send.

   **Return Value**:

      :dt:`[String]` msgs formatted message.


setMessageProcessor
###################

   Exchanges the message processor dynamically at runtime.

   **Parameters**:

      **func**: :dt:`function` func message processor function.

   **Return Value**:

      :dt:`Boolean` true when function was set.


.. _send-chat:

sendChat
########

   Sends a chat message.

   **Parameters**:

      **message**: :dt:`String` message message to send.

      **deleteTimeout**: :dt:`Number` delay in ms until message is deleted.

   **Return Value**:

      :dt:`[String]` message the formatted message.


invokeLogger
############

   Hooks up a logging library into plug.

   **Parameters**:

      **func**: :dt:`function` logging function to register.

   **Return Value**:

      :dt:`Boolean` true when logger has been registered.


setVerbosity
############

   Defines verbosity to use for logging. Lowest logging level is 0.

   **Parameters**:

      **verbosity**: :dt:`Number` sets verbosity.

   **Return Value**:

      :dt:`undefined`


getVerbosity
############

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` verbosity.


.. _login:

login
#####

   Log into https://www.plug.dj.

   **Parameters**:

      **credentials**: :dt:`Object` formatted loging info, see Options.

      **authToken**: :dt:`Object` last session token.

      **callback**: :dt:`function` called after logging in.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **self**: :doc:`[Self]</datatypes/modelself>`

   **Return Value**:

      :dt:`undefined`


guest
#####

   Logs into a room as a guest.

   **Parameters**:

      **slug**: :dt:`String` room name.

      **callback**: :dt:`String` called after entering the room.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **stats**: :doc:`[Room]</datatypes/room>`

   **Return Value**:

      :dt:`undefined`


.. _connect:

connect
#######

   Connects to a room.

   **Parameters**:

      **slug**: :dt:`String` room name.

      **callback**: :dt:`function` called after entering the room.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **stats**: :doc:`[Room]</datatypes/room>`

   **Return Value**:

      :dt:`undefined`


getUserById
###########

   Gets a user by their ID.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **cache**: :doc:`CACHE</datatypes/cache>`

   **Return Value**:

      :dt:`Object` :doc:`User</datatypes/user>`


getUserByName
#############

   Gets a user by their name.

   **Parameters**:

      **username**: :dt:`String` user's name

      **cache**: :doc:`CACHE</datatypes/cache>`

   **Return Value**:

      :dt:`Object` :doc:`User</datatypes/user>`


getUserRole
###########

   Gets user by role.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

   **Return Value**:

      :dt:`Number` user's role.


getUsers
########

   Gets all users in a room.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`[Object]` :doc:`User</datatypes/user>` all users.


getSelf
#######

   Gets :doc:`Self</datatypes/modelself>` object.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` :doc:`Self</datatypes/modelself>` Account.


setSetting
##########

   Sets a personal setting.

   **Parameters**:

      **key**: :dt:`String` key setting name.

      **value**: :dt:`*` value to set.

      **callback**: :dt:`function` called when data was saved.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`Boolean` true when save went to server.


getSetting
##########

   Gets a personal setting.

   **Parameters**:

      **key**: :dt:`String` key setting name.

   **Return Value**:

      :dt:`*` value saved at key.


getSettings
###########

   Gets all personal settings.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` Settings' object.


isFriend
########

   Checks if user is a friend.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

   **Return Value**:

      :dt:`Boolean` true when befriended.


getDJ
#####

   Gets the DJ.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` :doc:`User</datatypes/user>`


getMedia
########

   Gets the Media.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` :doc:`Media</datatypes/media>`


getStartTime
############

   Gets the Media start time.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`String` start time. Ex.: "2017-01-01T00:00:00.000000Z"


getBooth
########

   Gets the Booth.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` :doc:`Booth</datatypes/booth>`


getRoom
#######

   Gets the Room.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` :doc:`Room</datatypes/room>`


getRoomMeta
###########

   Gets the Metadata of a Room.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Object` :doc:`Metadata</datatypes/meta>`


getRoomName
###########

   Gets the name of a Room.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`String` Room's name.


getFX
#####

   Gets FX data.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`[String]` FX settings.


checkGlobalRole
###############

   Rectifies the given role. There's several roles but only 3 are set for the UI
   namely:

   * NONE
   * BRAND_AMBASSADOR
   * ADMIN


   **Parameters**:

      **role**: :dt:`Number` global role.

   **Return Value**:

      :dt:`Number` rectified level.


getHostName
###########

   Gets host name.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`String` Host's name.


getHostID
#########

   Gets host ID.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` Host's ID.


getPopulation
#############

   Gets population of a room.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` Amount of users connected.


getGuests
#########

   Gets the number of guests.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` Guests connected.


getMinChatLevel
###############

   Gets the minimum chat level.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Number` Minimumin chat level.


isFavorite
##########

   Checks if room is favorited.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Boolean` true when favorited.


getDescription
##############

   Gets the description.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`String` Room's description.


getWelcomeMessage
#################

   Gets the welcome message.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`String` Room's welcome message.


getSlug
#######

   Gets the slug.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`String` Room's slug.


getWaitlist
###########

   Gets the waitlist.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`[Number]` Waitlist in ascending order.


isWaitlistLocked
################

   Checks if the waitlist is locked.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Boolean` true when waitlist is locked.


doesWaitlistCycle
#################

   Checks if the waitlist cycles.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`Boolean` true when waitlist cycles.


getVotes
########

   Gets all votes.

   **Parameters**:

      **withUserObject**: :dt:`Boolean` replaces IDs with User objects.

   **Return Value**:

      :doc:`[Number]|[Vote]</datatypes/vote>` number array when param is false,
      object array otherwise.


getGrabs
########

   Gets all grabs.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`[Number][Object]` :doc:`User</datatypes/user>` number array when param is
      false, object array otherwise.


cacheUser
#########

   Saves a User.

   **Parameters**:

      **user**: :dt:`Object` :doc:`User</datatypes/user>`

   **Return Value**:

      :dt:`Boolean` true when saved, false when user is already cached.


removeCachedUserById
####################

   Removes a User from cache.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

   **Return Value**:

      :dt:`Boolean` true when the user was found and removed.


removeCachedUserByUsername
##########################

   Removes a User from cache.

   **Parameters**:

      **username**: :dt:`String`

   **Return Value**:

      :dt:`Boolean` true when the user was found and removed.


getStaffOnline
##############

   Gets staff online.

   **Parameters**:

      :dt:`undefined`

   **Return Value**:

      :dt:`[Object]` :doc:`User</datatypes/user>` Staff online.


getStaffOnlineByRole
####################

   Gets staff online by role.

   **Parameters**:

      **role**: :dt:`Number` :doc:`USERROLE</datatypes/role>` staff by role.

   **Return Value**:

      :dt:`[Object]` :doc:`User</datatypes/user>` staff currently online with role specified.


getStaffByRole
##############

   Gets all staff by role.

   **Parameters**:

      **role**: :dt:`Number` :doc:`USERROLE</datatypes/role>` staff by role.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **staff**: :doc:`[User]</datatypes/user>`

   **Return Value**:

      :dt:`undefined`


getNews
#######

   Gets news.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **news**: :doc:`[News]</datatypes/news>`

   **Return Value**:

      :dt:`undefined`


getAuthToken
############

   Gets auth token.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **token**: :dt:`String` auth token.

   **Return Value**:

      :dt:`undefined`


getRoomStats
############

   Gets room stats.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **room**: :doc:`Room</datatypes/room>`

   **Return Value**:

      :dt:`undefined`


findRooms
#########

   Finds paginated results of rooms.

   **Parameters**:

      **page**: :dt:`Number` zero based index.

      **limit**: :dt:`Number` amount of rooms per page.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **rooms**: :doc:`[FlatRoom]</datatypes/flatroom>`

   **Return Value**:

      :dt:`undefined`


getRoomList
###########

   Gets unfiltered paginated results of rooms.

   **Parameters**:

      **page**: :dt:`Number` zero based index.

      **limit**: :dt:`Number` amount of rooms per page.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **rooms**: :doc:`[FlatRoom]</datatypes/flatroom>`

   **Return Value**:

      :dt:`undefined`


getStaff
########

   Gets staff members.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **staff**: :doc:`[User]</datatypes/user>`

   **Return Value**:

      :dt:`undefined`


getUser
#######

   Gets a user.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **user**: :doc:`User</datatypes/user>`

   **Return Value**:

      :dt:`undefined`


.. _get-room-history:

getRoomHistory
##############

   Gets room history.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **history**: :doc:`[History]</datatypes/history>`

   **Return Value**:

      :dt:`undefined`


validateRoomName
################

   Validates a room name.

   **Parameters**:

      **name**: :dt:`String` name to be validated.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **slug**: :dt:`String` url conform representation of room name.

   **Return Value**:

      :dt:`undefined`


validateUsername
################

   Validates a username.

   **Parameters**:

      **name**: :dt:`String` name to be validated.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **slug**: :dt:`String` url conform representation of name.


   **Return Value**:

      :dt:`undefined`


getMutes
########

   Gets mutes.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **mutes**: :doc:`[Mute]</datatypes/mute>`

   **Return Value**:

      :dt:`undefined`


getBans
#######

   Gets bans.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **bans**: :doc:`[Ban]</datatypes/ban>`

   **Return Value**:

      :dt:`undefined`


saveSettings
############

   Saves settings.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


setLock
#######

   Sets up a lock.

   **Parameters**:

      **lock**: :dt:`Boolean` should waitlist be locked?

      **removeAllDJs**: :dt:`Boolean` remove all users in waitlist?

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


setCycle
########

   Decides cycle mode.

   **Parameters**:

      **shouldCycle**: :dt:`Boolean` should waitlist cycle?

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


resetPassword
#############

   Sends a request to the server to reset the account's password.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


requestUsers
############

   Gets users in bulk.

   **Parameters**:

      **ids**: :dt:`[Number]` user IDs.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **users**: :doc:`[User]</datatypes/user>`

   **Return Value**:

      :dt:`undefined`


joinRoom
########

   Joins a room.

   **Parameters**:

      **slug**: :dt:`String` room name.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


joinWaitlist
############

   Joins the waitlist.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


addToWaitlist
#############

   Adds a user to the waitlist.

   This fires the :ref:`waitlist-update` event indirectly.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


addPlaylist
###########

   Creates a new playlist with media objects.

   **Parameters**:

      **name**: :dt:`String` playlist name.

      **media**: :dt:`[Object]` :doc:`Media</datatypes/media>` media to add.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **playlist**: :doc:`Playlist</datatypes/playlist>`

   **Return Value**:

      :dt:`undefined`


grab
####

   Grabs media.

   **Parameters**:

      **id**: :dt:`Number` playlist ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **playlist**: :doc:`Playlist</datatypes/playlist>`

   **Return Value**:

      :dt:`undefined`


skipDJ
######

   Skips the DJ.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


moveDJ
######

   Moves a user in the waitlist.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **position**: :dt:`Number` zero based index with zero being the first
        position.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


createRoom
##########

   Creates a new room.

   **Parameters**:

      **name**: :dt:`String` room name.

      **unlisted**: :dt:`Boolean` makes room private.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **room**: :doc:`NewRoom</datatypes/newroom>` info of new room.

   **Return Value**:

      :dt:`undefined`


sendSOS
#######

   Sends an SOS to the admins and global moderators of plug.dj

   .. note::
      Please keep in mind that this is a function with power and should be used only in
      a real emergency. Don't just spam this function at your leisure.


   **Parameters**:

      **message**: :dt:`String` message send to moderators.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


updateRoomInfo
##############

   Updates the room info.

   This fires the :ref:`room-description-update` event indirectly.

   **Parameters**:

      **name**: :dt:`String` room name.

      **description**: :dt:`String` room description.

      **welcome**: :dt:`String` welcome message shown on entrance.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


setMinChatLevel
###############

   Sets the room's minimum chat level.

   This will raise the :ref:`min-chat-level-update` event.

   **Parameters**:

      **level**: :dt:`Number` level required to chat.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


banUser
#######

   Bans a user.

   This will raise the :ref:`user-leave` and :ref:`mod-ban` event indirectly.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **time**: :dt:`Enum` :doc:`BANDURATION</datatypes/banduration>` duration of ban.

      **reason**: :dt:`Enum` :doc:`REASON</datatypes/reason>` reason of ban.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


banBooth
########

   Bans a user from the booth.

   This will raise the :ref:`waitlist-update` as well as the :ref:`advance` event
   indirectly.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **time**: :dt:`Enum` :doc:`BOOTHBANDURATION</datatypes/boothbanduration>` duration
                of ban.

      **reason**: :dt:`Enum` :doc:`BOOTHBANREASON</datatypes/boothbanreason>` reason of
                  ban.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


deleteBanBooth
##############

   Removes a previously registered ban.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


muteUser
########

   Mutes a user.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **time**: :dt:`Enum` :doc:`MUTEDURATION</datatypes/muteduration>` duration of mute.

      **reason**: :dt:`Enum` :doc:`REASON</datatypes/reason>` reason of mute.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


addStaff
########

   Adds a user to staff.

   This will raise the :ref:`user-update` event.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **role**: :dt:`Enum` :doc:`USERROLE</datatypes/role>` role to give.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


ignoreUser
##########

   Ignores a user.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **ignored**: :doc:`Ignore</datatypes/ignore>` ignored user.

   **Return Value**:

      :dt:`undefined`


deletePlaylist
##############

   Deletes a playlist.

   **Parameters**:

      **id**: :dt:`Number` playlist to delete.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


removeIgnore
############

   Unignores a user.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **unignored**: :doc:`Ignore</datatypes/ignore>` unignored
        user.

   **Return Value**:

      :dt:`undefined`


removeStaff
###########

   Removes a user from staff.

   This will raise the :ref:`user-update` event.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


removeDJ
########

   Removes a DJ.

   This will raise the :ref:`waitlist-update` and :ref:`advance` event indirectly.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


leaveWaitlist
#############

   Leaves the waitlist.

   This will raise the :ref:`waitlist-update` event indirectly.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


unbanUser
#########

   Unbans a user.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


.. _unmute-user:

unmuteUser
##########

   Unmutes a user.

   **Parameters**:

      **id**: :dt:`Number` user's ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


deleteMessage
#############

   Deletes a message.

   This will raise the :ref:`chat-delete` event.

   **Parameters**:

      **cid**: :dt:`Number` message ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


logout
######

   Logs the account out.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


requestSelf
###########

   Request the account info.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **self**: :doc:`[Self]</datatypes/modelself>`

   **Return Value**:

      :dt:`undefined`


.. _get-my-history:

getMyHistory
############

   Gets the account play history.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **history**: :doc:`[History]</datatypes/history>`

   **Return Value**:

      :dt:`undefined`


getFriends
##########

   Gets the account's friends.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **friends**: :doc:`[User]</datatypes/user>`

   **Return Value**:

      :dt:`undefined`


getFriendRequests
#################

   Gets the account's friend request.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **requests**: :doc:`[Invitation]</datatypes/invitation>`

   **Return Value**:

      :dt:`undefined`


findPlaylist
############

   Finds personal playlists.

   **Parameters**:

      **query**: :dt:`String` keywords to look for.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **playlist**: :doc:`[Playlist]</datatypes/playlist>`

   **Return Value**:

      :dt:`undefined`


findMedia
#########

   Finds media in all playlists.

   **Parameters**:

      **query**: :dt:`String` keywords to look for.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **media**: :doc:`[Media]</datatypes/media>`

   **Return Value**:

      :dt:`undefined`


findMediaPlaylist
#################

   Finds media in a playlist.

   **Parameters**:

      **id**: :dt:`Number` playlist to use for search.

      **query**: :dt:`String` keywords to look for.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **media**: :doc:`[Media]</datatypes/media>`

   **Return Value**:

      :dt:`undefined`


getPlaylist
###########

   Gets playlist.

   **Parameters**:

      **id**: :dt:`Number` playlist to retrieve.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **media**: :doc:`[Media]</datatypes/media>`

   **Return Value**:

      :dt:`undefined`


getPlaylists
############

   Gets all playlists.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **playlists**: :doc:`[Playlist]</datatypes/playlist>`

   **Return Value**:

      :dt:`undefined`


getIgnores
##########

   Gets ignores.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **users**: :doc:`[Ignore]</datatypes/ignore>` ignored users.

   **Return Value**:

      :dt:`undefined`


getFavoriteRooms
################

   Gets favorite rooms.

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **rooms**: :doc:`[FlatRoom]</datatypes/flatroom>` favorited rooms.

   **Return Value**:

      :dt:`undefined`


setProfileMessage
#################

   Sets profile message.

   **Parameters**:

      **message**: :dt:`String` profile message.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


renamePlaylist
##############

   Renames a playlist.

   **Parameters**:

      **id**: :dt:`String` playlist to rename.

      **name**: :dt:`String` new name.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


setAvatar
#########

   Sets avatar.

   **Parameters**:

      **id**: :dt:`String` avatar to set.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


setBadge
########

   Sets badge.

   **Parameters**:

      **id**: :dt:`String` badge to set.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


setLanguage
###########

   Sets language.

   **Parameters**:

      **language**: :dt:`String` ISO 3166-2 country code.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


rejectFriendRequest
###################

   Rejects a user's friend request.

   **Parameters**:

      **id**: :dt:`Number` user to reject.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


activatePlaylist
################

   Sets a playlist to play from.

   **Parameters**:

      **id**: :dt:`Number` playlist to set.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **activated**: :dt:`String` ID of activated playlist.

   **Return Value**:

      :dt:`undefined`


moveMedia
#########

   Moves media in a playlist.

   **Parameters**:

      **id**: :dt:`Number` playlist in which the media resides.

      **media**: :dt:`[Number]` media to move.

      **beforeID**: :dt:`Number` where to insert the media at.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **media**: :doc:`[Media]</datatypes/media>` order after move.

   **Return Value**:

      :dt:`undefined`


updateMedia
###########

   Updates a media item's info.

   **Parameters**:

      **id**: :dt:`Number` playlist in which the media resides.

      **mediaID**: :dt:`Number` media to edit.

      **author**: :dt:`String` media author like artist.

      **title**: :dt:`String` media title like song title.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **update**: :doc:`[Update]</datatypes/mediaupdate>`

   **Return Value**:

      :dt:`undefined`


shufflePlaylist
###############

   Shuffles a media item in a playlist.

   **Parameters**:

      **id**: :dt:`Number` playlist to shuffle.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **media**: :doc:`[Media]</datatypes/media>` order after shuffle.

   **Return Value**:

      :dt:`undefined`


addFriend
#########

   Adds a user as a friend.

   **Parameters**:

      **id**: :dt:`Number` user to add as friend.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


deleteMedia
###########

   Deletes a media item in a playlist.

   **Parameters**:

      **id**: :dt:`Number` playlist in which the media resides.

      **mediaIDs**: :dt:`[Number]` media to delete.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **media**: :doc:`[Media]</datatypes/media>` in playlist after deletion.

   **Return Value**:

      :dt:`undefined`


addMedia
########

   Adds media to a playlist.

   **Parameters**:

      **id**: :dt:`Number` playlist to add the media to.

      **media**: :dt:`[Object]` media objects to add.

      **append**: :dt:`Boolean` append media to the end.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **mediaAdd**: :doc:`MediaAdd</datatypes/mediaadd>`

   **Return Value**:

      :dt:`undefined`


woot
####

   Woots the media (upvote).

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


meh
###

   Mehs the media (downvote).

   **Parameters**:

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


favoriteRoom
############

   Favorites the room you are currently connected to.

   **Parameters**:

      **id**: :dt:`Number` room ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


removeFriend
#############

   Removes a user as a friend.

   **Parameters**:

      **id**: :dt:`Number` user ID.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

   **Return Value**:

      :dt:`undefined`


purchaseUsername
################

   Purchases a username from the store.

   **Parameters**:

      **username**: :dt:`String` name to purchase.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **item**: :doc:`Purchase</datatypes/purchase>`

   **Return Value**:

      :dt:`undefined`


purchaseItem
############

   Purchases an item from the store.

   **Parameters**:

      **id**: :dt:`String` item to purchase.

      **callback**: :dt:`function` called on retrieval.

   **callback**:

      **err**: :dt:`Object` possible error returned.

      **item**: :doc:`Purchase</datatypes/purchase>`

   **Return Value**:

      :dt:`undefined`


removeChatMessage
#################

   Removes a message.

   .. note::

      you have to enable cacheChat first! Otherwise you won't be able to delete any
      messages since plugged has no record of them.


   **Parameters**:

      **cid**: :dt:`String` unique message ID.

      **cacheOnly**: :dt:`Boolean` clears only the cache when true.

   **Return Value**:

      :dt:`Boolean` whether the message was deleted


removeChatMessagesByUser
########################

   Removes all messages of a user.

   .. note::

      you have to enable cacheChat first! Otherwise you won't be able to delete any
      messages since plugged has no record of them.

   **Parameters**:

      **username**: :dt:`String` name of a user.

      **cacheOnly**: :dt:`Boolean` clears only the cache when true.

   **Return Value**:

      :dt:`Boolean` whether the messages were deleted


watchUserCache
##############

   Enables time based cleanup of cached users.

   Default time is 5 minutes.

   **Parameters**:

      **enable**: :dt:`Boolean` boolean value indicating state.

   **Return Value**:

      :dt:`undefined`
