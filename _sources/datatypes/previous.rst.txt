========
Previous
========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The Previous model represents a block of information about media that was played
at a certain time. Usually this is an object used in the
:doc:`ADVANCE</reference/events>` model.


Model
-----

.. code-block:: Javascript

   {
      "historyID": "",
      "media": Media,
      "playlistID": -1,
      "dj": User,
      "score": Score
   }


Detail
------

**historyID**
   Unique identifier of the history object.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**media**
   Media shown.

   **Type**: :doc:`Media</datatypes/media>` |br|
   **Default Value**: ``see Media model``


**playlistID**
   Link to the blog entry.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**dj**
   DJ in booth.

   **Type**: :doc:`User</datatypes/user>` |br|
   **Default Value**: ``see User model``

**score**
   Score gained with play.

   **Type** :doc:`Score</datatypes/score>`
   **Default Value**: ``see Score model``
