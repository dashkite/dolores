"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startStepFunction = exports.hasStepFunction = exports.haltStepFunction = exports.getStepFunctionARN = exports.getStepFunction = exports.deleteStepFunction = exports.createStepFunction = void 0;

var StepFunction = _interopRequireWildcard(require("@aws-sdk/client-sfn"));

var STS = _interopRequireWildcard(require("@aws-sdk/client-sts"));

var _helpers = require("./helpers.js");

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _stack = require("./stack.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AWS, createStepFunction, deleteStepFunction, getStepFunction, getStepFunctionARN, haltStepFunction, hasStepFunction, startStepFunction;
exports.startStepFunction = startStepFunction;
exports.hasStepFunction = hasStepFunction;
exports.haltStepFunction = haltStepFunction;
exports.getStepFunctionARN = getStepFunctionARN;
exports.getStepFunction = getStepFunction;
exports.deleteStepFunction = deleteStepFunction;
exports.createStepFunction = createStepFunction;
AWS = {
  StepFunction: (0, _helpers.lift)(StepFunction),
  STS: (0, _helpers.lift)(STS)
};

exports.createStepFunction = createStepFunction = async function ({
  name,
  dictionary,
  resources,
  description
}) {
  var _template, account, arn;

  account = (await AWS.STS.getCallerIdentity()).Account; // TODO make the region dynamic?

  arn = `arn:aws:states:us-east-1:${account}:stateMachine:${name}`;
  _template = {
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Create step function [ ${name} ]`,
    Resources: {
      StatesExecutionRole: {
        Type: "AWS::IAM::Role",
        Properties: {
          AssumeRolePolicyDocument: {
            Version: "2012-10-17",
            Statement: [{
              Effect: "Allow",
              Principal: {
                Service: ["states.amazonaws.com"]
              },
              Action: "sts:AssumeRole"
            }]
          },
          Path: "/",
          Policies: [{
            PolicyName: "StatesExecutionPolicy",
            PolicyDocument: {
              Version: "2012-10-17",
              Statement: [{
                Effect: "Allow",
                Action: ["lambda:InvokeFunction"],
                Resource: resources.lambdas
              }, {
                Effect: "Allow",
                Action: ["states:startExecution"],
                Resource: [arn, ...resources.stepFunctions]
              }, {
                Effect: "Allow",
                Action: ["states:DescribeExecution", "states:StopExecution"],
                Resource: '*'
              }, {
                Effect: "Allow",
                Action: ["events:PutTargets", "events:PutRule", "events:DescribeRule"],
                Resource: [`arn:aws:events:us-east-1:${account}:rule/StepFunctionsGetEventsForStepFunctionsExecutionRule`]
              }]
            }
          }]
        }
      },
      StateMachine: {
        Type: "AWS::StepFunctions::StateMachine",
        Properties: {
          DefinitionString: JSON.stringify(description),
          DefinitionSubstitutions: { ...dictionary,
            self: arn
          },
          RoleArn: {
            "Fn::GetAtt": ["StatesExecutionRole", "Arn"]
          },
          StateMachineName: name,
          StateMachineType: "STANDARD"
        }
      }
    }
  };
  return (0, _stack.deployStack)(`${name}-sf`, _jsYaml.default.dump(_template));
};

exports.deleteStepFunction = deleteStepFunction = function (name) {
  return (0, _stack.deleteStack)(`${name}-sf`);
};

exports.getStepFunction = getStepFunction = async function (name) {
  var machine, stateMachines;
  ({
    stateMachines
  } = await AWS.StepFunction.listStateMachines());
  machine = stateMachines.find(function (machine) {
    return machine.name === name;
  });

  if (machine != null) {
    return {
      _: machine,
      arn: machine.stateMachineArn,
      name: machine.name
    };
  }
};

exports.hasStepFunction = hasStepFunction = async function (name) {
  return (await getStepFunction(name)) != null;
};

exports.getStepFunctionARN = getStepFunctionARN = async function (name) {
  var ref;
  return (ref = await getStepFunction(name)) != null ? ref.arn : void 0;
};

exports.startStepFunction = startStepFunction = async function (name, input) {
  var arn, parameters;

  if ((arn = await getStepFunctionARN(name)) != null) {
    parameters = input != null ? {
      stateMachineArn: arn,
      input: JSON.stringify(input)
    } : {
      stateMachineArn: arn
    };
    return AWS.StepFunction.startExecution(parameters);
  } else {
    throw new Error(`Step Function [ ${name} ] not found`);
  }
};

exports.haltStepFunction = haltStepFunction = async function (name) {
  var arn, execution, i, len, ref, response;

  if ((arn = await getStepFunctionARN(name)) != null) {
    response = await AWS.StepFunction.listExecutions({
      stateMachineArn: arn,
      statusFilter: "RUNNING"
    });
    ref = response.executions;

    for (i = 0, len = ref.length; i < len; i++) {
      execution = ref[i];
      AWS.StepFunction.stopExecution({
        executionArn: execution.executionArn
      });
    }

    if (response.nextToken != null) {
      throw new Error(`More executions remain for step function [ ${name} ]`);
    }
  } else {
    throw new Error(`Step Function [ ${name} ] not found`);
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zdGVwLWZ1bmN0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFHQTs7Ozs7Ozs7OztBQUpBLElBQUEsR0FBQSxFQUFBLGtCQUFBLEVBQUEsa0JBQUEsRUFBQSxlQUFBLEVBQUEsa0JBQUEsRUFBQSxnQkFBQSxFQUFBLGVBQUEsRUFBQSxpQkFBQTs7Ozs7Ozs7QUFRQSxHQUFBLEdBQ0U7QUFBQSxFQUFBLFlBQUEsRUFBYyxtQkFBZCxZQUFjLENBQWQ7QUFDQSxFQUFBLEdBQUEsRUFBSyxtQkFBQSxHQUFBO0FBREwsQ0FERjs7QUFJQSw2QkFBQSxrQkFBQSxHQUFxQixnQkFBQztBQUFBLEVBQUEsSUFBQTtBQUFBLEVBQUEsVUFBQTtBQUFBLEVBQUEsU0FBQTtBQUFELEVBQUE7QUFBQyxDQUFELEVBQUE7QUFDckIsTUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUE7O0FBQUUsRUFBQSxPQUFBLEdBQVUsQ0FBRSxNQUFNLEdBQUcsQ0FBQyxHQUFKLENBQVIsaUJBQVEsRUFBUixFQUFaLE9BQUUsQ0FEbUIsQzs7QUFHbkIsRUFBQSxHQUFBLEdBQU0sNEJBQUEsT0FBQSxpQkFBQSxJQUFBLEVBQU47QUFDQSxFQUFBLFNBQUEsR0FDRTtBQUFBLElBQUEsd0JBQUEsRUFBQSxZQUFBO0FBQ0EsSUFBQSxXQUFBLEVBQWEsMEJBQUEsSUFEYixJQUFBO0FBRUEsSUFBQSxTQUFBLEVBQ0U7QUFBQSxNQUFBLG1CQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBQSxnQkFBQTtBQUNBLFFBQUEsVUFBQSxFQUNFO0FBQUEsVUFBQSx3QkFBQSxFQUNFO0FBQUEsWUFBQSxPQUFBLEVBQUEsWUFBQTtBQUNBLFlBQUEsU0FBQSxFQUFXLENBQ1A7QUFBQSxjQUFBLE1BQUEsRUFBQSxPQUFBO0FBQ0EsY0FBQSxTQUFBLEVBQ0U7QUFBQSxnQkFBQSxPQUFBLEVBQVMsQ0FBQSxzQkFBQTtBQUFULGVBRkY7QUFHQSxjQUFB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U0FBQSxJQUFILElBQUEsRUFBQTtBQUNFLFlBQU0sSUFBQSxLQUFBLENBQVUsOENBQUEsSUFEbEIsSUFDUSxDQUFOO0FBUko7QUFBQSxHQUFBLE1BQUE7QUFVRSxVQUFNLElBQUEsS0FBQSxDQUFVLG1CQUFBLElBVmxCLGNBVVEsQ0FBTjs7QUFYZSxDQUFuQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIFN0ZXBGdW5jdGlvbiBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXNmblwiXG5pbXBvcnQgKiBhcyBTVFMgZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1zdHNcIlxuaW1wb3J0IHsgbGlmdCB9IGZyb20gXCIuL2hlbHBlcnNcIlxuXG5pbXBvcnQgWUFNTCBmcm9tIFwianMteWFtbFwiXG5cbmltcG9ydCB7IGRlcGxveVN0YWNrLCBkZWxldGVTdGFjayB9IGZyb20gXCIuL3N0YWNrXCJcblxuQVdTID1cbiAgU3RlcEZ1bmN0aW9uOiBsaWZ0IFN0ZXBGdW5jdGlvblxuICBTVFM6IGxpZnQgU1RTXG5cbmNyZWF0ZVN0ZXBGdW5jdGlvbiA9ICh7IG5hbWUsIGRpY3Rpb25hcnksIHJlc291cmNlcywgZGVzY3JpcHRpb24gfSkgLT5cbiAgYWNjb3VudCA9ICggYXdhaXQgQVdTLlNUUy5nZXRDYWxsZXJJZGVudGl0eSgpICkuQWNjb3VudFxuICAjIFRPRE8gbWFrZSB0aGUgcmVnaW9uIGR5bmFtaWM/XG4gIGFybiA9IFwiYXJuOmF3czpzdGF0ZXM6dXMtZWFzdC0xOiN7YWNjb3VudH06c3RhdGVNYWNoaW5lOiN7bmFtZX1cIlxuICBfdGVtcGxhdGUgPVxuICAgIEFXU1RlbXBsYXRlRm9ybWF0VmVyc2lvbjogXCIyMDEwLTA5LTA5XCJcbiAgICBEZXNjcmlwdGlvbjogXCJDcmVhdGUgc3RlcCBmdW5jdGlvbiBbICN7bmFtZX0gXVwiXG4gICAgUmVzb3VyY2VzOlxuICAgICAgU3RhdGVzRXhlY3V0aW9uUm9sZTpcbiAgICAgICAgVHlwZTogXCJBV1M6OklBTTo6Um9sZVwiXG4gICAgICAgIFByb3BlcnRpZXM6XG4gICAgICAgICAgQXNzdW1lUm9sZVBvbGljeURvY3VtZW50OlxuICAgICAgICAgICAgVmVyc2lvbjogXCIyMDEyLTEwLTE3XCJcbiAgICAgICAgICAgIFN0YXRlbWVudDogW1xuICAgICAgICAgICAgICAgIEVmZmVjdDogXCJBbGxvd1wiXG4gICAgICAgICAgICAgICAgUHJpbmNpcGFsOlxuICAgICAgICAgICAgICAgICAgU2VydmljZTogWyBcInN0YXRlcy5hbWF6b25hd3MuY29tXCIgXVxuICAgICAgICAgICAgICAgIEFjdGlvbjogXCJzdHM6QXNzdW1lUm9sZVwiXG4gICAgICAgICAgICBdXG4gICAgICAgICAgUGF0aDogXCIvXCJcbiAgICAgICAgICBQb2xpY2llczogW1xuICAgICAgICAgICAgUG9saWN5TmFtZTogXCJTdGF0ZXNFeGVjdXRpb25Qb2xpY3lcIlxuICAgICAgICAgICAgUG9saWN5RG9jdW1lbnQ6XG4gICAgICAgICAgICAgIFZlcnNpb246IFwiMjAxMi0xMC0xN1wiXG4gICAgICAgICAgICAgIFN0YXRlbWVudDogW1xuICAgICAgICAgICAgICAgICAgRWZmZWN0OiBcIkFsbG93XCJcbiAgICAgICAgICAgICAgICAgIEFjdGlvbjogWyBcImxhbWJkYTpJbnZva2VGdW5jdGlvblwiIF1cbiAgICAgICAgICAgICAgICAgIFJlc291cmNlOiByZXNvdXJjZXMubGFtYmRhc1xuICAgICAgICAgICAgICAgICxcbiAgICAgICAgICAgICAgICAgIEVmZmVjdDogXCJBbGxvd1wiXG4gICAgICAgICAgICAgICAgICBBY3Rpb246IFsgXG4gICAgICAgICAgICAgICAgICAgIFwic3RhdGVzOnN0YXJ0RXhlY3V0aW9uXCIgXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICBSZXNvdXJjZTogWyBhcm4sIHJlc291cmNlcy5zdGVwRnVuY3Rpb25zLi4uIF1cbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIlxuICAgICAgICAgICAgICAgICAgQWN0aW9uOltcbiAgICAgICAgICAgICAgICAgICAgXCJzdGF0ZXM6RGVzY3JpYmVFeGVjdXRpb25cIlxuICAgICAgICAgICAgICAgICAgICBcInN0YXRlczpTdG9wRXhlY3V0aW9uXCJcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgIFJlc291cmNlOiAnKidcbiAgICAgICAgICAgICAgICAsXG4gICAgICAgICAgICAgICAgICBFZmZlY3Q6IFwiQWxsb3dcIlxuICAgICAgICAgICAgICAgICAgQWN0aW9uOltcbiAgICAgICAgICAgICAgICAgICAgXCJldmVudHM6UHV0VGFyZ2V0c1wiXG4gICAgICAgICAgICAgICAgICAgIFwiZXZlbnRzOlB1dFJ1bGVcIlxuICAgICAgICAgICAgICAgICAgICBcImV2ZW50czpEZXNjcmliZVJ1bGVcIlxuICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgUmVzb3VyY2U6IFtcbiAgICAgICAgICAgICAgICAgICAgXCJhcm46YXdzOmV2ZW50czp1cy1lYXN0LTE6I3thY2NvdW50fTpydWxlL1N0ZXBGdW5jdGlvbnNHZXRFdmVudHNGb3JTdGVwRnVuY3Rpb25zRXhlY3V0aW9uUnVsZVwiXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICBdXG4gICAgICBTdGF0ZU1hY2hpbmU6XG4gICAgICAgIFR5cGU6IFwiQVdTOjpTdGVwRnVuY3Rpb25zOjpTdGF0ZU1hY2hpbmVcIlxuICAgICAgICBQcm9wZXJ0aWVzOiBcbiAgICAgICAgICBEZWZpbml0aW9uU3RyaW5nOiBKU09OLnN0cmluZ2lmeSBkZXNjcmlwdGlvblxuICAgICAgICAgIERlZmluaXRpb25TdWJzdGl0dXRpb25zOiB7XG4gICAgICAgICAgICBkaWN0aW9uYXJ5Li4uXG4gICAgICAgICAgICBzZWxmOiBhcm5cbiAgICAgICAgICB9XG4gICAgICAgICAgUm9sZUFybjogXCJGbjo6R2V0QXR0XCI6IFsgXCJTdGF0ZXNFeGVjdXRpb25Sb2xlXCIgLCBcIkFyblwiIF1cbiAgICAgICAgICBTdGF0ZU1hY2hpbmVOYW1lOiBuYW1lXG4gICAgICAgICAgU3RhdGVNYWNoaW5lVHlwZTogXCJTVEFOREFSRFwiXG5cbiAgZGVwbG95U3RhY2sgXCIje25hbWV9LXNmXCIsIFlBTUwuZHVtcCBfdGVtcGxhdGVcblxuZGVsZXRlU3RlcEZ1bmN0aW9uID0gKCBuYW1lICkgLT4gZGVsZXRlU3RhY2sgXCIje25hbWV9LXNmXCJcblxuZ2V0U3RlcEZ1bmN0aW9uID0gKG5hbWUpIC0+XG4gIHsgc3RhdGVNYWNoaW5lcyB9ID0gYXdhaXQgQVdTLlN0ZXBGdW5jdGlvbi5saXN0U3RhdGVNYWNoaW5lcygpXG4gIG1hY2hpbmUgPSBzdGF0ZU1hY2hpbmVzLmZpbmQgKG1hY2hpbmUpIC0+IG1hY2hpbmUubmFtZSA9PSBuYW1lXG4gIGlmIG1hY2hpbmU/XG4gICAgXzogbWFjaGluZVxuICAgIGFybjogbWFjaGluZS5zdGF0ZU1hY2hpbmVBcm5cbiAgICBuYW1lOiBtYWNoaW5lLm5hbWVcblxuaGFzU3RlcEZ1bmN0aW9uID0gKCBuYW1lICkgLT4gKCBhd2FpdCBnZXRTdGVwRnVuY3Rpb24gbmFtZSApP1xuXG5nZXRTdGVwRnVuY3Rpb25BUk4gPSAobmFtZSkgLT4gKCBhd2FpdCBnZXRTdGVwRnVuY3Rpb24gbmFtZSApPy5hcm5cblxuc3RhcnRTdGVwRnVuY3Rpb24gPSAobmFtZSwgaW5wdXQpIC0+XG4gIGlmICggYXJuID0gYXdhaXQgZ2V0U3RlcEZ1bmN0aW9uQVJOIG5hbWUgKT9cbiAgICBwYXJhbWV0ZXJzID0gaWYgaW5wdXQ/XG4gICAgICBzdGF0ZU1hY2hpbmVBcm46IGFyblxuICAgICAgaW5wdXQ6IEpTT04uc3RyaW5naWZ5IGlucHV0XG4gICAgZWxzZVxuICAgICAgc3RhdGVNYWNoaW5lQXJuOiBhcm5cblxuICAgIEFXUy5TdGVwRnVuY3Rpb24uc3RhcnRFeGVjdXRpb24gcGFyYW1ldGVyc1xuXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJTdGVwIEZ1bmN0aW9uIFsgI3sgbmFtZSB9IF0gbm90IGZvdW5kXCJcblxuaGFsdFN0ZXBGdW5jdGlvbiA9IChuYW1lKSAtPlxuICBpZiAoIGFybiA9IGF3YWl0IGdldFN0ZXBGdW5jdGlvbkFSTiBuYW1lICk/XG4gICAgcmVzcG9uc2UgPSBhd2FpdCBBV1MuU3RlcEZ1bmN0aW9uLmxpc3RFeGVjdXRpb25zXG4gICAgICBzdGF0ZU1hY2hpbmVBcm46IGFyblxuICAgICAgc3RhdHVzRmlsdGVyOiBcIlJVTk5JTkdcIlxuICAgIGZvciBleGVjdXRpb24gaW4gcmVzcG9uc2UuZXhlY3V0aW9uc1xuICAgICAgQVdTLlN0ZXBGdW5jdGlvbi5zdG9wRXhlY3V0aW9uXG4gICAgICAgIGV4ZWN1dGlvbkFybjogZXhlY3V0aW9uLmV4ZWN1dGlvbkFyblxuICAgIGlmIHJlc3BvbnNlLm5leHRUb2tlbj9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIk1vcmUgZXhlY3V0aW9ucyByZW1haW4gZm9yIHN0ZXAgZnVuY3Rpb24gWyAje25hbWV9IF1cIlxuICBlbHNlXG4gICAgdGhyb3cgbmV3IEVycm9yIFwiU3RlcCBGdW5jdGlvbiBbICN7IG5hbWUgfSBdIG5vdCBmb3VuZFwiXG5cbmV4cG9ydCB7XG4gIGNyZWF0ZVN0ZXBGdW5jdGlvblxuICBkZWxldGVTdGVwRnVuY3Rpb25cbiAgZ2V0U3RlcEZ1bmN0aW9uXG4gIGhhc1N0ZXBGdW5jdGlvblxuICBoYWx0U3RlcEZ1bmN0aW9uXG4gIGdldFN0ZXBGdW5jdGlvbkFSTlxuICBzdGFydFN0ZXBGdW5jdGlvblxufSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/step-function.coffee