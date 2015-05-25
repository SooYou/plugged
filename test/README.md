Test suite requirements
===========
In order to make the test run successfully you need to have the following requirements set:


Add the file 'test.json' in your test folder. It should look like this:

```JavaScript
{
    "email": "email@email.com",
    "password": "password",
    "room": "room",
    "usernameToBuy": ""
}
```

1. You need to have at least 2 other accounts in the test room and the waitlist

2. One of the 2 should have no moderation rights

3. You need to set a test room (obviously)

4. The account on which you let the test run should at least be CO-HOST

5. All 3 accounts should have at least one playlist and 2 media files in it


Usage
===========
Once the requirements are fulfilled you can run the test via 

>npm test
