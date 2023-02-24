"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitForReady = exports.versionLambda = exports.syncInvokeLambda = exports.putSources = exports.publishLambda = exports.listSources = exports.invokeLambda = exports.hasLambda = exports.getLatestLambdaARN = exports.getLatestLambda = exports.getLambdaVersion = exports.getLambdaUnqualifiedARN = exports.getLambdaARN = exports.getLambda = exports.deleteSources = exports.deleteSource = exports.deleteLambda = exports.createSources = exports.createSource = void 0;

var _crypto = _interopRequireDefault(require("crypto"));

var Lambda = _interopRequireWildcard(require("@aws-sdk/client-lambda"));

var S3 = _interopRequireWildcard(require("@aws-sdk/client-s3"));

var Text = _interopRequireWildcard(require("@dashkite/joy/text"));

var Time = _interopRequireWildcard(require("@dashkite/joy/time"));

var _helpers = require("./helpers.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AWS, _createSource, _invokeLambda, createSource, createSources, defaults, deleteLambda, deleteSource, deleteSources, getLambda, getLambdaARN, getLambdaUnqualifiedARN, getLambdaVersion, getLatestLambda, getLatestLambdaARN, hasLambda, invokeLambda, listSources, md5, publishLambda, putSources, syncInvokeLambda, versionLambda, waitForReady;

exports.waitForReady = waitForReady;
exports.versionLambda = versionLambda;
exports.syncInvokeLambda = syncInvokeLambda;
exports.putSources = putSources;
exports.publishLambda = publishLambda;
exports.listSources = listSources;
exports.invokeLambda = invokeLambda;
exports.hasLambda = hasLambda;
exports.getLatestLambdaARN = getLatestLambdaARN;
exports.getLatestLambda = getLatestLambda;
exports.getLambdaVersion = getLambdaVersion;
exports.getLambdaUnqualifiedARN = getLambdaUnqualifiedARN;
exports.getLambdaARN = getLambdaARN;
exports.getLambda = getLambda;
exports.deleteSources = deleteSources;
exports.deleteSource = deleteSource;
exports.deleteLambda = deleteLambda;
exports.createSources = createSources;
exports.createSource = createSource;
AWS = {
  Lambda: (0, _helpers.lift)(Lambda),
  S3: (0, _helpers.lift)(S3)
};

md5 = function (buffer) {
  return _crypto.default.createHash('md5').update(buffer).digest("base64");
};

exports.hasLambda = hasLambda = async function (name) {
  return (await getLambda(name)) != null;
};

exports.getLambda = getLambda = async function (name) {
  var error, lambda;

  try {
    lambda = await AWS.Lambda.getFunction({
      FunctionName: name
    });
    return {
      _: lambda,
      arn: lambda.Configuration.FunctionArn,
      state: lambda.Configuration.State,
      lastStatus: lambda.Configuration.LastUpdateStatus
    };
  } catch (error1) {
    error = error1;

    if (/ResourceNotFoundException/.test(error.toString())) {
      return void 0;
    } else {
      throw error;
    }
  }
}; // AWS added internal state management to Lambda in an effort to improve the performance
// of the invocation cycle. This is a broad helper to wait until the lambda is ready
// to go and accept more changes to its state.


exports.waitForReady = waitForReady = async function (name) {
  var lastStatus, results1, state;
  results1 = [];

  while (true) {
    ({
      state,
      lastStatus
    } = await getLambda(name));

    if (state === "Active" && lastStatus === "Successful") {
      break;
    } else if (state === "Failed") {
      throw new Error(`Lambda [ ${name} ] State is Failed.`);
    } else if (lastStatus === "Failed") {
      throw new Error(`Lambda [ ${name} ] LastUpdateStatus is Failed.`);
    } else {
      results1.push(await Time.sleep(1000));
    }
  }

  return results1;
};

exports.getLambdaVersion = getLambdaVersion = async function (name, version) {
  var Versions, current, i, len;
  ({
    Versions
  } = await AWS.Lambda.listVersionsByFunction({
    FunctionName: name
  }));

  for (i = 0, len = Versions.length; i < len; i++) {
    current = Versions[i];

    if (version === Text.parseNumber(current.Version)) {
      return {
        _: current,
        arn: current.FunctionArn,
        version: Text.parseNumber(currentVersion)
      };
    }
  }

  return void 0;
};

exports.getLatestLambda = getLatestLambda = async function (name) {
  var Versions, current, i, len, max, result, version;
  ({
    Versions
  } = await AWS.Lambda.listVersionsByFunction({
    FunctionName: name
  }));
  result = void 0;
  max = 0;

  for (i = 0, len = Versions.length; i < len; i++) {
    current = Versions[i];

    if (current.Version !== "$LATEST") {
      version = Text.parseNumber(current.Version);

      if (version >= max) {
        max = version;
        result = current;
      }
    } else {
      result = current;
    }
  }

  if (result != null) {
    return {
      _: result,
      arn: result.FunctionArn,
      version: max
    };
  }
};

exports.getLatestLambdaARN = getLatestLambdaARN = async function (name) {
  return (await getLatestLambda(name)).arn;
};

exports.getLambdaARN = getLambdaARN = getLatestLambdaARN;

exports.getLambdaUnqualifiedARN = getLambdaUnqualifiedARN = async function (name) {
  return (await getLambdaARN(name)).split(":").slice(0, -1).join(":");
};

defaults = {
  bucket: "dolores.dashkite.com",
  role: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
  memory: 128,
  // max size for edge lambdas
  timeout: 5,
  // max timeout for edge lambdas
  handler: "build/lambda/index.handler",
  runtime: "nodejs18.x"
};

exports.publishLambda = publishLambda = async function (name, data, configuration) {
  var _configuration, bucket, environment, handler, memory, role, runtime, timeout;

  ({
    role,
    handler,
    runtime,
    bucket,
    memory,
    timeout,
    environment
  } = { ...defaults,
    ...configuration
  });
  _configuration = {
    FunctionName: name,
    Handler: handler,
    Runtime: runtime,
    MemorySize: memory,
    Timeout: timeout,
    TracingConfig: {
      Mode: "PassThrough"
    },
    Role: role
  }; // if environment?
  //   _configuration.Environment = Variables: environment

  if (await hasLambda(name)) {
    await AWS.Lambda.updateFunctionCode({
      FunctionName: name,
      Publish: false,
      ZipFile: data
    });
    await waitForReady(name);
    await AWS.Lambda.updateFunctionConfiguration(_configuration);
    return waitForReady(name);
  } else {
    await AWS.Lambda.createFunction({ ..._configuration,
      Code: {
        ZipFile: data
      }
    });
    return waitForReady(name);
  }
};

exports.versionLambda = versionLambda = async function (name) {
  var result;
  result = await AWS.Lambda.publishVersion({
    FunctionName: name
  });
  return {
    _: result,
    arn: result.FunctionArn,
    version: Text.parseNumber(result.Version)
  };
};

exports.deleteLambda = deleteLambda = function (name) {
  return AWS.Lambda.deleteFunction({
    FunctionName: name
  });
};

_invokeLambda = function (name, sync, input) {
  var parameters;
  parameters = {
    FunctionName: name
  };
  parameters.InvocationType = sync ? "RequestResponse" : "Event";

  if (input != null) {
    parameters.Payload = JSON.stringify(input);
  }

  return AWS.Lambda.invoke(parameters);
};

exports.invokeLambda = invokeLambda = function (name, input) {
  return _invokeLambda(name, false, input);
};

exports.syncInvokeLambda = syncInvokeLambda = function (name, input) {
  return _invokeLambda(name, true, input);
};

exports.listSources = listSources = async function (name) {
  var EventSourceMappings, NextMarker, next, result, results;
  results = [];
  next = void 0;

  while (true) {
    result = await AWS.Lambda.listEventSourceMappings({
      FunctionName: name,
      Marker: next
    });
    ({
      EventSourceMappings,
      NextMarker
    } = result);
    next = NextMarker;
    results.push(...EventSourceMappings);

    if (next == null) {
      return results;
    }
  }
};

exports.deleteSource = deleteSource = async function (source) {
  return await AWS.Lambda.deleteEventSourceMapping({
    UUID: source.UUID
  });
};

exports.deleteSources = deleteSources = async function (name) {
  var i, len, results1, source, sources;
  sources = await listSources(name);
  results1 = [];

  for (i = 0, len = sources.length; i < len; i++) {
    source = sources[i];
    results1.push(await deleteSource(source));
  }

  return results1;
};

_createSource = async function (source) {
  return await AWS.Lambda.createEventSourceMapping(source);
};

exports.createSource = createSource = async function (source, duration = 125) {
  try {
    return await _createSource(source);
  } catch (error1) {
    duration *= 2;
    await Time.sleep(duration);
    return await createSource(source, duration);
  }
};

exports.createSources = createSources = async function (sources) {
  var i, len, results1, source;
  results1 = [];

  for (i = 0, len = sources.length; i < len; i++) {
    source = sources[i];
    results1.push(await createSource(source));
  }

  return results1;
};

exports.putSources = putSources = async function (name, sources) {
  await deleteSources(name);
  return await createSources(sources);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9sYW1iZGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztBQUpBLElBQUEsR0FBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxRQUFBLEVBQUEsWUFBQSxFQUFBLFlBQUEsRUFBQSxhQUFBLEVBQUEsU0FBQSxFQUFBLFlBQUEsRUFBQSx1QkFBQSxFQUFBLGdCQUFBLEVBQUEsZUFBQSxFQUFBLGtCQUFBLEVBQUEsU0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLGFBQUEsRUFBQSxVQUFBLEVBQUEsZ0JBQUEsRUFBQSxhQUFBLEVBQUEsWUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBT0EsR0FBQSxHQUNFO0FBQUEsRUFBQSxNQUFBLEVBQVEsbUJBQVIsTUFBUSxDQUFSO0FBQ0EsRUFBQSxFQUFBLEVBQUksbUJBQUEsRUFBQTtBQURKLENBREY7O0FBSUEsR0FBQSxHQUFNLFVBQUEsTUFBQSxFQUFBO1NBQ0osZ0JBQUEsVUFBQSxDQUFBLEtBQUEsRUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBLEM7QUFESSxDQUFOOztBQUdBLG9CQUFBLFNBQUEsR0FBWSxnQkFBQSxJQUFBLEVBQUE7U0FBVSxDQUFBLE1BQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEk7QUFBVixDQUFaOztBQUVBLG9CQUFBLFNBQUEsR0FBWSxnQkFBQSxJQUFBLEVBQUE7QUFDWixNQUFBLEtBQUEsRUFBQSxNQUFBOztBQUFFLE1BQUE7QUFDRSxJQUFBLE1BQUEsR0FBUyxNQUFNLEdBQUcsQ0FBQyxNQUFKLENBQUEsV0FBQSxDQUF1QjtBQUFBLE1BQUEsWUFBQSxFQUFjO0FBQWQsS0FBdkIsQ0FBZjtXQUNBO0FBQUEsTUFBQSxDQUFBLEVBQUEsTUFBQTtBQUNBLE1BQUEsR0FBQSxFQUFLLE1BQU0sQ0FBQyxhQUFQLENBREwsV0FBQTtBQUVBLE1BQUEsS0FBQSxFQUFPLE1BQU0sQ0FBQyxhQUFQLENBRlAsS0FBQTtBQUdBLE1BQUEsVUFBQSxFQUFZLE1BQU0sQ0FBQyxhQUFQLENBQXFCO0FBSGpDLEs7QUFJRixHQU5BLENBTUEsT0FBQSxNQUFBLEVBQUE7QUFBTSxJQUFBLEtBQUEsR0FBQSxNQUFBOztBQUNKLFFBQUcsNEJBQUEsSUFBQSxDQUFpQyxLQUFLLENBQXpDLFFBQW9DLEVBQWpDLENBQUgsRUFBQTthQUNFLEtBREYsQztBQUFBLEtBQUEsTUFBQTtBQUdFLFlBSEYsS0FHRTtBQUpKOztBQXZCRixDQWdCQSxDOzs7OztBQWdCQSx1QkFBQSxZQUFBLEdBQWUsZ0JBQUEsSUFBQSxFQUFBO0FBQ2YsTUFBQSxVQUFBLEVBQUEsUUFBQSxFQUFBLEtBQUE7QUFBRSxFQUFBLFFBQUEsR0FBQSxFQUFBOztTQUFBLEksRUFBQTtBQUNFLEtBQUE7QUFBQSxNQUFBLEtBQUE7QUFBQSxNQUFBO0FBQUEsUUFBd0IsTUFBTSxTQUFBLENBQTlCLElBQThCLENBQTlCOztBQUNBLFFBQUssS0FBQSxLQUFGLFFBQUEsSUFBMkIsVUFBQSxLQUE5QixZQUFBLEVBQUE7QUFBQTtBQUFBLEtBQUEsTUFFSyxJQUFHLEtBQUEsS0FBSCxRQUFBLEVBQUE7QUFDSCxZQUFNLElBQUEsS0FBQSxDQUFVLFlBQUEsSUFEYixxQkFDRyxDQUFOO0FBREcsS0FBQSxNQUVBLElBQUcsVUFBQSxLQUFILFFBQUEsRUFBQTtBQUNILFlBQU0sSUFBQSxLQUFBLENBQVUsWUFBQSxJQURiLGdDQUNHLENBQU47QUFERyxLQUFBLE1BQUE7ZUFHSCxJLENBQUEsTUFBTSxJQUFJLENBQUosS0FBQSxDQUhILElBR0csQzs7QUFUVjs7O0FBRGEsQ0FBZjs7QUFZQSwyQkFBQSxnQkFBQSxHQUFtQixnQkFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBO0FBQ25CLE1BQUEsUUFBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsR0FBQTtBQUFFLEdBQUE7QUFBQSxJQUFBO0FBQUEsTUFBZ0IsTUFBTSxHQUFHLENBQUMsTUFBSixDQUFBLHNCQUFBLENBQWtDO0FBQUEsSUFBQSxZQUFBLEVBQWM7QUFBZCxHQUFsQyxDQUF0Qjs7QUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTs7O0FBQ0UsUUFBRyxPQUFBLEtBQVcsSUFBSSxDQUFKLFdBQUEsQ0FBaUIsT0FBTyxDQUF0QyxPQUFjLENBQWQsRUFBQTtBQUNFLGFBQ0U7QUFBQSxRQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsUUFBQSxHQUFBLEVBQUssT0FBTyxDQURaLFdBQUE7QUFFQSxRQUFBLE9BQUEsRUFBUyxJQUFJLENBQUosV0FBQSxDQUFBLGNBQUE7QUFGVCxPQURGOztBQUZKOztTQU1BLEtBQUEsQztBQVJpQixDQUFuQjs7QUFVQSwwQkFBQSxlQUFBLEdBQWtCLGdCQUFBLElBQUEsRUFBQTtBQUNsQixNQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUE7QUFBRSxHQUFBO0FBQUEsSUFBQTtBQUFBLE1BQWdCLE1BQU0sR0FBRyxDQUFDLE1BQUosQ0FBQSxzQkFBQSxDQUFrQztBQUFBLElBQUEsWUFBQSxFQUFjO0FBQWQsR0FBbEMsQ0FBdEI7QUFDQSxFQUFBLE1BQUEsR0FBUyxLQUFBLENBQVQ7QUFDQSxFQUFBLEdBQUEsR0FBTSxDQUFOOztBQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBOzs7QUFDRSxRQUFHLE9BQU8sQ0FBUCxPQUFBLEtBQUgsU0FBQSxFQUFBO0FBQ0UsTUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFKLFdBQUEsQ0FBaUIsT0FBTyxDQUF4QixPQUFBLENBQVY7O0FBQ0EsVUFBRyxPQUFBLElBQUgsR0FBQSxFQUFBO0FBQ0UsUUFBQSxHQUFBLEdBQU0sT0FBTjtBQUNBLFFBQUEsTUFBQSxHQUZGLE9BRUU7QUFKSjtBQUFBLEtBQUEsTUFBQTtBQU1FLE1BQUEsTUFBQSxHQU5GLE9BTUU7O0FBUEo7O0FBUUEsTUFBRyxNQUFBLElBQUgsSUFBQSxFQUFBO1dBQ0U7QUFBQSxNQUFBLENBQUEsRUFBQSxNQUFBO0FBQ0EsTUFBQSxHQUFBLEVBQUssTUFBTSxDQURYLFdBQUE7QUFFQSxNQUFBLE9BQUEsRUFBUztBQUZULEs7O0FBYmMsQ0FBbEI7O0FBaUJBLDZCQUFBLGtCQUFBLEdBQXFCLGdCQUFBLElBQUEsRUFBQTtTQUFVLENBQUUsTUFBTSxlQUFBLENBQVIsSUFBUSxDQUFSLEVBQStCLEc7QUFBekMsQ0FBckI7O0FBRUEsdUJBQUEsWUFBQSxHQUFlLGtCQUFmOztBQUVBLGtDQUFBLHVCQUFBLEdBQTBCLGdCQUFBLElBQUEsRUFBQTtTQUNwQixDQUFFLE1BQU0sWUFBQSxDQUFSLElBQVEsQ0FBUixFQUFBLEtBQUEsQ0FBRixHQUFFLENBQUYsQ0FBeUMsS0FBekMsQ0FBeUMsQ0FBekMsRUFBeUMsQ0FBQSxDQUF6QyxFQUFGLElBQUUsQ0FBRixHQUFFLEM7QUFEc0IsQ0FBMUI7O0FBR0EsUUFBQSxHQUNFO0FBQUEsRUFBQSxNQUFBLEVBQUEsc0JBQUE7QUFDQSxFQUFBLElBQUEsRUFEQSxrRUFBQTtBQUVBLEVBQUEsTUFBQSxFQUZBLEdBQUE7QUFBQTtBQUdBLEVBQUEsT0FBQSxFQUhBLENBQUE7QUFBQTtBQUlBLEVBQUEsT0FBQSxFQUpBLDRCQUFBO0FBS0EsRUFBQSxPQUFBLEVBQVM7QUFMVCxDQURGOztBQVFBLHdCQUFBLGFBQUEsR0FBZ0IsZ0JBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxhQUFBLEVBQUE7QUFFaEIsTUFBQSxjQUFBLEVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxPQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQTs7QUFBRSxHQUFBO0FBQUEsSUFBQSxJQUFBO0FBQUEsSUFBQSxPQUFBO0FBQUEsSUFBQSxPQUFBO0FBQUEsSUFBQSxNQUFBO0FBQUEsSUFBQSxNQUFBO0FBQUEsSUFBQSxPQUFBO0FBQUEsSUFBQTtBQUFBLE1BUUksRUFBRSxHQUFGLFFBQUE7QUFBZSxPQVJuQjtBQVFJLEdBUko7QUFVQSxFQUFBLGNBQUEsR0FDRTtBQUFBLElBQUEsWUFBQSxFQUFBLElBQUE7QUFDQSxJQUFBLE9BQUEsRUFEQSxPQUFBO0FBRUEsSUFBQSxPQUFBLEVBRkEsT0FBQTtBQUdBLElBQUEsVUFBQSxFQUhBLE1BQUE7QUFJQSxJQUFBLE9BQUEsRUFKQSxPQUFBO0FBS0EsSUFBQSxhQUFBLEVBQWU7QUFBQSxNQUFBLElBQUEsRUFBTTtBQUFOLEtBTGY7QUFNQSxJQUFBLElBQUEsRUFBTTtBQU5OLEdBREYsQ0FaYyxDOzs7QUF3QmQsTUFBRyxNQUFNLFNBQUEsQ0FBVCxJQUFTLENBQVQsRUFBQTtBQUVFLFVBQU0sR0FBRyxDQUFDLE1BQUosQ0FBQSxrQkFBQSxDQUNKO0FBQUEsTUFBQSxZQUFBLEVBQUEsSUFBQTtBQUNBLE1BQUEsT0FBQSxFQURBLEtBQUE7QUFFQSxNQUFBLE9BQUEsRUFBUztBQUZULEtBREksQ0FBTjtBQUtBLFVBQU0sWUFBQSxDQUFBLElBQUEsQ0FBTjtBQUVBLFVBQU0sR0FBRyxDQUFDLE1BQUosQ0FBQSwyQkFBQSxDQUFBLGNBQUEsQ0FBTjtXQUVBLFlBQUEsQ0FYRixJQVdFLEM7QUFYRixHQUFBLE1BQUE7QUFlRSxVQUFNLEdBQUcsQ0FBQyxNQUFKLENBQUEsY0FBQSxDQUEwQixFQUM5QixHQUQ4QixjQUFBO0FBRTlCLE1BQUEsSUFBQSxFQUFNO0FBQUEsUUFBQSxPQUFBLEVBQVM7QUFBVDtBQUZ3QixLQUExQixDQUFOO1dBS0EsWUFBQSxDQXBCRixJQW9CRSxDOztBQTVDWSxDQUFoQjs7QUE4Q0Esd0JBQUEsYUFBQSxHQUFnQixnQkFBQSxJQUFBLEVBQUE7QUFDaEIsTUFBQSxNQUFBO0FBQUUsRUFBQSxNQUFBLEdBQVMsTUFBTSxHQUFHLENBQUMsTUFBSixDQUFBLGNBQUEsQ0FBMEI7QUFBQSxJQUFBLFlBQUEsRUFBYztBQUFkLEdBQTFCLENBQWY7U0FDQTtBQUFBLElBQUEsQ0FBQSxFQUFBLE1BQUE7QUFDQSxJQUFBLEdBQUEsRUFBSyxNQUFNLENBRFgsV0FBQTtBQUVBLElBQUEsT0FBQSxFQUFTLElBQUksQ0FBSixXQUFBLENBQWlCLE1BQU0sQ0FBdkIsT0FBQTtBQUZULEc7QUFGYyxDQUFoQjs7QUFNQSx1QkFBQSxZQUFBLEdBQWUsVUFBQSxJQUFBLEVBQUE7U0FDYixHQUFHLENBQUMsTUFBSixDQUFBLGNBQUEsQ0FBMEI7QUFBQSxJQUFBLFlBQUEsRUFBYztBQUFkLEdBQTFCLEM7QUFEYSxDQUFmOztBQUdBLGFBQUEsR0FBZ0IsVUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNoQixNQUFBLFVBQUE7QUFBRSxFQUFBLFVBQUEsR0FBYTtBQUFBLElBQUEsWUFBQSxFQUFjO0FBQWQsR0FBYjtBQUNBLEVBQUEsVUFBVSxDQUFWLGNBQUEsR0FBK0IsSUFBSCxHQUFBLGlCQUFBLEdBQW9DLE9BQWhFOztBQUVBLE1BQUcsS0FBQSxJQUFILElBQUEsRUFBQTtBQUNFLElBQUEsVUFBVSxDQUFWLE9BQUEsR0FBcUIsSUFBSSxDQUFKLFNBQUEsQ0FEdkIsS0FDdUIsQ0FBckI7OztTQUdGLEdBQUcsQ0FBQyxNQUFKLENBQUEsTUFBQSxDQUFBLFVBQUEsQztBQVJjLENBQWhCOztBQVVBLHVCQUFBLFlBQUEsR0FBZSxVQUFBLElBQUEsRUFBQSxLQUFBLEVBQUE7U0FBaUIsYUFBQSxDQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxDO0FBQWpCLENBQWY7O0FBQ0EsMkJBQUEsZ0JBQUEsR0FBbUIsVUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBO1NBQWlCLGFBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsQztBQUFqQixDQUFuQjs7QUFFQSxzQkFBQSxXQUFBLEdBQWMsZ0JBQUEsSUFBQSxFQUFBO0FBQ2QsTUFBQSxtQkFBQSxFQUFBLFVBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUE7QUFBRSxFQUFBLE9BQUEsR0FBVSxFQUFWO0FBQ0EsRUFBQSxJQUFBLEdBQU8sS0FBQSxDQUFQOztBQUNBLFNBQUEsSUFBQSxFQUFBO0FBQ0UsSUFBQSxNQUFBLEdBQVMsTUFBTSxHQUFHLENBQUMsTUFBSixDQUFBLHVCQUFBLENBQ2I7QUFBQSxNQUFBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsTUFBQSxNQUFBLEVBQVE7QUFEUixLQURhLENBQWY7QUFJQSxLQUFBO0FBQUEsTUFBQSxtQkFBQTtBQUFBLE1BQUE7QUFBQSxRQUFBLE1BQUE7QUFFQSxJQUFBLElBQUEsR0FBTyxVQUFQO0FBQ0EsSUFBQSxPQUFPLENBQVAsSUFBQSxDQUFhLEdBQWIsbUJBQUE7O0FBQ0EsUUFBSSxJQUFBLElBQUosSUFBQSxFQUFBO0FBQ0UsYUFERixPQUNFOztBQVZKO0FBSFksQ0FBZDs7QUFlQSx1QkFBQSxZQUFBLEdBQWUsZ0JBQUEsTUFBQSxFQUFBO0FBQ2IsU0FBQSxNQUFNLEdBQUcsQ0FBQyxNQUFKLENBQUEsd0JBQUEsQ0FBb0M7QUFBQSxJQUFBLElBQUEsRUFBTSxNQUFNLENBQUM7QUFBYixHQUFwQyxDQUFOO0FBRGEsQ0FBZjs7QUFHQSx3QkFBQSxhQUFBLEdBQWdCLGdCQUFBLElBQUEsRUFBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBO0FBQUUsRUFBQSxPQUFBLEdBQVUsTUFBTSxXQUFBLENBQU4sSUFBTSxDQUFoQjtBQUNBLEVBQUEsUUFBQSxHQUFBLEVBQUE7O0FBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7O2FBQ0UsSSxDQUFBLE1BQU0sWUFBQSxDQUFOLE1BQU0sQztBQURSOzs7QUFGYyxDQUFoQjs7QUFLQSxhQUFBLEdBQWdCLGdCQUFBLE1BQUEsRUFBQTtBQUNkLFNBQUEsTUFBTSxHQUFHLENBQUMsTUFBSixDQUFBLHdCQUFBLENBQU4sTUFBTSxDQUFOO0FBRGMsQ0FBaEI7O0FBR0EsdUJBQUEsWUFBQSxHQUFlLGdCQUFBLE1BQUEsRUFBUyxRQUFBLEdBQVQsR0FBQSxFQUFBO0FBQ2IsTUFBQTtBQUNFLFdBQUEsTUFBTSxhQUFBLENBRFIsTUFDUSxDQUFOO0FBQ0YsR0FGQSxDQUVBLE9BQUEsTUFBQSxFQUFBO0FBQ0UsSUFBQSxRQUFBLElBQVksQ0FBWjtBQUNBLFVBQU0sSUFBSSxDQUFKLEtBQUEsQ0FBQSxRQUFBLENBQU47QUFDQSxXQUFBLE1BQU0sWUFBQSxDQUFBLE1BQUEsRUFIUixRQUdRLENBQU47O0FBTlcsQ0FBZjs7QUFRQSx3QkFBQSxhQUFBLEdBQWdCLGdCQUFBLE9BQUEsRUFBQTtBQUNoQixNQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsUUFBQSxFQUFBLE1BQUE7QUFBRSxFQUFBLFFBQUEsR0FBQSxFQUFBOztBQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBOzthQUNFLEksQ0FBQSxNQUFNLFlBQUEsQ0FBTixNQUFNLEM7QUFEUjs7O0FBRGMsQ0FBaEI7O0FBSUEscUJBQUEsVUFBQSxHQUFhLGdCQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7QUFDWCxRQUFNLGFBQUEsQ0FBQSxJQUFBLENBQU47QUFDQSxTQUFBLE1BQU0sYUFBQSxDQUFOLE9BQU0sQ0FBTjtBQUZXLENBQWIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ3J5cHRvIGZyb20gXCJjcnlwdG9cIlxuaW1wb3J0ICogYXMgTGFtYmRhIGZyb20gXCJAYXdzLXNkay9jbGllbnQtbGFtYmRhXCJcbmltcG9ydCAqIGFzIFMzIGZyb20gXCJAYXdzLXNkay9jbGllbnQtczNcIlxuaW1wb3J0ICogYXMgVGV4dCBmcm9tIFwiQGRhc2hraXRlL2pveS90ZXh0XCJcbmltcG9ydCAqIGFzIFRpbWUgZnJvbSBcIkBkYXNoa2l0ZS9qb3kvdGltZVwiXG5pbXBvcnQgeyBsaWZ0IH0gZnJvbSBcIi4vaGVscGVyc1wiXG5cbkFXUyA9XG4gIExhbWJkYTogbGlmdCBMYW1iZGFcbiAgUzM6IGxpZnQgUzNcblxubWQ1ID0gKGJ1ZmZlcikgLT5cbiAgQ3J5cHRvLmNyZWF0ZUhhc2goJ21kNScpLnVwZGF0ZShidWZmZXIpLmRpZ2VzdChcImJhc2U2NFwiKVxuXG5oYXNMYW1iZGEgPSAobmFtZSkgLT4gKGF3YWl0IGdldExhbWJkYSBuYW1lKT9cblxuZ2V0TGFtYmRhID0gKG5hbWUpIC0+XG4gIHRyeVxuICAgIGxhbWJkYSA9IGF3YWl0IEFXUy5MYW1iZGEuZ2V0RnVuY3Rpb24gRnVuY3Rpb25OYW1lOiBuYW1lXG4gICAgXzogbGFtYmRhXG4gICAgYXJuOiBsYW1iZGEuQ29uZmlndXJhdGlvbi5GdW5jdGlvbkFyblxuICAgIHN0YXRlOiBsYW1iZGEuQ29uZmlndXJhdGlvbi5TdGF0ZVxuICAgIGxhc3RTdGF0dXM6IGxhbWJkYS5Db25maWd1cmF0aW9uLkxhc3RVcGRhdGVTdGF0dXNcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiAvUmVzb3VyY2VOb3RGb3VuZEV4Y2VwdGlvbi8udGVzdCBlcnJvci50b1N0cmluZygpXG4gICAgICB1bmRlZmluZWRcbiAgICBlbHNlXG4gICAgICB0aHJvdyBlcnJvclxuXG4jIEFXUyBhZGRlZCBpbnRlcm5hbCBzdGF0ZSBtYW5hZ2VtZW50IHRvIExhbWJkYSBpbiBhbiBlZmZvcnQgdG8gaW1wcm92ZSB0aGUgcGVyZm9ybWFuY2VcbiMgb2YgdGhlIGludm9jYXRpb24gY3ljbGUuIFRoaXMgaXMgYSBicm9hZCBoZWxwZXIgdG8gd2FpdCB1bnRpbCB0aGUgbGFtYmRhIGlzIHJlYWR5XG4jIHRvIGdvIGFuZCBhY2NlcHQgbW9yZSBjaGFuZ2VzIHRvIGl0cyBzdGF0ZS5cbndhaXRGb3JSZWFkeSA9IChuYW1lKSAtPlxuICBsb29wXG4gICAgeyBzdGF0ZSwgbGFzdFN0YXR1cyB9ID0gYXdhaXQgZ2V0TGFtYmRhIG5hbWVcbiAgICBpZiAoIHN0YXRlID09IFwiQWN0aXZlXCIgKSAmJiAoIGxhc3RTdGF0dXMgPT0gXCJTdWNjZXNzZnVsXCIgKVxuICAgICAgYnJlYWtcbiAgICBlbHNlIGlmIHN0YXRlID09IFwiRmFpbGVkXCJcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIkxhbWJkYSBbICN7bmFtZX0gXSBTdGF0ZSBpcyBGYWlsZWQuXCJcbiAgICBlbHNlIGlmIGxhc3RTdGF0dXMgPT0gXCJGYWlsZWRcIlxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiTGFtYmRhIFsgI3tuYW1lfSBdIExhc3RVcGRhdGVTdGF0dXMgaXMgRmFpbGVkLlwiXG4gICAgZWxzZVxuICAgICAgYXdhaXQgVGltZS5zbGVlcCAxMDAwXG5cbmdldExhbWJkYVZlcnNpb24gPSAobmFtZSwgdmVyc2lvbikgLT5cbiAgeyBWZXJzaW9ucyB9ICA9IGF3YWl0IEFXUy5MYW1iZGEubGlzdFZlcnNpb25zQnlGdW5jdGlvbiBGdW5jdGlvbk5hbWU6IG5hbWVcbiAgZm9yIGN1cnJlbnQgaW4gVmVyc2lvbnNcbiAgICBpZiB2ZXJzaW9uID09IFRleHQucGFyc2VOdW1iZXIgY3VycmVudC5WZXJzaW9uXG4gICAgICByZXR1cm5cbiAgICAgICAgXzogY3VycmVudFxuICAgICAgICBhcm46IGN1cnJlbnQuRnVuY3Rpb25Bcm5cbiAgICAgICAgdmVyc2lvbjogVGV4dC5wYXJzZU51bWJlciBjdXJyZW50VmVyc2lvblxuICB1bmRlZmluZWRcblxuZ2V0TGF0ZXN0TGFtYmRhID0gKG5hbWUpIC0+XG4gIHsgVmVyc2lvbnMgfSAgPSBhd2FpdCBBV1MuTGFtYmRhLmxpc3RWZXJzaW9uc0J5RnVuY3Rpb24gRnVuY3Rpb25OYW1lOiBuYW1lXG4gIHJlc3VsdCA9IHVuZGVmaW5lZFxuICBtYXggPSAwXG4gIGZvciBjdXJyZW50IGluIFZlcnNpb25zXG4gICAgaWYgY3VycmVudC5WZXJzaW9uICE9IFwiJExBVEVTVFwiXG4gICAgICB2ZXJzaW9uID0gVGV4dC5wYXJzZU51bWJlciBjdXJyZW50LlZlcnNpb25cbiAgICAgIGlmIHZlcnNpb24gPj0gbWF4XG4gICAgICAgIG1heCA9IHZlcnNpb25cbiAgICAgICAgcmVzdWx0ID0gY3VycmVudFxuICAgIGVsc2VcbiAgICAgIHJlc3VsdCA9IGN1cnJlbnRcbiAgaWYgcmVzdWx0P1xuICAgIF86IHJlc3VsdFxuICAgIGFybjogcmVzdWx0LkZ1bmN0aW9uQXJuXG4gICAgdmVyc2lvbjogbWF4XG5cbmdldExhdGVzdExhbWJkYUFSTiA9IChuYW1lKSAtPiAoIGF3YWl0IGdldExhdGVzdExhbWJkYSBuYW1lICkuYXJuXG5cbmdldExhbWJkYUFSTiA9IGdldExhdGVzdExhbWJkYUFSTlxuXG5nZXRMYW1iZGFVbnF1YWxpZmllZEFSTiA9IChuYW1lKSAtPlxuICAoICggKCBhd2FpdCBnZXRMYW1iZGFBUk4gbmFtZSApLnNwbGl0IFwiOlwiIClbLi4tMl0gKS5qb2luIFwiOlwiXG5cbmRlZmF1bHRzID1cbiAgYnVja2V0OiBcImRvbG9yZXMuZGFzaGtpdGUuY29tXCJcbiAgcm9sZTogXCJhcm46YXdzOmlhbTo6YXdzOnBvbGljeS9zZXJ2aWNlLXJvbGUvQVdTTGFtYmRhQmFzaWNFeGVjdXRpb25Sb2xlXCJcbiAgbWVtb3J5OiAxMjggIyBtYXggc2l6ZSBmb3IgZWRnZSBsYW1iZGFzXG4gIHRpbWVvdXQ6IDUgIyBtYXggdGltZW91dCBmb3IgZWRnZSBsYW1iZGFzXG4gIGhhbmRsZXI6IFwiYnVpbGQvbGFtYmRhL2luZGV4LmhhbmRsZXJcIlxuICBydW50aW1lOiBcIm5vZGVqczE4LnhcIlxuXG5wdWJsaXNoTGFtYmRhID0gKG5hbWUsIGRhdGEsIGNvbmZpZ3VyYXRpb24pIC0+XG5cbiAgeyBcbiAgICByb2xlXG4gICAgaGFuZGxlclxuICAgIHJ1bnRpbWVcbiAgICBidWNrZXRcbiAgICBtZW1vcnlcbiAgICB0aW1lb3V0XG4gICAgZW52aXJvbm1lbnRcbiAgfSA9IHsgZGVmYXVsdHMuLi4sIGNvbmZpZ3VyYXRpb24uLi4gfVxuXG4gIF9jb25maWd1cmF0aW9uID1cbiAgICBGdW5jdGlvbk5hbWU6IG5hbWVcbiAgICBIYW5kbGVyOiBoYW5kbGVyXG4gICAgUnVudGltZTogcnVudGltZVxuICAgIE1lbW9yeVNpemU6IG1lbW9yeVxuICAgIFRpbWVvdXQ6IHRpbWVvdXRcbiAgICBUcmFjaW5nQ29uZmlnOiBNb2RlOiBcIlBhc3NUaHJvdWdoXCJcbiAgICBSb2xlOiByb2xlXG5cbiAgIyBpZiBlbnZpcm9ubWVudD9cbiAgIyAgIF9jb25maWd1cmF0aW9uLkVudmlyb25tZW50ID0gVmFyaWFibGVzOiBlbnZpcm9ubWVudFxuXG4gIGlmIGF3YWl0IGhhc0xhbWJkYSBuYW1lXG5cbiAgICBhd2FpdCBBV1MuTGFtYmRhLnVwZGF0ZUZ1bmN0aW9uQ29kZVxuICAgICAgRnVuY3Rpb25OYW1lOiBuYW1lXG4gICAgICBQdWJsaXNoOiBmYWxzZVxuICAgICAgWmlwRmlsZTogZGF0YVxuXG4gICAgYXdhaXQgd2FpdEZvclJlYWR5IG5hbWVcbiAgICBcbiAgICBhd2FpdCBBV1MuTGFtYmRhLnVwZGF0ZUZ1bmN0aW9uQ29uZmlndXJhdGlvbiBfY29uZmlndXJhdGlvblxuXG4gICAgd2FpdEZvclJlYWR5IG5hbWVcblxuICBlbHNlXG5cbiAgICBhd2FpdCBBV1MuTGFtYmRhLmNyZWF0ZUZ1bmN0aW9uIHtcbiAgICAgIF9jb25maWd1cmF0aW9uLi4uXG4gICAgICBDb2RlOiBaaXBGaWxlOiBkYXRhXG4gICAgfVxuXG4gICAgd2FpdEZvclJlYWR5IG5hbWVcblxudmVyc2lvbkxhbWJkYSA9IChuYW1lKSAtPlxuICByZXN1bHQgPSBhd2FpdCBBV1MuTGFtYmRhLnB1Ymxpc2hWZXJzaW9uIEZ1bmN0aW9uTmFtZTogbmFtZVxuICBfOiByZXN1bHRcbiAgYXJuOiByZXN1bHQuRnVuY3Rpb25Bcm5cbiAgdmVyc2lvbjogVGV4dC5wYXJzZU51bWJlciByZXN1bHQuVmVyc2lvblxuXG5kZWxldGVMYW1iZGEgPSAobmFtZSkgLT5cbiAgQVdTLkxhbWJkYS5kZWxldGVGdW5jdGlvbiBGdW5jdGlvbk5hbWU6IG5hbWVcblxuX2ludm9rZUxhbWJkYSA9IChuYW1lLCBzeW5jLCBpbnB1dCkgLT5cbiAgcGFyYW1ldGVycyA9IEZ1bmN0aW9uTmFtZTogbmFtZVxuICBwYXJhbWV0ZXJzLkludm9jYXRpb25UeXBlID0gaWYgc3luYyB0aGVuIFwiUmVxdWVzdFJlc3BvbnNlXCIgZWxzZSBcIkV2ZW50XCJcblxuICBpZiBpbnB1dD9cbiAgICBwYXJhbWV0ZXJzLlBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSBpbnB1dFxuXG5cbiAgQVdTLkxhbWJkYS5pbnZva2UgcGFyYW1ldGVyc1xuXG5pbnZva2VMYW1iZGEgPSAobmFtZSwgaW5wdXQpIC0+IF9pbnZva2VMYW1iZGEgbmFtZSwgZmFsc2UsIGlucHV0XG5zeW5jSW52b2tlTGFtYmRhID0gKG5hbWUsIGlucHV0KSAtPiBfaW52b2tlTGFtYmRhIG5hbWUsIHRydWUsIGlucHV0XG5cbmxpc3RTb3VyY2VzID0gKG5hbWUpIC0+XG4gIHJlc3VsdHMgPSBbXVxuICBuZXh0ID0gdW5kZWZpbmVkXG4gIHdoaWxlIHRydWVcbiAgICByZXN1bHQgPSBhd2FpdCBBV1MuTGFtYmRhLmxpc3RFdmVudFNvdXJjZU1hcHBpbmdzXG4gICAgICBGdW5jdGlvbk5hbWU6IG5hbWVcbiAgICAgIE1hcmtlcjogbmV4dFxuXG4gICAgeyBFdmVudFNvdXJjZU1hcHBpbmdzLCBOZXh0TWFya2VyIH0gPSByZXN1bHRcblxuICAgIG5leHQgPSBOZXh0TWFya2VyXG4gICAgcmVzdWx0cy5wdXNoIEV2ZW50U291cmNlTWFwcGluZ3MuLi5cbiAgICBpZiAhbmV4dD9cbiAgICAgIHJldHVybiByZXN1bHRzXG5cbmRlbGV0ZVNvdXJjZSA9IChzb3VyY2UpIC0+XG4gIGF3YWl0IEFXUy5MYW1iZGEuZGVsZXRlRXZlbnRTb3VyY2VNYXBwaW5nIFVVSUQ6IHNvdXJjZS5VVUlEXG5cbmRlbGV0ZVNvdXJjZXMgPSAobmFtZSkgLT5cbiAgc291cmNlcyA9IGF3YWl0IGxpc3RTb3VyY2VzIG5hbWVcbiAgZm9yIHNvdXJjZSBpbiBzb3VyY2VzXG4gICAgYXdhaXQgZGVsZXRlU291cmNlIHNvdXJjZVxuXG5fY3JlYXRlU291cmNlID0gKHNvdXJjZSkgLT5cbiAgYXdhaXQgQVdTLkxhbWJkYS5jcmVhdGVFdmVudFNvdXJjZU1hcHBpbmcgc291cmNlXG5cbmNyZWF0ZVNvdXJjZSA9IChzb3VyY2UsIGR1cmF0aW9uID0gMTI1KSAtPlxuICB0cnlcbiAgICBhd2FpdCBfY3JlYXRlU291cmNlIHNvdXJjZVxuICBjYXRjaFxuICAgIGR1cmF0aW9uICo9IDJcbiAgICBhd2FpdCBUaW1lLnNsZWVwIGR1cmF0aW9uXG4gICAgYXdhaXQgY3JlYXRlU291cmNlIHNvdXJjZSwgZHVyYXRpb25cblxuY3JlYXRlU291cmNlcyA9IChzb3VyY2VzKSAtPlxuICBmb3Igc291cmNlIGluIHNvdXJjZXNcbiAgICBhd2FpdCBjcmVhdGVTb3VyY2Ugc291cmNlXG5cbnB1dFNvdXJjZXMgPSAobmFtZSwgc291cmNlcykgLT5cbiAgYXdhaXQgZGVsZXRlU291cmNlcyBuYW1lXG4gIGF3YWl0IGNyZWF0ZVNvdXJjZXMgc291cmNlc1xuICBcblxuZXhwb3J0IHtcbiAgaGFzTGFtYmRhXG4gIGdldExhbWJkYVxuICB3YWl0Rm9yUmVhZHlcbiAgZ2V0TGFtYmRhVmVyc2lvblxuICBnZXRMYXRlc3RMYW1iZGFcbiAgZ2V0TGF0ZXN0TGFtYmRhQVJOXG4gIGdldExhbWJkYUFSTlxuICBnZXRMYW1iZGFVbnF1YWxpZmllZEFSTlxuICBwdWJsaXNoTGFtYmRhXG4gIHZlcnNpb25MYW1iZGFcbiAgZGVsZXRlTGFtYmRhXG4gIGludm9rZUxhbWJkYVxuICBzeW5jSW52b2tlTGFtYmRhXG4gIGxpc3RTb3VyY2VzXG4gIGRlbGV0ZVNvdXJjZXNcbiAgZGVsZXRlU291cmNlXG4gIGNyZWF0ZVNvdXJjZXNcbiAgY3JlYXRlU291cmNlXG4gIHB1dFNvdXJjZXNcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/lambda.coffee