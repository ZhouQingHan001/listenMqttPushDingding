/* jshint esversion: 6 */

const mongodb = require('./_mongodb');
const Schema = require('mongoose').Schema;

const MoteDevicesWrongHistory = new Schema(
  {
    "SN": { type: String, required: true, index: { unique: false } },
    "Time": { type: Date, index: { unique: false } },
    "ErrorType": { type: String },//错误类型
    "Owner": { type: String ,index: { unique: false }},
    "Parkinglot": {
      "ParkinglotName": { type: String, index: { unique: false } },
      "ParkinglotId": { type: String, index: { unique: false } },
    },
    "ErrorCount": { type: Number },
    "Data": { type: Object },
  },
  { collection: 'MoteDevicesWrongHistory' }
);

module.exports = mongodb.db.model('MoteDevicesWrongHistory', MoteDevicesWrongHistory);
