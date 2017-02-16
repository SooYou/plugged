=====
Booth
=====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model represents the booth.


Model
-----

.. code-block:: Javascript

   {
      "dj": null,
      "isLocked": false,
      "shouldCycle": false,
      "waitlist": []
   }


Detail
------

**dj**
   Current DJ.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
   

**isLocked**
   Whether waitlist is locked or not.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**shouldCycle**
   Whether or not the booth should cycle.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**waitlist**
   Waitlist sorted in descending order.
   
   **Type**: :dt:`[Number]` |br|
   **Default Value**: ``[]``
