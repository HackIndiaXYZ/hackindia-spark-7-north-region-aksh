import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/techexpo";
console.log(`[DB] Connecting to: ${MONGO_URI}`);
mongoose.connect(MONGO_URI);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connection successful to database");
});

export default db;