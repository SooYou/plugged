==========
ChatDelete
==========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when a mod deletes a chat message.


Model
-----

.. code-block:: Javascript

   {
      "cid": "",
      "moderatorID": -1
   }


Detail
------

**cid**
   ID of the deleted message.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**moderatorID**
   ID of the moderator.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
