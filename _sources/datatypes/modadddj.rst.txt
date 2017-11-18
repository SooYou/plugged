========
ModAddDJ
========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when a mod adds a user to the waitlist.


Model
-----

.. code-block:: Javascript

   {
      "moderator": "",
      "moderatorID": -1,
      "username": ""
   }


Detail
------

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
