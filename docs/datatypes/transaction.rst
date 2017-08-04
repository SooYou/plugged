============
Transactions
============

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

This model represents a transaction you made on plug's store. It's basically a
review of the purchase object in a more detailed manner.


Model
-----

.. code-block:: Javascript

   {
      "cash": -1,
      "id": "",
      "item": "",
      "pp": -1,
      "timestamp": "Invalid Date",
      "type": ""
   }


Detail
------

**cash**
   Cash you paid.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**id**
   Unique identifier for the transaction.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**item**
   Bought item.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**pp**
   Plug points paid.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**timestamp**
   Timestamp of when the transaction was made.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``"Invalid Date"``


**type**
   Product type, i.e. *badges*.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
