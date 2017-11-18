=======
History
=======

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

History is one big contract model that represents a spot in time in which a user
played media in a room. It also keeps track of the listeners and score it ranked
as well as some very basic info about the DJ themself.

.. note::

   The History model finds use in several places throughout the API, which does
   help consistency. For example in :ref:`get-my-history` and
   :ref:`get-room-history`



Model
-----

.. code-block:: Javascript

   {
      "id": "",
      "media": Media,
      "room": {
        "name": "",
        "slug": "",
        "private": false,
      },
      "score": Score,
      "timestamp": "Invalid Date",
      "user": {
        "id": -1,
        "username": ""
      }
   }


Detail
------

**id**
   Unique identifier of the history object.

   .. note::

      The ID is using the GUID v4 representation for the history object.

   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**media**
   Media played.

   **Type**: :doc:`Media</datatypes/media>` |br|
   **Default Value**: ``see Media model``
   

**room**
   Room the History entry was created in.
   
   **Type**: :dt:`Object` |br|
   **Default Value**: ``see example above``


**score**
   Score model keeping track of listeners and rank.
   
   **Type**: :doc:`Score</datatypes/score>` |br|
   **Default Value**: ``see Score model``


**timestamp**
   Timestamp when the history object was created.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``Invalid Date``


**user**
   User that was the DJ at the time.
   
   **Type**: :dt:`Object` |br|
   **Default Value**: ``see example above``
