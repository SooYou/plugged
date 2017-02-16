====
Vote
====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model emitted when someone votes.


Model
-----

.. code-block:: Javascript

   {
      "direction": -1,
      "id": -1
   }


Detail
------

**direction**
   What kind of vote was being pushed, with:

   * 1 -> woot
   * -1 -> meh


   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
   

**id**
   ID of the user.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
