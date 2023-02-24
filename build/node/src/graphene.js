"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.putResource = exports.getResource = exports.deleteResource = exports.Resource = void 0;
var _secrets = require("./secrets.js");
var Meta = _interopRequireWildcard(require("@dashkite/joy/metaclass"));
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
var Resource, deleteResource, getContentType, getResource, putResource;
exports.putResource = putResource;
exports.getResource = getResource;
exports.deleteResource = deleteResource;
exports.Resource = Resource;
getContentType = function (path) {
  var ref;
  return (ref = _mimeTypes.default.lookup(path)) != null ? ref : "application/octet-stream";
};
exports.Resource = Resource = function () {
  class Resource {
    static create(_) {
      return Object.assign(new this(), {
        _
      });
    }
    toJSON() {
      return {
        collection: this.collection,
        key: this.key,
        value: this.value,
        created: this.created,
        updated: this.updated,
        expires: this.expires
      };
    }
  }
  ;
  Meta.mixin(Resource.prototype, [Meta.getters({
    collection: function () {
      return this._.collection;
    },
    _collection: function () {
      return encodeURIComponent(this.collection);
    },
    key: function () {
      return this._.key;
    },
    _key: function () {
      return encodeURIComponent(this.key);
    },
    url: function () {
      return `https://graphene.dashkite.io/files/${this._collection}/${this._key}`;
    },
    value: function () {
      return this._.value;
    },
    created: function () {
      return this._.created;
    },
    updated: function () {
      return this._.updated;
    },
    expires: function () {
      return this._.expires;
    },
    type: function () {
      return getContentType(this.key);
    }
  })]);
  return Resource;
}.call(void 0);
exports.getResource = getResource = async function (collection, key) {
  var resource, response;
  resource = Resource.create({
    collection,
    key
  });
  response = await (0, _nodeFetch.default)(resource.url, {
    headers: {
      "x-api-key": await (0, _secrets.getSecret)("dashkite-api-key")
    }
  });
  switch (response.status) {
    case 200:
      return Resource.create(await response.json());
    case 404:
      return null;
    default:
      throw new Error(`graphene: get failed with status ${response.status} for [ ${collection} ][ ${key} ]`);
  }
};
exports.putResource = putResource = async function (collection, key, value) {
  var resource, response;
  resource = Resource.create({
    collection,
    key,
    value
  });
  response = await (0, _nodeFetch.default)(resource.url, {
    method: "PUT",
    body: JSON.stringify(resource),
    headers: {
      "x-api-key": await (0, _secrets.getSecret)("dashkite-api-key")
    }
  });
  switch (response.status) {
    case 200:
    case 201:
      return Resource.create(await response.json());
    default:
      throw new Error(`graphene: put failed with status ${response.status} for [ ${collection} ][ ${key} ]`);
  }
};
exports.deleteResource = deleteResource = async function (collection, key) {
  var resource, response;
  resource = Resource.create({
    collection,
    key
  });
  response = await (0, _nodeFetch.default)(resource.url, {
    method: "DELETE",
    headers: {
      "x-api-key": await (0, _secrets.getSecret)("dashkite-api-key")
    }
  });
  switch (response.status) {
    case 204:
      return {
        resourceDeleted: true
      };
    case 404:
      return {
        resourceDeleted: false
      };
    default:
      throw new Error(`graphene: delete failed with status ${response.status} for [ ${collection} ][ ${key} ]`);
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9ncmFwaGVuZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUNBLElBQUEsSUFBQSxHQUFBLHVCQUFBLENBQUEsT0FBQTtBQUNBLElBQUEsVUFBQSxHQUFBLHNCQUFBLENBQUEsT0FBQTtBQUNBLElBQUEsVUFBQSxHQUFBLHNCQUFBLENBQUEsT0FBQTtBQUFBLFNBQUEsdUJBQUEsR0FBQSxXQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsS0FBQSxPQUFBLEVBQUEsR0FBQTtBQUFBLFNBQUEseUJBQUEsV0FBQSxlQUFBLE9BQUEsa0NBQUEsaUJBQUEsT0FBQSxPQUFBLFFBQUEsZ0JBQUEsT0FBQSxPQUFBLFlBQUEsd0JBQUEsWUFBQSxDQUFBLFdBQUEsV0FBQSxXQUFBLEdBQUEsZ0JBQUEsR0FBQSxpQkFBQSxLQUFBLFdBQUE7QUFBQSxTQUFBLHdCQUFBLEdBQUEsRUFBQSxXQUFBLFNBQUEsV0FBQSxJQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsVUFBQSxXQUFBLEdBQUEsUUFBQSxHQUFBLG9CQUFBLEdBQUEsd0JBQUEsR0FBQSw0QkFBQSxPQUFBLEVBQUEsR0FBQSxVQUFBLEtBQUEsR0FBQSx3QkFBQSxDQUFBLFdBQUEsT0FBQSxLQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLFlBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLFNBQUEsTUFBQSxXQUFBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLGNBQUEsSUFBQSxNQUFBLENBQUEsd0JBQUEsV0FBQSxHQUFBLElBQUEsR0FBQSxRQUFBLEdBQUEsa0JBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsRUFBQSxHQUFBLFNBQUEsSUFBQSxHQUFBLHFCQUFBLEdBQUEsTUFBQSxDQUFBLHdCQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsY0FBQSxJQUFBLEtBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxLQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLFlBQUEsTUFBQSxDQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsR0FBQSxTQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxNQUFBLEtBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsRUFBQSxNQUFBLFlBQUEsTUFBQTtBQUhBLElBQUEsUUFBQSxFQUFBLGNBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUE7QUFBQSxPQUFBLENBQUEsV0FBQSxHQUFBLFdBQUE7QUFBQSxPQUFBLENBQUEsV0FBQSxHQUFBLFdBQUE7QUFBQSxPQUFBLENBQUEsY0FBQSxHQUFBLGNBQUE7QUFBQSxPQUFBLENBQUEsUUFBQSxHQUFBLFFBQUE7QUFLQSxjQUFBLEdBQWlCLFNBQUEsQ0FBQyxJQUFELEVBQUE7RUFDakIsSUFBQSxHQUFBO2lFQUEwQiwwQkFBQTtBQURULENBQUE7QUFHWCxPQUFBLENBQUEsUUFBQSxHQUFBLFFBQUEsR0FBQSxZQUFBO0VBQU4sTUFBQSxRQUFBLENBQUE7SUFDVyxPQUFSLE1BQVEsQ0FBQyxDQUFELEVBQUE7YUFDUCxNQUFNLENBQUMsTUFBUCxDQUFlLElBQUksSUFBSixFQUFmLEVBQXVCO1FBQUU7TUFBRixDQUF2QixDQUFBO0lBRE87SUFpQlQsTUFBUSxDQUFBLEVBQUE7YUFBRztRQUFHLFVBQUEsRUFBRCxJQUFDLENBQUEsVUFBSDtRQUFnQixHQUFBLEVBQUQsSUFBQyxDQUFBLEdBQWhCO1FBQXNCLEtBQUEsRUFBRCxJQUFDLENBQUEsS0FBdEI7UUFBOEIsT0FBQSxFQUFELElBQUMsQ0FBQSxPQUE5QjtRQUF3QyxPQUFBLEVBQUQsSUFBQyxDQUFBLE9BQXhDO1FBQWtELE9BQUEsRUFBRCxJQUFDLENBQUE7TUFBbEQsQ0FBQTtJQUFIO0VBbEJWO0VBQUE7RUFJRSxJQUFJLENBQUMsS0FBTCxDQUFXLFFBQUMsQ0FBQSxTQUFaLEVBQWdCLENBQ2QsSUFBSSxDQUFDLE9BQUwsQ0FDRTtJQUFBLFVBQUEsRUFBWSxTQUFBLENBQUEsRUFBQTthQUFHLElBQUMsQ0FBQSxDQUFDLENBQUMsVUFBQTtJQUFOLENBQVo7SUFDQSxXQUFBLEVBQWEsU0FBQSxDQUFBLEVBQUE7YUFBRyxrQkFBQSxDQUFtQixJQUFDLENBQUEsVUFBcEIsQ0FBQTtJQUFILENBRGI7SUFFQSxHQUFBLEVBQUssU0FBQSxDQUFBLEVBQUE7YUFBRyxJQUFDLENBQUEsQ0FBQyxDQUFDLEdBQUE7SUFBTixDQUZMO0lBR0EsSUFBQSxFQUFNLFNBQUEsQ0FBQSxFQUFBO2FBQUcsa0JBQUEsQ0FBbUIsSUFBQyxDQUFBLEdBQXBCLENBQUE7SUFBSCxDQUhOO0lBSUEsR0FBQSxFQUFLLFNBQUEsQ0FBQSxFQUFBO01BQUcsT0FBQSxzQ0FBc0MsSUFBQyxDQUF2QyxXQUFBLElBQXNELElBQUMsQ0FBdkQsSUFBQSxFQUFBO0lBQUgsQ0FKTDtJQUtBLEtBQUEsRUFBTyxTQUFBLENBQUEsRUFBQTthQUFHLElBQUMsQ0FBQSxDQUFDLENBQUMsS0FBQTtJQUFOLENBTFA7SUFNQSxPQUFBLEVBQVMsU0FBQSxDQUFBLEVBQUE7YUFBRyxJQUFDLENBQUEsQ0FBQyxDQUFDLE9BQUE7SUFBTixDQU5UO0lBT0EsT0FBQSxFQUFTLFNBQUEsQ0FBQSxFQUFBO2FBQUcsSUFBQyxDQUFBLENBQUMsQ0FBQyxPQUFBO0lBQU4sQ0FQVDtJQVFBLE9BQUEsRUFBUyxTQUFBLENBQUEsRUFBQTthQUFHLElBQUMsQ0FBQSxDQUFDLENBQUMsT0FBQTtJQUFOLENBUlQ7SUFTQSxJQUFBLEVBQU0sU0FBQSxDQUFBLEVBQUE7YUFBRyxjQUFBLENBQWUsSUFBQyxDQUFBLEdBQWhCLENBQUE7SUFBSDtFQVROLENBREYsQ0FEYyxDQUFoQixDQUFBOzs7QUFpQkYsT0FBQSxDQUFBLFdBQUEsR0FBQSxXQUFBLEdBQWMsZUFBQSxDQUFDLFVBQUQsRUFBYSxHQUFiLEVBQUE7RUFDZCxJQUFBLFFBQUEsRUFBQSxRQUFBO0VBQUUsUUFBQSxHQUFXLFFBQVEsQ0FBQyxNQUFULENBQWdCO0lBQUUsVUFBRjtJQUFjO0VBQWQsQ0FBaEIsQ0FBQTtFQUNYLFFBQUEsR0FBVyxNQUFNLElBQUEsa0JBQUEsRUFBTSxRQUFRLENBQUMsR0FBZixFQUNmO0lBQUEsT0FBQSxFQUNFO01BQUEsV0FBQSxFQUFhLE1BQU0sSUFBQSxrQkFBQSxFQUFVLGtCQUFoQjtJQUFiO0VBREYsQ0FEUyxDQUFBO0VBR1gsUUFBTyxRQUFRLENBQUMsTUFBaEI7SUFBQSxLQUNPLEdBRFA7YUFFSSxRQUFRLENBQUMsTUFBVCxDQUFnQixNQUFNLFFBQVEsQ0FBQyxJQUFULEVBQXRCLENBQUE7SUFGSixLQUdPLEdBSFA7YUFJSSxJQUFBO0lBSko7TUFNSSxNQUFNLElBQUksS0FBSixDQUFVLG9DQUNYLFFBQVEsQ0FERyxNQUFBLFVBQUEsVUFBQSxPQUFBLEdBQUEsSUFBVixDQUFBO0VBQUE7QUFYRSxDQUFBO0FBY2QsT0FBQSxDQUFBLFdBQUEsR0FBQSxXQUFBLEdBQWMsZUFBQSxDQUFDLFVBQUQsRUFBYSxHQUFiLEVBQWtCLEtBQWxCLEVBQUE7RUFDZCxJQUFBLFFBQUEsRUFBQSxRQUFBO0VBQUUsUUFBQSxHQUFXLFFBQVEsQ0FBQyxNQUFULENBQWdCO0lBQUUsVUFBRjtJQUFjLEdBQWQ7SUFBbUI7RUFBbkIsQ0FBaEIsQ0FBQTtFQUNYLFFBQUEsR0FBVyxNQUFNLElBQUEsa0JBQUEsRUFBTSxRQUFRLENBQUMsR0FBZixFQUNmO0lBQUEsTUFBQSxFQUFRLEtBQVI7SUFDQSxJQUFBLEVBQU0sSUFBSSxDQUFDLFNBQUwsQ0FBZSxRQUFmLENBRE47SUFFQSxPQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQWEsTUFBTSxJQUFBLGtCQUFBLEVBQVUsa0JBQWhCO0lBQWI7RUFIRixDQURTLENBQUE7RUFLWCxRQUFPLFFBQVEsQ0FBQyxNQUFoQjtJQUFBLEtBQ08sR0FEUDtJQUFBLEtBQ1ksR0FEWjthQUVJLFFBQVEsQ0FBQyxNQUFULENBQWdCLE1BQU0sUUFBUSxDQUFDLElBQVQsRUFBdEIsQ0FBQTtJQUZKO01BSUksTUFBTSxJQUFJLEtBQUosQ0FBVSxvQ0FDWCxRQUFRLENBREcsTUFBQSxVQUFBLFVBQUEsT0FBQSxHQUFBLElBQVYsQ0FBQTtFQUFBO0FBWEUsQ0FBQTtBQWNkLE9BQUEsQ0FBQSxjQUFBLEdBQUEsY0FBQSxHQUFpQixlQUFBLENBQUMsVUFBRCxFQUFhLEdBQWIsRUFBQTtFQUNqQixJQUFBLFFBQUEsRUFBQSxRQUFBO0VBQUUsUUFBQSxHQUFXLFFBQVEsQ0FBQyxNQUFULENBQWdCO0lBQUUsVUFBRjtJQUFjO0VBQWQsQ0FBaEIsQ0FBQTtFQUNYLFFBQUEsR0FBVyxNQUFNLElBQUEsa0JBQUEsRUFBTSxRQUFRLENBQUMsR0FBZixFQUNmO0lBQUEsTUFBQSxFQUFRLFFBQVI7SUFDQSxPQUFBLEVBQ0U7TUFBQSxXQUFBLEVBQWEsTUFBTSxJQUFBLGtCQUFBLEVBQVUsa0JBQWhCO0lBQWI7RUFGRixDQURTLENBQUE7RUFJWCxRQUFPLFFBQVEsQ0FBQyxNQUFoQjtJQUFBLEtBQ08sR0FEUDthQUVJO1FBQUEsZUFBQSxFQUFpQjtNQUFqQixDQUFBO0lBRkosS0FHTyxHQUhQO2FBSUk7UUFBQSxlQUFBLEVBQWlCO01BQWpCLENBQUE7SUFKSjtNQU1JLE1BQU0sSUFBSSxLQUFKLENBQVUsdUNBQ1gsUUFBUSxDQURHLE1BQUEsVUFBQSxVQUFBLE9BQUEsR0FBQSxJQUFWLENBQUE7RUFBQTtBQVpLLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRTZWNyZXQgfSBmcm9tIFwiLi9zZWNyZXRzXCJcbmltcG9ydCAqIGFzIE1ldGEgZnJvbSBcIkBkYXNoa2l0ZS9qb3kvbWV0YWNsYXNzXCJcbmltcG9ydCBmZXRjaCBmcm9tIFwibm9kZS1mZXRjaFwiXG5pbXBvcnQgTWltZSBmcm9tIFwibWltZS10eXBlc1wiXG5cbmdldENvbnRlbnRUeXBlID0gKHBhdGgpIC0+XG4gICggTWltZS5sb29rdXAgcGF0aCAgKSA/IFwiYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtXCJcblxuY2xhc3MgUmVzb3VyY2VcbiAgQGNyZWF0ZTogKF8pIC0+XG4gICAgT2JqZWN0LmFzc2lnbiAobmV3IEApLCB7IF8gfVxuXG4gIE1ldGEubWl4aW4gQDo6LCBbXG4gICAgTWV0YS5nZXR0ZXJzXG4gICAgICBjb2xsZWN0aW9uOiAtPiBAXy5jb2xsZWN0aW9uXG4gICAgICBfY29sbGVjdGlvbjogLT4gZW5jb2RlVVJJQ29tcG9uZW50IEBjb2xsZWN0aW9uXG4gICAgICBrZXk6IC0+IEBfLmtleVxuICAgICAgX2tleTogLT4gZW5jb2RlVVJJQ29tcG9uZW50IEBrZXlcbiAgICAgIHVybDogLT4gXCJodHRwczovL2dyYXBoZW5lLmRhc2hraXRlLmlvL2ZpbGVzLyN7QF9jb2xsZWN0aW9ufS8je0Bfa2V5fVwiXG4gICAgICB2YWx1ZTogLT4gQF8udmFsdWVcbiAgICAgIGNyZWF0ZWQ6IC0+IEBfLmNyZWF0ZWRcbiAgICAgIHVwZGF0ZWQ6IC0+IEBfLnVwZGF0ZWRcbiAgICAgIGV4cGlyZXM6IC0+IEBfLmV4cGlyZXNcbiAgICAgIHR5cGU6IC0+IGdldENvbnRlbnRUeXBlIEBrZXlcbiAgXVxuXG4gIHRvSlNPTjogLT4geyBAY29sbGVjdGlvbiwgQGtleSwgQHZhbHVlLCBAY3JlYXRlZCwgQHVwZGF0ZWQsIEBleHBpcmVzIH1cbiAgICBcblxuZ2V0UmVzb3VyY2UgPSAoY29sbGVjdGlvbiwga2V5KSAtPlxuICByZXNvdXJjZSA9IFJlc291cmNlLmNyZWF0ZSB7IGNvbGxlY3Rpb24sIGtleSB9XG4gIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2ggcmVzb3VyY2UudXJsLFxuICAgIGhlYWRlcnM6XG4gICAgICBcIngtYXBpLWtleVwiOiBhd2FpdCBnZXRTZWNyZXQgXCJkYXNoa2l0ZS1hcGkta2V5XCJcbiAgc3dpdGNoIHJlc3BvbnNlLnN0YXR1c1xuICAgIHdoZW4gMjAwXG4gICAgICBSZXNvdXJjZS5jcmVhdGUgYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgd2hlbiA0MDRcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJncmFwaGVuZTogZ2V0IGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyByZXNwb25zZS5zdGF0dXMgfSBmb3IgWyAje2NvbGxlY3Rpb259IF1bICN7a2V5fSBdXCJcbiAgXG5wdXRSZXNvdXJjZSA9IChjb2xsZWN0aW9uLCBrZXksIHZhbHVlKSAtPlxuICByZXNvdXJjZSA9IFJlc291cmNlLmNyZWF0ZSB7IGNvbGxlY3Rpb24sIGtleSwgdmFsdWUgfVxuICByZXNwb25zZSA9IGF3YWl0IGZldGNoIHJlc291cmNlLnVybCxcbiAgICBtZXRob2Q6IFwiUFVUXCJcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSByZXNvdXJjZVxuICAgIGhlYWRlcnM6XG4gICAgICBcIngtYXBpLWtleVwiOiBhd2FpdCBnZXRTZWNyZXQgXCJkYXNoa2l0ZS1hcGkta2V5XCJcbiAgc3dpdGNoIHJlc3BvbnNlLnN0YXR1c1xuICAgIHdoZW4gMjAwLCAyMDFcbiAgICAgIFJlc291cmNlLmNyZWF0ZSBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJncmFwaGVuZTogcHV0IGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyByZXNwb25zZS5zdGF0dXMgfSBmb3IgWyAje2NvbGxlY3Rpb259IF1bICN7a2V5fSBdXCJcblxuZGVsZXRlUmVzb3VyY2UgPSAoY29sbGVjdGlvbiwga2V5KSAtPlxuICByZXNvdXJjZSA9IFJlc291cmNlLmNyZWF0ZSB7IGNvbGxlY3Rpb24sIGtleSB9XG4gIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2ggcmVzb3VyY2UudXJsLFxuICAgIG1ldGhvZDogXCJERUxFVEVcIlxuICAgIGhlYWRlcnM6XG4gICAgICBcIngtYXBpLWtleVwiOiBhd2FpdCBnZXRTZWNyZXQgXCJkYXNoa2l0ZS1hcGkta2V5XCJcbiAgc3dpdGNoIHJlc3BvbnNlLnN0YXR1c1xuICAgIHdoZW4gMjA0XG4gICAgICByZXNvdXJjZURlbGV0ZWQ6IHRydWVcbiAgICB3aGVuIDQwNFxuICAgICAgcmVzb3VyY2VEZWxldGVkOiBmYWxzZVxuICAgIGVsc2VcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImdyYXBoZW5lOiBkZWxldGUgZmFpbGVkIHdpdGggc3RhdHVzXG4gICAgICAgICN7IHJlc3BvbnNlLnN0YXR1cyB9IGZvciBbICN7Y29sbGVjdGlvbn0gXVsgI3trZXl9IF1cIlxuXG5leHBvcnQgeyBSZXNvdXJjZSwgZ2V0UmVzb3VyY2UsIHB1dFJlc291cmNlLCBkZWxldGVSZXNvdXJjZSB9Il0sInNvdXJjZVJvb3QiOiIifQ==
//# sourceURL=src/graphene.coffee