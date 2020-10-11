"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const apollo_server_express_1 = require("apollo-server-express");
const Express = require("express");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const UserResolver_1 = require("./resolvers/UserResolver");
const winston = require("winston");
const main = async () => {
    // Logger configuration
    const logConfiguration = {
        transports: [
            new winston.transports.File({
                filename: "./logs/GitGraphQL.log",
                maxsize: 1024 * 1024,
                maxFiles: 3,
            }),
        ],
    };
    // Create the logger
    const logger = winston.createLogger(logConfiguration);
    const app = Express();
    await typeorm_1.createConnection();
    const schema = await type_graphql_1.buildSchema({
        resolvers: [UserResolver_1.UserResolver],
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema,
        context: () => {
            const requestId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
            const context = { requestId, logger };
            return context;
        },
    });
    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log("GraphQL server started on http://localhost:4000/graphql");
    });
};
main();
