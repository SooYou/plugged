=========
Promotion
=========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when a user gets promoted.


Model
-----

.. code-block:: Javascript

   {
      "id": -1,
      "moderator": "",
      "moderatorID": -1,
      "role": -1,
      "username": ""
   }


Detail
------

**id**
   ID of the user.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
   

**moderator**
   Name of the moderator.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**moderatorID**
   ID of the moderator.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**role**
   New role of the user.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
   

**username**
   Name of the user.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
