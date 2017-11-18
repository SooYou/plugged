============
MUTEDURATION
============

Summary
-------

The MUTEDURATION enumeration is, as the name implies, used for the duration a
user should be muted for.

.. hint::

   The timing is set by 4 chars representing the duration of the mute. Different
   to :doc:`BANDURATION</datatypes/banduration>` MUTEDURATION has the option to
   set the time to zero, or NONE as described below. This is just but a
   redundant way to remove the mute on a user inside plug's API. The recommended
   way using plugged is to call :ref:`unmute-user`.

   The other three options describe their length as arbitrary names. The actual
   length is listed as follow:

   * SHORT => 15 minutes
   * MEDIUM => 30 minutes
   * LONG => 45 minutes


Enum
----

   * 'o': NONE
   * 's': SHORT
   * 'm': MEDIUM
   * 'l': LONG
