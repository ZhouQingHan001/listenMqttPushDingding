const moment = require("moment");
const Dingding = require("./index");

const dingding_Info = content => {
  new Dingding()
    .createNotifyDist("DingDingRobot", {
      name: "钉钉机器人",
      url:
        "https://oapi.dingtalk.com/robot/send?access_token=ddcb27ff4b31a135dcbdbc2146b29e437772255bd19654f0f891120e4302ba39"
    })
    .post2DingdingRobot("钉钉机器人", {
      msgtype: "text",
      text: {
        content: `${moment(new Date()).format(
          "YYYY-MM-DD HH:mm:ss"
        )} ,${content}`
      }
    });
};

const dingding_status = content => {
  new Dingding()
    .createNotifyDist("DingDingRobot", {
      name: "钉钉机器人",
      url:
        "https://oapi.dingtalk.com/robot/send?access_token=f538b9202eeae23cc64d42568a76b973426351e6ab86448f79e7fa297b85d47a"
    })
    .post2DingdingRobot("钉钉机器人", {
      msgtype: "text",
      text: {
        content: `${moment(new Date()).format(
          "YYYY-MM-DD HH:mm:ss"
        )} ,${content}`
      }
    });
};

const dingding_Accumulate = content => {
  new Dingding()
    .createNotifyDist("DingDingRobot", {
      name: "钉钉机器人",
      url:
        "https://oapi.dingtalk.com/robot/send?access_token=ac9268a1eca6595b9f4cb67fab7f49a430604dadac55ad8e00e810b0c3d99dc1"
    })
    .post2DingdingRobot("钉钉机器人", {
      msgtype: "text",
      text: {
        content: `${moment(new Date()).format(
          "YYYY-MM-DD HH:mm:ss"
        )} ,${content}`
      }
    });
};

const dingding_SpclReboot = content => {
  new Dingding()
    .createNotifyDist("DingDingRobot", {
      name: "钉钉机器人",
      url:
        "https://oapi.dingtalk.com/robot/send?access_token=b5f6af7e31a50a26a4cf80af21f1f743ff1d3694c36b006cb4c38dc7b7f59dfd"
    })
    .post2DingdingRobot("钉钉机器人", {
      msgtype: "text",
      text: {
        content: `${moment(new Date()).format(
          "YYYY-MM-DD HH:mm:ss"
        )} ,${content}`
      }
    });
};
const dingding_KangKang = content => {
  new Dingding()
    .createNotifyDist("DingDingRobot", {
      name: "钉钉机器人",
      url:
        "https://oapi.dingtalk.com/robot/send?access_token=ab32b68a5218be882e18bb7984c8c858e52b989dd228dc4875d77014a3e2b67e"
    })
    .post2DingdingRobot("钉钉机器人", {
      msgtype: "text",
      text: {
        content: `${moment(new Date()).format(
          "YYYY-MM-DD HH:mm:ss"
        )} ,${content}`
      }
    });
};

module.exports = {
  dingding_Info,
  dingding_status,
  dingding_Accumulate,
  dingding_SpclReboot,
  dingding_KangKang
};
