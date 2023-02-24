"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasStack = exports.getStack = exports.deployStackAsync = exports.deployStack = exports.deleteStack = void 0;

var _clientCloudformation = require("@aws-sdk/client-cloudformation");

var Time = _interopRequireWildcard(require("@dashkite/joy/time"));

var _helpers = require("./helpers.js");

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var Type = _interopRequireWildcard(require("@dashkite/joy/type"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AWS, deleteStack, deployStack, deployStackAsync, getStack, getStatus, hasStack, nodes;
exports.hasStack = hasStack;
exports.getStack = getStack;
exports.deployStackAsync = deployStackAsync;
exports.deployStack = deployStack;
exports.deleteStack = deleteStack;
AWS = {
  CloudFormation: new _clientCloudformation.CloudFormation({
    region: "us-east-1"
  })
};

exports.hasStack = hasStack = async function (name) {
  return (await getStack(name)) != null;
};

exports.getStack = getStack = async function (name) {
  var Stacks, ref;

  try {
    ({
      Stacks
    } = await AWS.CloudFormation.describeStacks({
      StackName: name
    }));
    return {
      // TODO is there anything else to return here?
      status: (ref = Stacks[0]) != null ? ref.StackStatus : void 0,
      _: Stacks[0]
    };
  } catch (error1) {
    return void 0;
  }
};

getStatus = async function (context) {
  var ref, ref1;
  context.stack = await getStack(context.name);
  return (ref = (ref1 = context.stack) != null ? ref1.status : void 0) != null ? ref : "create";
};

nodes = [{
  pattern: "start",
  next: getStatus,
  nodes: [{
    pattern: /UPDATE_ROLLBACK_(COMPLETE|FAILED)$/,
    next: function () {
      return "update";
    }
  }, {
    pattern: /ROLLBACK_(COMPLETE|FAILED)$/,
    next: function () {
      return "delete";
    }
  }, {
    pattern: /COMPLETE$/,
    next: function () {
      return "update";
    }
  }]
}, {
  pattern: "create",
  action: function ({
    template
  }) {
    return AWS.CloudFormation.createStack(template);
  },
  next: getStatus
}, {
  pattern: "update",
  action: function ({
    template
  }) {
    return AWS.CloudFormation.updateStack(template);
  },
  next: getStatus
}, {
  pattern: "delete",
  action: function ({
    name
  }) {
    return AWS.CloudFormation.deleteStack({
      StackName: name
    });
  },
  next: getStatus
}, {
  pattern: "done",
  result: function ({
    stack
  }) {
    return stack;
  }
}, {
  pattern: /^(CREATE|UPDATE)_COMPLETE$/,
  next: function () {
    return "done";
  }
}, {
  pattern: "DELETE_COMPLETE",
  next: function () {
    return "create";
  }
}, {
  pattern: /ROLLBACK_(COMPLETE|FAILED)$/,
  next: function ({
    name
  }) {
    throw new Error(`Deploy failed for [ ${name} ]`);
  }
}, {
  pattern: /IN_PROGRESS$/,
  action: function () {
    return Time.sleep(5000);
  },
  next: getStatus
}, {
  pattern: /FAILED$/,
  result: function ({
    name
  }) {
    throw new Error(`Unable to gracefully recover from state [ ${name} ]`);
  }
}];

exports.deployStack = deployStack = async function (name, template, capabilities) {
  var context, error, state;

  if (capabilities == null) {
    capabilities = ["CAPABILITY_IAM"];
  }

  if (Type.isObject(template)) {
    template = _jsYaml.default.dump(template);
  }

  console.log(template);
  state = {
    name: "start"
  };
  context = {
    name: name,
    template: {
      StackName: name,
      Capabilities: capabilities,
      // Tags: [{
      //   Key: "domain"
      //   Value: configuration.tld
      // }]
      TemplateBody: template
    }
  };

  try {
    return await (0, _helpers.runNetwork)(nodes, state, context);
  } catch (error1) {
    error = error1;

    if (/No updates/.test(error.toString())) {
      return console.log(`no updates for stack [${name}]`);
    } else {
      throw error;
    }
  }
};

exports.deployStackAsync = deployStackAsync = async function (name, _template, capabilities) {
  var template;
  console.log(_template);
  template = {
    StackName: name,
    Capabilities: capabilities != null ? capabilities : ["CAPABILITY_IAM"],
    TemplateBody: _template
  };

  if (await hasStack(name)) {
    return AWS.CloudFormation.updateStack(template);
  } else {
    return AWS.CloudFormation.createStack(template);
  }
};

exports.deleteStack = deleteStack = function (name) {
  return AWS.CloudFormation.deleteStack({
    StackName: name
  });
};
//# sourceMappingURL=data:application/json;base64,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QkFBQSxXQUFBLEdBQWMsVUFBQSxJQUFBLEVBQUE7U0FDWixHQUFHLENBQUMsY0FBSixDQUFBLFdBQUEsQ0FBK0I7QUFBQSxJQUFBLFNBQUEsRUFBVztBQUFYLEdBQS9CLEM7QUFEWSxDQUFkIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb24gfSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNsb3VkZm9ybWF0aW9uXCJcbmltcG9ydCAqIGFzIFRpbWUgZnJvbSBcIkBkYXNoa2l0ZS9qb3kvdGltZVwiXG5pbXBvcnQgeyBydW5OZXR3b3JrIH0gZnJvbSBcIi4vaGVscGVyc1wiXG5pbXBvcnQgWUFNTCBmcm9tIFwianMteWFtbFwiXG5pbXBvcnQgKiBhcyBUeXBlIGZyb20gXCJAZGFzaGtpdGUvam95L3R5cGVcIlxuXG5BV1MgPVxuICBDbG91ZEZvcm1hdGlvbjogbmV3IENsb3VkRm9ybWF0aW9uIHJlZ2lvbjogXCJ1cy1lYXN0LTFcIlxuXG5oYXNTdGFjayA9IChuYW1lKSAtPiAoYXdhaXQgZ2V0U3RhY2sgbmFtZSk/XG5cbmdldFN0YWNrID0gKG5hbWUpIC0+XG4gIHRyeVxuICAgIHsgU3RhY2tzIH0gPSBhd2FpdCBBV1MuQ2xvdWRGb3JtYXRpb24uZGVzY3JpYmVTdGFja3MgU3RhY2tOYW1lOiBuYW1lXG4gICAgIyBUT0RPIGlzIHRoZXJlIGFueXRoaW5nIGVsc2UgdG8gcmV0dXJuIGhlcmU/XG4gICAgc3RhdHVzOiBTdGFja3NbMF0/LlN0YWNrU3RhdHVzXG4gICAgXzogU3RhY2tzWzBdXG4gIGNhdGNoXG4gICAgdW5kZWZpbmVkXG5cbmdldFN0YXR1cyA9IChjb250ZXh0KSAtPlxuICBjb250ZXh0LnN0YWNrID0gYXdhaXQgZ2V0U3RhY2sgY29udGV4dC5uYW1lXG4gIGNvbnRleHQuc3RhY2s/LnN0YXR1cyA/IFwiY3JlYXRlXCJcblxubm9kZXMgPSBbXG5cbiAgICBwYXR0ZXJuOiBcInN0YXJ0XCJcbiAgICBuZXh0OiBnZXRTdGF0dXNcbiAgICBub2RlczogW1xuICAgICAgICBwYXR0ZXJuOiAvVVBEQVRFX1JPTExCQUNLXyhDT01QTEVURXxGQUlMRUQpJC9cbiAgICAgICAgbmV4dDogLT4gXCJ1cGRhdGVcIlxuICAgICAgLFxuICAgICAgICBwYXR0ZXJuOiAvUk9MTEJBQ0tfKENPTVBMRVRFfEZBSUxFRCkkL1xuICAgICAgICBuZXh0OiAtPiBcImRlbGV0ZVwiXG4gICAgICAsXG4gICAgICAgIHBhdHRlcm46IC9DT01QTEVURSQvXG4gICAgICAgIG5leHQ6IC0+IFwidXBkYXRlXCJcbiAgICBdXG4gICxcbiAgICBwYXR0ZXJuOiBcImNyZWF0ZVwiXG4gICAgYWN0aW9uOiAoeyB0ZW1wbGF0ZSB9KSAtPiBBV1MuQ2xvdWRGb3JtYXRpb24uY3JlYXRlU3RhY2sgdGVtcGxhdGVcbiAgICBuZXh0OiBnZXRTdGF0dXNcbiAgLFxuICAgIHBhdHRlcm46IFwidXBkYXRlXCJcbiAgICBhY3Rpb246ICh7IHRlbXBsYXRlIH0pIC0+IEFXUy5DbG91ZEZvcm1hdGlvbi51cGRhdGVTdGFjayB0ZW1wbGF0ZVxuICAgIG5leHQ6IGdldFN0YXR1c1xuICAsXG4gICAgcGF0dGVybjogXCJkZWxldGVcIlxuICAgIGFjdGlvbjogKHsgbmFtZSB9KSAtPiBBV1MuQ2xvdWRGb3JtYXRpb24uZGVsZXRlU3RhY2sgU3RhY2tOYW1lOiBuYW1lXG4gICAgbmV4dDogZ2V0U3RhdHVzXG4gICxcbiAgICBwYXR0ZXJuOiBcImRvbmVcIlxuICAgIHJlc3VsdDogKHsgc3RhY2sgfSkgLT4gc3RhY2sgXG4gICxcbiAgICBwYXR0ZXJuOiAvXihDUkVBVEV8VVBEQVRFKV9DT01QTEVURSQvXG4gICAgbmV4dDogLT4gXCJkb25lXCJcbiAgLFxuICAgIHBhdHRlcm46IFwiREVMRVRFX0NPTVBMRVRFXCJcbiAgICBuZXh0OiAtPiBcImNyZWF0ZVwiXG4gICxcbiAgICBwYXR0ZXJuOiAvUk9MTEJBQ0tfKENPTVBMRVRFfEZBSUxFRCkkL1xuICAgIG5leHQ6ICh7bmFtZX0pIC0+IHRocm93IG5ldyBFcnJvciBcIkRlcGxveSBmYWlsZWQgZm9yIFsgI3tuYW1lfSBdXCJcbiAgLFxuICAgIHBhdHRlcm46IC9JTl9QUk9HUkVTUyQvXG4gICAgYWN0aW9uOiAtPiBUaW1lLnNsZWVwIDUwMDBcbiAgICBuZXh0OiBnZXRTdGF0dXNcbiAgLFxuICAgIHBhdHRlcm46IC9GQUlMRUQkL1xuICAgIHJlc3VsdDogKHtuYW1lfSkgLT4gdGhyb3cgbmV3IEVycm9yIFwiVW5hYmxlIHRvIGdyYWNlZnVsbHkgcmVjb3ZlciBmcm9tIHN0YXRlIFsgI3tuYW1lfSBdXCJcblxuXVxuXG5kZXBsb3lTdGFjayA9IChuYW1lLCB0ZW1wbGF0ZSwgY2FwYWJpbGl0aWVzKSAtPlxuXG4gIGNhcGFiaWxpdGllcyA/PSBbIFwiQ0FQQUJJTElUWV9JQU1cIiBdXG5cbiAgaWYgVHlwZS5pc09iamVjdCB0ZW1wbGF0ZVxuICAgIHRlbXBsYXRlID0gWUFNTC5kdW1wIHRlbXBsYXRlXG5cbiAgY29uc29sZS5sb2cgdGVtcGxhdGVcblxuICBzdGF0ZSA9IG5hbWU6IFwic3RhcnRcIlxuXG4gIGNvbnRleHQgPVxuICAgIG5hbWU6IG5hbWVcbiAgICB0ZW1wbGF0ZTogXG4gICAgICBTdGFja05hbWU6IG5hbWVcbiAgICAgIENhcGFiaWxpdGllczogY2FwYWJpbGl0aWVzXG4gICAgICAjIFRhZ3M6IFt7XG4gICAgICAjICAgS2V5OiBcImRvbWFpblwiXG4gICAgICAjICAgVmFsdWU6IGNvbmZpZ3VyYXRpb24udGxkXG4gICAgICAjIH1dXG4gICAgICBUZW1wbGF0ZUJvZHk6IHRlbXBsYXRlXG5cbiAgdHJ5XG4gICAgYXdhaXQgcnVuTmV0d29yayBub2Rlcywgc3RhdGUsIGNvbnRleHRcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiAvTm8gdXBkYXRlcy8udGVzdCBlcnJvci50b1N0cmluZygpXG4gICAgICBjb25zb2xlLmxvZyBcIm5vIHVwZGF0ZXMgZm9yIHN0YWNrIFsje25hbWV9XVwiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuZGVwbG95U3RhY2tBc3luYyA9IChuYW1lLCBfdGVtcGxhdGUsIGNhcGFiaWxpdGllcykgLT5cbiAgY29uc29sZS5sb2cgX3RlbXBsYXRlXG5cbiAgdGVtcGxhdGUgPVxuICAgIFN0YWNrTmFtZTogbmFtZVxuICAgIENhcGFiaWxpdGllczogY2FwYWJpbGl0aWVzID8gWyBcIkNBUEFCSUxJVFlfSUFNXCIgXVxuICAgIFRlbXBsYXRlQm9keTogX3RlbXBsYXRlXG5cbiAgaWYgYXdhaXQgaGFzU3RhY2sgbmFtZVxuICAgIEFXUy5DbG91ZEZvcm1hdGlvbi51cGRhdGVTdGFjayB0ZW1wbGF0ZVxuICBlbHNlXG4gICAgQVdTLkNsb3VkRm9ybWF0aW9uLmNyZWF0ZVN0YWNrIHRlbXBsYXRlXG4gICAgXG5cbmRlbGV0ZVN0YWNrID0gKG5hbWUpIC0+XG4gIEFXUy5DbG91ZEZvcm1hdGlvbi5kZWxldGVTdGFjayBTdGFja05hbWU6IG5hbWVcblxuZXhwb3J0IHtcbiAgaGFzU3RhY2tcbiAgZ2V0U3RhY2tcbiAgZGVwbG95U3RhY2tcbiAgZGVwbG95U3RhY2tBc3luY1xuICBkZWxldGVTdGFja1xufSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/stack.coffee