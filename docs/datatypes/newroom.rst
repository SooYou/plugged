=======
NewRoom
=======

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Model received when creating a new room. It contains the necessary info to take
further actions.


Model
-----

.. code-block:: Javascript

   {
      "id": -1,
      "name": "",
      "slug": ""
   }


Detail
------

**id**
   Room's unique identifier.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**name**
   Room's name.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**slug**
   URL conform representation of room's name.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
