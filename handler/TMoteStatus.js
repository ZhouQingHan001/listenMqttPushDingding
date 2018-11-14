const log4js = require("log4js");
const Parkingspaces = require("../mongo/Parkingspaces");
const MoteDevicesWrongHistory = require("../mongo/MoteDevicesWrongHistory");
const { dingding_status } = require("../dingding/robots");
const log4TMoteStatus = log4js.getLogger("log4TMoteStatus");
log4TMoteStatus.level = "debug";

const BufferStatus = [];
let statusTotalCount = 0;
let radarDistanceCt = 0;
let radarBackgroundCt = 0;
let signalQualityPoorCt = 0;
let DelayTooLongCt = 0;
let heartPackageRepeat = 0;
let statusPackageRepeat = 0;
let magDiffUnnormal = 0;
let countError = 0;
let xyzSamePrevious = 0;

/**
 * 比较两个对象是否完全一样
 * @param {object} obj1
 * @param {object} obj2
 */
const compare = (obj1, obj2) => {
  for (var key in obj1) {
    if (typeof obj2[key] === "undefined") {
      return false;
    } else {
      if (typeof obj1[key] === "object") {
        compare(obj1[key], obj2[key]);
      } else {
        if (obj1[key] !== obj2[key]) {
          return false;
        }
      }
    }
  }
  return true;
};

const allValueLt5 = RadarVal => {
  let temp = RadarVal.split(",");
  for (let i = 0; i < temp.length; i++) {
    if (temp[i] >= 5) return false;
  }
  if (RadarVal.match(/[0]/g).length === temp.length) return false;
  return true;
};

const mongoAgent = async (SN, ErrorType, TOPIC, TMoteStatus, parkinglot) => {
  let ret = await MoteDevicesWrongHistory.create({
    SN: SN,
    ErrorType: ErrorType,
    Time: new Date(),
    Owner: TOPIC,
    Data: TMoteStatus,
    Parkinglot: {
      ParkinglotName: parkinglot.ParkinglotName,
      ParkinglotId: parkinglot.ParkinglotId
    }
  });
  if (!ret._id) return ret;
  return "create";
};

/**
 * 0:没重复; 1: 状态包重复; 2: 心跳包重复 3:count值不连续
 * @param {string} sn
 * @param {Object} data 当前上报TMoteStatus
 * @param {Object} bufferData 缓存中的TMoteStatus
 */
const judgePackage = (sn, data, bufferData) => {
  return new Promise((resolve, reject) => {
    let passTime = new Date().getTime() - bufferData.Time.getTime();
    let BufferTMoteStatus = bufferData.TMoteStatus;
    let repeatResult = compare(BufferTMoteStatus, data);
    if (allValueLt5(data.RadarVal)) {
      resolve(6);
    } else if (
      data.Status < 2 &&
      BufferTMoteStatus.x == data.x &&
      BufferTMoteStatus.y == data.y &&
      BufferTMoteStatus.z == data.z &&
      BufferTMoteStatus.Status != data.Status
    ) {
      // console.log("越石要我加的xyz一样");
      resolve(5);
    } else if (repeatResult && data.Status < 2) {
      //状态包重复
      resolve(1);
    } else if (repeatResult && data.Status > 1) {
      if (passTime < 1800000) {
        //在半小时内连续发了两包一样的心跳包也是有问题的
        resolve(2);
      } else {
        resolve(0);
      }
    } else if (data.Count - BufferTMoteStatus.Count > 1) {
      resolve(3); //count值不连续，丢包了
    } else if (
      data.Status < 2 &&
      Math.abs(new Date().getTime() - new Date(data.Time).getTime()) > 60000
    ) {
      //状态包延时太大:超过1分钟
      resolve(4);
    } else {
      resolve(0);
    }
  });
};
/**
 * 判断信号好不好，version为1暂时无法判断
 * 0:version为1或者正常,1：rssi太小, 2：Snr太小
 * @param {Object} TMoteStatus
 */
const signalQuality = data => {
  return new Promise((resolve, reject) => {
    if (data.Version == 2) {
      if (data.Rssi == 0 && data.Snr == 0) {
        resolve(0); //此时未上报rssi和snr的值
      } else if (data.Rssi < 5) {
        //定为多少合适
        resolve(1);
      } else if (data.Snr < -20) {
        //定为多少合适
        resolve(2);
      }
    }
    resolve(0);
  });
};

/**
 * 判断数据是否正常
 * @param {String} SN
 * @param {Object} TMoteStatus
 */
const statusIsNormal = (sn, data, bufferData) => {
  let BufferTMoteStatus = bufferData.TMoteStatus;
  return new Promise((resolve, reject) => {
    switch (data.Status) {
      case 0:
        //  console.log("车辆离开");
        let reliability = (255 + data.RadarDiff * 2 - data.CoverCount) % 255; // < 5 为优； < 10 为良
        if (reliability > 10) {
          //  console.log("雷达背景值异常", reliability);
          resolve(1);
          break;
        }
        if (data.Distance > 8) {
          // console.log("雷达distance有问题", data.Distance);
          resolve(2);
          break;
        }
        if (BufferTMoteStatus.Status == 1 && BufferTMoteStatus.Status == 3) {
          //上一包是有车
          if (data.MagDiff > BufferTMoteStatus.MagDiff) {
            //无车的磁场比有车时还大，疑似有问题
            resolve(3);
            break;
          }
          if (
            data.RadarDiff > BufferTMoteStatus.RadarDiff ||
            data.CoverCount > BufferTMoteStatus.CoverCount
          ) {
            //无车的RadarDiff和CoverCount比有车时还大，疑似有问题
            resolve(1);
            break;
          }
        }
        resolve(0);
        break;
      case 1:
        // console.log("车辆进入");
        if (data.Distance < 8) {
          // console.log("雷达distance有问题", data.Distance);
          resolve(2);
          break;
        }
        if (BufferTMoteStatus.Status == 0 && BufferTMoteStatus.Status == 2) {
          //上一包是无车
          if (data.MagDiff < BufferTMoteStatus.MagDiff) {
            //有车的磁场比无车时还小，疑似有问题
            resolve(3);
            break;
          }
          if (
            data.RadarDiff < BufferTMoteStatus.RadarDiff ||
            data.CoverCount < BufferTMoteStatus.CoverCount
          ) {
            //有车的RadarDiff和CoverCount比无车时还小，疑似有问题
            resolve(1);
            break;
          }
        }
        resolve(0);
        break;
      case 2:
        // console.log("持续无车");
        let reliability2 = (255 + data.RadarDiff * 2 - data.CoverCount) % 255; // < 5 为优； < 10 为良
        if (reliability2 > 10) {
          // console.log("雷达有问题", reliability2);
          resolve(1);
          break;
        }
        if (data.Distance > 8) {
          // console.log("雷达distance有问题", data.Distance);
          resolve(2);
          break;
        }
        if (
          data.RadarDiff - BufferTMoteStatus.RadarDiff > 8 ||
          data.CoverCount - BufferTMoteStatus.CoverCount > 8
        ) {
          //持续无车变化值超过分辨率8疑似有问题。
          resolve(1);
          break;
        }
        if (Math.abs(data.MagDiff - BufferTMoteStatus.MagDiff) > 1000) {
          //持续无车的磁场变化太强1：周围停了一辆车2：有问题
          resolve(3); //这里判断的依据是 数据库统计Status=2时 magdiff<1000 率为 282920/322542
          break;
        }
        resolve(0);
        break;
      case 3:
        // console.log("持续有车");
        if (data.Distance < 8) {
          // console.log("雷达distance有问题", data.Distance);
          resolve(2);
          break;
        }
        // if (Math.abs(data.RadarDiff - BufferTMoteStatus.RadarDiff) > 10  || Math.abs(data.CoverCount - BufferTMoteStatus.CoverCount) > 10) {
        //     //持续有车的RadarDiff和CoverCount变化超过10，疑似有问题，后续调整
        //     resolve(1);
        //     break;
        // }
        resolve(0);
        break;
      default:
        reject("error");
        break;
    }
  });
};
/**
 * 根据设备SN去找到所在的车场
 * @param {String} SN
 */
const findParkinglot = SN => {
  return new Promise((resolve, rejecet) => {
    if (!SN)
      rejecet({
        Error: "SN is illegal"
      });
    Parkingspaces.findOne({
      MoteDeviceId: SN
    }).then(findOne => {
      if (!findOne) {
        resolve(null);
      } else {
        resolve({
          ParkinglotName: findOne.Parkinglot.ParkinglotName,
          ParkinglotId: findOne.Parkinglot.ParkinglotId
        });
      }
    });
  });
};
/**
 *
 * @param {*} packageResult 包判断，是否重复，是否不连续
 * @param {*} signalQualityPoor 是否信号差
 * @param {*} statusResult 数据判断
 */
const middleware = (packageResult, statusResult, signalQualityPoor) => {
  let ErrorType = "normal";
  let Msg = "数据包有问题";
  if (!packageResult && !signalQualityPoor && statusResult == 0) {
    ErrorType = "normal";
    Msg = "数据正常";
  }
  switch (packageResult) {
    case 1:
      // console.log(`状态包重复`);
      ErrorType = "status package repeat";
      Msg = "设备状态包重复";
      break;
    case 2:
      // console.log('心跳包重复');
      ErrorType = "heart package repeat";
      Msg = "设备心跳包重复,";
      break;
    case 3:
      // console.log('count值不连续');
      ErrorType = "count error";
      Msg = "数据包count值不连续";
      break;
    case 4:
      // console.log('状态包延时超过1分钟');
      ErrorType = "status Delay too long ";
      Msg = "数据包延时很大";
      break;
    case 5:
      // console.log("上报的数据XYZ值和上一包完全一样, 请及时查看确认");
      ErrorType = "xyz same previous package";
      Msg = "磁场XYZ值相比上一包没变化";
      break;
    default:
      break;
  }
  if (statusResult) {
    switch (statusResult) {
      case 1:
        // console.log("雷达背景值异常");
        ErrorType = "radar background unnormal";
        Msg = "雷达背景值异常";
        break;
      case 2:
        // console.log('Distance');
        ErrorType = "radar distance unnormal";
        Msg = "雷达Distance异常";
        break;
      case 3:
        console.log("磁场有问题");
        ErrorType = "magDiff unnormal";
        Msg = "磁感数据异常";
        break;
      default:
        break;
    }
  } else if (signalQualityPoor) {
    ErrorType = "signal Quality Poor";
    Msg = "设备信号质量很差";
  }
  return { ErrorType, Msg };
};

const handleTMoteStatus = async data => {
  const { SN, TOPIC, TMoteStatus } = data;
  statusTotalCount++;
  let result = BufferStatus.find(x => {
    if (x.SN == SN) {
      return x;
    }
  });
  if (result == undefined) {
    //第一次内存中没此SN的数据
    BufferStatus.push({
      SN: SN,
      Time: new Date(),
      TMoteStatus: TMoteStatus
    });
  } else {
    let ret1 = await judgePackage(SN, TMoteStatus, result);
    let ret2 = await statusIsNormal(SN, TMoteStatus, result);
    let ret3 = await signalQuality(TMoteStatus);
    let parkinglot = (await findParkinglot(SN)) || { ParkinglotName: "" };
    result.TMoteStatus = TMoteStatus;
    result.Time = new Date(); //更新buffer
    if (ret1 == 6) {
      await mongoAgent(
        SN,
        "radar value unnormal",
        TOPIC,
        TMoteStatus,
        parkinglot
      );
      let content = `${
        parkinglot.ParkinglotName
      }(${TOPIC})下的设备[${SN}],雷达值全部小于5，请及时查看确认`;
      dingding_status(content);
    }
    const { ErrorType, Msg } = middleware(ret1, ret2, ret3);
    if (ErrorType != "normal") {
      await mongoAgent(SN, ErrorType, TOPIC, TMoteStatus, parkinglot);
      switch (ErrorType) {
        case "radar distance unnormal":
          radarDistanceCt = radarDistanceCt + 1;
          break;
        case "signal Quality Poor":
          signalQualityPoorCt = signalQualityPoorCt + 1;
          break;
        case "status Delay too long ":
          DelayTooLongCt = DelayTooLongCt + 1;
          break;
        case "radar background unnormal":
          radarBackgroundCt = radarBackgroundCt + 1;
          break;
        case "heart package repeat":
          heartPackageRepeat = heartPackageRepeat + 1;
          break;
        case "status package repeat":
          statusPackageRepeat = statusPackageRepeat + 1;
          break;
        case "magDiff unnormal":
          magDiffUnnormal = magDiffUnnormal + 1;
          break;
        case "count error":
          countError = countError + 1;
          break;
        case "xyz same previous package":
          xyzSamePrevious = xyzSamePrevious + 1;
          break;
        default:
          break;
      }
      let content = `${
        parkinglot.ParkinglotName
      }(${TOPIC})的设备:[${SN}]发现问题：${Msg}`;
      log4TMoteStatus.error(content);
    }
  }
};

const reportStatusCnt = () => {
  let sum =
    radarDistanceCt +
    radarBackgroundCt +
    signalQualityPoorCt +
    DelayTooLongCt +
    heartPackageRepeat +
    statusPackageRepeat +
    magDiffUnnormal +
    countError +
    xyzSamePrevious;
  let content = `TMoteStatus统计 \r\n上报TMoteStatus数据包总数:${statusTotalCount}条 \r\n异常TMoteStatus数据包总数:${sum}条\r\n异常TMoteStatus数据包占比：${(
    sum / statusTotalCount
  ).toFixed(
    2
  )}\r\n 雷达距离异常：${radarDistanceCt}\r\n雷达背景异常：${radarBackgroundCt}\r\n信号质量很差：${signalQualityPoorCt}\r\n数据延时很大：${DelayTooLongCt}\r\n重复数据上报：${heartPackageRepeat +
    statusPackageRepeat}\r\n磁感数据异常：${magDiffUnnormal}\r\ncount不连续：${countError}\r\n 磁感XYZ无变化：${xyzSamePrevious}`;
  dingding_status(content);
};

module.exports = {
  handleTMoteStatus,
  reportStatusCnt
};
