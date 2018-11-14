const client = require("./client");
const events = require("events").EventEmitter;

const log4js = require("log4js");
const log4mqtt = log4js.getLogger("mqtt");
log4mqtt.level = "debug";

class MqttBroker {
  constructor() {
    this.client = client;
    this.event = new events();
    client.on("message", (TOPIC, data) => {
      const receivedStr = data.toString();
      const receiveJosnString = receivedStr.slice(8);
      if (
        receivedStr.slice(0, 4) === "TCLD" &&
        isJsonString(receiveJosnString)
      ) {
        const receiveJson = JSON.parse(receiveJosnString);
        const {
          SN = "00000000",
          Name = "",
          TMoteStatus = {},
          TMoteInfo = {},
          WorkInfo = {}
        } = receiveJson;
        log4mqtt.info(`MESSAGE RECEIVED :${TOPIC} ${SN} ${Name}`);
        switch (Name) {
          case "TMoteStatus":
            this.event.emit("TMoteStatus", {
              SN,
              TOPIC,
              TMoteStatus
            });
            break;
          case "TMoteInfo":
            this.event.emit("TMoteInfo", {
              SN,
              TOPIC,
              TMoteInfo
            });
            break;
          case WorkInfo:
            this.event.emit("WorkInfo", {
              SN,
              TOPIC,
              WorkInfo
            });
            break;
          default:
            break;
        }
      }
    });
  }
  on(event, listener) {
    this.event.addListener(event, transmit => listener(transmit));
  }
}

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = MqttBroker;
