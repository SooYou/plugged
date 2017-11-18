==============
ModWaitlistBan
==============

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when a mod bans a user from the booth.


Model
-----

.. code-block:: Javascript

   {
      "duration": "",
      "moderator": "",
      "moderatorID": -1,
      "username": "",
      "userID": -1
   }


Detail
------

**duration**
   Duration of the ban.

   .. note::

      as is with any other ban, this can have a time value decoded in a single character.
      The character for this are:

      "s": short => 15 minutes
      "m": medium => 1 hour
      "l": medium => 1 day
      "f": medium => forever


   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**moderator**
   Name of the moderator.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**moderatorID**
   ID of the moderator.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**username**
   Name of the user.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**userID**
   ID of the user.

   **Type**: :dt:`Number` |br|
   **Default Value**: -1
