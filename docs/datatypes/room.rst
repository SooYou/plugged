====
Room
====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The Room model represents a room on plug.


Model
-----

.. code-block:: Javascript

   {
      "booth": Booth,
      "grabs": [],
      "meta": Meta,
      "playback": Playback,
      "role": -1,
      "users": [],
      "votes": []
   }


Detail
------

**booth**
   Booth of the room.

   **Type**: :doc:`Booth</datatypes/booth>` |br|
   **Default Value**: ``see Booth model``


**grabs**
   All users that grabbed the current media.
   With String being the user ID and Number the grab.

   .. hint::

      the grab value is always one, this will not change, not matter how often
      people grab a single song.


   **Type**: :dt:`[Number]` |br|
   **Default Value**: ``[]``


**meta**
   Metadata of room.

   **Type**: :doc:`Meta</datatypes/meta>` |br|
   **Default Value**: ``see Meta model``


**meta**
   Playback info of room.

   **Type**: :doc:`Playback</datatypes/playback>` |br|
   **Default Value**: ``see Playback model``


**role**
   Your role in the room.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**users**
   List of all listeners.

   **Type**: :doc:`[User]</datatypes/user>` |br|
   **Default Value**: ``[]``


**votes**
   listener votes.
   String being the user ID and Number the Vote.

   .. note::

      The vote is represent by two numbers, -1 and 1, with 1 being woot and -1
      meh


   **Type**: :doc:`[Vote]</datatypes/vote>` |br|
   **Default Value**: ``[]``
