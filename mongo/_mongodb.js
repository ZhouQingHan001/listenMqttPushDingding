const mongoose = require("mongoose");
const log4js = require("log4js");
const log4db = log4js.getLogger("mongo");
log4db.level = "debug";

mongoose.set("useCreateIndex", true);

const url = "mongodb://47.104.142.145:27017,47.96.13.197:27017/parking_platform";
const connectionOptions = {
  replicaSet: "movebroad-01",
  user: "parking_platform",
  pass: "135246Acbd",
  useNewUrlParser: true
};

mongoose.connect( url, connectionOptions );

const db = mongoose.connection;

db.on("open", () => {
  log4db.info("Connection using Mongoose succeed!");
});

db.on("error", error => {
  log4db.error(`Error in MongoDB connection ${error}`);
});

exports.db = db;
