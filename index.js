const MQTT = require("./mqtt/index");
const later = require("later");
later.date.localTime();
const sched = { schedules: [{ h: [21], m: [30] }] };

const {
  TMoteStatus: { handleTMoteStatus, reportStatusCnt },
  TMoteInfo: { handleTmoteInfo, reportRadarCt },
  WorkInfo: { handleWorkInfo, reportNbRuntTme }
} = require("./handler/index");
const mqtt = new MQTT();

mqtt.on("TMoteStatus", data => {
  // handleTMoteStatus(data);
});
mqtt.on("TMoteInfo", data => {
  handleTmoteInfo(data);
});
mqtt.on("WorkInfo", data => {
  // handleWorkInfo(data);
});

let alarm = later.setInterval(async () => {
  // await reportRadarCt();
  // reportStatusCnt();
  // reportNbRuntTme();
}, sched);
