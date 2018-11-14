/* jshint esversion: 6 */

const mongodb = require('./_mongodb');
const Schema = require('mongoose').Schema;

const Parkingspaces = new Schema(
  {
    "ParkingspaceId": { type: String, required: true, index: { unique: true } },
    "MoteDeviceId": { type: String, index: { unique: true } },
    "DeviceId": { type: String },
    "Imei": { type: String , index: { unique: true }},
    "GeographicCoordinate": {
      "Longitude": { type: Number, default: 120.372031 },
      "Latitude": { type: Number, default: 30.303537 },
    },
    "Parkinglot": {
      "ParkinglotName": { type: String, required: true, index: { unique: false } },
      "ParkinglotId": { type: String, required: true, index: { unique: false } },
    },
  },
  { collection: 'Parkingspaces' }
);

const parkingspaces = mongodb.db.model('Parkingspaces', Parkingspaces);

module.exports = parkingspaces;

