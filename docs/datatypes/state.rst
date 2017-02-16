=====
State
=====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The State model keeps track of the current state within plugged. It allows for
easy access to a lot of data without having to retrieve it from the server over
and over again.


Model
-----

.. code-block:: Javascript

   {
      "chatcache": [],
      "credentials": {
          "accessToken": "",
          "email": "",
          "userID": "",
          "password": "",
      },
      "room": Room,
      "self": Self,
      "usercache": [{
          "user": User,
          "timestamp": DateTime
      }],
   }


Detail
------

**chatcache**
   Chatlog.

   ..hint::

     The size of the chatcache is set by :ref:`set-chat-cache-size` and
     retrieved by :ref:`get-chat-cache-size`

   
   **Type**: :doc:`[Chat]</datatypes/chat>` |br|
   **Default Value**: ``see Chat model``


**credentials**
   Credentials that you used for this account. Remember, you can only login with
   either your email and password OR your userID and accessToken.
   
   **Type**: :dt:`Object` |br|
   **Default Value**: ``see example above``


**room**
   Room you are connected to.
   
   **Type**: :doc:`Room</datatypes/room>` |br|
   **Default Value**: ``see Room model``


**self**
   Your user account.
   
   **Type**: :doc:`Self</datatypes/modelself>` |br|
   **Default Value**: ``see Self model``


**usercache**
   Cache of recently used users.

   ..hint::

     This holds information in an Object literal which contains the
     :doc:`[User]</datatypes/user>` that was used by Plugged at a given time.
     The time itself is represented by the **time** field which holds a DateTime
     of when the user was last needed.

   
   **Type**: :dt:`Object` |br|
   **Default Value**: ``[]``


