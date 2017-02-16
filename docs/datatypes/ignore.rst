======
Ignore
======

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The Ignore model is a fairly light one. All it contains is the id of the ignored
user and their name.


Model
-----

.. code-block:: Javascript

   {
      "username": "",
      "id": -1
   }


Detail
------

**username**
   Ignored user's name.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**id**
   Internal identifier.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
