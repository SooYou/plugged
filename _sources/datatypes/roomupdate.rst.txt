==========
RoomUpdate
==========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when an aspect of the room gets updated.

.. NOTE::

   This object will contain only 2 of the 4 given members stated below. With the
   first being the moderatorID and the second depending on which property was
   changed by a moderator.



Model
-----

.. code-block:: Javascript

   {
      "moderatorID": -1
      "name": "",
      "description": "",
      "welcome": ""
   }


Detail
------

**moderatorID**
   ID of the moderator.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**name**
   Name of the room.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**description**
   Description of the room.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**welcome**
   Welcome message of the room.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
