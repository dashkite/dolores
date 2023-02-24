"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.streamObject = exports.putObject = exports.putBucketLifecycle = exports.putBucket = exports.listObjects = exports.headObject = exports.hasObject = exports.hasBucket = exports.getObject = exports.getBucketLifecycle = exports.getBucketARN = exports.emptyBucket = exports.deleteObjects = exports.deleteObject = exports.deleteDirectory = exports.deleteBucketLifecycle = exports.deleteBucket = void 0;

var S3 = _interopRequireWildcard(require("@aws-sdk/client-s3"));

var _helpers = require("./helpers.js");

var _generic = require("@dashkite/joy/generic");

var _type = require("@dashkite/joy/type");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AWS, deleteBucket, deleteBucketLifecycle, deleteDirectory, deleteObject, deleteObjects, emptyBucket, getBucketARN, getBucketLifecycle, getObject, hasBucket, hasObject, headObject, isS3Object, listObjects, putBucket, putBucketLifecycle, putObject, rescueNotFound, streamObject;
exports.streamObject = streamObject;
exports.putObject = putObject;
exports.putBucketLifecycle = putBucketLifecycle;
exports.putBucket = putBucket;
exports.listObjects = listObjects;
exports.headObject = headObject;
exports.hasObject = hasObject;
exports.hasBucket = hasBucket;
exports.getObject = getObject;
exports.getBucketLifecycle = getBucketLifecycle;
exports.getBucketARN = getBucketARN;
exports.emptyBucket = emptyBucket;
exports.deleteObjects = deleteObjects;
exports.deleteObject = deleteObject;
exports.deleteDirectory = deleteDirectory;
exports.deleteBucketLifecycle = deleteBucketLifecycle;
exports.deleteBucket = deleteBucket;
AWS = {
  S3: (0, _helpers.lift)(S3)
};

rescueNotFound = function (error) {
  var code, ref, ref1;
  code = (ref = error != null ? (ref1 = error.$response) != null ? ref1.statusCode : void 0 : void 0) != null ? ref : error.$metadata.httpStatusCode;

  if (!(code === 403 || code === 404)) {
    throw error;
  }
};

exports.hasBucket = hasBucket = async function (name) {
  var error;

  try {
    await AWS.S3.headBucket({
      Bucket: name
    });
    return true;
  } catch (error1) {
    error = error1;
    rescueNotFound(error);
    return false;
  }
};

exports.getBucketARN = getBucketARN = function (name) {
  return `arn:aws:s3:::${name}`;
};

exports.putBucket = putBucket = async function (name) {
  if (!(await hasBucket(name))) {
    return await AWS.S3.createBucket({
      Bucket: name
    });
  }
};

exports.deleteBucket = deleteBucket = async function (name) {
  if (await hasBucket(name)) {
    return await AWS.S3.deleteBucket({
      Bucket: name
    });
  }
};

exports.getBucketLifecycle = getBucketLifecycle = async function (name) {
  return await AWS.S3.getBucketLifecycleConfiguration({
    Bucket: name
  });
};

exports.putBucketLifecycle = putBucketLifecycle = async function (name, lifecycle) {
  return await AWS.S3.putBucketLifecycleConfiguration({
    Bucket: name,
    LifecycleConfiguration: lifecycle
  });
};

exports.deleteBucketLifecycle = deleteBucketLifecycle = async function (name) {
  return await AWS.S3.deleteBucketLifecycle({
    Bucket: name
  });
};

exports.headObject = headObject = async function (name, key) {
  var error;

  try {
    return await AWS.S3.headObject({
      Bucket: name,
      Key: key
    });
  } catch (error1) {
    error = error1;
    rescueNotFound(error);
    return null;
  }
};

exports.hasObject = hasObject = async function (name, key) {
  if ((await headObject(name, key)) != null) {
    return true;
  } else {
    return false;
  }
};

exports.getObject = getObject = async function (name, key) {
  var error;

  try {
    return await AWS.S3.getObject({
      Bucket: name,
      Key: key
    });
  } catch (error1) {
    error = error1;
    rescueNotFound(error);
    return null;
  }
};

isS3Object = function (value) {
  return (0, _type.isObject)(value) && value.Body != null;
};

exports.streamObject = streamObject = (0, _generic.generic)({
  name: "streamObject"
});
(0, _generic.generic)(streamObject, isS3Object, _type.isString, function ({
  Body
}, encoding) {
  if (encoding === "binary") {
    return Body;
  } else {
    return new Promise(function (resolve, reject) {
      var output;
      Body.setEncoding(encoding);
      output = "";
      Body.on("data", function (chunk) {
        return output += chunk;
      });
      Body.on("error", function (error) {
        return reject(error);
      });
      return Body.on("end", function () {
        return resolve(output);
      });
    });
  }
});
(0, _generic.generic)(streamObject, isS3Object, function (object) {
  return streamObject(object, "utf8");
});
(0, _generic.generic)(streamObject, _type.isString, _type.isString, _type.isString, async function (name, key, encoding) {
  return streamObject(await getObject(name, key), encoding);
});
(0, _generic.generic)(streamObject, _type.isString, _type.isString, async function (name, key) {
  return streamObject(await getObject(name, key));
});

exports.putObject = putObject = function (parameters) {
  return AWS.S3.putObject(parameters);
};

exports.deleteObject = deleteObject = async function (name, key) {
  if (await hasObject(name, key)) {
    return await AWS.S3.deleteObject({
      Bucket: name,
      Key: key
    });
  }
};

exports.deleteObjects = deleteObjects = async function (name, keys) {
  var key;
  return await AWS.S3.deleteObjects({
    Bucket: name,
    Delete: {
      Objects: function () {
        var i, len, results;
        results = [];

        for (i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          results.push({
            Key: key
          });
        }

        return results;
      }(),
      Quiet: true
    }
  });
};

exports.listObjects = listObjects = async function (name, prefix, items = [], token) {
  var Contents, IsTruncated, NextContinuationToken, parameters;
  parameters = {
    Bucket: name,
    MaxKeys: 1000
  };

  if (token != null) {
    parameters.ContinuationToken = token;
  }

  if (prefix != null) {
    parameters.Prefix = prefix;
  }

  ({
    IsTruncated,
    Contents,
    NextContinuationToken
  } = await AWS.S3.listObjectsV2(parameters));

  if (IsTruncated) {
    items = items.concat(Contents);
    return await listObjects(name, prefix, items, NextContinuationToken);
  } else {
    return items.concat(Contents);
  }
};

exports.deleteDirectory = deleteDirectory = async function (name, prefix) {
  var batch, i, keys, len, object, ref, ref1, results;
  keys = [];
  ref = await listObjects(name, prefix);

  for (i = 0, len = ref.length; i < len; i++) {
    object = ref[i];
    keys.push(object.Key);
  }

  ref1 = (0, _helpers.partition)(1000, keys);
  results = [];

  for (batch of ref1) {
    if (batch.length > 0) {
      // Is this neccessary?
      results.push(await deleteObjects(name, batch));
    } else {
      results.push(void 0);
    }
  }

  return results;
};

exports.emptyBucket = emptyBucket = function (name) {
  return deleteDirectory(name);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9idWNrZXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7OztBQUVBOztBQUNBOzs7Ozs7QUFIQSxJQUFBLEdBQUEsRUFBQSxZQUFBLEVBQUEscUJBQUEsRUFBQSxlQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsWUFBQSxFQUFBLGtCQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBLGtCQUFBLEVBQUEsU0FBQSxFQUFBLGNBQUEsRUFBQSxZQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFNQSxHQUFBLEdBQ0U7QUFBQSxFQUFBLEVBQUEsRUFBSSxtQkFBQSxFQUFBO0FBQUosQ0FERjs7QUFHQSxjQUFBLEdBQWlCLFVBQUEsS0FBQSxFQUFBO0FBQ2pCLE1BQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBO0FBQUUsRUFBQSxJQUFBLEdBQUEsQ0FBQSxHQUFBLEdBQUEsS0FBQSxJQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsU0FBQSxLQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLElBQUEsR0FBQSxHQUFBLEdBQXNDLEtBQUssQ0FBQyxTQUFOLENBQWdCLGNBQXREOztBQUNBLE1BQUcsRUFBSSxJQUFBLEtBQVUsR0FBVixJQUFBLElBQUEsS0FBUCxHQUFHLENBQUgsRUFBQTtBQUNFLFVBREYsS0FDRTs7QUFIYSxDQUFqQjs7QUFLQSxvQkFBQSxTQUFBLEdBQVksZ0JBQUEsSUFBQSxFQUFBO0FBQ1osTUFBQSxLQUFBOztBQUFFLE1BQUE7QUFDRSxVQUFNLEdBQUcsQ0FBQyxFQUFKLENBQUEsVUFBQSxDQUFrQjtBQUFBLE1BQUEsTUFBQSxFQUFRO0FBQVIsS0FBbEIsQ0FBTjtXQURGLEk7QUFHQSxHQUhBLENBR0EsT0FBQSxNQUFBLEVBQUE7QUFBTSxJQUFBLEtBQUEsR0FBQSxNQUFBO0FBQ0osSUFBQSxjQUFBLENBQUEsS0FBQSxDQUFBO1dBREYsSzs7QUFKVSxDQUFaOztBQVFBLHVCQUFBLFlBQUEsR0FBZSxVQUFBLElBQUEsRUFBQTtBQUNiLFNBQUEsZ0JBQUEsSUFBQSxFQUFBO0FBRGEsQ0FBZjs7QUFHQSxvQkFBQSxTQUFBLEdBQVksZ0JBQUEsSUFBQSxFQUFBO0FBQ1YsTUFBRyxFQUFHLE1BQU0sU0FBQSxDQUFaLElBQVksQ0FBVCxDQUFILEVBQUE7QUFDRSxXQUFBLE1BQU0sR0FBRyxDQUFDLEVBQUosQ0FBQSxZQUFBLENBQW9CO0FBQUEsTUFBQSxNQUFBLEVBQVE7QUFBUixLQUFwQixDQUFOOztBQUZRLENBQVo7O0FBSUEsdUJBQUEsWUFBQSxHQUFlLGdCQUFBLElBQUEsRUFBQTtBQUNiLE1BQUcsTUFBTSxTQUFBLENBQVQsSUFBUyxDQUFULEVBQUE7QUFDRSxXQUFBLE1BQU0sR0FBRyxDQUFDLEVBQUosQ0FBQSxZQUFBLENBQW9CO0FBQUEsTUFBQSxNQUFBLEVBQVE7QUFBUixLQUFwQixDQUFOOztBQUZXLENBQWY7O0FBSUEsNkJBQUEsa0JBQUEsR0FBcUIsZ0JBQUEsSUFBQSxFQUFBO0FBQ25CLFNBQUEsTUFBTSxHQUFHLENBQUMsRUFBSixDQUFBLCtCQUFBLENBQXVDO0FBQUEsSUFBQSxNQUFBLEVBQVE7QUFBUixHQUF2QyxDQUFOO0FBRG1CLENBQXJCOztBQUdBLDZCQUFBLGtCQUFBLEdBQXFCLGdCQUFBLElBQUEsRUFBQSxTQUFBLEVBQUE7QUFDbkIsU0FBQSxNQUFNLEdBQUcsQ0FBQyxFQUFKLENBQUEsK0JBQUEsQ0FDSjtBQUFBLElBQUEsTUFBQSxFQUFBLElBQUE7QUFDQSxJQUFBLHNCQUFBLEVBQXdCO0FBRHhCLEdBREksQ0FBTjtBQURtQixDQUFyQjs7QUFLQSxnQ0FBQSxxQkFBQSxHQUF3QixnQkFBQSxJQUFBLEVBQUE7QUFDdEIsU0FBQSxNQUFNLEdBQUcsQ0FBQyxFQUFKLENBQUEscUJBQUEsQ0FBNkI7QUFBQSxJQUFBLE1BQUEsRUFBUTtBQUFSLEdBQTdCLENBQU47QUFEc0IsQ0FBeEI7O0FBSUEscUJBQUEsVUFBQSxHQUFhLGdCQUFBLElBQUEsRUFBQSxHQUFBLEVBQUE7QUFDYixNQUFBLEtBQUE7O0FBQUUsTUFBQTtBQUNFLFdBQUEsTUFBTSxHQUFHLENBQUMsRUFBSixDQUFBLFVBQUEsQ0FBa0I7QUFBQSxNQUFBLE1BQUEsRUFBQSxJQUFBO0FBQWMsTUFBQSxHQUFBLEVBQUs7QUFBbkIsS0FBbEIsQ0FBTjtBQUNGLEdBRkEsQ0FFQSxPQUFBLE1BQUEsRUFBQTtBQUFNLElBQUEsS0FBQSxHQUFBLE1BQUE7QUFDSixJQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUE7V0FERixJOztBQUhXLENBQWI7O0FBT0Esb0JBQUEsU0FBQSxHQUFZLGdCQUFBLElBQUEsRUFBQSxHQUFBLEVBQUE7QUFDVixNQUFHLENBQUEsTUFBQSxVQUFBLENBQUEsSUFBQSxFQUFBLEdBQUEsQ0FBQSxLQUFILElBQUEsRUFBQTtXQUFBLEk7QUFBQSxHQUFBLE1BQUE7V0FBQSxLOztBQURVLENBQVo7O0FBR0Esb0JBQUEsU0FBQSxHQUFZLGdCQUFBLElBQUEsRUFBQSxHQUFBLEVBQUE7QUFDWixNQUFBLEtBQUE7O0FBQUUsTUFBQTtBQUNFLFdBQUEsTUFBTSxHQUFHLENBQUMsRUFBSixDQUFBLFNBQUEsQ0FBaUI7QUFBQSxNQUFBLE1BQUEsRUFBQSxJQUFBO0FBQWMsTUFBQSxHQUFBLEVBQUs7QUFBbkIsS0FBakIsQ0FBTjtBQUNGLEdBRkEsQ0FFQSxPQUFBLE1BQUEsRUFBQTtBQUFNLElBQUEsS0FBQSxHQUFBLE1BQUE7QUFDSixJQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUE7V0FERixJOztBQUhVLENBQVo7O0FBT0EsVUFBQSxHQUFhLFVBQUEsS0FBQSxFQUFBO1NBQWEsb0JBQUYsS0FBRSxDQUFGLElBQXNCLEtBQUEsQ0FBQSxJQUFBLElBQUEsSTtBQUFqQyxDQUFiOztBQUVBLHVCQUFBLFlBQUEsR0FBZSxzQkFBUTtBQUFBLEVBQUEsSUFBQSxFQUFNO0FBQU4sQ0FBUixDQUFmO0FBRUEsc0JBQUEsWUFBQSxFQUFBLFVBQUEsRUFBQSxjQUFBLEVBQTRDLFVBQUU7QUFBRixFQUFBO0FBQUUsQ0FBRixFQUFBLFFBQUEsRUFBQTtBQUMxQyxNQUFHLFFBQUEsS0FBSCxRQUFBLEVBQUE7V0FBQSxJO0FBQUEsR0FBQSxNQUFBO1dBR0UsSUFBQSxPQUFBLENBQVksVUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ2hCLFVBQUEsTUFBQTtBQUFNLE1BQUEsSUFBSSxDQUFKLFdBQUEsQ0FBQSxRQUFBO0FBQ0EsTUFBQSxNQUFBLEdBQVMsRUFBVDtBQUNBLE1BQUEsSUFBSSxDQUFKLEVBQUEsQ0FBQSxNQUFBLEVBQWdCLFVBQUEsS0FBQSxFQUFBO2VBQVcsTUFBQSxJQUFVLEs7QUFBckMsT0FBQTtBQUNBLE1BQUEsSUFBSSxDQUFKLEVBQUEsQ0FBQSxPQUFBLEVBQWlCLFVBQUEsS0FBQSxFQUFBO2VBQVcsTUFBQSxDQUFBLEtBQUEsQztBQUE1QixPQUFBO2FBQ0EsSUFBSSxDQUFKLEVBQUEsQ0FBQSxLQUFBLEVBQWUsWUFBQTtlQUFHLE9BQUEsQ0FBQSxNQUFBLEM7QUFBbEIsT0FBQSxDO0FBUkosS0FHRSxDOztBQUpKLENBQUE7QUFXQSxzQkFBQSxZQUFBLEVBQUEsVUFBQSxFQUFrQyxVQUFBLE1BQUEsRUFBQTtTQUNoQyxZQUFBLENBQUEsTUFBQSxFQUFBLE1BQUEsQztBQURGLENBQUE7QUFHQSxzQkFBQSxZQUFBLEVBQUEsY0FBQSxFQUFBLGNBQUEsRUFBQSxjQUFBLEVBQW9ELGdCQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBO1NBQ2xELFlBQUEsQ0FBZSxNQUFNLFNBQUEsQ0FBQSxJQUFBLEVBQXJCLEdBQXFCLENBQXJCLEVBQUEsUUFBQSxDO0FBREYsQ0FBQTtBQUdBLHNCQUFBLFlBQUEsRUFBQSxjQUFBLEVBQUEsY0FBQSxFQUEwQyxnQkFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBO1NBQ3hDLFlBQUEsQ0FBYSxNQUFNLFNBQUEsQ0FBQSxJQUFBLEVBQW5CLEdBQW1CLENBQW5CLEM7QUFERixDQUFBOztBQUdBLG9CQUFBLFNBQUEsR0FBWSxVQUFBLFVBQUEsRUFBQTtTQUNWLEdBQUcsQ0FBQyxFQUFKLENBQUEsU0FBQSxDQUFBLFVBQUEsQztBQURVLENBQVo7O0FBR0EsdUJBQUEsWUFBQSxHQUFlLGdCQUFBLElBQUEsRUFBQSxHQUFBLEVBQUE7QUFDYixNQUFHLE1BQU0sU0FBQSxDQUFBLElBQUEsRUFBVCxHQUFTLENBQVQsRUFBQTtBQUNFLFdBQUEsTUFBTSxHQUFHLENBQUMsRUFBSixDQUFBLFlBQUEsQ0FBb0I7QUFBQSxNQUFBLE1BQUEsRUFBQSxJQUFBO0FBQWMsTUFBQSxHQUFBLEVBQUs7QUFBbkIsS0FBcEIsQ0FBTjs7QUFGVyxDQUFmOztBQUtBLHdCQUFBLGFBQUEsR0FBZ0IsZ0JBQUEsSUFBQSxFQUFBLElBQUEsRUFBQTtBQUNoQixNQUFBLEdBQUE7QUFBRSxTQUFBLE1BQU0sR0FBRyxDQUFDLEVBQUosQ0FBQSxhQUFBLENBQ0o7QUFBQSxJQUFBLE1BQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQSxNQUFBLEVBQ0U7QUFBQSxNQUFBLE9BQUEsRUFBQSxZQUFBOztBQUFXLFFBQUEsT0FBQSxHQUFBLEVBQUE7O0FBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7O3VCQUFBO0FBQUEsWUFBQSxHQUFBLEVBQUs7QUFBTCxXO0FBQUE7OztBQUFYLE9BQUEsRUFBQTtBQUNBLE1BQUEsS0FBQSxFQUFPO0FBRFA7QUFGRixHQURJLENBQU47QUFEYyxDQUFoQjs7QUFRQSxzQkFBQSxXQUFBLEdBQWMsZ0JBQUEsSUFBQSxFQUFBLE1BQUEsRUFBZSxLQUFBLEdBQWYsRUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNkLE1BQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxxQkFBQSxFQUFBLFVBQUE7QUFBRSxFQUFBLFVBQUEsR0FDRTtBQUFBLElBQUEsTUFBQSxFQUFBLElBQUE7QUFDQSxJQUFBLE9BQUEsRUFBUztBQURULEdBREY7O0FBR0EsTUFBd0MsS0FBQSxJQUF4QyxJQUFBLEVBQUE7QUFBQSxJQUFBLFVBQVUsQ0FBVixpQkFBQSxHQUFBLEtBQUE7OztBQUNBLE1BQThCLE1BQUEsSUFBOUIsSUFBQSxFQUFBO0FBQUEsSUFBQSxVQUFVLENBQVYsTUFBQSxHQUFBLE1BQUE7OztBQUVBLEdBQUE7QUFBQSxJQUFBLFdBQUE7QUFBQSxJQUFBLFFBQUE7QUFBQSxJQUFBO0FBQUEsTUFJSSxNQUFNLEdBQUcsQ0FBQyxFQUFKLENBQUEsYUFBQSxDQUpWLFVBSVUsQ0FKVjs7QUFNQSxNQUFBLFdBQUEsRUFBQTtBQUNFLElBQUEsS0FBQSxHQUFRLEtBQUssQ0FBTCxNQUFBLENBQUEsUUFBQSxDQUFSO0FBQ0EsV0FBQSxNQUFNLFdBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFGUixxQkFFUSxDQUFOO0FBRkYsR0FBQSxNQUFBO1dBSUUsS0FBSyxDQUFMLE1BQUEsQ0FKRixRQUlFLEM7O0FBakJVLENBQWQ7O0FBbUJBLDBCQUFBLGVBQUEsR0FBa0IsZ0JBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQTtBQUNsQixNQUFBLEtBQUEsRUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBO0FBQUUsRUFBQSxJQUFBLEdBQU8sRUFBUDtBQUNBLEVBQUEsR0FBQSxHQUFBLE1BQUEsV0FBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUE7O0FBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxHQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7O0FBQ0UsSUFBQSxJQUFJLENBQUosSUFBQSxDQUFVLE1BQU0sQ0FBaEIsR0FBQTtBQURGOztBQUdBLEVBQUEsSUFBQSxHQUFBLHdCQUFBLElBQUEsRUFBQSxJQUFBLENBQUE7QUFBQSxFQUFBLE9BQUEsR0FBQSxFQUFBOztBQUFBLE9BQUEsS0FBQSxJQUFBLElBQUEsRUFBQTtBQUNFLFFBQUcsS0FBSyxDQUFMLE1BQUEsR0FBSCxDQUFBLEVBQUE7QUFBQTtjQUNFLEksQ0FBQSxNQUFNLGFBQUEsQ0FBQSxJQUFBLEVBRFIsS0FDUSxDO0FBRFIsS0FBQSxNQUFBO3dCQUFBLEM7O0FBREY7OztBQUxnQixDQUFsQjs7QUFTQSxzQkFBQSxXQUFBLEdBQWMsVUFBQSxJQUFBLEVBQUE7U0FBVSxlQUFBLENBQUEsSUFBQSxDO0FBQVYsQ0FBZCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFMzIGZyb20gXCJAYXdzLXNkay9jbGllbnQtczNcIlxuaW1wb3J0IHsgbGlmdCwgcGFydGl0aW9uIH0gZnJvbSBcIi4vaGVscGVyc1wiXG5pbXBvcnQgeyBnZW5lcmljIH0gZnJvbSBcIkBkYXNoa2l0ZS9qb3kvZ2VuZXJpY1wiXG5pbXBvcnQgeyBpc1N0cmluZywgaXNPYmplY3QgfSBmcm9tIFwiQGRhc2hraXRlL2pveS90eXBlXCJcblxuXG5BV1MgPVxuICBTMzogbGlmdCBTM1xuXG5yZXNjdWVOb3RGb3VuZCA9IChlcnJvcikgLT5cbiAgY29kZSA9IGVycm9yPy4kcmVzcG9uc2U/LnN0YXR1c0NvZGUgPyBlcnJvci4kbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGVcbiAgaWYgISAoIGNvZGUgaW4gWyA0MDMsIDQwNCBdIClcbiAgICB0aHJvdyBlcnJvclxuXG5oYXNCdWNrZXQgPSAobmFtZSkgLT5cbiAgdHJ5XG4gICAgYXdhaXQgQVdTLlMzLmhlYWRCdWNrZXQgQnVja2V0OiBuYW1lXG4gICAgdHJ1ZVxuICBjYXRjaCBlcnJvclxuICAgIHJlc2N1ZU5vdEZvdW5kIGVycm9yXG4gICAgZmFsc2VcblxuZ2V0QnVja2V0QVJOID0gKG5hbWUpIC0+XG4gIFwiYXJuOmF3czpzMzo6OiN7bmFtZX1cIlxuXG5wdXRCdWNrZXQgPSAobmFtZSkgLT5cbiAgaWYgISggYXdhaXQgaGFzQnVja2V0IG5hbWUgKVxuICAgIGF3YWl0IEFXUy5TMy5jcmVhdGVCdWNrZXQgQnVja2V0OiBuYW1lXG5cbmRlbGV0ZUJ1Y2tldCA9IChuYW1lKSAtPlxuICBpZiBhd2FpdCBoYXNCdWNrZXQgbmFtZVxuICAgIGF3YWl0IEFXUy5TMy5kZWxldGVCdWNrZXQgQnVja2V0OiBuYW1lXG5cbmdldEJ1Y2tldExpZmVjeWNsZSA9IChuYW1lKSAtPlxuICBhd2FpdCBBV1MuUzMuZ2V0QnVja2V0TGlmZWN5Y2xlQ29uZmlndXJhdGlvbiBCdWNrZXQ6IG5hbWVcblxucHV0QnVja2V0TGlmZWN5Y2xlID0gKG5hbWUsIGxpZmVjeWNsZSkgLT5cbiAgYXdhaXQgQVdTLlMzLnB1dEJ1Y2tldExpZmVjeWNsZUNvbmZpZ3VyYXRpb24gXG4gICAgQnVja2V0OiBuYW1lXG4gICAgTGlmZWN5Y2xlQ29uZmlndXJhdGlvbjogbGlmZWN5Y2xlXG5cbmRlbGV0ZUJ1Y2tldExpZmVjeWNsZSA9IChuYW1lKSAtPlxuICBhd2FpdCBBV1MuUzMuZGVsZXRlQnVja2V0TGlmZWN5Y2xlIEJ1Y2tldDogbmFtZVxuXG5cbmhlYWRPYmplY3QgPSAobmFtZSwga2V5KSAtPlxuICB0cnlcbiAgICBhd2FpdCBBV1MuUzMuaGVhZE9iamVjdCBCdWNrZXQ6IG5hbWUsIEtleToga2V5XG4gIGNhdGNoIGVycm9yXG4gICAgcmVzY3VlTm90Rm91bmQgZXJyb3JcbiAgICBudWxsXG5cbmhhc09iamVjdCA9IChuYW1lLCBrZXkpIC0+XG4gIGlmICggYXdhaXQgaGVhZE9iamVjdCBuYW1lLCBrZXkgKT8gdGhlbiB0cnVlIGVsc2UgZmFsc2VcblxuZ2V0T2JqZWN0ID0gKCBuYW1lLCBrZXkgKSAtPlxuICB0cnlcbiAgICBhd2FpdCBBV1MuUzMuZ2V0T2JqZWN0IEJ1Y2tldDogbmFtZSwgS2V5OiBrZXlcbiAgY2F0Y2ggZXJyb3JcbiAgICByZXNjdWVOb3RGb3VuZCBlcnJvclxuICAgIG51bGxcblxuaXNTM09iamVjdCA9ICh2YWx1ZSkgLT4gKCBpc09iamVjdCB2YWx1ZSApICYmIHZhbHVlLkJvZHk/XG5cbnN0cmVhbU9iamVjdCA9IGdlbmVyaWMgbmFtZTogXCJzdHJlYW1PYmplY3RcIlxuXG5nZW5lcmljIHN0cmVhbU9iamVjdCwgaXNTM09iamVjdCwgaXNTdHJpbmcsICggeyBCb2R5IH0sIGVuY29kaW5nICkgLT5cbiAgaWYgZW5jb2RpbmcgPT0gXCJiaW5hcnlcIlxuICAgIEJvZHlcbiAgZWxzZVxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBCb2R5LnNldEVuY29kaW5nIGVuY29kaW5nXG4gICAgICBvdXRwdXQgPSBcIlwiXG4gICAgICBCb2R5Lm9uIFwiZGF0YVwiLCAoY2h1bmspIC0+IG91dHB1dCArPSBjaHVua1xuICAgICAgQm9keS5vbiBcImVycm9yXCIsIChlcnJvcikgLT4gcmVqZWN0IGVycm9yXG4gICAgICBCb2R5Lm9uIFwiZW5kXCIsIC0+IHJlc29sdmUgb3V0cHV0XG5cbmdlbmVyaWMgc3RyZWFtT2JqZWN0LCBpc1MzT2JqZWN0LCAoIG9iamVjdCApIC0+XG4gIHN0cmVhbU9iamVjdCBvYmplY3QsIFwidXRmOFwiXG5cbmdlbmVyaWMgc3RyZWFtT2JqZWN0LCBpc1N0cmluZywgaXNTdHJpbmcsIGlzU3RyaW5nLCAoIG5hbWUsIGtleSwgZW5jb2RpbmcgKSAtPlxuICBzdHJlYW1PYmplY3QgKCBhd2FpdCBnZXRPYmplY3QgbmFtZSwga2V5ICksIGVuY29kaW5nXG5cbmdlbmVyaWMgc3RyZWFtT2JqZWN0LCBpc1N0cmluZywgaXNTdHJpbmcsICggbmFtZSwga2V5ICkgLT5cbiAgc3RyZWFtT2JqZWN0IGF3YWl0IGdldE9iamVjdCBuYW1lLCBrZXlcblxucHV0T2JqZWN0ID0gKHBhcmFtZXRlcnMpIC0+XG4gIEFXUy5TMy5wdXRPYmplY3QgcGFyYW1ldGVyc1xuXG5kZWxldGVPYmplY3QgPSAobmFtZSwga2V5KSAtPlxuICBpZiBhd2FpdCBoYXNPYmplY3QgbmFtZSwga2V5XG4gICAgYXdhaXQgQVdTLlMzLmRlbGV0ZU9iamVjdCBCdWNrZXQ6IG5hbWUsIEtleToga2V5XG5cblxuZGVsZXRlT2JqZWN0cyA9IChuYW1lLCBrZXlzKSAtPlxuICBhd2FpdCBBV1MuUzMuZGVsZXRlT2JqZWN0c1xuICAgIEJ1Y2tldDogbmFtZVxuICAgIERlbGV0ZTpcbiAgICAgIE9iamVjdHM6ICggS2V5OiBrZXkgZm9yIGtleSBpbiBrZXlzIClcbiAgICAgIFF1aWV0OiB0cnVlXG5cblxubGlzdE9iamVjdHMgPSAobmFtZSwgcHJlZml4LCBpdGVtcz1bXSwgdG9rZW4pIC0+XG4gIHBhcmFtZXRlcnMgPSBcbiAgICBCdWNrZXQ6IG5hbWVcbiAgICBNYXhLZXlzOiAxMDAwXG4gIHBhcmFtZXRlcnMuQ29udGludWF0aW9uVG9rZW4gPSB0b2tlbiBpZiB0b2tlbj9cbiAgcGFyYW1ldGVycy5QcmVmaXggPSBwcmVmaXggaWYgcHJlZml4P1xuXG4gIHtcbiAgICBJc1RydW5jYXRlZFxuICAgIENvbnRlbnRzXG4gICAgTmV4dENvbnRpbnVhdGlvblRva2VuXG4gIH0gPSBhd2FpdCBBV1MuUzMubGlzdE9iamVjdHNWMiBwYXJhbWV0ZXJzXG4gIFxuICBpZiBJc1RydW5jYXRlZFxuICAgIGl0ZW1zID0gaXRlbXMuY29uY2F0IENvbnRlbnRzXG4gICAgYXdhaXQgbGlzdE9iamVjdHMgbmFtZSwgcHJlZml4LCBpdGVtcywgTmV4dENvbnRpbnVhdGlvblRva2VuXG4gIGVsc2VcbiAgICBpdGVtcy5jb25jYXQgQ29udGVudHNcblxuZGVsZXRlRGlyZWN0b3J5ID0gKG5hbWUsIHByZWZpeCkgLT5cbiAga2V5cyA9IFtdXG4gIGZvciBvYmplY3QgaW4gKCBhd2FpdCBsaXN0T2JqZWN0cyBuYW1lLCBwcmVmaXggKVxuICAgIGtleXMucHVzaCBvYmplY3QuS2V5XG4gIFxuICBmb3IgYmF0Y2ggZnJvbSBwYXJ0aXRpb24gMTAwMCwga2V5c1xuICAgIGlmIGJhdGNoLmxlbmd0aCA+IDAgIyBJcyB0aGlzIG5lY2Nlc3Nhcnk/XG4gICAgICBhd2FpdCBkZWxldGVPYmplY3RzIG5hbWUsIGJhdGNoXG5cbmVtcHR5QnVja2V0ID0gKG5hbWUpIC0+IGRlbGV0ZURpcmVjdG9yeSBuYW1lXG5cbmV4cG9ydCB7XG4gIGdldEJ1Y2tldEFSTlxuICBoYXNCdWNrZXRcbiAgcHV0QnVja2V0XG4gIGRlbGV0ZUJ1Y2tldFxuICBkZWxldGVEaXJlY3RvcnlcbiAgZW1wdHlCdWNrZXRcblxuICBnZXRCdWNrZXRMaWZlY3ljbGVcbiAgcHV0QnVja2V0TGlmZWN5Y2xlXG4gIGRlbGV0ZUJ1Y2tldExpZmVjeWNsZVxuXG4gIGhlYWRPYmplY3RcbiAgaGFzT2JqZWN0XG4gIGdldE9iamVjdFxuICBzdHJlYW1PYmplY3RcbiAgcHV0T2JqZWN0XG4gIGRlbGV0ZU9iamVjdFxuICBkZWxldGVPYmplY3RzXG4gIGxpc3RPYmplY3RzXG59Il0sInNvdXJjZVJvb3QiOiIifQ==
//# sourceURL=src/bucket.coffee