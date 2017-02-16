====
Self
====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The :doc:`Self<modelself>` object is basically an extended version of the
:doc:`User<user>` object with the exception that it contains additional
information, specifically about your own account.

The difference between the :doc:`User<user>` class and the
:doc:`Self<modelself>` class is that it's basically an extended
:doc:`User<user>` class sporting following additional fields:

    * blurb
    * guest
    * ignores
    * notifications
    * pp
    * pw
    * settings
    * xp


All the same best practices work for the :doc:`Self<modelself>` class that work
for the :doc:`User<user>` class.


Model
-----

.. code-block:: Javascript

   {
      "avatarID": "",
      "badge": "",
      "blurb": "",
      "friends": [],
      "gRole": -1,
      "id": -1,
      "ignores": [],
      "joined": "Invalid Date",
      "language": "",
      "level": -1,
      "notifications": [],
      "pp": -1,
      "pw": false,
      "role": -1,
      "settings": Settings,
      "silver": false,
      "slug": "",
      "sub": -1,
      "username": ""
      "xp": -1,
   }


Detail
------

**avatarID**
   User's avatar, i.e. "animals01".
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**badge**
   User's badge, i.e. "bt-og".

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**blurb**
   Message shown on profile page.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**friends**
   Your friends.
   
   **Type**: :dt:`[Number]` |br|
   **Default Value**: ``[]``


**gRole**
   Global role on plug.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**id**
   Unique identifier for user.

   **Type**: :dt:`Number` |br|
   **Default Value**: -1


**ignores**
   Ignored users.

   **Type**: :doc:`[Ignored]</datatypes/ignored>` |br|
   **Default Value**: ``[]``


**joined**
   Date and time of joining plug.

   **Type**: :dt:`String` |br|
   **Default Value**: ``"Invalid Date"``


**level**
   The experience level on plug

   **Type**: :dt:`Number` |br|
   **Default Value**: *-1*


**language**
   Language used, represented by ISO 639-1 encoding. See:
   `Wikipedia <http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes/>`_
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**notifications**
   Notifications received by plug.

   **Type**: :doc:`[Notification]</datatypes/notification>` |br|
   **Default Value**: ``[]``


**pp**
   Total plug points gained

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**pw**
   Account uses a password instead of a token

   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**role**
   Room wide role on plug.

   .. note::

      Role won't be set before you join a room since it's dependent on the room
      you are in and gets set by plugged rather than plug. This is for
      convinience reasons.


   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**settings**
   Your personal Settings on plug.dj, for example if chat images are enabled
   etc.

   **Type**: :doc:`Settings</datatypes/settings>` |br|
   **Default Value**: ``see Settings model``


**silver**
   User has a silver subscription level

   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**slug**
   URL conform representation of the username, used for the profile link.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**sub**
   Subscription status

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**username**
   User's name.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**xp**
   Total experience points gained on plug

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
