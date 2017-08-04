========
Purchase
========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

This model represents a purchase made on plug's store.

.. note::

   While the Purchase model has members for cash and plug points, it'll usually
   only be one of the two that will have a valid number given. The two members
   just exist for consistency reasons and because items can cost either Plug
   Points or real cash.


Model
-----

.. code-block:: Javascript

   {
      "count": -1,
      "cash": -1,
      "name": "",
      "pp": -1
   }


Detail
------

**count**
   Amount of the item you bought.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**cash**
   The amount of real money it did cost.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**name**
   Key value used as an identifier for the item.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**pp**
   Plug points after purchase.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
