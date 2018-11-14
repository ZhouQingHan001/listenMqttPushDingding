const request = require("request");

class Dingding {
  constructor() {
    this.DingDingRobot = {};
  }

  /**
   * 创建一个推送目标，目前支持阿里钉钉机器人
   * @param {String} type 推送目标的类型，比如DingDingRobot
   * @param {Object} info 推送目标的信息，当为DingDingRobot时，则包含name表示机器人自定义名，url表示推送地址
   */
  createNotifyDist(type, info) {
    switch (type) {
      case "DingDingRobot": {
        if (info.name && info.url && !this.DingDingRobot[info.name]) {
          this.DingDingRobot[info.name] = info.url;
        } else {
        }
        break;
      }
      default: {
        break;
      }
    }
    return this;
  }

  /**
   * 将定制的消息推送给阿里机器人
   * @param {*} name 创建机器人时的机器人自定义名，省掉了冗长的地址传入
   * @param {*} message 详见阿里钉钉机器人开放接口的请求体组装规范
   */
  post2DingdingRobot(name, message) {
    request.post(
      this.DingDingRobot[name],
      {
        json: { ...message }
      },
      (error, response, body) => {
        if (error) console.log(error);
        else console.log("post to Dingding Robot success", body);
      }
    );
    return this;
  }
}

module.exports = Dingding;
