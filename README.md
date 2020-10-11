# TypeGraphQL Github user info application

Simple TypeGraphQL app for accessing Github users.

## Installation

1. Install node.js
2. Run `git clone https://github.com/msojat/typegraphql-github-user-info-application.git`
3. Go into the cloned folder
4. Run `npm install` (only has to be done before first start or when you
   change the source code)
5. Run `npm run start`
6. Browse to <http://localhost:4000/graphql>

## Documentation

The application is built using TypeGraphQL running on top of express server. The goal of the application is to fetch the user data from GitHub REST API and expose it using GraphQL while keeping count of requests for every single user.

### Database

Since this is small application ment to run on small scale the database choice is SQLite because of it's simplicity. In case the application would be run on bigger scale, another database should be used.
