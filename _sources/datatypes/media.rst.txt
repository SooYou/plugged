=====
Media
=====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Media model is a collection of members that serializes media sources from two
different sites, namely http://www.youtube.com and http://www.soundcloud.com


Model
-----

.. code-block:: Javascript

   {
      "author": "",
      "cid": "",
      "duration": -1,
      "format": -1,
      "id": -1,
      "image": "",
      "title": ""
   }


Detail
------

**author**
   Author like artist.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**cid**
   ID from the originating site.

   .. note::

      Media originating from youtube uses the value of the **v** tag. |br|
      Media from soundcloud uses the track ID.
   
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**duration**
   Length in seconds.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**format**
   Site where the media originated from.

     * 1: youtube.com
     * 2: soundcloud.com
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**id**
   Internal unique identifier.
   
   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**image**
   Preview thumbnail.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**title**
   Title like song title.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
