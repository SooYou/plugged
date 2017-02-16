====
Mute
====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Mute model represents a contract between a moderator of a room and a user in
which the user got disabled from their ability to chat for one of a couple of
possible reasons.


Model
-----

.. code-block:: Javascript

   {
      "expires": -1,
      "id": -1,
      "moderator": "",
      "moderatorID": -1,
      "reason": -1,
      "username": ""
   }


Detail
------

**expires**
   Time in seconds until mute expires.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**id**
   Unique identifier of user.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**moderator**
   Moderator's name who conducted the mute.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**moderatorID**
   Moderator's ID.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**reason**
   Mute's reason represented as an integer.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**username**
   Muted user's name.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
