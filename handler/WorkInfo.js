const { dingding_Accumulate } = require("../dingding/robots");
let Buffer_nbRunTime = [];

const nbRuntTme = (SN, Nbruntime) => {
  let result = Buffer_nbRunTime.find(a => {
    if (a.SN == SN) {
      return a;
    }
  });
  if (result == undefined || result.Nbruntime == undefined) {
    Buffer_nbRunTime.push({
      SN: SN,
      NbruntimeOneDay: null,
      Nbruntime: Nbruntime
    });
  } else {
    result.NbruntimeOneDay = Nbruntime - result.Nbruntime;
    result.Nbruntime = Nbruntime;
  }
};
const reportNbRuntTme = () => {
  let ltOneHundred = 0;
  let OneHundred = 0;
  let TwoHundred = 0;
  let ThreeHundred = 0;
  let FourHundred = 0;
  let FiveHundred = 0;
  let gtOneThousand = 0;
  const actions = [];
  Buffer_nbRunTime.map(item => {
    let action = () => {
      return new Promise(resolve => {
        if (item.NbruntimeOneDay > 0 && item.NbruntimeOneDay <= 100) {
          ltOneHundred = ltOneHundred + 1;
        } else if (item.NbruntimeOneDay > 100 && item.NbruntimeOneDay <= 200) {
          OneHundred = OneHundred + 1;
        } else if (item.NbruntimeOneDay > 200 && item.NbruntimeOneDay <= 300) {
          TwoHundred = TwoHundred + 1;
        } else if (item.NbruntimeOneDay > 300 && item.NbruntimeOneDay <= 400) {
          ThreeHundred = ThreeHundred + 1;
        } else if (item.NbruntimeOneDay > 400 && item.NbruntimeOneDay <= 500) {
          FourHundred = FourHundred + 1;
        } else if (item.NbruntimeOneDay > 500 && item.NbruntimeOneDay <= 1000) {
          FiveHundred = FiveHundred + 1;
        } else if (item.NbruntimeOneDay > 1000) {
          gtOneThousand = gtOneThousand + 1;
        }
        resolve();
      });
    };
    actions.push(action());
  });
  Promise.all(actions).then(() => {
    let content = `今日Nbruntime统计如下 \r\n 0 < nbRunTime < 100 === ${ltOneHundred}\r\n100 < nbRunTime < 200 === ${OneHundred}\r\n200 < nbRunTime < 300 === ${TwoHundred}\r\n300 < nbRunTime < 400 === ${ThreeHundred}\r\n400 < nbRunTime < 500 === ${FourHundred}\r\n500 < nbRunTime < 1000 === ${FiveHundred}\r\n nbRunTime > 1000 === ${gtOneThousand}`;
    dingding_Accumulate(content);
  });
};
const handleWorkInfo = data => {
  const { SN, TOPIC, WorkInfo } = data;
  const { Nbruntime } = WorkInfo;
  if (Nbruntime) nbRuntTme(SN, Nbruntime);
};

module.exports = {
  handleWorkInfo,
  reportNbRuntTme
};
