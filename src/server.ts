import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { createServer } from "http";
import compression from "compression";
import cors from "cors";
import { Sequelize } from "sequelize-typescript";
require("dotenv").config();

import schema from "./schema";

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: "postgres",
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  storage: ":memory:",
  port: 5432,
  models: [__dirname + "/models"],
  modelMatch: (filename, member) => {
    return (
      filename.substring(0, filename.indexOf(".model")) === member.toLowerCase()
    );
  }
});

sequelize.authenticate().then(() => {
  console.log("good~!");
});

const app = express();
const server = new ApolloServer({
  schema,
  validationRules: [depthLimit(7)]
});

app.use("*", cors());
app.use(compression());
server.applyMiddleware({ app, path: "/graphql" });

const httpServer = createServer(app);

httpServer.listen({ port: 8000 }, (): void => console.log("server start"));
