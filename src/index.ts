import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";

import * as Express from "express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { UserResolver } from "./resolvers/UserResolver";

const main = async () => {
  const app = Express();

  await createConnection();

  const schema = await buildSchema({
    resolvers: [UserResolver],
  });

  const apolloServer = new ApolloServer({ schema });

  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("GraphQL server started on http://localhost:4000/graphql");
  });
};

main();
