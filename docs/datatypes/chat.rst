=====
Chat
=====

.. |br| raw:: html

    <br />


.. role:: dt
   :class: datatype


Summary
-------

Chat message offering some further details about the user that wrote it.


Model
-----

.. code-block:: Javascript

   {
       "cid": "",
       "message": "",
       "sub": -1,
       "id": -1,
       "username": ""
   }


Detail
------

**cid**
   Unique identifier of chat message.

   .. note::

      The cid consists of three identifiers, first is the user's ID, second the
      unix timestamp of the message and a third suffix, so for example a message
      from user 1234567 at unix time 1234567890 would look like this:
      **1234567-1234567890123**


   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**message**
   Actual message sent by user.

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``


**sub**
   Indicates if the user have a subscription going.

   .. note::

      Subscription has a zero based index with 0 representing false as in the
      user have no subscription going and 1 with them having.


   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**id**
   User's ID.

   **Type**: :dt:`Number` |br|
   **Default Value**: ``-1``


**username**
   User's name

   **Type**: :dt:`String` |br|
   **Default Value**: ``""``
