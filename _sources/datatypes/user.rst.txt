====
User
====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The :doc:`User<user>` class represents a User in a room. Every User you interact
with will have the data provided by this class, except yourself. For this one
exception there is an extended User class available called
:doc:`Self<modelself>`


Model
-----

.. code-block:: Javascript

   {
      "avatarID": "",
      "badge": "",
      "gRole": -1,
      "guest": false,
      "id": -1,
      "joined": "Invalid Date",
      "language": "",
      "level": -1,
      "role": -1,
      "silver": false,
      "slug": "",
      "sub": -1,
      "username": ""
   }


Detail
------

**avatarID**
   Avatar used, i.e. "animals01".
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**badge**
   User's badge, i.e. "bt-g".

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**gRole**
   Global wide role on plug.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**guest**
   Indicates if user is a guest.

   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**id**

   **Type**: :dt:`Number` |br|
   **Default Value**: -1


**joined**
   Date and time when user joined plug

   **Type**: :dt:`String` |br|
   **Default Value**: ``"Invalid Date"``


**language**
   Language used, represented by ISO 639-1 encoding. See:
   `Wikipedia <http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes/>`_
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**level**
   Level gathered on plug.

   **Type**: :dt:`Number` |br|
   **Default Value**: *0*


**role**
   Role in a room.

   .. note::

      This is not set when requesting users that are not connected to the room
      you are in.
   

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**silver**
   Indicates if user has silver subscription.

   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**slug**
   URL conform representation of the username. Used for the profile link.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**sub**
   Subscription status

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**username**
   Name of the user.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
