"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasRole = exports.getRoleARN = exports.getRole = exports.deleteRole = exports.createRole = void 0;

var _clientIam = require("@aws-sdk/client-iam");

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _stack = require("./stack.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AWS, createRole, deleteRole, getRole, getRoleARN, hasRole;
exports.hasRole = hasRole;
exports.getRoleARN = getRoleARN;
exports.getRole = getRole;
exports.deleteRole = deleteRole;
exports.createRole = createRole;
AWS = {
  IAM: new _clientIam.IAM({
    region: "us-east-1"
  })
};

exports.createRole = createRole = async function (name, policies, managedPolicies) {
  var _template, properties; // TODO possibly use API directly for creating roles
  // so we don't exhaust our stack quota


  properties = {
    RoleName: name,
    AssumeRolePolicyDocument: {
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Principal: {
          Service: ["lambda.amazonaws.com", "edgelambda.amazonaws.com"]
        },
        Action: ["sts:AssumeRole"]
      }]
    }
  };

  if (managedPolicies != null) {
    properties.ManagedPolicyArns = managedPolicies;
  }

  if (policies != null) {
    properties.Policies = [{
      PolicyName: `${name}-policy`,
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: policies
      }
    }];
  }

  _template = {
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Create role [ ${name} ]`,
    Resources: {
      IAMRole: {
        Type: "AWS::IAM::Role",
        Properties: properties
      }
    }
  };
  await (0, _stack.deployStack)(name, _jsYaml.default.dump(_template), ["CAPABILITY_NAMED_IAM"]);
  return void 0;
};

exports.deleteRole = deleteRole = function (name) {
  return (0, _stack.deleteStack)(name);
};

exports.hasRole = hasRole = async function (name) {
  return (await getRole(name)) != null;
};

exports.getRole = getRole = async function (name) {
  var Role;

  try {
    // TODO handle not found explicitly
    // see lambda for example but unsure if the exception is always the same
    ({
      Role
    } = await AWS.IAM.getRole({
      RoleName: name
    }));
    return {
      arn: Role.Arn,
      _: Role
    };
  } catch (error) {}
};

exports.getRoleARN = getRoleARN = async function (name) {
  return (await getRole(name)).arn;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9yb2xlcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7QUFEQSxJQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsT0FBQTs7Ozs7O0FBS0EsR0FBQSxHQUNFO0FBQUEsRUFBQSxHQUFBLEVBQUssSUFBQSxjQUFBLENBQVE7QUFBQSxJQUFBLE1BQUEsRUFBUTtBQUFSLEdBQVI7QUFBTCxDQURGOztBQUdBLHFCQUFBLFVBQUEsR0FBYSxnQkFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBLGVBQUEsRUFBQTtBQUNiLE1BQUEsU0FBQSxFQUFBLFVBQUEsQ0FEYSxDOzs7O0FBR1gsRUFBQSxVQUFBLEdBQ0U7QUFBQSxJQUFBLFFBQUEsRUFBQSxJQUFBO0FBQ0EsSUFBQSx3QkFBQSxFQUNFO0FBQUEsTUFBQSxPQUFBLEVBQUEsWUFBQTtBQUNBLE1BQUEsU0FBQSxFQUFXLENBQ1Q7QUFBQSxRQUFBLE1BQUEsRUFBQSxPQUFBO0FBQ0EsUUFBQSxTQUFBLEVBQ0U7QUFBQSxVQUFBLE9BQUEsRUFBUyxDQUFBLHNCQUFBLEVBQUEsMEJBQUE7QUFBVCxTQUZGO0FBTUEsUUFBQSxNQUFBLEVBQU8sQ0FBQSxnQkFBQTtBQU5QLE9BRFM7QUFEWDtBQUZGLEdBREY7O0FBY0EsTUFBRyxlQUFBLElBQUgsSUFBQSxFQUFBO0FBQ0UsSUFBQSxVQUFVLENBQVYsaUJBQUEsR0FERixlQUNFOzs7QUFFRixNQUFHLFFBQUEsSUFBSCxJQUFBLEVBQUE7QUFDRSxJQUFBLFVBQVUsQ0FBVixRQUFBLEdBQXNCLENBQ3BCO0FBQUEsTUFBQSxVQUFBLEVBQVksR0FBQSxJQUFaLFNBQUE7QUFDQSxNQUFBLGNBQUEsRUFDRTtBQUFBLFFBQUEsT0FBQSxFQUFBLFlBQUE7QUFDQSxRQUFBLFNBQUEsRUFBVztBQURYO0FBRkYsS0FEb0IsQ0FBdEI7OztBQU9GLEVBQUEsU0FBQSxHQUNFO0FBQUEsSUFBQSx3QkFBQSxFQUFBLFlBQUE7QUFDQSxJQUFBLFdBQUEsRUFBYSxpQkFBQSxJQURiLElBQUE7QUFFQSxJQUFBLFNBQUEsRUFDRTtBQUFBLE1BQUEsT0FBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQUEsZ0JBQUE7QUFDQSxRQUFBLFVBQUEsRUFBWTtBQURaO0FBREY7QUFIRixHQURGO0FBUUEsUUFBTSx3QkFBQSxJQUFBLEVBQ0YsZ0JBQUEsSUFBQSxDQURFLFNBQ0YsQ0FERSxFQUVKLENBRkksc0JBRUosQ0FGSSxDQUFOO1NBSUEsS0FBQSxDO0FBeENXLENBQWI7O0FBMENBLHFCQUFBLFVBQUEsR0FBYSxVQUFBLElBQUEsRUFBQTtTQUFVLHdCQUFBLElBQUEsQztBQUFWLENBQWI7O0FBRUEsa0JBQUEsT0FBQSxHQUFVLGdCQUFBLElBQUEsRUFBQTtTQUFVLENBQUEsTUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsSTtBQUFWLENBQVY7O0FBRUEsa0JBQUEsT0FBQSxHQUFVLGdCQUFBLElBQUEsRUFBQTtBQUNWLE1BQUEsSUFBQTs7QUFFRSxNQUFBOzs7QUFDRSxLQUFBO0FBQUEsTUFBQTtBQUFBLFFBQVcsTUFBTSxHQUFHLENBQUMsR0FBSixDQUFBLE9BQUEsQ0FBZ0I7QUFBQSxNQUFBLFFBQUEsRUFBVTtBQUFWLEtBQWhCLENBQWpCO1dBQ0E7QUFBQSxNQUFBLEdBQUEsRUFBSyxJQUFJLENBQVQsR0FBQTtBQUNBLE1BQUEsQ0FBQSxFQUFHO0FBREgsSztBQUZGLEdBQUEsQ0FBQSxPQUFBLEtBQUEsRUFBQSxDQUFBO0FBSFEsQ0FBVjs7QUFRQSxxQkFBQSxVQUFBLEdBQWEsZ0JBQUEsSUFBQSxFQUFBO1NBQVUsQ0FBQyxNQUFNLE9BQUEsQ0FBUCxJQUFPLENBQVAsRUFBcUIsRztBQUEvQixDQUFiIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSUFNIH0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1pYW1cIlxuaW1wb3J0IFlBTUwgZnJvbSBcImpzLXlhbWxcIlxuXG5pbXBvcnQgeyBkZXBsb3lTdGFjaywgZGVsZXRlU3RhY2sgfSBmcm9tIFwiLi9zdGFja1wiXG5cbkFXUyA9XG4gIElBTTogbmV3IElBTSByZWdpb246IFwidXMtZWFzdC0xXCJcblxuY3JlYXRlUm9sZSA9ICggbmFtZSwgcG9saWNpZXMsIG1hbmFnZWRQb2xpY2llcyApIC0+XG4gICMgVE9ETyBwb3NzaWJseSB1c2UgQVBJIGRpcmVjdGx5IGZvciBjcmVhdGluZyByb2xlc1xuICAjIHNvIHdlIGRvbid0IGV4aGF1c3Qgb3VyIHN0YWNrIHF1b3RhXG4gIHByb3BlcnRpZXMgPSBcbiAgICBSb2xlTmFtZTogbmFtZVxuICAgIEFzc3VtZVJvbGVQb2xpY3lEb2N1bWVudDpcbiAgICAgIFZlcnNpb246IFwiMjAxMi0xMC0xN1wiXG4gICAgICBTdGF0ZW1lbnQ6IFtcbiAgICAgICAgRWZmZWN0OiBcIkFsbG93XCJcbiAgICAgICAgUHJpbmNpcGFsOlxuICAgICAgICAgIFNlcnZpY2U6IFtcbiAgICAgICAgICAgIFwibGFtYmRhLmFtYXpvbmF3cy5jb21cIlxuICAgICAgICAgICAgXCJlZGdlbGFtYmRhLmFtYXpvbmF3cy5jb21cIlxuICAgICAgICAgIF1cbiAgICAgICAgQWN0aW9uOlsgXCJzdHM6QXNzdW1lUm9sZVwiIF1cbiAgICAgIF1cbiAgXG4gIGlmIG1hbmFnZWRQb2xpY2llcz9cbiAgICBwcm9wZXJ0aWVzLk1hbmFnZWRQb2xpY3lBcm5zID0gbWFuYWdlZFBvbGljaWVzXG4gICAgXG4gIGlmIHBvbGljaWVzP1xuICAgIHByb3BlcnRpZXMuUG9saWNpZXMgPSBbXG4gICAgICBQb2xpY3lOYW1lOiBcIiN7bmFtZX0tcG9saWN5XCJcbiAgICAgIFBvbGljeURvY3VtZW50OlxuICAgICAgICBWZXJzaW9uOiBcIjIwMTItMTAtMTdcIlxuICAgICAgICBTdGF0ZW1lbnQ6IHBvbGljaWVzXG4gICAgXVxuXG4gIF90ZW1wbGF0ZSA9XG4gICAgQVdTVGVtcGxhdGVGb3JtYXRWZXJzaW9uOiBcIjIwMTAtMDktMDlcIlxuICAgIERlc2NyaXB0aW9uOiBcIkNyZWF0ZSByb2xlIFsgI3tuYW1lfSBdXCJcbiAgICBSZXNvdXJjZXM6XG4gICAgICBJQU1Sb2xlOlxuICAgICAgICBUeXBlOiBcIkFXUzo6SUFNOjpSb2xlXCJcbiAgICAgICAgUHJvcGVydGllczogcHJvcGVydGllc1xuXG4gIGF3YWl0IGRlcGxveVN0YWNrIG5hbWUsXG4gICAgKCBZQU1MLmR1bXAgX3RlbXBsYXRlICksXG4gICAgWyBcIkNBUEFCSUxJVFlfTkFNRURfSUFNXCIgXVxuXG4gIHVuZGVmaW5lZFxuXG5kZWxldGVSb2xlID0gKG5hbWUpIC0+IGRlbGV0ZVN0YWNrIG5hbWVcblxuaGFzUm9sZSA9IChuYW1lKSAtPiAoYXdhaXQgZ2V0Um9sZSBuYW1lKT9cblxuZ2V0Um9sZSA9IChuYW1lKSAtPlxuICAjIFRPRE8gaGFuZGxlIG5vdCBmb3VuZCBleHBsaWNpdGx5XG4gICMgc2VlIGxhbWJkYSBmb3IgZXhhbXBsZSBidXQgdW5zdXJlIGlmIHRoZSBleGNlcHRpb24gaXMgYWx3YXlzIHRoZSBzYW1lXG4gIHRyeVxuICAgIHsgUm9sZSB9ID0gYXdhaXQgQVdTLklBTS5nZXRSb2xlIFJvbGVOYW1lOiBuYW1lXG4gICAgYXJuOiBSb2xlLkFyblxuICAgIF86IFJvbGVcblxuZ2V0Um9sZUFSTiA9IChuYW1lKSAtPiAoYXdhaXQgZ2V0Um9sZSBuYW1lKS5hcm5cblxuZXhwb3J0IHtcbiAgY3JlYXRlUm9sZVxuICBoYXNSb2xlXG4gIGdldFJvbGVcbiAgZGVsZXRlUm9sZVxuICBnZXRSb2xlQVJOXG59Il0sInNvdXJjZVJvb3QiOiIifQ==
//# sourceURL=src/roles.coffee