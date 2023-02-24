"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHostedZoneID = exports.getHostedZone = exports.addSubdomain = void 0;

var Route53 = _interopRequireWildcard(require("@aws-sdk/client-route-53"));

var _helpers = require("./helpers.js");

var _stack = require("./stack.js");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var AWS, addSubdomain, getHostedZone, getHostedZoneID, getTLD;
exports.getHostedZoneID = getHostedZoneID;
exports.getHostedZone = getHostedZone;
exports.addSubdomain = addSubdomain;
AWS = {
  Route53: (0, _helpers.lift)(Route53)
};

getTLD = function (domain) {
  return domain.split(".").slice(-2).join(".");
};

exports.getHostedZone = getHostedZone = async function (domain) {
  var HostedZones, i, len, zone;
  ({
    HostedZones
  } = await AWS.Route53.listHostedZones({
    MaxItems: "100"
  }));

  for (i = 0, len = HostedZones.length; i < len; i++) {
    zone = HostedZones[i];

    if (domain === zone.Name.slice(0, -1)) {
      return {
        _: zone,
        id: zone.Id
      };
    }
  }

  return void 0;
};

exports.getHostedZoneID = getHostedZoneID = async function (domain) {
  return (await getHostedZone(domain)).id;
};

exports.addSubdomain = addSubdomain = async function (domain, target) {
  return (0, _stack.deployStack)("domain-" + domain.replaceAll(".", "-"), {
    AWSTemplateFormatVersion: "2010-09-09",
    Description: `Create subdomain [ ${domain} ]`,
    Resources: {
      Subdomain: {
        Type: "AWS::Route53::RecordSetGroup",
        Properties: {
          HostedZoneId: await getHostedZoneID(getTLD(domain)),
          RecordSets: [{
            Name: domain,
            Type: "A",
            AliasTarget: {
              DNSName: target,
              EvaluateTargetHealth: false,
              HostedZoneId: "Z2FDTNDATAQYW2"
            }
          }]
        }
      }
    }
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9yb3V0ZTUzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7QUFBQSxJQUFBLEdBQUEsRUFBQSxZQUFBLEVBQUEsYUFBQSxFQUFBLGVBQUEsRUFBQSxNQUFBOzs7O0FBSUEsR0FBQSxHQUNFO0FBQUEsRUFBQSxPQUFBLEVBQVMsbUJBQUEsT0FBQTtBQUFULENBREY7O0FBR0EsTUFBQSxHQUFTLFVBQUEsTUFBQSxFQUFBO1NBQWUsTUFBTSxDQUFOLEtBQUEsQ0FBRixHQUFFLENBQUYsQ0FBb0IsS0FBcEIsQ0FBb0IsQ0FBQSxDQUFwQixFQUFELElBQUMsQ0FBRCxHQUFDLEM7QUFBYixDQUFUOztBQUVBLHdCQUFBLGFBQUEsR0FBZ0IsZ0JBQUEsTUFBQSxFQUFBO0FBQ2hCLE1BQUEsV0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQTtBQUFFLEdBQUE7QUFBQSxJQUFBO0FBQUEsTUFBa0IsTUFBTSxHQUFHLENBQUMsT0FBSixDQUFBLGVBQUEsQ0FBNEI7QUFBQSxJQUFBLFFBQUEsRUFBVTtBQUFWLEdBQTVCLENBQXhCOztBQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxFQUFBOzs7QUFDRSxRQUFHLE1BQUEsS0FBVSxJQUFJLENBQUMsSUFBTCxDQUFTLEtBQVQsQ0FBUyxDQUFULEVBQVMsQ0FBdEIsQ0FBYSxDQUFiLEVBQUE7QUFDRSxhQUNFO0FBQUEsUUFBQSxDQUFBLEVBQUEsSUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFJLElBQUksQ0FBQztBQURULE9BREY7O0FBRko7O1NBS0EsS0FBQSxDO0FBUGMsQ0FBaEI7O0FBU0EsMEJBQUEsZUFBQSxHQUFrQixnQkFBQSxNQUFBLEVBQUE7U0FBWSxDQUFFLE1BQU0sYUFBQSxDQUFSLE1BQVEsQ0FBUixFQUErQixFO0FBQTNDLENBQWxCOztBQUVBLHVCQUFBLFlBQUEsR0FBZSxnQkFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBO1NBQ2Isd0JBQWMsWUFBWSxNQUFNLENBQU4sVUFBQSxDQUFBLEdBQUEsRUFBMUIsR0FBMEIsQ0FBMUIsRUFDRTtBQUFBLElBQUEsd0JBQUEsRUFBQSxZQUFBO0FBQ0EsSUFBQSxXQUFBLEVBQWEsc0JBQUEsTUFEYixJQUFBO0FBRUEsSUFBQSxTQUFBLEVBQ0U7QUFBQSxNQUFBLFNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFBLDhCQUFBO0FBQ0EsUUFBQSxVQUFBLEVBQ0U7QUFBQSxVQUFBLFlBQUEsRUFBYyxNQUFNLGVBQUEsQ0FBZ0IsTUFBQSxDQUFwQyxNQUFvQyxDQUFoQixDQUFwQjtBQUNBLFVBQUEsVUFBQSxFQUFZLENBQ1Y7QUFBQSxZQUFBLElBQUEsRUFBQSxNQUFBO0FBQ0EsWUFBQSxJQUFBLEVBREEsR0FBQTtBQUVBLFlBQUEsV0FBQSxFQUNFO0FBQUEsY0FBQSxPQUFBLEVBQUEsTUFBQTtBQUNBLGNBQUEsb0JBQUEsRUFEQSxLQUFBO0FBRUEsY0FBQSxZQUFBLEVBQWM7QUFGZDtBQUhGLFdBRFU7QUFEWjtBQUZGO0FBREY7QUFIRixHQURGLEM7QUFEYSxDQUFmIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgUm91dGU1MyBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LXJvdXRlLTUzXCJcbmltcG9ydCB7IGxpZnQgfSBmcm9tIFwiLi9oZWxwZXJzXCJcbmltcG9ydCB7IGRlcGxveVN0YWNrIH0gZnJvbSBcIi4vc3RhY2tcIlxuXG5BV1MgPVxuICBSb3V0ZTUzOiBsaWZ0IFJvdXRlNTNcblxuZ2V0VExEID0gKGRvbWFpbikgLT4gKCggZG9tYWluLnNwbGl0IFwiLlwiIClbLTIuLl0pLmpvaW4gXCIuXCJcblxuZ2V0SG9zdGVkWm9uZSA9IChkb21haW4pIC0+XG4gIHsgSG9zdGVkWm9uZXMgfSA9IGF3YWl0IEFXUy5Sb3V0ZTUzLmxpc3RIb3N0ZWRab25lcyBNYXhJdGVtczogXCIxMDBcIlxuICBmb3Igem9uZSBpbiBIb3N0ZWRab25lc1xuICAgIGlmIGRvbWFpbiA9PSB6b25lLk5hbWVbLi4tMl1cbiAgICAgIHJldHVyblxuICAgICAgICBfOiB6b25lXG4gICAgICAgIGlkOiB6b25lLklkXG4gIHVuZGVmaW5lZFxuXG5nZXRIb3N0ZWRab25lSUQgPSAoZG9tYWluKSAtPiAoIGF3YWl0IGdldEhvc3RlZFpvbmUgZG9tYWluICkuaWRcblxuYWRkU3ViZG9tYWluID0gKGRvbWFpbiwgdGFyZ2V0KSAtPlxuICBkZXBsb3lTdGFjayAoIFwiZG9tYWluLVwiICsgZG9tYWluLnJlcGxhY2VBbGwgXCIuXCIsIFwiLVwiICksXG4gICAgQVdTVGVtcGxhdGVGb3JtYXRWZXJzaW9uOiBcIjIwMTAtMDktMDlcIlxuICAgIERlc2NyaXB0aW9uOiBcIkNyZWF0ZSBzdWJkb21haW4gWyAje2RvbWFpbn0gXVwiXG4gICAgUmVzb3VyY2VzOlxuICAgICAgU3ViZG9tYWluOlxuICAgICAgICBUeXBlOiBcIkFXUzo6Um91dGU1Mzo6UmVjb3JkU2V0R3JvdXBcIlxuICAgICAgICBQcm9wZXJ0aWVzOlxuICAgICAgICAgIEhvc3RlZFpvbmVJZDogYXdhaXQgZ2V0SG9zdGVkWm9uZUlEIGdldFRMRCBkb21haW5cbiAgICAgICAgICBSZWNvcmRTZXRzOiBbXG4gICAgICAgICAgICBOYW1lOiBkb21haW5cbiAgICAgICAgICAgIFR5cGU6IFwiQVwiXG4gICAgICAgICAgICBBbGlhc1RhcmdldDpcbiAgICAgICAgICAgICAgRE5TTmFtZTogdGFyZ2V0XG4gICAgICAgICAgICAgIEV2YWx1YXRlVGFyZ2V0SGVhbHRoOiBmYWxzZVxuICAgICAgICAgICAgICBIb3N0ZWRab25lSWQ6IFwiWjJGRFROREFUQVFZVzJcIlxuICAgICAgICAgIF1cblxuICAjIFRPRE8gSSBjb3VsZG4ndCBnZXQgdGhpcyB0byB3b3JrXG4gICMgYnV0IHRoaXMgd291bGQgcHJvYmFibHkgcnVuIG11Y2ggZmFzdGVyP1xuICAjIGtlcHQgZ2V0dGluZyBpbnZhbGlkIGlucHV0IGVycm9yc1xuICAjIEFXUy5Sb3V0ZTUzLmNoYW5nZVJlc291cmNlUmVjb3JkU2V0c1xuICAjICAgSG9zdGVkWm9uZUlkOiBhd2FpdCBnZXRIb3N0ZWRab25lSUQgZ2V0VExEIGRvbWFpblxuICAjICAgQ2hhbmdlQmF0Y2g6XG4gICMgICAgIENoYW5nZXM6IFtcbiAgIyAgICAgICBBY3Rpb246IFwiVVBTRVJUXCJcbiAgIyAgICAgICBSZXNvdXJjZVJlY29yZFNldDpcbiAgIyAgICAgICAgIE5hbWU6IFwiI3sgZG9tYWluIH0uXCJcbiAgIyAgICAgICAgIFR5cGU6IFwiQVwiXG4gICMgICAgICAgICBUVEw6IDMwMFxuICAjICAgICAgICAgQWxpYXNUYXJnZXQ6XG4gICMgICAgICAgICAgIEROU05hbWU6IFwiI3sgdGFyZ2V0IH0uXCJcbiAgIyAgICAgICAgICAgRXZhbHVhdGVUYXJnZXRIZWFsdGg6IGZhbHNlXG4gICMgICAgICAgICAgIEhvc3RlZFpvbmVJZDogXCJaMkZEVE5EQVRBUVlXMlwiXG4gICMgICAgIF1cblxuZXhwb3J0IHtcbiAgZ2V0SG9zdGVkWm9uZVxuICBnZXRIb3N0ZWRab25lSURcbiAgYWRkU3ViZG9tYWluXG59XG5cbiJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/route53.coffee