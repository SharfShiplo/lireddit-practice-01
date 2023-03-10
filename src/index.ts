import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolver/hello";
import { PostResolver } from "./resolver/post";
import { UserResolver } from "./resolver/user";
// import { Redis } from "ioredis";
// import { User } from "./entities/User";
// import cors from 'cors'

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  //   await orm.em.nativeDelete(User, {})
  await orm.getMigrator().up();
  
  const app = express();
  // const redis = new Redis();

  // app.use(cors({
  //     origin: 'http://localhost:3000',
  //     credentials: true,
  // }))

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  });

  await apolloServer.start();
  // apolloServer.applyMiddleware({app, cors: {origin: 'http://localhost:3000',}})
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("server is running on localhost:4000");
  });
};

main().catch((err) => {
  console.log(err);
});
