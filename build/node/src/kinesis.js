"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.putStream = exports.listConsumers = exports.hasStream = exports.getStreamARN = exports.getStream = exports.deleteStream = exports.addRecord = void 0;

var Kinesis = _interopRequireWildcard(require("@aws-sdk/client-kinesis"));

var STS = _interopRequireWildcard(require("@aws-sdk/client-sts"));

var _helpers = require("./helpers.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AWS, addRecord, cache, deleteStream, getStream, getStreamARN, hasStream, listConsumers, putStream, region;
exports.putStream = putStream;
exports.listConsumers = listConsumers;
exports.hasStream = hasStream;
exports.getStreamARN = getStreamARN;
exports.getStream = getStream;
exports.deleteStream = deleteStream;
exports.addRecord = addRecord;
cache = {
  account: null
};
AWS = {
  Kinesis: (0, _helpers.lift)(Kinesis),
  STS: (0, _helpers.lift)(STS)
};
region = "us-east-1";

exports.getStreamARN = getStreamARN = async function (stream) {
  var account;
  account = await async function () {
    return cache.account != null ? cache.account : cache.account = (await AWS.STS.getCallerIdentity()).Account;
  }();
  return `arn:aws:kinesis:${region}:${account}:stream/${stream}`;
};

exports.getStream = getStream = async function (stream) {
  var _, error;

  try {
    ({
      StreamDescriptionSummary: _
    } = await AWS.Kinesis.describeStreamSummary({
      StreamName: stream
    }));
    return {
      _: _,
      arn: _.StreamARN,
      status: _.StreamStatus
    };
  } catch (error1) {
    error = error1;

    if (/ResourceNotFoundException/.test(error.toString())) {
      return void 0;
    } else {
      throw error;
    }
  }
};

exports.hasStream = hasStream = async function (stream) {
  if ((await getStream(stream)) != null) {
    return true;
  } else {
    return false;
  }
};

exports.putStream = putStream = async function (stream) {
  if (!(await hasStream(stream))) {
    return await AWS.Kinesis.createStream({
      StreamName: stream,
      StreamModeDetails: {
        StreamMode: "ON_DEMAND"
      }
    });
  }
};

exports.deleteStream = deleteStream = async function (stream) {
  if (await hasStream(stream)) {
    return await AWS.Kinesis.deleteStream({
      StreamName: stream
    });
  }
};

exports.addRecord = addRecord = async function ({
  stream,
  partition,
  data
}) {
  return await AWS.Kinesis.putRecord({
    StreamName: stream,
    PartitionKey: partition,
    Data: Buffer.from(JSON.stringify(data), "utf8")
  });
};

exports.listConsumers = listConsumers = async function (stream) {
  var Consumers, NextToken, next, results;
  results = [];
  next = void 0;

  while (true) {
    ({
      Consumers,
      NextToken
    } = await AWS.Kinesis.listStreamConsumers({
      StreamARN: stream.arn,
      NextToken: next
    }));
    next = NextToken;
    results.push(...Consumers);

    if (next == null) {
      return results;
    }
  }
};
//# sourceMappingURL=data:application/json;base64,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QSxJQUFBLEVBQU0sTUFBTSxDQUFOLElBQUEsQ0FBYyxJQUFJLENBQUosU0FBQSxDQUFkLElBQWMsQ0FBZCxFQUFBLE1BQUE7QUFGTixHQURJLENBQU47QUFEVSxDQUFaOztBQU1BLHdCQUFBLGFBQUEsR0FBZ0IsZ0JBQUEsTUFBQSxFQUFBO0FBQ2hCLE1BQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTtBQUFFLEVBQUEsT0FBQSxHQUFVLEVBQVY7QUFDQSxFQUFBLElBQUEsR0FBTyxLQUFBLENBQVA7O0FBQ0EsU0FBQSxJQUFBLEVBQUE7QUFDRSxLQUFBO0FBQUEsTUFBQSxTQUFBO0FBQUEsTUFBQTtBQUFBLFFBQTJCLE1BQU0sR0FBRyxDQUFDLE9BQUosQ0FBQSxtQkFBQSxDQUMvQjtBQUFBLE1BQUEsU0FBQSxFQUFXLE1BQU0sQ0FBakIsR0FBQTtBQUNBLE1BQUEsU0FBQSxFQUFXO0FBRFgsS0FEK0IsQ0FBakM7QUFJQSxJQUFBLElBQUEsR0FBTyxTQUFQO0FBQ0EsSUFBQSxPQUFPLENBQVAsSUFBQSxDQUFhLEdBQWIsU0FBQTs7QUFDQSxRQUFJLElBQUEsSUFBSixJQUFBLEVBQUE7QUFDRSxhQURGLE9BQ0U7O0FBUko7QUFIYyxDQUFoQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEtpbmVzaXMgZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1raW5lc2lzXCJcbmltcG9ydCAqIGFzIFNUUyBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXN0c1wiXG5pbXBvcnQgeyBsaWZ0LCBwYXJ0aXRpb24gfSBmcm9tIFwiLi9oZWxwZXJzXCJcblxuY2FjaGUgPVxuICBhY2NvdW50OiBudWxsXG5cbkFXUyA9XG4gIEtpbmVzaXM6IGxpZnQgS2luZXNpc1xuICBTVFM6IGxpZnQgU1RTXG5cbnJlZ2lvbiA9IFwidXMtZWFzdC0xXCJcblxuZ2V0U3RyZWFtQVJOID0gKHN0cmVhbSkgLT5cbiAgYWNjb3VudCA9IGF3YWl0IGRvIC0+XG4gICAgY2FjaGUuYWNjb3VudCA/PSAoIGF3YWl0IEFXUy5TVFMuZ2V0Q2FsbGVySWRlbnRpdHkoKSApLkFjY291bnRcbiAgXCJhcm46YXdzOmtpbmVzaXM6I3tyZWdpb259OiN7YWNjb3VudH06c3RyZWFtLyN7c3RyZWFtfVwiXG5cbmdldFN0cmVhbSA9IChzdHJlYW0pIC0+XG4gIHRyeVxuICAgIHsgU3RyZWFtRGVzY3JpcHRpb25TdW1tYXJ5OiBfIH0gPSBcbiAgICAgIGF3YWl0IEFXUy5LaW5lc2lzLmRlc2NyaWJlU3RyZWFtU3VtbWFyeSBTdHJlYW1OYW1lOiBzdHJlYW1cbiAgICBfOiBfXG4gICAgYXJuOiBfLlN0cmVhbUFSTlxuICAgIHN0YXR1czogXy5TdHJlYW1TdGF0dXNcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiAvUmVzb3VyY2VOb3RGb3VuZEV4Y2VwdGlvbi8udGVzdCBlcnJvci50b1N0cmluZygpXG4gICAgICB1bmRlZmluZWRcbiAgICBlbHNlXG4gICAgICB0aHJvdyBlcnJvclxuXG5oYXNTdHJlYW0gPSAoc3RyZWFtKSAtPlxuICBpZiAoIGF3YWl0IGdldFN0cmVhbSBzdHJlYW0gKT9cbiAgICB0cnVlXG4gIGVsc2VcbiAgICBmYWxzZVxuXG5wdXRTdHJlYW0gPSAoc3RyZWFtKSAtPlxuICBpZiAhKCBhd2FpdCBoYXNTdHJlYW0gc3RyZWFtIClcbiAgICBhd2FpdCBBV1MuS2luZXNpcy5jcmVhdGVTdHJlYW0gXG4gICAgICBTdHJlYW1OYW1lOiBzdHJlYW1cbiAgICAgIFN0cmVhbU1vZGVEZXRhaWxzOiBcbiAgICAgICAgU3RyZWFtTW9kZTogXCJPTl9ERU1BTkRcIlxuXG5kZWxldGVTdHJlYW0gPSAoc3RyZWFtKSAtPlxuICBpZiBhd2FpdCBoYXNTdHJlYW0gc3RyZWFtXG4gICAgYXdhaXQgQVdTLktpbmVzaXMuZGVsZXRlU3RyZWFtIFN0cmVhbU5hbWU6IHN0cmVhbVxuXG5hZGRSZWNvcmQgPSAoeyBzdHJlYW0sIHBhcnRpdGlvbiwgZGF0YSB9KSAtPlxuICBhd2FpdCBBV1MuS2luZXNpcy5wdXRSZWNvcmQgXG4gICAgU3RyZWFtTmFtZTogc3RyZWFtXG4gICAgUGFydGl0aW9uS2V5OiBwYXJ0aXRpb25cbiAgICBEYXRhOiBCdWZmZXIuZnJvbSAoIEpTT04uc3RyaW5naWZ5IGRhdGEgKSwgXCJ1dGY4XCJcblxubGlzdENvbnN1bWVycyA9IChzdHJlYW0pIC0+XG4gIHJlc3VsdHMgPSBbXVxuICBuZXh0ID0gdW5kZWZpbmVkXG4gIHdoaWxlIHRydWVcbiAgICB7IENvbnN1bWVycywgTmV4dFRva2VuIH0gPSBhd2FpdCBBV1MuS2luZXNpcy5saXN0U3RyZWFtQ29uc3VtZXJzXG4gICAgICBTdHJlYW1BUk46IHN0cmVhbS5hcm5cbiAgICAgIE5leHRUb2tlbjogbmV4dFxuXG4gICAgbmV4dCA9IE5leHRUb2tlblxuICAgIHJlc3VsdHMucHVzaCBDb25zdW1lcnMuLi5cbiAgICBpZiAhbmV4dD9cbiAgICAgIHJldHVybiByZXN1bHRzXG5cbmV4cG9ydCB7XG4gIGdldFN0cmVhbUFSTlxuICBnZXRTdHJlYW1cbiAgaGFzU3RyZWFtXG4gIHB1dFN0cmVhbVxuICBkZWxldGVTdHJlYW1cbiAgYWRkUmVjb3JkXG4gIGxpc3RDb25zdW1lcnNcbn0iXSwic291cmNlUm9vdCI6IiJ9
//# sourceURL=src/kinesis.coffee