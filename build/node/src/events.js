"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hasRule = exports.getRuleARN = exports.getRule = exports.deleteRule = exports.createRule = void 0;

var _jsYaml = _interopRequireDefault(require("js-yaml"));

var _stack = require("./stack.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createRule, deleteRule, getRule, getRuleARN, hasRule;
exports.hasRule = hasRule;
exports.getRuleARN = getRuleARN;
exports.getRule = getRule;
exports.deleteRule = deleteRule;
exports.createRule = createRule;

// TODO support patterns
exports.createRule = createRule = async function ({
  name,
  target,
  schedule
}) {
  var _template; // TODO possibly use API directly for creating rules
  // so we don't exhaust our stack quota.
  // we need to add some specificity to this function's interface.


  _template = {
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Create rule [ ${name} ]`,
    Resources: {
      Event: {
        Type: "AWS::Events::Rule",
        Properties: {
          Description: name,
          // EventBusName: String
          // EventPattern: Json
          Name: name,
          ScheduleExpression: schedule,
          State: "ENABLED",
          Targets: [target]
        }
      },
      EventPermission: {
        DependsOn: ["Event"],
        Type: "AWS::Lambda::Permission",
        Properties: {
          Action: "lambda:InvokeFunction",
          FunctionName: target.Arn,
          Principal: "events.amazonaws.com",
          SourceArn: {
            "Fn::GetAtt": ["Event", "Arn"]
          }
        }
      }
    }
  };
  await (0, _stack.deployStack)(name, _jsYaml.default.dump(_template));
  return void 0;
};

exports.deleteRule = deleteRule = function (name) {
  return (0, _stack.deleteStack)(name);
};

exports.hasRule = hasRule = async function (name) {
  return (await getRule(name)) != null;
};

exports.getRule = getRule = function (name) {};

exports.getRuleARN = getRuleARN = async function (name) {
  return (await getRule(name)).arn;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9ldmVudHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7O0FBQUEsSUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsT0FBQTs7Ozs7Ozs7QUFNQSxxQkFBQSxVQUFBLEdBQWEsZ0JBQUM7QUFBQSxFQUFBLElBQUE7QUFBQSxFQUFBLE1BQUE7QUFBRCxFQUFBO0FBQUMsQ0FBRCxFQUFBO0FBQ2IsTUFBQSxTQUFBLENBRGEsQzs7Ozs7QUFNWCxFQUFBLFNBQUEsR0FDRTtBQUFBLElBQUEsd0JBQUEsRUFBQSxZQUFBO0FBQ0EsSUFBQSxXQUFBLEVBQWEsaUJBQUEsSUFEYixJQUFBO0FBRUEsSUFBQSxTQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFBLG1CQUFBO0FBQ0EsUUFBQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLFdBQUEsRUFBQSxJQUFBOzs7QUFHQSxVQUFBLElBQUEsRUFIQSxJQUFBO0FBSUEsVUFBQSxrQkFBQSxFQUpBLFFBQUE7QUFLQSxVQUFBLEtBQUEsRUFMQSxTQUFBO0FBTUEsVUFBQSxPQUFBLEVBQVMsQ0FBQSxNQUFBO0FBTlQ7QUFGRixPQURGO0FBVUEsTUFBQSxlQUFBLEVBQ0U7QUFBQSxRQUFBLFNBQUEsRUFBVyxDQUFYLE9BQVcsQ0FBWDtBQUNBLFFBQUEsSUFBQSxFQURBLHlCQUFBO0FBRUEsUUFBQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLE1BQUEsRUFBQSx1QkFBQTtBQUNBLFVBQUEsWUFBQSxFQUFjLE1BQU0sQ0FEcEIsR0FBQTtBQUVBLFVBQUEsU0FBQSxFQUZBLHNCQUFBO0FBR0EsVUFBQSxTQUFBLEVBQ0U7QUFBQSwwQkFBYyxDQUFBLE9BQUEsRUFBQSxLQUFBO0FBQWQ7QUFKRjtBQUhGO0FBWEY7QUFIRixHQURGO0FBeUJBLFFBQU0sd0JBQUEsSUFBQSxFQUFrQixnQkFBQSxJQUFBLENBQWxCLFNBQWtCLENBQWxCLENBQU47U0FFQSxLQUFBLEM7QUFqQ1csQ0FBYjs7QUFtQ0EscUJBQUEsVUFBQSxHQUFhLFVBQUEsSUFBQSxFQUFBO1NBQVUsd0JBQUEsSUFBQSxDO0FBQVYsQ0FBYjs7QUFFQSxrQkFBQSxPQUFBLEdBQVUsZ0JBQUEsSUFBQSxFQUFBO1NBQVUsQ0FBQSxNQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxJO0FBQVYsQ0FBVjs7QUFFQSxrQkFBQSxPQUFBLEdBQVUsVUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUFWOztBQUVBLHFCQUFBLFVBQUEsR0FBYSxnQkFBQSxJQUFBLEVBQUE7U0FBVSxDQUFDLE1BQU0sT0FBQSxDQUFQLElBQU8sQ0FBUCxFQUFxQixHO0FBQS9CLENBQWIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgWUFNTCBmcm9tIFwianMteWFtbFwiXG5cbmltcG9ydCB7IGRlcGxveVN0YWNrLCBkZWxldGVTdGFjayB9IGZyb20gXCIuL3N0YWNrXCJcblxuIyBUT0RPIHN1cHBvcnQgcGF0dGVybnNcblxuY3JlYXRlUnVsZSA9ICh7IG5hbWUsIHRhcmdldCwgc2NoZWR1bGUgfSkgLT5cbiAgIyBUT0RPIHBvc3NpYmx5IHVzZSBBUEkgZGlyZWN0bHkgZm9yIGNyZWF0aW5nIHJ1bGVzXG4gICMgc28gd2UgZG9uJ3QgZXhoYXVzdCBvdXIgc3RhY2sgcXVvdGEuXG5cbiAgIyB3ZSBuZWVkIHRvIGFkZCBzb21lIHNwZWNpZmljaXR5IHRvIHRoaXMgZnVuY3Rpb24ncyBpbnRlcmZhY2UuXG5cbiAgX3RlbXBsYXRlID1cbiAgICBBV1NUZW1wbGF0ZUZvcm1hdFZlcnNpb246IFwiMjAxMC0wOS0wOVwiXG4gICAgRGVzY3JpcHRpb246IFwiQ3JlYXRlIHJ1bGUgWyAje25hbWV9IF1cIlxuICAgIFJlc291cmNlczpcbiAgICAgIEV2ZW50OlxuICAgICAgICBUeXBlOiBcIkFXUzo6RXZlbnRzOjpSdWxlXCJcbiAgICAgICAgUHJvcGVydGllczogXG4gICAgICAgICAgRGVzY3JpcHRpb246IG5hbWVcbiAgICAgICAgICAjIEV2ZW50QnVzTmFtZTogU3RyaW5nXG4gICAgICAgICAgIyBFdmVudFBhdHRlcm46IEpzb25cbiAgICAgICAgICBOYW1lOiBuYW1lXG4gICAgICAgICAgU2NoZWR1bGVFeHByZXNzaW9uOiBzY2hlZHVsZVxuICAgICAgICAgIFN0YXRlOiBcIkVOQUJMRURcIlxuICAgICAgICAgIFRhcmdldHM6IFsgdGFyZ2V0IF1cbiAgICAgIEV2ZW50UGVybWlzc2lvbjpcbiAgICAgICAgRGVwZW5kc09uOiBbIFwiRXZlbnRcIiBdXG4gICAgICAgIFR5cGU6IFwiQVdTOjpMYW1iZGE6OlBlcm1pc3Npb25cIlxuICAgICAgICBQcm9wZXJ0aWVzOlxuICAgICAgICAgIEFjdGlvbjogXCJsYW1iZGE6SW52b2tlRnVuY3Rpb25cIlxuICAgICAgICAgIEZ1bmN0aW9uTmFtZTogdGFyZ2V0LkFyblxuICAgICAgICAgIFByaW5jaXBhbDogXCJldmVudHMuYW1hem9uYXdzLmNvbVwiXG4gICAgICAgICAgU291cmNlQXJuOlxuICAgICAgICAgICAgXCJGbjo6R2V0QXR0XCI6IFsgXCJFdmVudFwiICwgXCJBcm5cIiBdXG5cblxuICBhd2FpdCBkZXBsb3lTdGFjayBuYW1lLCBZQU1MLmR1bXAgX3RlbXBsYXRlXG5cbiAgdW5kZWZpbmVkXG5cbmRlbGV0ZVJ1bGUgPSAobmFtZSkgLT4gZGVsZXRlU3RhY2sgbmFtZVxuXG5oYXNSdWxlID0gKG5hbWUpIC0+IChhd2FpdCBnZXRSdWxlIG5hbWUpP1xuXG5nZXRSdWxlID0gKG5hbWUpIC0+XG5cbmdldFJ1bGVBUk4gPSAobmFtZSkgLT4gKGF3YWl0IGdldFJ1bGUgbmFtZSkuYXJuXG5cbmV4cG9ydCB7XG4gIGNyZWF0ZVJ1bGVcbiAgZGVsZXRlUnVsZVxuICBoYXNSdWxlXG4gIGdldFJ1bGVcbiAgZ2V0UnVsZUFSTlxufSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/events.coffee