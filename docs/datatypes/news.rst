====
News
====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

The News model is a fairly light one. All it contains is a short description of 
a blog entry, a link to it and the corresponding title.

Plug has its own kind of like _rss_ feed going in which it informs you about the
latest news regarding their page, this model is representing an entry in this
feed.


Model
-----

.. code-block:: Javascript

   {
      "desc": "",
      "href": "",
      "title": ""
   }


Detail
------

**desc**
   Blog entry text, cut after 300 characters.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
   

**href**
   Link to the blog entry.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**title**
   Blog entry title.
   
   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
