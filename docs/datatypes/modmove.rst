=======
ModMove
=======

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when a mod moves a user in the waitlist.


Model
-----

.. code-block:: Javascript

   {
      "moderator": "",
      "moderatorID": -1,
      "newIndex": -1,
      "oldIndex": -1,
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


**newIndex**
   New waitlist position of user.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**oldIndex**
   Old waitlist position of user.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**username**
   Name of the user.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
