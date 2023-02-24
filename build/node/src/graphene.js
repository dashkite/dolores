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
//# sourceMappingURL=data:application/json;base64,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TUFBTSx3QkFBTixrQkFBTTtBQUFuQjtBQUZGLEdBRGUsQ0FBakI7O0FBSUEsVUFBTyxRQUFRLENBQWYsTUFBQTtBQUFBLFNBQUEsR0FBQTthQUVJO0FBQUEsUUFBQSxlQUFBLEVBQWlCO0FBQWpCLE87O0FBRkosU0FBQSxHQUFBO2FBSUk7QUFBQSxRQUFBLGVBQUEsRUFBaUI7QUFBakIsTzs7QUFKSjtBQU1JLFlBQU0sSUFBQSxLQUFBLENBQVUsdUNBQ1gsUUFBUSxDQURHLE1BQUEsVUFBQSxVQUFBLE9BQUEsR0FBVixJQUFBLENBQU47QUFOSjtBQU5lLENBQWpCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0U2VjcmV0IH0gZnJvbSBcIi4vc2VjcmV0c1wiXG5pbXBvcnQgKiBhcyBNZXRhIGZyb20gXCJAZGFzaGtpdGUvam95L21ldGFjbGFzc1wiXG5pbXBvcnQgZmV0Y2ggZnJvbSBcIm5vZGUtZmV0Y2hcIlxuaW1wb3J0IE1pbWUgZnJvbSBcIm1pbWUtdHlwZXNcIlxuXG5nZXRDb250ZW50VHlwZSA9IChwYXRoKSAtPlxuICAoIE1pbWUubG9va3VwIHBhdGggICkgPyBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG5cbmNsYXNzIFJlc291cmNlXG4gIEBjcmVhdGU6IChfKSAtPlxuICAgIE9iamVjdC5hc3NpZ24gKG5ldyBAKSwgeyBfIH1cblxuICBNZXRhLm1peGluIEA6OiwgW1xuICAgIE1ldGEuZ2V0dGVyc1xuICAgICAgY29sbGVjdGlvbjogLT4gQF8uY29sbGVjdGlvblxuICAgICAgX2NvbGxlY3Rpb246IC0+IGVuY29kZVVSSUNvbXBvbmVudCBAY29sbGVjdGlvblxuICAgICAga2V5OiAtPiBAXy5rZXlcbiAgICAgIF9rZXk6IC0+IGVuY29kZVVSSUNvbXBvbmVudCBAa2V5XG4gICAgICB1cmw6IC0+IFwiaHR0cHM6Ly9ncmFwaGVuZS5kYXNoa2l0ZS5pby9maWxlcy8je0BfY29sbGVjdGlvbn0vI3tAX2tleX1cIlxuICAgICAgdmFsdWU6IC0+IEBfLnZhbHVlXG4gICAgICBjcmVhdGVkOiAtPiBAXy5jcmVhdGVkXG4gICAgICB1cGRhdGVkOiAtPiBAXy51cGRhdGVkXG4gICAgICBleHBpcmVzOiAtPiBAXy5leHBpcmVzXG4gICAgICB0eXBlOiAtPiBnZXRDb250ZW50VHlwZSBAa2V5XG4gIF1cblxuICB0b0pTT046IC0+IHsgQGNvbGxlY3Rpb24sIEBrZXksIEB2YWx1ZSwgQGNyZWF0ZWQsIEB1cGRhdGVkLCBAZXhwaXJlcyB9XG4gICAgXG5cbmdldFJlc291cmNlID0gKGNvbGxlY3Rpb24sIGtleSkgLT5cbiAgcmVzb3VyY2UgPSBSZXNvdXJjZS5jcmVhdGUgeyBjb2xsZWN0aW9uLCBrZXkgfVxuICByZXNwb25zZSA9IGF3YWl0IGZldGNoIHJlc291cmNlLnVybCxcbiAgICBoZWFkZXJzOlxuICAgICAgXCJ4LWFwaS1rZXlcIjogYXdhaXQgZ2V0U2VjcmV0IFwiZGFzaGtpdGUtYXBpLWtleVwiXG4gIHN3aXRjaCByZXNwb25zZS5zdGF0dXNcbiAgICB3aGVuIDIwMFxuICAgICAgUmVzb3VyY2UuY3JlYXRlIGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIHdoZW4gNDA0XG4gICAgICBudWxsXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZ3JhcGhlbmU6IGdldCBmYWlsZWQgd2l0aCBzdGF0dXNcbiAgICAgICAgI3sgcmVzcG9uc2Uuc3RhdHVzIH0gZm9yIFsgI3tjb2xsZWN0aW9ufSBdWyAje2tleX0gXVwiXG4gIFxucHV0UmVzb3VyY2UgPSAoY29sbGVjdGlvbiwga2V5LCB2YWx1ZSkgLT5cbiAgcmVzb3VyY2UgPSBSZXNvdXJjZS5jcmVhdGUgeyBjb2xsZWN0aW9uLCBrZXksIHZhbHVlIH1cbiAgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCByZXNvdXJjZS51cmwsXG4gICAgbWV0aG9kOiBcIlBVVFwiXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkgcmVzb3VyY2VcbiAgICBoZWFkZXJzOlxuICAgICAgXCJ4LWFwaS1rZXlcIjogYXdhaXQgZ2V0U2VjcmV0IFwiZGFzaGtpdGUtYXBpLWtleVwiXG4gIHN3aXRjaCByZXNwb25zZS5zdGF0dXNcbiAgICB3aGVuIDIwMCwgMjAxXG4gICAgICBSZXNvdXJjZS5jcmVhdGUgYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgZWxzZVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZ3JhcGhlbmU6IHB1dCBmYWlsZWQgd2l0aCBzdGF0dXNcbiAgICAgICAgI3sgcmVzcG9uc2Uuc3RhdHVzIH0gZm9yIFsgI3tjb2xsZWN0aW9ufSBdWyAje2tleX0gXVwiXG5cbmRlbGV0ZVJlc291cmNlID0gKGNvbGxlY3Rpb24sIGtleSkgLT5cbiAgcmVzb3VyY2UgPSBSZXNvdXJjZS5jcmVhdGUgeyBjb2xsZWN0aW9uLCBrZXkgfVxuICByZXNwb25zZSA9IGF3YWl0IGZldGNoIHJlc291cmNlLnVybCxcbiAgICBtZXRob2Q6IFwiREVMRVRFXCJcbiAgICBoZWFkZXJzOlxuICAgICAgXCJ4LWFwaS1rZXlcIjogYXdhaXQgZ2V0U2VjcmV0IFwiZGFzaGtpdGUtYXBpLWtleVwiXG4gIHN3aXRjaCByZXNwb25zZS5zdGF0dXNcbiAgICB3aGVuIDIwNFxuICAgICAgcmVzb3VyY2VEZWxldGVkOiB0cnVlXG4gICAgd2hlbiA0MDRcbiAgICAgIHJlc291cmNlRGVsZXRlZDogZmFsc2VcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJncmFwaGVuZTogZGVsZXRlIGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyByZXNwb25zZS5zdGF0dXMgfSBmb3IgWyAje2NvbGxlY3Rpb259IF1bICN7a2V5fSBdXCJcblxuZXhwb3J0IHsgUmVzb3VyY2UsIGdldFJlc291cmNlLCBwdXRSZXNvdXJjZSwgZGVsZXRlUmVzb3VyY2UgfSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/graphene.coffee