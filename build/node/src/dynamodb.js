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
//# sourceMappingURL=data:application/json;base64,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QSxJQUFILEVBQUE7V0FDRSxJQURGO0dBQUEsTUFBQTtXQUdFLEtBSEY7O0FBRFMsQ0FBQTtBQU1YLE9BQUEsQ0FBQSxXQUFBLEdBQUEsV0FBQSxHQUFjLFNBQUEsQ0FBQyxJQUFELEVBQUE7RUFDWixPQUFBLG9CQUFBLE1BQUEsWUFBQSxJQUFBLEVBQUE7QUFEWSxDQUFBO0FBR2QsT0FBQSxDQUFBLFdBQUEsR0FBQSxXQUFBLEdBQWMsU0FBQSxDQUFDLGFBQUQsRUFBQTtTQUNaLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBYixDQUF5QixhQUF6QixDQUFBO0FBRFksQ0FBQTtBQUdkLE9BQUEsQ0FBQSxXQUFBLEdBQUEsV0FBQSxHQUFjLFNBQUEsQ0FBRSxhQUFGLEVBQUE7U0FDWixHQUFHLENBQUMsUUFBUSxDQUFDLFdBQWIsQ0FBeUIsYUFBekIsQ0FBQTtBQURZLENBQUE7QUFHZCxPQUFBLENBQUEsV0FBQSxHQUFBLFdBQUEsR0FBYyxlQUFBLENBQUMsSUFBRCxFQUFBO0VBQ1osSUFBRyxNQUFNLFFBQUEsQ0FBUyxJQUFULENBQVQsRUFBQTtXQUNFLEdBQUcsQ0FBQyxRQUFRLENBQUMsV0FBYixDQUF5QjtNQUFBLFNBQUEsRUFBVztJQUFYLENBQXpCLENBREY7O0FBRFksQ0FBQTtBQUlkLE9BQUEsQ0FBQSxXQUFBLEdBQUEsV0FBQSxHQUFjLFNBQUEsQ0FBRSxhQUFGLEVBQUE7U0FDWixHQUFHLENBQUMsUUFBUSxDQUFDLGdCQUFiLENBQThCLGFBQTlCLENBQUE7QUFEWSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgRHluYW1vREIgZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1keW5hbW9kYlwiXG5pbXBvcnQgeyBsaWZ0LCBwYXJ0aXRpb24gfSBmcm9tIFwiLi9oZWxwZXJzXCJcblxuQVdTID1cbiAgRHluYW1vREI6IGxpZnQgRHluYW1vREJcblxucmVnaW9uID0gXCJ1cy1lYXN0LTFcIlxuXG5nZXRUYWJsZSA9IChuYW1lKSAtPlxuICB0cnlcbiAgICB7IFRhYmxlIH0gPSBhd2FpdCBBV1MuRHluYW1vREIuZGVzY3JpYmVUYWJsZSBUYWJsZU5hbWU6IG5hbWVcbiAgICBUYWJsZVxuICBjYXRjaCBlcnJvclxuICAgIGlmIC9SZXNvdXJjZU5vdEZvdW5kRXhjZXB0aW9uLy50ZXN0IGVycm9yLnRvU3RyaW5nKClcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBlcnJvclxuXG5oYXNUYWJsZSA9IChuYW1lKSAtPlxuICBpZiAoIGF3YWl0IGdldFRhYmxlIG5hbWUgKT9cbiAgICB0cnVlXG4gIGVsc2VcbiAgICBmYWxzZVxuXG5nZXRUYWJsZUFSTiA9IChuYW1lKSAtPlxuICBcImFybjphd3M6ZHluYW1vZGI6I3tyZWdpb259Oio6dGFibGUvI3tuYW1lfVwiXG5cbmNyZWF0ZVRhYmxlID0gKGNvbmZpZ3VyYXRpb24pIC0+XG4gIEFXUy5EeW5hbW9EQi5jcmVhdGVUYWJsZSBjb25maWd1cmF0aW9uXG5cbnVwZGF0ZVRhYmxlID0gKCBjb25maWd1cmF0aW9uICkgLT5cbiAgQVdTLkR5bmFtb0RCLnVwZGF0ZVRhYmxlIGNvbmZpZ3VyYXRpb25cblxuZGVsZXRlVGFibGUgPSAobmFtZSkgLT5cbiAgaWYgYXdhaXQgaGFzVGFibGUgbmFtZVxuICAgIEFXUy5EeW5hbW9EQi5kZWxldGVUYWJsZSBUYWJsZU5hbWU6IG5hbWVcblxuc2V0VGFibGVUVEwgPSAoIGNvbmZpZ3VyYXRpb24gKSAtPlxuICBBV1MuRHluYW1vREIudXBkYXRlVGltZVRvTGl2ZSBjb25maWd1cmF0aW9uXG5cbmV4cG9ydCB7XG4gIGdldFRhYmxlXG4gIGhhc1RhYmxlXG4gIGdldFRhYmxlQVJOXG4gIGNyZWF0ZVRhYmxlXG4gIHVwZGF0ZVRhYmxlXG4gIGRlbGV0ZVRhYmxlXG4gIHNldFRhYmxlVFRMXG59Il0sInNvdXJjZVJvb3QiOiIifQ==
//# sourceURL=src/dynamodb.coffee