=====
Cycle
=====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when a mod changes whether the booth should cycle DJs or not.


Model
-----

.. code-block:: Javascript

   {
      "moderator": "",
      "moderatorID": -1,
      "shouldCycle": false
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


**shouldCycle**
   Whether or not the booth should cycle.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``
