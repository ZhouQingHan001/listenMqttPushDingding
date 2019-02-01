const mongodb = require('./_mongodb');
const Schema = require('mongoose').Schema;

const MoteDevices = new Schema
(
    {
      SN: { type: String, required: true, index: { unique: true } }, // 设备编号
      // 动态信息
      Runtime: { type: String }, // 运行时间
      Rssi: { type: Number }, // 信号质量
      Snr: { type: Number }, // 信噪比
      Batt: { type: Number }, // 电池电压 单位 V
      Rlib: { type: String, alias: 'rlib' }, // 雷达库版本 如peak2diff,8116,14
      Rcnt: { type: Number, alias: 'rcnt' }, // 雷达发送次数
      Temp: { type: Number, alias: 'temp' }, // 温度
      Rdgb: { type: Number, alias: 'rdgb' }, // radar debug 在软件版本127已经去掉
      Psm: { type: Number, alias: 'psm' }, // 密钥 暂时没用
      Algo: { type: Number, alias: 'algo' }, // 检测算法库版本
      Qmcrbt: { type: Number, alias: 'qmcrbt' }, // qmc reboot 重启次数
      Nbboot: { type: Number, alias: 'nbbootcnt' }, // NB重启次数
      Nbsent: { type: Number, alias: 'nbsentcnt' }, // NB发送次数
      Nbrecv: { type: Number }, // NB接受消息次数
      Indelay: { type: Number }, // 检测到有车持续一定的平稳时间后上报数据 单位 s
      Nbheart: { type: Number }, // 心跳间隔 单位 h
      // 静态信息
      Type: { type: String }, // 表示设备类型，比如是车位还是流量
      Vender: { type: String }, // 厂牌，如mvb
      Hard: { type: String }, // 硬件版本 如 L151-nb-rf(老一代版本标识) STM32L151xBA-NB-RF-GD25-RV2(目前版本标识)
      Soft: { type: String }, // 软件版本 如 1.115(老一代版本标识) 28:20.129(目前版本标识)
      Sim: { type: String }, // NB卡 sim卡号
      Imei: { type: String }, // NB模块IMEI号
      Nbvender: { type: String }, // NB模组厂牌 Lierda
      Nbmode: { type: String, alias: 'Model' }, // 联网模块型号 如 LSD4NBN-LB05000002 Hi12RM0-B5 老版本设备中是Model
      Nbcgd: { type: String }, // 具体不清楚 "IP,ctnb"
      Boot: { type: String }, // 本次重启方式和累计重启次数 a.b a表示重启方式 b表示重启次数 "1.3"
      Ver: { type: String }, // NB软件版本号 "B657SP5"
      Rmold: { type: String }, // 雷达硬件版本 软件版本见动态信息 "0"
    },
    { collection: 'MoteDevices' }
  );
const moteDevices = mongodb.db.model('MoteDevices', MoteDevices);

module.exports = moteDevices;




