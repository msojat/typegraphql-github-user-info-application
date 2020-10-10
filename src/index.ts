import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";

import * as Express from "express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { UserResolver } from "./resolvers/UserResolver";
import winston = require("winston");

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
  await createConnection();

  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const apolloServer = new ApolloServer({
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
