# TypeGraphQL Github user info application

Simple TypeGraphQL app for accessing Github users data.

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

Since this is a small application meant to run on small scale, the database choice is SQLite because of it's simplicity. In case the application is run on a bigger scale, another database should be used.

### Logs

Logs are saved to files named GitGraphQL*.log (* in name represents generated number added to new files) in the subdirectory "logs". Files are limited to the size of 1MB and only last 3 files are kept.

#### Log Structure

Logs are structured as level and message. Level represents importance and message is combination of following:

| Time     | [Request ID]                       | Function name           | \|        | Message |
| -------- | ---------------------------------- | ----------------------- | --------- | ------- |
| ISO 8601 | Integer generated for each request | Name of called function | Separator | String  |

Example:
`{"message":"2020-10-11T10:34:45.771Z [664053549663089] mostSearched | called with args: { limit: 5 }","level":"info"}`
