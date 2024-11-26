const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");
const { Users } = require("./user");


const {Users} = require("./user");

const {Todo} = require("./todo");

async function StartServer() {
    const app = express();

    const server = new ApolloServer({
        typeDefs: `
        
         type User {
           id: ID!
           name: String!
           username: String!
        }

         type Todo {
           id: ID!
           title: String!
           completed: Boolean
           user: User
         }

        type Query {
        getTodos: [Todo]
        GetUser(id: ID!): User
        }
        `,
        resolvers: {
            Todo: {
                user: async (todo) => {
                    try {
                        const user = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.userId}`);
                        return user.data; // Return user data
                    } catch (error) {
                        console.error("Error fetching user:", error);
                        throw new Error("Failed to fetch user");
                    }
                }
            },
            Query: {
                getTodos: async () => {
                    try {
                        return (await axios.get("https://jsonplaceholder.typicode.com/todos")).data;
                    } catch (error) {
                        console.error("Error fetching todos:", error);
                        throw new Error("Failed to fetch todos");
                    }
                },
                GetUser: async (parent, { id }) => {
                    try {
                        return (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data;
                    } catch (error) {
                        console.error("Error fetching user:", error);
                        throw new Error("Failed to fetch user");
                    }
                }
            }
        }
    });

    app.use(bodyParser.json());
    app.use(cors());

    await server.start();
    app.use("/graphql", expressMiddleware(server));

    app.listen(8000, () => console.log("Server running on http://localhost:8000/graphql"));
}

StartServer();
