/* jshint esversion: 6 */

const mongodb = require('./_mongodb');
const Schema = require('mongoose').Schema;

const EnterpriseUsers = new Schema(
  {
    "EnterpriseUserName": { type: String, required: true, index: { unique: true },  trim: true,  },
    "EnterpriseUserId": { type: String, required: true, index: { unique: true },  trim: true,  },
    "Password": { type: String, required: true, trim: true, },
    "Roles": { type: [String], },
    "CallbackUrl": { type: String, trim: true, },
    "MqttTopic": { type: String, trim: true, },
    "PhoneNumber": { type: String },
    "Email": { type: String },
    "CreateTime": { type: Date },
    "ParentUser": [{
      "ParentUserName": { type: String, required: true, trim: true, },
      "ParentUserId": { type: String, required: true, trim: true, }
    }],
  },
  { collection: 'EnterpriseUsers' }
);

const enterpriseUsers = mongodb.db.model('EnterpriseUsers', EnterpriseUsers);

module.exports = enterpriseUsers;

