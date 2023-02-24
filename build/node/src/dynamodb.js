"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateTable = exports.setTableTTL = exports.hasTable = exports.getTableARN = exports.getTable = exports.deleteTable = exports.createTable = void 0;

var DynamoDB = _interopRequireWildcard(require("@aws-sdk/client-dynamodb"));

var _helpers = require("./helpers.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AWS, createTable, deleteTable, getTable, getTableARN, hasTable, region, setTableTTL, updateTable;
exports.updateTable = updateTable;
exports.setTableTTL = setTableTTL;
exports.hasTable = hasTable;
exports.getTableARN = getTableARN;
exports.getTable = getTable;
exports.deleteTable = deleteTable;
exports.createTable = createTable;
AWS = {
  DynamoDB: (0, _helpers.lift)(DynamoDB)
};
region = "us-east-1";

exports.getTable = getTable = async function (name) {
  var Table, error;

  try {
    ({
      Table
    } = await AWS.DynamoDB.describeTable({
      TableName: name
    }));
    return Table;
  } catch (error1) {
    error = error1;

    if (/ResourceNotFoundException/.test(error.toString())) {
      return null;
    } else {
      throw error;
    }
  }
};

exports.hasTable = hasTable = async function (name) {
  if ((await getTable(name)) != null) {
    return true;
  } else {
    return false;
  }
};

exports.getTableARN = getTableARN = function (name) {
  return `arn:aws:dynamodb:${region}:*:table/${name}`;
};

exports.createTable = createTable = function (configuration) {
  return AWS.DynamoDB.createTable(configuration);
};

exports.updateTable = updateTable = function (configuration) {
  return AWS.DynamoDB.updateTable(configuration);
};

exports.deleteTable = deleteTable = async function (name) {
  if (await hasTable(name)) {
    return AWS.DynamoDB.deleteTable({
      TableName: name
    });
  }
};

exports.setTableTTL = setTableTTL = function (configuration) {
  return AWS.DynamoDB.updateTimeToLive(configuration);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9keW5hbW9kYi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7OztBQUFBLElBQUEsR0FBQSxFQUFBLFdBQUEsRUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxXQUFBOzs7Ozs7OztBQUdBLEdBQUEsR0FDRTtBQUFBLEVBQUEsUUFBQSxFQUFVLG1CQUFBLFFBQUE7QUFBVixDQURGO0FBR0EsTUFBQSxHQUFTLFdBQVQ7O0FBRUEsbUJBQUEsUUFBQSxHQUFXLGdCQUFBLElBQUEsRUFBQTtBQUNYLE1BQUEsS0FBQSxFQUFBLEtBQUE7O0FBQUUsTUFBQTtBQUNFLEtBQUE7QUFBQSxNQUFBO0FBQUEsUUFBWSxNQUFNLEdBQUcsQ0FBQyxRQUFKLENBQUEsYUFBQSxDQUEyQjtBQUFBLE1BQUEsU0FBQSxFQUFXO0FBQVgsS0FBM0IsQ0FBbEI7V0FERixLO0FBR0EsR0FIQSxDQUdBLE9BQUEsTUFBQSxFQUFBO0FBQU0sSUFBQSxLQUFBLEdBQUEsTUFBQTs7QUFDSixRQUFHLDRCQUFBLElBQUEsQ0FBaUMsS0FBSyxDQUF6QyxRQUFvQyxFQUFqQyxDQUFILEVBQUE7YUFBQSxJO0FBQUEsS0FBQSxNQUFBO0FBR0UsWUFIRixLQUdFO0FBSko7O0FBSlMsQ0FBWDs7QUFVQSxtQkFBQSxRQUFBLEdBQVcsZ0JBQUEsSUFBQSxFQUFBO0FBQ1QsTUFBRyxDQUFBLE1BQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFILElBQUEsRUFBQTtXQUFBLEk7QUFBQSxHQUFBLE1BQUE7V0FBQSxLOztBQURTLENBQVg7O0FBTUEsc0JBQUEsV0FBQSxHQUFjLFVBQUEsSUFBQSxFQUFBO0FBQ1osU0FBQSxvQkFBQSxNQUFBLFlBQUEsSUFBQSxFQUFBO0FBRFksQ0FBZDs7QUFHQSxzQkFBQSxXQUFBLEdBQWMsVUFBQSxhQUFBLEVBQUE7U0FDWixHQUFHLENBQUMsUUFBSixDQUFBLFdBQUEsQ0FBQSxhQUFBLEM7QUFEWSxDQUFkOztBQUdBLHNCQUFBLFdBQUEsR0FBYyxVQUFBLGFBQUEsRUFBQTtTQUNaLEdBQUcsQ0FBQyxRQUFKLENBQUEsV0FBQSxDQUFBLGFBQUEsQztBQURZLENBQWQ7O0FBR0Esc0JBQUEsV0FBQSxHQUFjLGdCQUFBLElBQUEsRUFBQTtBQUNaLE1BQUcsTUFBTSxRQUFBLENBQVQsSUFBUyxDQUFULEVBQUE7V0FDRSxHQUFHLENBQUMsUUFBSixDQUFBLFdBQUEsQ0FBeUI7QUFBQSxNQUFBLFNBQUEsRUFBVztBQUFYLEtBQXpCLEM7O0FBRlUsQ0FBZDs7QUFJQSxzQkFBQSxXQUFBLEdBQWMsVUFBQSxhQUFBLEVBQUE7U0FDWixHQUFHLENBQUMsUUFBSixDQUFBLGdCQUFBLENBQUEsYUFBQSxDO0FBRFksQ0FBZCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIER5bmFtb0RCIGZyb20gXCJAYXdzLXNkay9jbGllbnQtZHluYW1vZGJcIlxuaW1wb3J0IHsgbGlmdCwgcGFydGl0aW9uIH0gZnJvbSBcIi4vaGVscGVyc1wiXG5cbkFXUyA9XG4gIER5bmFtb0RCOiBsaWZ0IER5bmFtb0RCXG5cbnJlZ2lvbiA9IFwidXMtZWFzdC0xXCJcblxuZ2V0VGFibGUgPSAobmFtZSkgLT5cbiAgdHJ5XG4gICAgeyBUYWJsZSB9ID0gYXdhaXQgQVdTLkR5bmFtb0RCLmRlc2NyaWJlVGFibGUgVGFibGVOYW1lOiBuYW1lXG4gICAgVGFibGVcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiAvUmVzb3VyY2VOb3RGb3VuZEV4Y2VwdGlvbi8udGVzdCBlcnJvci50b1N0cmluZygpXG4gICAgICBudWxsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuaGFzVGFibGUgPSAobmFtZSkgLT5cbiAgaWYgKCBhd2FpdCBnZXRUYWJsZSBuYW1lICk/XG4gICAgdHJ1ZVxuICBlbHNlXG4gICAgZmFsc2VcblxuZ2V0VGFibGVBUk4gPSAobmFtZSkgLT5cbiAgXCJhcm46YXdzOmR5bmFtb2RiOiN7cmVnaW9ufToqOnRhYmxlLyN7bmFtZX1cIlxuXG5jcmVhdGVUYWJsZSA9IChjb25maWd1cmF0aW9uKSAtPlxuICBBV1MuRHluYW1vREIuY3JlYXRlVGFibGUgY29uZmlndXJhdGlvblxuXG51cGRhdGVUYWJsZSA9ICggY29uZmlndXJhdGlvbiApIC0+XG4gIEFXUy5EeW5hbW9EQi51cGRhdGVUYWJsZSBjb25maWd1cmF0aW9uXG5cbmRlbGV0ZVRhYmxlID0gKG5hbWUpIC0+XG4gIGlmIGF3YWl0IGhhc1RhYmxlIG5hbWVcbiAgICBBV1MuRHluYW1vREIuZGVsZXRlVGFibGUgVGFibGVOYW1lOiBuYW1lXG5cbnNldFRhYmxlVFRMID0gKCBjb25maWd1cmF0aW9uICkgLT5cbiAgQVdTLkR5bmFtb0RCLnVwZGF0ZVRpbWVUb0xpdmUgY29uZmlndXJhdGlvblxuXG5leHBvcnQge1xuICBnZXRUYWJsZVxuICBoYXNUYWJsZVxuICBnZXRUYWJsZUFSTlxuICBjcmVhdGVUYWJsZVxuICB1cGRhdGVUYWJsZVxuICBkZWxldGVUYWJsZVxuICBzZXRUYWJsZVRUTFxufSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/dynamodb.coffee