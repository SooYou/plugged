========
Playback
========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The Playback model represents a block of information about media that was played
at a certain time. Usually this is an object used in the
:doc:`State</datatypes/state>` model.


Model
-----

.. code-block:: Javascript

   {
      "historyID": "",
      "media": Media,
      "playlistID": -1,
      "startTime": ""
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


**startTime**
   Timestamp when this media started playing.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
