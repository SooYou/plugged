========
FlatRoom
========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Different to the :doc:`Room</datatypes/room>` Model, this model is used in
as a representation of a room's current state in a search entry. It's basically
a flattened model of the :doc:`Room</datatypes/room>` Model, hence the name.


Model
-----

.. code-block:: Javascript

   {
      "capacity": -1,
      "cid": "",
      "dj": "",
      "favorite": false,
      "format": -1,
      "guests": -1,
      "host": "",
      "id": -1,
      "image": "",
      "media": "",
      "name": "",
      "nsfw": false,
      "population": -1,
      "private": false,
      "slug": ""
   }


Detail
------

**capacity**
   Maximum amount of user slots available. -1 means infinite.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**cid**
   Originating site's media ID.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**dj**
   Name of the DJ.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**favorite**
   Shows if this room is in your favorites.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**format**
   Media format. Plug's internal indicator from which site the media originates.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**guests**
   Amount of guests connected.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**host**
   Name of the host.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**id**
   Host's ID.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**image**
   Preview image of the media currently played.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**media**
   Title and Author of the media currently played.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**name**
   Name of the room.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**nsfw**
   Shows if this room is marked as not safe for work.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**population**
   Current amount of users, guests are counted seperately.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**private**
   Whether the room is private, as in, not listed.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**slug**
   URL conform representation of the username. Used for the profile link.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
