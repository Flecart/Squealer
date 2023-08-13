# Squealer

This repo contains the project for the 2022/2023 [Web technology course](https://www.unibo.it/it/didattica/insegnamenti/insegnamento/2022/436428) at University of Bologna, Computer Science Bachelor. The project is real-world like startup (but without money nor customers :D). We had to build three different websites with two different frameworks and a Vanilla JS website.

## Features

This project is a full-fledged social media app, with manager dashboards for social media managers and ideal company employees.

### Main social media features

As an example a user can:

-   Create accounts
-   Custom login functionalities
-   Post messages
-   Post automatic messages on certain topics
-   Set message quota for a single day/week/month
-   Post geolocation messages
-   Post real-time geolocation messages
-   Buy more quota for their own messages
-   Like/Dislike other people posts
-   Create Image and Video messages
-   Answer other people posts
-   Upload files
-   Search other users
-   Customized feed
-   Logging for app troubleshooting
-   Buy VIP user statuses
-   Controversy/Popular quota updates
-   Channel creation and management
-   Channel invitations
-   Channel permissions (read/write/admin)

### Social Media Manager Features

A social media manager can:

-   Track the statistics of their own VIP user
-   Post for their VIP user
-   Send fake geolocation messages for their VIP user
-   Order VIP posts by like, dislikes, controversy, popularity

### Squaler Managers

A squealer manager can:

-   Enable/Disable accounts
-   Delete messages
-   Move messages to other channels
-   Set a fake number of likes or dislikes for a post
-   Make reccurent messages on some topics

For the full documentation see [here](https://github.com/Flecart/Squealer/blob/main/specs.pdf)

## How to run

-   Install node version 20.0.0
-   Setup mongodb connections, filling out a file similar to the provided .env.example
-   compile with `yarn build` this will compile all the three projects.
-   Start with `yarn start`

# Authors

-   [Xuanqiang "Angelo" Huang](https://github.com/flecart)
-   [Giovanni Spadaccini](https://github.com/giospada)
-   [Luca Panariello](https://github.com/Lukirby)
