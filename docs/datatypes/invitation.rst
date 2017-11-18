==========
Invitation
==========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The Invitation model consists of a slimmed down :doc:`User</datatypes/user>`
model with only a few required members for plug's UI.

.. note::

   This can also act as a contract model between two users in which user A
   requests user B to accept their friend request. This allows for some info to
   be shared, for example if they are online, in which room they currently are
   and more.



Model
-----

.. code-block:: Javascript

   {
      "avatarID": "",
      "gRole": -1,
      "id": -1,
      "joined": "Invalid Date",
      "level": -1,
      "status": -1,
      "timestamp": "Invalid Date",
      "username": "",
   }


Detail
------

**avatarID**
   User's avatar, i.e. "animals01".

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**gRole**
   User's global role.

   .. note::

      For further explanation about the global roles check out
      :doc:`GlobalRole</datatypes/globalrole>`
   
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``



**id**
   Unique identifier of user.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**joined**
   Time they joined plug.dj.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``"Invalid Date"``


**level**
   Their current level.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**status**
   User's online status.

   .. note::

      As with a lot of other Integer based boolean flags, this too is a zero
      based index with 0 meaning the user is offline and 1 that they are online.

   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**timestamp**
   Timestamp of when the request was sent.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``"Invalid Date"``


**username**
   User's name.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
