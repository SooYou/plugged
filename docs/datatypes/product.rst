=======
Product
=======

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

This model represents a product in the store.


Model
-----

.. code-block:: Javascript

   {
      "base": false,
      "cash": -1,
      "category": "",
      "category_id": "",
      "currency": -1,
      "currency_id": -1,
      "currency_name": "",
      "id": -1,
      "level": -1,
      "name": "",
      "parent_id": null,
      "pp": -1,
      "price": -1,
      "product_id": -1,
      "sub": -1,
      "tier_name": "",
      "type": ""
   }


Detail
------

**base**
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**cash**
   Cash you paid.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**category**
   Name of category this product is sorted in.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**category_id**
   Unique identifier of category.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**currency**
   Currency used for payment.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**currency_id**
   Unique identifier of currency.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**currency_name**
   Name of the currency used.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**id**
   Unique identifier of transaction.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**level**
   Level you need to purchase this item.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**name**
   Name of the item.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**parent_id**
   Item from which this product derives from.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**pp**
   Plug points paid.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**price**
   Product's price.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**product_id**
   Unique identifier of product.

   .. note::

      This is also used in the purchase to identify the item you want to buy.

   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**sub**
   Only available for subscribers.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**tier_name**
   Kind of product you buy, i.e. rave.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**type**
   type of product, i.e. "badges".

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
