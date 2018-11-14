const mqtt = require("mqtt");
const log4js = require("log4js");

const log4mqtt = log4js.getLogger("mqtt");
log4mqtt.level = "debug";

const URL = "ws://106.14.142.169:8083/mqtt";
const clientId = "CLASSIFY" + Date.now();
const TOPIC = ["/standard/kangkang/"];

const client = mqtt
  .connect(
    URL,
    { clientId, clean: true }
  )
  .on("connect", connack => {
    log4mqtt.info(
      `106.14.142.169:8083 connect success, ${JSON.stringify(connack)}`
    );
  })
  .on("reconnect", () => {
    log4mqtt.warn("reconnect start");
  })
  .on("error", err => {
    log4mqtt.error(`error occured, ${err}`);
    client.reconnect();
  })
  .on("close", () => {
    log4mqtt.error("client closed");
  })
  .on("offline", () => {
    log4mqtt.error("client offline");
  })
  .subscribe(TOPIC, (error, granted) => {
    if (error) {
      log4mqtt.error(`subscribe error ${error}`);
    } else {
      log4mqtt.info(`subscribe success ${JSON.stringify(granted)}`);
    }
  });

module.exports = client;
