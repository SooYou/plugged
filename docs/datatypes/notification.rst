============
Notification
============

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Notifications model represents information notes you receive occasionally from
plug. You receive these for example when you level up.


Model
-----

.. code-block:: Javascript

   {
      "action": "",
      "id": -1,
      "timestamp": "",
      "value": ""
   }


Detail
------

**action**
   Kind of notification received.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**id**
   Unique identifier.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**timestamp**
   When the notification was received.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**value**
   Value can be, for example, 11 when the action is a "levelUp".
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
