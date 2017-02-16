========
Playlist
========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The Playlist model represents the playlists metadata. It helps identifiying how
many items are in the list and includes some vital data like the ID.


Model
-----

.. code-block:: Javascript

   {
       "active": false,
       "count": -1,
       "id": -1,
       "name": ""
   }


Detail
------

**active**
   Whether the playlist is active or not.

   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``
   

**count**
   Media objects inside the playlist.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**id**
   Unique identifier.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``

**name**
   Playlist name.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
