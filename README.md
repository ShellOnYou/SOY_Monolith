

# Monolith version of the ShellOnYou app

## Content

- [Description](#description)
- [Content of the repo](#content)
- [Building or getting the app](#building-or-getting-the-app)
- [Configuring](#configuring-the-app)
- [Launching](#launching-the-app)
- [Using](#Using-the-app)
- [Citing](#how-to-cite)
- [License](#license)

## Description

This repo contains the monolith backend version (v4) of the ShellOnYou app described in [1]. This app proposes exercises for students to practice the Unix CLI. Teachers can add exercises group them into sessions that can be opened to their students. 
See the *Help* pages once the app has been started.

Nota that this version of the app is only proposed for scientific purposes (replicating the tests we did in [1]), so no associated frontend is provided with it (if you really need a frontend for this version please contact us for getting one).

Note that the database proposed here contains just one exercise. Instructors can contact us to have access to a private repo containing more exercises (not exposed to students ;-).

The app is intended to run as a couple of containers:
- one for the monolith
- one for the database

So you need docker installed (v25 and v26 have been tested but older version should also work). Alternatively, you could easily migrate to kubernetes or even manually start its components one by one with appropriate changes in the code (port numbers, variables).

## Content

This directory contains two folders:
- `back`: code for the monolith.
- `soy-monolith-db`: the *database* of the app.


## Building or getting the app

Once you have cloned the content of this repo, to get the app you either need to build it (recommended) or get it from Docker Hub:

### Building the app:

- `cd` to the root of this repo, i.e. that containing (`variables.env`).
- run the `./build.sh` command (this builds the docker images one after the other).

### Getting the app from DockerHub:

Alternatively, you can get the app by getting the docker images from Docker Hub:
- `cd` to the root folder of the repo (containing the `variables.env` file).
- run the `pull_from_dockerHub.sh` script  

In case of problem also refer to [Docker Hub](https://hub.docker.com/repository/docker/icws24submission/postgres_monolith/general)


## Configuring the app

### Setting up the app
- Go with the `cd` to the `soy-monolith-db` folder.

- If the DB is compressed (`.tgz` file), uncompress it by typing: `tar xzf v4-soy-db.tgz`. This should create a `v4-soy-db` folder. Check by `ls -l` that the permissions are `7xx` on this folder (i.e. the user has all permissions).

- Type `cd ..` to return to the root folder of this repo

- Modify the `variables.env` file according to your environment requirements.

- Complete the information in the `EMAIL` section of this file. This is needed for the account creation and change password functionalities. If you don't need them (eg if you're just interested in running load tests), ignore this section.

- Uncomment/comment the `DEBUG=*` line in this file to have less/more info as the app launches and runs.

### Replicating the monolith

The app comes in a configuration where the monolith is launched in only one replica. To replicate the monolith, you need to be put it behind a reverse proxy (the entrance port can only be mapped to one process). In [1] we resorted to an [HAproxy](https://www.haproxy.org/) service to do that. It's installation is beyond the scope of this README file but you can contact us in case of difficulties. 

## Launching the app

- While still being in the root folder of this repo, run this command: 

``````
docker compose up
``````

Note: with older versions of *docker*, e.g. v20, you could need to add a dash: `docker-compose up`

## Using the app

Once it is launched, you can access the app using the appropriate endpoints and ports specified in your customized `docker-compose.yml` and `variables.env` files. If you didn't change the default port, the backend *login* route is accessed by sending a POST request at `http://localhost:5001/api/user/login` with a payload indicating a valid `email` and `password`.
The other endpoints are listed in the `back/routes` folder.

The DB in its current state contains a large number of user accounts for load test purposes. We give some examples here so that you can log in (.e.g. with curl or postman) and then send other requests:
- adminp@yopmail.com / `adminp`
- teacher1@yopmail.com / `plageCT`
- teacher2@yopmail.com / `plageVB`
- student@yopmail.com / `toto`

--- 
## How to cite

[1] *Is it Worth Migrating a Monolith to Microservices? An Experience Report on Performance, Availability and Energy Usage*. V. Berry, A. Castelltort, B. Lange, J. Teriihoania, C. Tibermacine, C. Trubiani. Proc. of IEEE International Conference on Web Services (ICWS'24).

[2] *ShellOnYou: learning by doing Unix command line*. V. Berry, C. Castelltort, C. Pelissier, M. Rousseau, C. Tibermacine, Proc. of the 27th ann. conf. on Innovation and Technology in Computer Science Education (ITiCSE), Vol 1, pages 379-385, 2022, doi 10.1145/3502718.3524753

---
## License
### Copyright notice
``````
Shell On You, an educational web application to learn shell.
Copyright © 2022 POLYTECH MONTPELLIER.


This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
``````
### Modification
When you modified the code of a file, you may edit the copyright notice on top of it and make it a modification notice by adding a modification copyright notice.
``````
Shell On You, an educational web application to learn shell.
Copyright (C) <year> modified by <NAME> (<MAIL>)
Copyright © 2022 POLYTECH MONTPELLIER.


This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
```````





