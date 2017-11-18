========
Settings
========

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

This models sums up all personal settings for the UI on plug.dj, usually you
won't have any need for this information except you want to build a GUI


Model
-----

.. code-block:: Javascript

   {
      "chatImages": false,
      "chatTimestamps": -1,
      "emoji": false,
      "friendAvatarsOnly": false,
      "notifyDJ": false,
      "notifyFriendJoin": false,
      "notifyScore": false,
      "tooltips": false,
      "videoOnly": false
   }


Detail
------

**chatImages**
   Show chat images.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**chatTimestamps**
   Time system to use. Valid values are:

   * 12
   * 24


   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``
   

**emoji**
   Show emoji.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**friendAvatarsOnly**
   Show avatars of friends only.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**notifyDJ**
   Show DJ notifications only.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**notifyFriendJoin**
   Show notification when friend joins room.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**notifyScore**
   Show notification on advance.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**tooltips**
   Show tooltips.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``


**videoOnly**
   Show video only.
   
   **Type**: :dt:`Boolean` |br|
   **Default Value**: ``false``
