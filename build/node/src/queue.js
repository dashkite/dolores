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
}; // Dolores will be opinionated and always assume a FIFO queue.


exports.createQueue = createQueue = function (name, options = {}) {
  var defaults;
  name = `${name}.fifo`;
  defaults = {
    FifoQueue: true,
    ReceiveMessageWaitTimeSeconds: 20,
    ContentBasedDeduplication: true
  };
  return _createQueue(name, Obj.merge(defaults, options));
}; // Dolores will be opinionated and always assume a FIFO queue.


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
}; // For now, this will be idempotent. Some aspects of queues cannot be updated
//   and require a delete-create cycle (~60s) to perform an effective update.


exports.putQueue = putQueue = async function (name, options) {
  if ((await getQueueURL(name)) == null) {
    return await createQueue(name, options);
  }
}; // AWS indicates this can take 60 seconds to complete.


exports.emptyQueue = emptyQueue = async function (name) {
  var url;

  if ((url = await getQueueURL(name)) != null) {
    return await AWS.SQS.purgeQueue({
      QueueUrl: url
    });
  }
}; // AWS indicates this can take 60 seconds to complete.


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
//# sourceMappingURL=data:application/json;base64,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aW1wb3J0ICogYXMgU1RTIGZyb20gXCJAYXdzLXNkay9jbGllbnQtc3RzXCJcbmltcG9ydCAqIGFzIE9iaiBmcm9tIFwiQGRhc2hraXRlL2pveS9vYmplY3RcIlxuaW1wb3J0ICogYXMgVHlwZSBmcm9tIFwiQGRhc2hraXRlL2pveS90eXBlXCJcbmltcG9ydCB7IGxpZnQgfSBmcm9tIFwiLi9oZWxwZXJzXCJcblxuY3JlYXRlU3RlcEZ1bmN0aW9uID0gKHsgbmFtZSwgZGljdGlvbmFyeSwgcmVzb3VyY2VzLCBkZXNjcmlwdGlvbiB9KSAtPlxuXG5jYWNoZSA9XG4gIGFjY291bnQ6IG51bGxcblxuQVdTID1cbiAgU1FTOiBsaWZ0IFNRU1xuICBTVFM6IGxpZnQgU1RTXG5cbnJlZ2lvbiA9IFwidXMtZWFzdC0xXCJcblxuZ2V0UXVldWVBUk4gPSAobmFtZSkgLT5cbiAgYWNjb3VudCA9IGF3YWl0IGRvIC0+XG4gICAgY2FjaGUuYWNjb3VudCA/PSAoIGF3YWl0IEFXUy5TVFMuZ2V0Q2FsbGVySWRlbnRpdHkoKSApLkFjY291bnRcbiAgXCJhcm46YXdzOnNxczoje3JlZ2lvbn06I3thY2NvdW50fToje25hbWV9LmZpZm9cIlxuXG5fY3JlYXRlUXVldWUgPSAobmFtZSwgb3B0aW9ucykgLT5cbiAgQVdTLlNRUy5jcmVhdGVRdWV1ZVxuICAgIFF1ZXVlTmFtZTogbmFtZVxuICAgIEF0dHJpYnV0ZXM6IG9wdGlvbnNcblxuIyBEb2xvcmVzIHdpbGwgYmUgb3BpbmlvbmF0ZWQgYW5kIGFsd2F5cyBhc3N1bWUgYSBGSUZPIHF1ZXVlLlxuY3JlYXRlUXVldWUgPSAobmFtZSwgb3B0aW9ucyA9IHt9KSAtPlxuICBuYW1lID0gXCIje25hbWV9LmZpZm9cIlxuICBkZWZhdWx0cyA9IFxuICAgIEZpZm9RdWV1ZTogdHJ1ZVxuICAgIFJlY2VpdmVNZXNzYWdlV2FpdFRpbWVTZWNvbmRzOiAyMFxuICAgIENvbnRlbnRCYXNlZERlZHVwbGljYXRpb246IHRydWVcblxuICBfY3JlYXRlUXVldWUgbmFtZSwgT2JqLm1lcmdlIGRlZmF1bHRzLCBvcHRpb25zXG5cbiMgRG9sb3JlcyB3aWxsIGJlIG9waW5pb25hdGVkIGFuZCBhbHdheXMgYXNzdW1lIGEgRklGTyBxdWV1ZS5cbmdldFF1ZXVlVVJMID0gKG5hbWUpIC0+XG4gIG5hbWUgPSBcIiN7bmFtZX0uZmlmb1wiXG4gIHRyeVxuICAgIHsgUXVldWVVcmwgfSA9IGF3YWl0IEFXUy5TUVMuZ2V0UXVldWVVcmwgUXVldWVOYW1lOiBuYW1lXG4gICAgUXVldWVVcmxcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiAvQVdTXFwuU2ltcGxlUXVldWVTZXJ2aWNlXFwuTm9uRXhpc3RlbnRRdWV1ZS8udGVzdCBlcnJvci50b1N0cmluZygpXG4gICAgICBudWxsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuIyBGb3Igbm93LCB0aGlzIHdpbGwgYmUgaWRlbXBvdGVudC4gU29tZSBhc3BlY3RzIG9mIHF1ZXVlcyBjYW5ub3QgYmUgdXBkYXRlZFxuIyAgIGFuZCByZXF1aXJlIGEgZGVsZXRlLWNyZWF0ZSBjeWNsZSAofjYwcykgdG8gcGVyZm9ybSBhbiBlZmZlY3RpdmUgdXBkYXRlLlxucHV0UXVldWUgPSAobmFtZSwgb3B0aW9ucykgLT5cbiAgaWYgISggYXdhaXQgZ2V0UXVldWVVUkwgbmFtZSApP1xuICAgIGF3YWl0IGNyZWF0ZVF1ZXVlIG5hbWUsIG9wdGlvbnNcblxuIyBBV1MgaW5kaWNhdGVzIHRoaXMgY2FuIHRha2UgNjAgc2Vjb25kcyB0byBjb21wbGV0ZS5cbmVtcHR5UXVldWUgPSAobmFtZSkgLT5cbiAgaWYgKCB1cmwgPSBhd2FpdCBnZXRRdWV1ZVVSTCBuYW1lICk/XG4gICAgYXdhaXQgQVdTLlNRUy5wdXJnZVF1ZXVlIFF1ZXVlVXJsOiB1cmxcblxuIyBBV1MgaW5kaWNhdGVzIHRoaXMgY2FuIHRha2UgNjAgc2Vjb25kcyB0byBjb21wbGV0ZS5cbmRlbGV0ZVF1ZXVlID0gKG5hbWUpIC0+XG4gIGlmICggdXJsID0gYXdhaXQgZ2V0UXVldWVVUkwgbmFtZSApP1xuICAgIGF3YWl0IEFXUy5TUVMuZGVsZXRlUXVldWUgUXVldWVVcmw6IHVybFxuXG5wdXNoTWVzc2FnZSA9IChuYW1lLCBtZXNzYWdlLCBvcHRpb25zKSAtPlxuICBpZiAhKFR5cGUuaXNTdHJpbmcgbWVzc2FnZSkgfHwgKCBtZXNzYWdlLmxlbmd0aCA9PSAwIClcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJkb2xvcmVzOnF1ZXVlOiBtZXNzYWdlIG11c3QgYmUgYSBzdHJpbmcgd2l0aFxuICAgICAgbWluaW11bSBsZW5ndGggMS5cIlxuXG4gIGRlZmF1bHRzID1cbiAgICBNZXNzYWdlR3JvdXBJZDogXCJEZWZhdWx0TWVzc2FnZUdyb3VwSURcIlxuXG4gIGlmICggdXJsID0gYXdhaXQgZ2V0UXVldWVVUkwgbmFtZSApP1xuICAgIGF3YWl0IEFXUy5TUVMuc2VuZE1lc3NhZ2UgT2JqLm1lcmdlIGRlZmF1bHRzLCBvcHRpb25zLFxuICAgICAgTWVzc2FnZUJvZHk6IG1lc3NhZ2VcbiAgICAgIFF1ZXVlVXJsOiB1cmxcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBcImRvbG9yZXM6cXVldWU6IHRoZSBxdWV1ZSAje25hbWV9IGlzIG5vdCBhdmFpbGFibGVcIlxuXG5fcmVjZWlldmVNZXNzYWdlcyA9ICh1cmwsIG9wdGlvbnMpIC0+XG4gIGRlZmF1bHRzID0gXG4gICAgQXR0cmlidXRlTmFtZXM6IFsgXCJBbGxcIiBdXG4gICAgTWVzc2FnZUF0dHJpYnV0ZU5hbWVzOiBbIFwiQWxsXCIgXVxuXG4gIHsgTWVzc2FnZXMgfSA9IGF3YWl0IEFXUy5TUVMucmVjZWl2ZU1lc3NhZ2UgT2JqLm1lcmdlIGRlZmF1bHRzLCBvcHRpb25zLFxuICAgIFF1ZXVlVXJsOiB1cmxcblxuICBNZXNzYWdlc1xuXG5fZGVsZXRlTWVzc2FnZSA9ICh1cmwsIGhhbmRsZSkgLT5cbiAgQVdTLlNRUy5kZWxldGVNZXNzYWdlXG4gICAgUXVldWVVcmw6IHVybFxuICAgIFJlY2VpcHRIYW5kbGU6IGhhbmRsZVxuXG5fZGVsZXRlTWVzc2FnZXMgPSAodXJsLCBoYW5kbGVzKSAtPlxuICBBV1MuU1FTLmRlbGV0ZU1lc3NhZ2VCYXRjaFxuICAgIFF1ZXVlVXJsOiB1cmxcbiAgICBFbnRyaWVzOiBkbyAtPlxuICAgICAgZm9yIGhhbmRsZSwgaW5kZXggaW4gaGFuZGxlc1xuICAgICAgICBJZDogXCIje2luZGV4fVwiXG4gICAgICAgIFJlY2VpcHRIYW5kbGU6IGhhbmRsZVxuXG5wb3BNZXNzYWdlcyA9IChuYW1lLCBvcHRpb25zKSAtPlxuICBpZiAoIHVybCA9IGF3YWl0IGdldFF1ZXVlVVJMIG5hbWUgKT9cbiAgICBfbWVzc2FnZXMgPSBhd2FpdCBfcmVjZWlldmVNZXNzYWdlcyB1cmwsIG9wdGlvbnNcbiAgICBfbWVzc2FnZXMgPz0gW11cbiAgICBoYW5kbGVzID0gW11cbiAgICBtZXNzYWdlcyA9IFtdXG4gICAgXG4gICAgZm9yIHsgUmVjZWlwdEhhbmRsZSwgQm9keSB9IGluIF9tZXNzYWdlc1xuICAgICAgaGFuZGxlcy5wdXNoIFJlY2VpcHRIYW5kbGVcbiAgICAgIG1lc3NhZ2VzLnB1c2ggQm9keVxuICAgIFxuICAgIGlmIGhhbmRsZXMubGVuZ3RoID4gMFxuICAgICAgYXdhaXQgX2RlbGV0ZU1lc3NhZ2VzIHVybCwgaGFuZGxlc1xuICAgIFxuICAgIG1lc3NhZ2VzXG5cbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvciBcImRvbG9yZXM6cXVldWU6IHRoZSBxdWV1ZSAje25hbWV9IGlzIG5vdCBhdmFpbGFibGVcIlxuXG4jIFRPRE86IGhhbmRsZSB0aGUgYmF0Y2ggdmVyc2lvbnMgb2YgdGhlc2Ugb3BlcmF0aW9ucy4uLlxuXG5leHBvcnQge1xuICBfY3JlYXRlUXVldWVcbiAgZ2V0UXVldWVBUk5cbiAgY3JlYXRlUXVldWVcbiAgZ2V0UXVldWVVUkxcbiAgcHV0UXVldWVcbiAgZW1wdHlRdWV1ZVxuICBkZWxldGVRdWV1ZVxuICBwdXNoTWVzc2FnZVxuICBwb3BNZXNzYWdlc1xufSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/queue.coffee