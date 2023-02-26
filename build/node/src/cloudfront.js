"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = exports.invalidatePaths = exports.getDistributionForDomain = exports.find = exports.addCustomHeader = void 0;
var CloudFront = _interopRequireWildcard(require("@aws-sdk/client-cloudfront"));
var _helpers = require("./helpers.js");
var It = _interopRequireWildcard(require("@dashkite/joy/iterable"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var AWS, addCustomHeader, find, getDistributionForDomain, invalidatePaths, isAliasFor, list, normalize;
exports.list = list;
exports.invalidatePaths = invalidatePaths;
exports.getDistributionForDomain = getDistributionForDomain;
exports.find = find;
exports.addCustomHeader = addCustomHeader;
AWS = {
  CloudFront: (0, _helpers.lift)(CloudFront)
};
normalize = function (distribution) {
  var ARN, Comment, Id, Status;
  ({
    Comment,
    Id,
    ARN,
    Status
  } = distribution);
  return {
    name: Comment,
    id: Id,
    arn: ARN,
    status: Status != null ? Status.toLowerCase() : void 0,
    _: distribution
  };
};
exports.list = list = async function* () {
  var $metadata, DistributionList, Items, Marker, NextMarker, i, item, len, results;
  Marker = void 0;
  results = [];
  while (true) {
    ({
      $metadata,
      DistributionList
    } = await AWS.CloudFront.listDistributions({
      Marker
    }));
    if ($metadata.httpStatusCode === 200) {
      ({
        NextMarker,
        Items
      } = DistributionList);
      for (i = 0, len = Items.length; i < len; i++) {
        item = Items[i];
        yield normalize(item);
      }
      if (NextMarker != null) {
        results.push(Marker = NextMarker);
      } else {
        break;
      }
    } else {
      throw new Error(`cloudfront::list: unexpected status [ ${$metadata.httpStatusCode} ]`);
    }
  }
  return results;
};

// undefined
isAliasFor = function (domain) {
  return function ({
    _
  }) {
    var ref;
    return (ref = _.Aliases.Items) != null ? ref.includes(domain) : void 0;
  };
};
exports.find = find = function (domain) {
  return It.find(isAliasFor(domain), list());
};
exports.getDistributionForDomain = getDistributionForDomain = function (domain) {
  return find(domain);
};
exports.addCustomHeader = addCustomHeader = async function ({
  domain,
  origin,
  name,
  value
}) {
  var $metadata, DistributionConfig, ETag, distribution, header, headers, ref;
  distribution = await find(domain);
  ({
    $metadata,
    ETag,
    DistributionConfig
  } = await AWS.CloudFront.getDistributionConfig({
    Id: distribution.id
  }));
  if ($metadata.httpStatusCode === 200) {
    origin = DistributionConfig.Origins.Items.find(function ({
      DomainName
    }) {
      return origin === DomainName;
    });
    if (origin != null) {
      headers = (ref = origin.CustomHeaders.Items) != null ? ref : [];
      if ((header = headers.find(function ({
        HeaderName
      }) {
        return HeaderName === name;
      })) != null) {
        header.HeaderValue = value;
      } else {
        headers.push({
          HeaderName: name,
          HeaderValue: value
        });
      }
      DistributionConfig.Origins.Items[0].CustomHeaders.Items = headers;
      DistributionConfig.Origins.Items[0].CustomHeaders.Quantity = headers.length;
      return AWS.CloudFront.updateDistribution({
        Id: distribution.id,
        IfMatch: ETag,
        DistributionConfig: DistributionConfig
      });
    } else {
      throw new Error(`cloudfront.addCustomHeader: missing origin [ ${origin} ]`);
    }
  } else {
    throw new Error(`cloudfront.addCustomHeader: unexpected status [ ${$metadata.httpStatusCode} ]`);
  }
};
exports.invalidatePaths = invalidatePaths = async function ({
  domain,
  paths
}) {
  var $metadata, Invalidation, Location, distribution;
  distribution = await find(domain);
  ({
    $metadata,
    Invalidation,
    Location
  } = await AWS.CloudFront.createInvalidation({
    DistributionId: distribution.id,
    InvalidationBatch: {
      CallerReference: Date.now(),
      Paths: {
        Items: paths,
        Quantity: paths.length
      }
    }
  }));
  if ($metadata.httpStatusCode === 201) {
    return console.log("cloudfront.invalidatePaths: success response", {
      status: Invalidation.Status,
      paths: Invalidation.InvalidationBatch.Paths
    });
  } else {
    throw new Error(`cloudfront.invalidatePaths: unexpected status [ ${$metadata.httpStatusCode} ]`);
  }
};
//# sourceMappingURL=data:application/json;base64,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aUJBQWlCLENBQUM7SUFGb0IsQ0FBNUQsQ0FERjtHQUFBLE1BQUE7SUFNRSxNQUFNLElBQUksS0FBSixDQUFVLG1EQUFvRCxTQUFTLENBQTdELGNBQUEsSUFBVixDQU5SOztBQWZnQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQ2xvdWRGcm9udCBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNsb3VkZnJvbnRcIlxuaW1wb3J0IHsgbGlmdCwgcGFydGl0aW9uIH0gZnJvbSBcIi4vaGVscGVyc1wiXG5pbXBvcnQgKiBhcyBJdCBmcm9tIFwiQGRhc2hraXRlL2pveS9pdGVyYWJsZVwiXG5cbkFXUyA9XG4gIENsb3VkRnJvbnQ6IGxpZnQgQ2xvdWRGcm9udFxuXG5ub3JtYWxpemUgPSAoIGRpc3RyaWJ1dGlvbiApIC0+XG4gIHsgQ29tbWVudCwgSWQsIEFSTiwgU3RhdHVzIH0gPSBkaXN0cmlidXRpb25cbiAgbmFtZTogQ29tbWVudFxuICBpZDogSWRcbiAgYXJuOiBBUk5cbiAgc3RhdHVzOiBTdGF0dXM/LnRvTG93ZXJDYXNlKClcbiAgXzogZGlzdHJpYnV0aW9uXG5cbmxpc3QgPSAtPlxuICBNYXJrZXIgPSB1bmRlZmluZWRcbiAgbG9vcFxuICAgIHsgJG1ldGFkYXRhLCBEaXN0cmlidXRpb25MaXN0IH0gPSBhd2FpdCBBV1MuQ2xvdWRGcm9udC5saXN0RGlzdHJpYnV0aW9ucyB7IE1hcmtlciB9XG4gICAgaWYgJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09IDIwMFxuICAgICAgeyBOZXh0TWFya2VyLCBJdGVtcyB9ID0gRGlzdHJpYnV0aW9uTGlzdFxuICAgICAgKCB5aWVsZCBub3JtYWxpemUgaXRlbSApIGZvciBpdGVtIGluIEl0ZW1zXG4gICAgICBpZiBOZXh0TWFya2VyPyB0aGVuIE1hcmtlciA9IE5leHRNYXJrZXIgZWxzZSBicmVha1xuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImNsb3VkZnJvbnQ6Omxpc3Q6IHVuZXhwZWN0ZWQgc3RhdHVzIFsgI3sgJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlIH0gXVwiXG4gICMgdW5kZWZpbmVkXG5cbmlzQWxpYXNGb3IgPSAoZG9tYWluKSAtPiAoeyBfIH0pIC0+IF8uQWxpYXNlcy5JdGVtcz8uaW5jbHVkZXMgZG9tYWluXG5maW5kID0gKCBkb21haW4gKSAtPiBJdC5maW5kICggaXNBbGlhc0ZvciBkb21haW4gKSwgbGlzdCgpXG5cbmdldERpc3RyaWJ1dGlvbkZvckRvbWFpbiA9ICggZG9tYWluICkgLT4gZmluZCBkb21haW5cblxuYWRkQ3VzdG9tSGVhZGVyID0gKHsgZG9tYWluLCBvcmlnaW4sIG5hbWUsIHZhbHVlIH0pIC0+XG5cbiAgZGlzdHJpYnV0aW9uID0gYXdhaXQgZmluZCBkb21haW5cblxuICB7IFxuICAgICRtZXRhZGF0YVxuICAgIEVUYWdcbiAgICBEaXN0cmlidXRpb25Db25maWcgXG4gIH0gPSBhd2FpdCBBV1MuQ2xvdWRGcm9udC5nZXREaXN0cmlidXRpb25Db25maWcgSWQ6IGRpc3RyaWJ1dGlvbi5pZFxuXG4gIGlmICRtZXRhZGF0YS5odHRwU3RhdHVzQ29kZSA9PSAyMDBcblxuICAgIG9yaWdpbiA9IERpc3RyaWJ1dGlvbkNvbmZpZ1xuICAgICAgLk9yaWdpbnMuSXRlbXMuZmluZCAoeyBEb21haW5OYW1lIH0pIC0+IG9yaWdpbiA9PSBEb21haW5OYW1lXG5cbiAgICBpZiBvcmlnaW4/XG5cbiAgICAgIGhlYWRlcnMgPSAoIG9yaWdpbi5DdXN0b21IZWFkZXJzLkl0ZW1zID8gW10gKVxuXG4gICAgICBpZiAoIGhlYWRlciA9IGhlYWRlcnMuZmluZCAoeyBIZWFkZXJOYW1lIH0pIC0+IEhlYWRlck5hbWUgPT0gbmFtZSApP1xuICAgICAgICBoZWFkZXIuSGVhZGVyVmFsdWUgPSB2YWx1ZVxuICAgICAgZWxzZVxuICAgICAgICBoZWFkZXJzLnB1c2hcbiAgICAgICAgICBIZWFkZXJOYW1lOiBuYW1lXG4gICAgICAgICAgSGVhZGVyVmFsdWU6IHZhbHVlXG5cbiAgICAgIERpc3RyaWJ1dGlvbkNvbmZpZy5PcmlnaW5zLkl0ZW1zWzBdLkN1c3RvbUhlYWRlcnMuSXRlbXMgPSBoZWFkZXJzXG4gICAgICBEaXN0cmlidXRpb25Db25maWcuT3JpZ2lucy5JdGVtc1swXS5DdXN0b21IZWFkZXJzLlF1YW50aXR5ID0gaGVhZGVycy5sZW5ndGhcblxuICAgICAgQVdTLkNsb3VkRnJvbnQudXBkYXRlRGlzdHJpYnV0aW9uIFxuICAgICAgICBJZDogZGlzdHJpYnV0aW9uLmlkXG4gICAgICAgIElmTWF0Y2g6IEVUYWdcbiAgICAgICAgRGlzdHJpYnV0aW9uQ29uZmlnOiBEaXN0cmlidXRpb25Db25maWdcblxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImNsb3VkZnJvbnQuYWRkQ3VzdG9tSGVhZGVyOiBtaXNzaW5nIG9yaWdpbiBbICN7IG9yaWdpbiB9IF1cIlxuXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJjbG91ZGZyb250LmFkZEN1c3RvbUhlYWRlcjogdW5leHBlY3RlZCBzdGF0dXMgWyAjeyAkbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgfSBdXCJcblxuaW52YWxpZGF0ZVBhdGhzID0gKHsgZG9tYWluLCBwYXRocyB9KSAtPlxuICBkaXN0cmlidXRpb24gPSBhd2FpdCBmaW5kIGRvbWFpblxuICBcbiAgeyBcbiAgICAkbWV0YWRhdGFcbiAgICBJbnZhbGlkYXRpb25cbiAgICBMb2NhdGlvbiBcbiAgfSA9IGF3YWl0IEFXUy5DbG91ZEZyb250LmNyZWF0ZUludmFsaWRhdGlvbiBcbiAgICBEaXN0cmlidXRpb25JZDogZGlzdHJpYnV0aW9uLmlkXG4gICAgSW52YWxpZGF0aW9uQmF0Y2g6XG4gICAgICBDYWxsZXJSZWZlcmVuY2U6IERhdGUubm93KClcbiAgICAgIFBhdGhzOlxuICAgICAgICBJdGVtczogcGF0aHNcbiAgICAgICAgUXVhbnRpdHk6IHBhdGhzLmxlbmd0aFxuICBcbiAgaWYgJG1ldGFkYXRhLmh0dHBTdGF0dXNDb2RlID09IDIwMVxuICAgIGNvbnNvbGUubG9nIFwiY2xvdWRmcm9udC5pbnZhbGlkYXRlUGF0aHM6IHN1Y2Nlc3MgcmVzcG9uc2VcIiwgeyBcbiAgICAgIHN0YXR1czogSW52YWxpZGF0aW9uLlN0YXR1cyBcbiAgICAgIHBhdGhzOiBJbnZhbGlkYXRpb24uSW52YWxpZGF0aW9uQmF0Y2guUGF0aHNcbiAgICB9XG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJjbG91ZGZyb250LmludmFsaWRhdGVQYXRoczogdW5leHBlY3RlZCBzdGF0dXMgWyAjeyAkbWV0YWRhdGEuaHR0cFN0YXR1c0NvZGUgfSBdXCJcblxuXG5leHBvcnQge1xuICBsaXN0XG4gIGZpbmRcbiAgYWRkQ3VzdG9tSGVhZGVyXG4gIGludmFsaWRhdGVQYXRoc1xuICBnZXREaXN0cmlidXRpb25Gb3JEb21haW5cbn0iXSwic291cmNlUm9vdCI6IiJ9
//# sourceURL=src/cloudfront.coffee