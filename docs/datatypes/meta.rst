=====
Meta
=====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Metadata containing a flush of information about the room, the host and the
current state.


Model
-----

.. code-block:: Javascript

   {
      "description": "",
      "favorite": false,
      "guests": -1,
      "hostID": -1,
      "hostName": "",
      "id": -1,
      "minChatLevel": -1,
      "name": "",
      "population": -1,
      "slug": "",
      "welcome": ""
   }


Detail
------

**description**
   Room description.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**favorite**
   Whether this room is in your favorites.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**guests**
   Amount of guests connected.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**hostID**
   Unique identifier of the host.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**hostName**
   Username of the host of the room.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**id**
   Unique identifier of the room.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**minChatLevel**
   Minimum level required to chat.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**name**
   Name of the room.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**population**
   Amount of people connected to this room right now. Without guests.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**slug**
   URL conform name of the room, used as link.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**welcome**
   Welcome message shown on entrance.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
