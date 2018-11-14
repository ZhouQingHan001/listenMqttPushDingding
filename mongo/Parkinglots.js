/* jshint esversion: 6 */

const mongodb = require('./_mongodb');
const Schema = require('mongoose').Schema;

const Parkinglots = new Schema(
  {
    "ParkinglotName": { type: String, required: true, index: { unique: true }, },
    "ParkinglotId": { type: String, required: true, index: { unique: true } },
    "Owner": [{
      "OwnerName": { type: String },
      "OwnerId": { type: String },
    }],
    "OwnerPhoneNumber": { type: String, default: '0571-83031258（默认）' },
    "ParkinglotAddress": { type: String, default: '浙江省杭州市下沙江干区高新技术孵化园' },
    "ParkinglotType": { type: String, default: '室内停车场' },
    "GeographicCoordinate": {
      "Longitude": { type: Number, default: 120.372031 },
      "Latitude": { type: Number, default: 30.303537 },
    },
    "FeeStandard": {type: String},
  },
  { collection: 'Parkinglots' }
);

const parkinglots = mongodb.db.model('Parkinglots', Parkinglots);

module.exports = parkinglots;

