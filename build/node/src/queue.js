"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.putQueue = exports.pushMessage = exports.popMessages = exports.getQueueURL = exports.getQueueARN = exports.emptyQueue = exports.deleteQueue = exports.createQueue = exports._createQueue = void 0;
var SQS = _interopRequireWildcard(require("@aws-sdk/client-sqs"));
var STS = _interopRequireWildcard(require("@aws-sdk/client-sts"));
var Obj = _interopRequireWildcard(require("@dashkite/joy/object"));
var Type = _interopRequireWildcard(require("@dashkite/joy/type"));
var _helpers = require("./helpers.js");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var AWS, _createQueue, _deleteMessage, _deleteMessages, _receieveMessages, cache, createQueue, createStepFunction, deleteQueue, emptyQueue, getQueueARN, getQueueURL, popMessages, pushMessage, putQueue, region;
exports.putQueue = putQueue;
exports.pushMessage = pushMessage;
exports.popMessages = popMessages;
exports.getQueueURL = getQueueURL;
exports.getQueueARN = getQueueARN;
exports.emptyQueue = emptyQueue;
exports.deleteQueue = deleteQueue;
exports.createQueue = createQueue;
exports._createQueue = _createQueue;
createStepFunction = function ({
  name,
  dictionary,
  resources,
  description
}) {};
cache = {
  account: null
};
AWS = {
  SQS: (0, _helpers.lift)(SQS),
  STS: (0, _helpers.lift)(STS)
};
region = "us-east-1";
exports.getQueueARN = getQueueARN = async function (name) {
  var account;
  account = await async function () {
    return cache.account != null ? cache.account : cache.account = (await AWS.STS.getCallerIdentity()).Account;
  }();
  return `arn:aws:sqs:${region}:${account}:${name}.fifo`;
};
exports._createQueue = _createQueue = function (name, options) {
  return AWS.SQS.createQueue({
    QueueName: name,
    Attributes: options
  });
};

// Dolores will be opinionated and always assume a FIFO queue.
exports.createQueue = createQueue = function (name, options = {}) {
  var defaults;
  name = `${name}.fifo`;
  defaults = {
    FifoQueue: true,
    ReceiveMessageWaitTimeSeconds: 20,
    ContentBasedDeduplication: true
  };
  return _createQueue(name, Obj.merge(defaults, options));
};

// Dolores will be opinionated and always assume a FIFO queue.
exports.getQueueURL = getQueueURL = async function (name) {
  var QueueUrl, error;
  name = `${name}.fifo`;
  try {
    ({
      QueueUrl
    } = await AWS.SQS.getQueueUrl({
      QueueName: name
    }));
    return QueueUrl;
  } catch (error1) {
    error = error1;
    if (/AWS\.SimpleQueueService\.NonExistentQueue/.test(error.toString())) {
      return null;
    } else {
      throw error;
    }
  }
};

// For now, this will be idempotent. Some aspects of queues cannot be updated
//   and require a delete-create cycle (~60s) to perform an effective update.
exports.putQueue = putQueue = async function (name, options) {
  if ((await getQueueURL(name)) == null) {
    return await createQueue(name, options);
  }
};

// AWS indicates this can take 60 seconds to complete.
exports.emptyQueue = emptyQueue = async function (name) {
  var url;
  if ((url = await getQueueURL(name)) != null) {
    return await AWS.SQS.purgeQueue({
      QueueUrl: url
    });
  }
};

// AWS indicates this can take 60 seconds to complete.
exports.deleteQueue = deleteQueue = async function (name) {
  var url;
  if ((url = await getQueueURL(name)) != null) {
    return await AWS.SQS.deleteQueue({
      QueueUrl: url
    });
  }
};
exports.pushMessage = pushMessage = async function (name, message, options) {
  var defaults, url;
  if (!Type.isString(message) || message.length === 0) {
    throw new Error("dolores:queue: message must be a string with minimum length 1.");
  }
  defaults = {
    MessageGroupId: "DefaultMessageGroupID"
  };
  if ((url = await getQueueURL(name)) != null) {
    return await AWS.SQS.sendMessage(Obj.merge(defaults, options, {
      MessageBody: message,
      QueueUrl: url
    }));
  } else {
    throw new Error(`dolores:queue: the queue ${name} is not available`);
  }
};
_receieveMessages = async function (url, options) {
  var Messages, defaults;
  defaults = {
    AttributeNames: ["All"],
    MessageAttributeNames: ["All"]
  };
  ({
    Messages
  } = await AWS.SQS.receiveMessage(Obj.merge(defaults, options, {
    QueueUrl: url
  })));
  return Messages;
};
_deleteMessage = function (url, handle) {
  return AWS.SQS.deleteMessage({
    QueueUrl: url,
    ReceiptHandle: handle
  });
};
_deleteMessages = function (url, handles) {
  return AWS.SQS.deleteMessageBatch({
    QueueUrl: url,
    Entries: function () {
      var handle, i, index, len, results;
      results = [];
      for (index = i = 0, len = handles.length; i < len; index = ++i) {
        handle = handles[index];
        results.push({
          Id: `${index}`,
          ReceiptHandle: handle
        });
      }
      return results;
    }()
  });
};
exports.popMessages = popMessages = async function (name, options) {
  var Body, ReceiptHandle, _messages, handles, i, len, messages, url;
  if ((url = await getQueueURL(name)) != null) {
    _messages = await _receieveMessages(url, options);
    if (_messages == null) {
      _messages = [];
    }
    handles = [];
    messages = [];
    for (i = 0, len = _messages.length; i < len; i++) {
      ({
        ReceiptHandle,
        Body
      } = _messages[i]);
      handles.push(ReceiptHandle);
      messages.push(Body);
    }
    if (handles.length > 0) {
      await _deleteMessages(url, handles);
    }
    return messages;
  } else {
    throw new Error(`dolores:queue: the queue ${name} is not available`);
  }
};
//# sourceMappingURL=data:application/json;base64,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LEdBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtNQUNGLE9BQU8sQ0FBQyxJQUFSLENBQWEsYUFBYixDQUFBO01BQ0EsUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLENBQUE7SUFGRjtJQUlBLElBQUcsT0FBTyxDQUFDLE1BQVIsR0FBaUIsQ0FBcEIsRUFBQTtNQUNFLE1BQU0sZUFBQSxDQUFnQixHQUFoQixFQUFxQixPQUFyQixDQURSOztXQUdBLFFBYkY7R0FBQSxNQUFBO0lBZ0JFLE1BQU0sSUFBSSxLQUFKLENBQVUsNEJBQUEsSUFBQSxtQkFBVixDQWhCUjs7QUFEWSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgU1FTIGZyb20gXCJAYXdzLXNkay9jbGllbnQtc3FzXCJcbmltcG9ydCAqIGFzIFNUUyBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXN0c1wiXG5pbXBvcnQgKiBhcyBPYmogZnJvbSBcIkBkYXNoa2l0ZS9qb3kvb2JqZWN0XCJcbmltcG9ydCAqIGFzIFR5cGUgZnJvbSBcIkBkYXNoa2l0ZS9qb3kvdHlwZVwiXG5pbXBvcnQgeyBsaWZ0IH0gZnJvbSBcIi4vaGVscGVyc1wiXG5cbmNyZWF0ZVN0ZXBGdW5jdGlvbiA9ICh7IG5hbWUsIGRpY3Rpb25hcnksIHJlc291cmNlcywgZGVzY3JpcHRpb24gfSkgLT5cblxuY2FjaGUgPVxuICBhY2NvdW50OiBudWxsXG5cbkFXUyA9XG4gIFNRUzogbGlmdCBTUVNcbiAgU1RTOiBsaWZ0IFNUU1xuXG5yZWdpb24gPSBcInVzLWVhc3QtMVwiXG5cbmdldFF1ZXVlQVJOID0gKG5hbWUpIC0+XG4gIGFjY291bnQgPSBhd2FpdCBkbyAtPlxuICAgIGNhY2hlLmFjY291bnQgPz0gKCBhd2FpdCBBV1MuU1RTLmdldENhbGxlcklkZW50aXR5KCkgKS5BY2NvdW50XG4gIFwiYXJuOmF3czpzcXM6I3tyZWdpb259OiN7YWNjb3VudH06I3tuYW1lfS5maWZvXCJcblxuX2NyZWF0ZVF1ZXVlID0gKG5hbWUsIG9wdGlvbnMpIC0+XG4gIEFXUy5TUVMuY3JlYXRlUXVldWVcbiAgICBRdWV1ZU5hbWU6IG5hbWVcbiAgICBBdHRyaWJ1dGVzOiBvcHRpb25zXG5cbiMgRG9sb3JlcyB3aWxsIGJlIG9waW5pb25hdGVkIGFuZCBhbHdheXMgYXNzdW1lIGEgRklGTyBxdWV1ZS5cbmNyZWF0ZVF1ZXVlID0gKG5hbWUsIG9wdGlvbnMgPSB7fSkgLT5cbiAgbmFtZSA9IFwiI3tuYW1lfS5maWZvXCJcbiAgZGVmYXVsdHMgPSBcbiAgICBGaWZvUXVldWU6IHRydWVcbiAgICBSZWNlaXZlTWVzc2FnZVdhaXRUaW1lU2Vjb25kczogMjBcbiAgICBDb250ZW50QmFzZWREZWR1cGxpY2F0aW9uOiB0cnVlXG5cbiAgX2NyZWF0ZVF1ZXVlIG5hbWUsIE9iai5tZXJnZSBkZWZhdWx0cywgb3B0aW9uc1xuXG4jIERvbG9yZXMgd2lsbCBiZSBvcGluaW9uYXRlZCBhbmQgYWx3YXlzIGFzc3VtZSBhIEZJRk8gcXVldWUuXG5nZXRRdWV1ZVVSTCA9IChuYW1lKSAtPlxuICBuYW1lID0gXCIje25hbWV9LmZpZm9cIlxuICB0cnlcbiAgICB7IFF1ZXVlVXJsIH0gPSBhd2FpdCBBV1MuU1FTLmdldFF1ZXVlVXJsIFF1ZXVlTmFtZTogbmFtZVxuICAgIFF1ZXVlVXJsXG4gIGNhdGNoIGVycm9yXG4gICAgaWYgL0FXU1xcLlNpbXBsZVF1ZXVlU2VydmljZVxcLk5vbkV4aXN0ZW50UXVldWUvLnRlc3QgZXJyb3IudG9TdHJpbmcoKVxuICAgICAgbnVsbFxuICAgIGVsc2VcbiAgICAgIHRocm93IGVycm9yXG5cbiMgRm9yIG5vdywgdGhpcyB3aWxsIGJlIGlkZW1wb3RlbnQuIFNvbWUgYXNwZWN0cyBvZiBxdWV1ZXMgY2Fubm90IGJlIHVwZGF0ZWRcbiMgICBhbmQgcmVxdWlyZSBhIGRlbGV0ZS1jcmVhdGUgY3ljbGUgKH42MHMpIHRvIHBlcmZvcm0gYW4gZWZmZWN0aXZlIHVwZGF0ZS5cbnB1dFF1ZXVlID0gKG5hbWUsIG9wdGlvbnMpIC0+XG4gIGlmICEoIGF3YWl0IGdldFF1ZXVlVVJMIG5hbWUgKT9cbiAgICBhd2FpdCBjcmVhdGVRdWV1ZSBuYW1lLCBvcHRpb25zXG5cbiMgQVdTIGluZGljYXRlcyB0aGlzIGNhbiB0YWtlIDYwIHNlY29uZHMgdG8gY29tcGxldGUuXG5lbXB0eVF1ZXVlID0gKG5hbWUpIC0+XG4gIGlmICggdXJsID0gYXdhaXQgZ2V0UXVldWVVUkwgbmFtZSApP1xuICAgIGF3YWl0IEFXUy5TUVMucHVyZ2VRdWV1ZSBRdWV1ZVVybDogdXJsXG5cbiMgQVdTIGluZGljYXRlcyB0aGlzIGNhbiB0YWtlIDYwIHNlY29uZHMgdG8gY29tcGxldGUuXG5kZWxldGVRdWV1ZSA9IChuYW1lKSAtPlxuICBpZiAoIHVybCA9IGF3YWl0IGdldFF1ZXVlVVJMIG5hbWUgKT9cbiAgICBhd2FpdCBBV1MuU1FTLmRlbGV0ZVF1ZXVlIFF1ZXVlVXJsOiB1cmxcblxucHVzaE1lc3NhZ2UgPSAobmFtZSwgbWVzc2FnZSwgb3B0aW9ucykgLT5cbiAgaWYgIShUeXBlLmlzU3RyaW5nIG1lc3NhZ2UpIHx8ICggbWVzc2FnZS5sZW5ndGggPT0gMCApXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiZG9sb3JlczpxdWV1ZTogbWVzc2FnZSBtdXN0IGJlIGEgc3RyaW5nIHdpdGhcbiAgICAgIG1pbmltdW0gbGVuZ3RoIDEuXCJcblxuICBkZWZhdWx0cyA9XG4gICAgTWVzc2FnZUdyb3VwSWQ6IFwiRGVmYXVsdE1lc3NhZ2VHcm91cElEXCJcblxuICBpZiAoIHVybCA9IGF3YWl0IGdldFF1ZXVlVVJMIG5hbWUgKT9cbiAgICBhd2FpdCBBV1MuU1FTLnNlbmRNZXNzYWdlIE9iai5tZXJnZSBkZWZhdWx0cywgb3B0aW9ucyxcbiAgICAgIE1lc3NhZ2VCb2R5OiBtZXNzYWdlXG4gICAgICBRdWV1ZVVybDogdXJsXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJkb2xvcmVzOnF1ZXVlOiB0aGUgcXVldWUgI3tuYW1lfSBpcyBub3QgYXZhaWxhYmxlXCJcblxuX3JlY2VpZXZlTWVzc2FnZXMgPSAodXJsLCBvcHRpb25zKSAtPlxuICBkZWZhdWx0cyA9IFxuICAgIEF0dHJpYnV0ZU5hbWVzOiBbIFwiQWxsXCIgXVxuICAgIE1lc3NhZ2VBdHRyaWJ1dGVOYW1lczogWyBcIkFsbFwiIF1cblxuICB7IE1lc3NhZ2VzIH0gPSBhd2FpdCBBV1MuU1FTLnJlY2VpdmVNZXNzYWdlIE9iai5tZXJnZSBkZWZhdWx0cywgb3B0aW9ucyxcbiAgICBRdWV1ZVVybDogdXJsXG5cbiAgTWVzc2FnZXNcblxuX2RlbGV0ZU1lc3NhZ2UgPSAodXJsLCBoYW5kbGUpIC0+XG4gIEFXUy5TUVMuZGVsZXRlTWVzc2FnZVxuICAgIFF1ZXVlVXJsOiB1cmxcbiAgICBSZWNlaXB0SGFuZGxlOiBoYW5kbGVcblxuX2RlbGV0ZU1lc3NhZ2VzID0gKHVybCwgaGFuZGxlcykgLT5cbiAgQVdTLlNRUy5kZWxldGVNZXNzYWdlQmF0Y2hcbiAgICBRdWV1ZVVybDogdXJsXG4gICAgRW50cmllczogZG8gLT5cbiAgICAgIGZvciBoYW5kbGUsIGluZGV4IGluIGhhbmRsZXNcbiAgICAgICAgSWQ6IFwiI3tpbmRleH1cIlxuICAgICAgICBSZWNlaXB0SGFuZGxlOiBoYW5kbGVcblxucG9wTWVzc2FnZXMgPSAobmFtZSwgb3B0aW9ucykgLT5cbiAgaWYgKCB1cmwgPSBhd2FpdCBnZXRRdWV1ZVVSTCBuYW1lICk/XG4gICAgX21lc3NhZ2VzID0gYXdhaXQgX3JlY2VpZXZlTWVzc2FnZXMgdXJsLCBvcHRpb25zXG4gICAgX21lc3NhZ2VzID89IFtdXG4gICAgaGFuZGxlcyA9IFtdXG4gICAgbWVzc2FnZXMgPSBbXVxuICAgIFxuICAgIGZvciB7IFJlY2VpcHRIYW5kbGUsIEJvZHkgfSBpbiBfbWVzc2FnZXNcbiAgICAgIGhhbmRsZXMucHVzaCBSZWNlaXB0SGFuZGxlXG4gICAgICBtZXNzYWdlcy5wdXNoIEJvZHlcbiAgICBcbiAgICBpZiBoYW5kbGVzLmxlbmd0aCA+IDBcbiAgICAgIGF3YWl0IF9kZWxldGVNZXNzYWdlcyB1cmwsIGhhbmRsZXNcbiAgICBcbiAgICBtZXNzYWdlc1xuXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJkb2xvcmVzOnF1ZXVlOiB0aGUgcXVldWUgI3tuYW1lfSBpcyBub3QgYXZhaWxhYmxlXCJcblxuIyBUT0RPOiBoYW5kbGUgdGhlIGJhdGNoIHZlcnNpb25zIG9mIHRoZXNlIG9wZXJhdGlvbnMuLi5cblxuZXhwb3J0IHtcbiAgX2NyZWF0ZVF1ZXVlXG4gIGdldFF1ZXVlQVJOXG4gIGNyZWF0ZVF1ZXVlXG4gIGdldFF1ZXVlVVJMXG4gIHB1dFF1ZXVlXG4gIGVtcHR5UXVldWVcbiAgZGVsZXRlUXVldWVcbiAgcHVzaE1lc3NhZ2VcbiAgcG9wTWVzc2FnZXNcbn0iXSwic291cmNlUm9vdCI6IiJ9
//# sourceURL=src/queue.coffee