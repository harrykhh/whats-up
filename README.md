##Whats Up

The UI of the application used display database, application and internet statuses

Recording data into MongoDb to generate historic response time D3 graphs

Live data updates are pushed via Redis's pubsub and socket.io

##Design Diagram
![Diagram](https://github.com/harrykhh/whats-up/raw/master/images/diagram.png)

##Software Requirements
1. [Node](http://nodejs.org)
2. [Bower](http://bower.io)
3. [MongoDB](http://www.mongodb.org/)
4. [Redis](http://redis.io/)

##Features

1. Live graph updates with [socket.io](http://socket.io/)

[![Live graph update](http://img.youtube.com/vi/Uc9aNiXWZDo/0.jpg)](http://www.youtube.com/watch?v=Uc9aNiXWZDo)

2. Integrated with [passport](http://passportjs.org/)

![Homescreen](https://github.com/harrykhh/whats-up/raw/master/images/1.png)

##Install

1. Clone the repo: `git clone https://github.com/harrykhh/whats-up.git`.
2. Install with [Node](http://nodejs.org): `npm update`.
3. Install with [Bower](http://bower.io): `bower update`.

##Settings

Config file located at : `server/config/config.json`

1. Redis port(default 6379) `"redis_port" : "6379"`
2. Redis URL(default localhost) `"redis_url" : "localhost"`
3. MongoDb URL(default mongodb://localhost:27017/stats) `"mongodb_url" : "mongodb://localhost:27017/stats"`
4. MongoDb User(default mongouser) `"mongodb_user" : "mongouser"`
5. MongoDb Password(default password) `"mongodb_password" : "password",`
6. LDAP Passport Config (optional)

	`"LDAPPassportConfig" : {
		"server" : {
			"url": "LDAP://localhost",
			"adminDn": "network\\admin",
			"adminPassword" : "password",
			"searchBase" : "CN=Users,DC=NETWORK,DC=com",
			"searchFilter" : "(sAMAccountName={{username}})"
		}
	}`

##Author

**Harry Ho**

+ https://github.com/harrykhh
+ http://www.linkedin.com/pub/harry-ho/43/15a/5a3

##License

The MIT License (MIT)

Copyright (c) [2014] [Harry Ho]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.