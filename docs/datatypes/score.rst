=====
Score
=====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

This model represents the score of a media object. Basically how many people
woot'd, meh'd, grabbed the song and also how many listened to it at the time of
the play.


Model
-----

.. code-block:: Javascript

   {
      "grabs": -1,
      "listeners": -1,
      "negative": -1,
      "positive": -1,
      "skipped": -1
   }


Detail
------

**grabs**
   Amount of grabs gathered.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**listeners**
   Amount of listeners at the time this was playing.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**negative**
   Amount of mehs.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**positive**
   Amount of woots.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**skipped**
   Whether the media was skipped.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
