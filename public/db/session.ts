import mongoDbSession, { MongoDBStore } from "connect-mongodb-session";
import session, { MemoryStore, Store } from "express-session";
import { MONGO_URI } from "./database";   
import { User } from "../interfaces/user";

const mongoDBStore = mongoDbSession(session);

const mongoStore = new mongoDBStore({
    uri: MONGO_URI,
    collection: "sessions",
    databaseName: "login-express"
})

declare module 'express-session'{
    export interface SessionData{
        user?: User,
    }
}

export default session({
    secret : process.env.SESSION_SECRET ?? "mijn geheim",
    store: mongoStore,
    resave : true,
    saveUninitialized : true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    }
})