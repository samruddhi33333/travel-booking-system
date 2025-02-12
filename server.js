import express from "express";
import { ApolloServer } from "apollo-server-express";
import typeDefs from "./graphql/typeDefs.js";
import resolvers from "./graphql/resolvers.js";
import connectDB from "./config.js";

const app = express();

// Root route to check API status
app.get("/", (req, res) => {
  res.send("Travel Booking GraphQL API is running!");
});

// Apollo Server
const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
