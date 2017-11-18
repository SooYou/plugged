===
Ban
===

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The ban model represents a ban contract between a room and a user. The room
is not in the model because this model will only occur on requests made in the
room in which the ban occured.

.. note::

   The duration is represented as a char. plug.dj uses a char internally to
   represent the duration of the ban, namely:

   * h <=> hour
   * d <=> day
   * f <=> forever


Model
-----

.. code-block:: Javascript

   {
      "duration": "",
      "id": -1,
      "moderator": "",
      "reason": -1,
      "timestamp": "Invalid Date",
      "username": "",
   }


Detail
------

**duration**
   Duration of the ban presented as a char.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**id**
   User's ID
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**moderator**
   The moderator who conducted the ban.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**reason**
   The bans' reason presented as an integer.

   .. note::

      For more information about the reason model check out
      :doc:`Reason</datatypes/reason>`

   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**timestamp**
   The time the ban was conducted.

   **Type**: :dt:`String` |br|
   **Default Value**: ``"Invalid Date"``
   

**username**
   The banned user's name.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
