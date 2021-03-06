======
ModBan
======

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when a mod bans a user.


Model
-----

.. code-block:: Javascript

   {
      "duration": "",
      "moderator": "",
      "moderatorID": -1,
      "username": ""
   }


Detail
------

**duration**
   Duration of the ban.

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
