Test suite requirements
===========
In order to make the test run successfully you need to have the following requirements set:


1. add test.json in test folder. It should look like this:

```JavaScript
{
    "email": "email@email.com",
    "password": "password",
    "room": "room",
    "usernameToBuy": ""
}
```

2. you need to have at least 2 other accounts in the test room and the waitlist

3. one of the 2 should have no moderation rights

4. you need to set a test room (obviously)

5. the account on which you let the test run should at least be CO-HOST

6. all 3 accounts should have at least one playlist and 2 media files in it


Usage
===========
Once the requirements are fulfilled you can run the test via 

>npm test
