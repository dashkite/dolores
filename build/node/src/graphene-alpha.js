"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitCollection = exports.upsertCollection = exports.scan = exports.putItem = exports.publishCollection = exports.incrementItem = exports.getItem = exports.getDatabase = exports.getCollection = exports.deleteItem = exports.deleteDatabase = exports.deleteCollection = exports.createDatabase = exports.Item = void 0;

var _secrets = require("./secrets.js");

var Meta = _interopRequireWildcard(require("@dashkite/joy/metaclass"));

var Fn = _interopRequireWildcard(require("@dashkite/joy/function"));

var Time = _interopRequireWildcard(require("@dashkite/joy/time"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _pandaSkyClient = _interopRequireDefault(require("panda-sky-client"));

var _mimeTypes = _interopRequireDefault(require("mime-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var Item, cache, createDatabase, createRequest, deleteCollection, deleteDatabase, deleteItem, getCollection, getContentType, getDatabase, getItem, h, incrementItem, publishCollection, putItem, scan, upsertCollection, waitCollection;
exports.waitCollection = waitCollection;
exports.upsertCollection = upsertCollection;
exports.scan = scan;
exports.putItem = putItem;
exports.publishCollection = publishCollection;
exports.incrementItem = incrementItem;
exports.getItem = getItem;
exports.getDatabase = getDatabase;
exports.getCollection = getCollection;
exports.deleteItem = deleteItem;
exports.deleteDatabase = deleteDatabase;
exports.deleteCollection = deleteCollection;
exports.createDatabase = createDatabase;
exports.Item = Item;
cache = {
  url: "https://graphene-alpha.dashkite.io",
  apiKey: null,
  client: null
};
h = {
  resource: Fn.curry(Fn.rtee(function (resource, context) {
    return context.resource = resource;
  })),
  method: Fn.curry(Fn.rtee(function (method, context) {
    return context.method = method;
  })),
  parameters: Fn.curry(Fn.rtee(function (parameters, context) {
    return context.parameters = parameters;
  })),
  content: Fn.curry(Fn.rtee(function (content, context) {
    return context.content = content;
  })),
  headers: Fn.curry(Fn.rtee(function (headers, context) {
    if (context.headers == null) {
      context.headers = {};
    }

    return Object.assign(context.headers, headers);
  }))
};

createRequest = function (fx) {
  return {
    issue: async function () {
      var apiKey, body, client, context, headers, json, method, parameters, resource, response;
      apiKey = await async function () {
        return cache.apiKey != null ? cache.apiKey : cache.apiKey = await (0, _secrets.getSecret)("dashkite-api-key");
      }();
      client = await async function () {
        return cache.client != null ? cache.client : cache.client = await (0, _pandaSkyClient.default)(cache.url, {
          fetch: _nodeFetch.default,
          headers: {
            "x-api-key": apiKey
          }
        });
      }();
      context = Fn.pipe([function () {
        return {};
      }, ...fx, h.headers({
        "x-api-key": apiKey
      })])();
      ({
        resource,
        parameters,
        method,
        content: body,
        headers
      } = context);
      response = await client[resource](parameters)[method]({
        body,
        headers
      });

      if (response.status !== 204) {
        json = await response.json();
      }

      return {
        status: response.status,
        json: json
      };
    }
  };
};

getContentType = function (path) {
  var ref;
  return (ref = _mimeTypes.default.lookup(path)) != null ? ref : "application/octet-stream";
};

exports.Item = Item = function () {
  class Item {
    static create(_) {
      return Object.assign(new this(), {
        _
      });
    }

    toJSON() {
      return {
        database: this.database,
        collection: this.collection,
        key: this.key,
        content: this.content,
        created: this.created,
        updated: this.updated,
        expires: this.expires
      };
    }

  }

  ;
  Meta.mixin(Item.prototype, [Meta.getters({
    database: function () {
      return this._.database;
    },
    collection: function () {
      return this._.collection;
    },
    key: function () {
      return this._.key;
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
    content: function () {
      return this._.content;
    },
    type: function () {
      return getContentType(this.key);
    }
  })]);
  return Item;
}.call(void 0);

exports.getItem = getItem = async function ({
  database,
  collection,
  key
}) {
  var error, request, response;
  request = createRequest([h.resource("item"), h.method("get"), h.parameters({
    database,
    collection,
    key
  })]);

  try {
    response = await request.issue();
    return Item.create(response.json);
  } catch (error1) {
    error = error1;

    if (error.status === 404) {
      return null;
    } else if (error.status != null) {
      throw new Error(`graphene: get failed with status ${error.status} for [ ${database} ][ ${collection} ][ ${key} ]`);
    } else {
      throw error;
    }
  }
};

exports.putItem = putItem = async function ({
  database,
  collection,
  key,
  content
}) {
  var error, item, request, response;
  item = Item.create({
    database,
    collection,
    key,
    content
  });
  request = createRequest([h.resource("item"), h.method("put"), h.parameters(item), h.content(item)]);

  try {
    response = await request.issue();
    return Item.create(response.json);
  } catch (error1) {
    error = error1;

    if (error.status != null) {
      throw new Error(`graphene: put failed with status ${error.status} for [ ${database} ][ ${collection} ][ ${key} ]`);
    } else {
      throw error;
    }
  }
};

exports.deleteItem = deleteItem = async function ({
  database,
  collection,
  key
}) {
  var error, request, response;
  request = createRequest([h.resource("item"), h.method("delete"), h.parameters({
    database,
    collection,
    key
  })]);

  try {
    response = await request.issue();
    return {
      itemDeleted: true
    };
  } catch (error1) {
    error = error1;

    if (error.status === 404) {
      return {
        itemDeleted: false
      };
    } else if (error.status != null) {
      throw new Error(`graphene: delete failed with status ${error.status} for [ ${database} ][ ${collection} ][ ${key} ]`);
    } else {
      throw error;
    }
  }
};

exports.scan = scan = async function ({
  database,
  collection,
  filter,
  token
}) {
  var _, error, request, response;

  _ = filter != null ? JSON.stringify(filter) : void 0;
  request = createRequest([h.resource("items"), h.method("get"), h.parameters({
    database,
    collection,
    filter: _,
    token
  })]);

  try {
    response = await request.issue();
    return {
      list: function () {
        var i, len, ref, results;
        ref = response.json.list;
        results = [];

        for (i = 0, len = ref.length; i < len; i++) {
          _ = ref[i];
          results.push(Item.create(_));
        }

        return results;
      }(),
      token: response.json.token
    };
  } catch (error1) {
    error = error1;

    if (error.status != null) {
      throw new Error(`graphene: scan failed with status ${error.status} for [ ${database} ][ ${collection} ]`);
    } else {
      throw error;
    }
  }
};

exports.incrementItem = incrementItem = async function ({
  database,
  collection,
  key,
  increments
}) {
  var error, request;
  request = createRequest([h.resource("increment"), h.method("post"), h.parameters({
    database,
    collection,
    key
  }), h.content({
    increments
  })]);

  try {
    return await request.issue();
  } catch (error1) {
    error = error1;

    if (error.status === 404) {
      return {
        itemDeleted: false
      };
    } else if (error.status != null) {
      throw new Error(`graphene: item increment failed with status ${error.status} for [ ${database} ][ ${collection} ][ ${key} ]`);
    } else {
      throw error;
    }
  }
};

exports.createDatabase = createDatabase = async function ({
  name
}) {
  var error, request, response;
  request = createRequest([h.resource("databases"), h.method("post"), h.parameters({
    name
  })]);

  try {
    response = await request.issue();
    return response.json;
  } catch (error1) {
    error = error1;

    if (error.status != null) {
      throw new Error(`graphene: database creation failed with status ${error.status}`);
    } else {
      throw error;
    }
  }
};

exports.getDatabase = getDatabase = async function ({
  address
}) {
  var error, request, response;
  request = createRequest([h.resource("database"), h.method("get"), h.parameters({
    address
  })]);

  try {
    response = await request.issue();
    return response.json;
  } catch (error1) {
    error = error1;

    if (error.status === 404) {
      return null;
    } else if (error.status != null) {
      throw new Error(`graphene: database get failed with status ${error.status} for [ ${address} ]`);
    } else {
      throw error;
    }
  }
};

exports.deleteDatabase = deleteDatabase = async function ({
  address
}) {
  var error, request;
  request = createRequest([h.resource("database"), h.method("delete"), h.parameters({
    address
  })]);

  try {
    await request.issue();
    return {
      databaseDeleted: true
    };
  } catch (error1) {
    error = error1;

    if (error.status === 404) {
      return {
        databaseDeleted: false
      };
    } else if (error.status != null) {
      throw new Error(`graphene: database delete failed with status ${error.status} for [ ${address} ]`);
    } else {
      throw error;
    }
  }
};

exports.upsertCollection = upsertCollection = async function ({
  database,
  byname,
  name,
  views
}) {
  var error, request, response;
  request = createRequest([h.resource("collection"), h.method("post"), h.parameters({
    database,
    byname
  }), h.content({
    database,
    byname,
    name,
    views
  })]);

  try {
    response = await request.issue();
    return response.json;
  } catch (error1) {
    error = error1;

    if (error.status != null) {
      throw new Error(`graphene: collection post failed with status ${error.status} for [ ${database} ][ ${collection} ]`);
    } else {
      throw error;
    }
  }
};

exports.getCollection = getCollection = async function ({
  database,
  byname
}) {
  var error, request, response;
  request = createRequest([h.resource("collection"), h.method("get"), h.parameters({
    database,
    byname
  })]);

  try {
    response = await request.issue();
    return response.json;
  } catch (error1) {
    error = error1;

    if (error.status === 404) {
      return null;
    } else if (error.status != null) {
      throw new Error(`graphene: collection get failed with status ${error.status} for [ ${database} ][ ${byname} ]`);
    } else {
      throw error;
    }
  }
};

exports.deleteCollection = deleteCollection = async function ({
  database,
  byname
}) {
  var error, request;
  request = createRequest([h.resource("collection"), h.method("delete"), h.parameters({
    database,
    byname
  })]);

  try {
    await request.issue();
    return {
      collectionDeleted: true
    };
  } catch (error1) {
    error = error1;

    if (error.status === 404) {
      return {
        collectionDeleted: false
      };
    } else if (error.status != null) {
      throw new Error(`graphene: database delete failed with status ${error.status} for [ ${address} ]`);
    } else {
      throw error;
    }
  }
};

exports.waitCollection = waitCollection = async function ({
  database,
  byname
}) {
  var collection, count;
  collection = await getCollection({
    database,
    byname
  });
  count = 0;

  while (true) {
    if (count++ > 5) {
      throw new Error(`graphene: collection [ ${database} ][ ${byname} ] failed to stabilize`);
    } else if (collection == null) {
      throw new Error(`graphene: collection [ ${database} ][ ${byname} ] is not found`);
    } else if (collection.status !== "ready") {
      count++;
      await Time.sleep(5000);
    } else {
      return collection;
    }
  }
};

exports.publishCollection = publishCollection = async function ({
  database,
  byname,
  name,
  views
}) {
  await upsertCollection({
    database,
    byname,
    name,
    views
  });
  return await waitCollection({
    database,
    byname
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9ncmFwaGVuZS1hbHBoYS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7Ozs7O0FBTkEsSUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLGNBQUEsRUFBQSxhQUFBLEVBQUEsZ0JBQUEsRUFBQSxjQUFBLEVBQUEsVUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLE9BQUEsRUFBQSxDQUFBLEVBQUEsYUFBQSxFQUFBLGlCQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxnQkFBQSxFQUFBLGNBQUE7Ozs7Ozs7Ozs7Ozs7OztBQVFBLEtBQUEsR0FDRTtBQUFBLEVBQUEsR0FBQSxFQUFBLG9DQUFBO0FBQ0EsRUFBQSxNQUFBLEVBREEsSUFBQTtBQUVBLEVBQUEsTUFBQSxFQUFRO0FBRlIsQ0FERjtBQUtBLENBQUEsR0FDRTtBQUFBLEVBQUEsUUFBQSxFQUFVLEVBQUUsQ0FBRixLQUFBLENBQVMsRUFBRSxDQUFGLElBQUEsQ0FBUSxVQUFBLFFBQUEsRUFBQSxPQUFBLEVBQUE7V0FDekIsT0FBTyxDQUFQLFFBQUEsR0FBbUIsUTtBQURyQixHQUFtQixDQUFULENBQVY7QUFHQSxFQUFBLE1BQUEsRUFBUSxFQUFFLENBQUYsS0FBQSxDQUFTLEVBQUUsQ0FBRixJQUFBLENBQVEsVUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBO1dBQ3ZCLE9BQU8sQ0FBUCxNQUFBLEdBQWlCLE07QUFKbkIsR0FHaUIsQ0FBVCxDQUhSO0FBTUEsRUFBQSxVQUFBLEVBQVksRUFBRSxDQUFGLEtBQUEsQ0FBUyxFQUFFLENBQUYsSUFBQSxDQUFRLFVBQUEsVUFBQSxFQUFBLE9BQUEsRUFBQTtXQUMzQixPQUFPLENBQVAsVUFBQSxHQUFxQixVO0FBUHZCLEdBTXFCLENBQVQsQ0FOWjtBQVNBLEVBQUEsT0FBQSxFQUFTLEVBQUUsQ0FBRixLQUFBLENBQVMsRUFBRSxDQUFGLElB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QUEsUUFBQTtBQUFBLElBQUEsTUFBQTtBQUFBLElBQUEsSUFBQTtBQUFqQixJQUFBO0FBQWlCLEdBQWpCLENBQU47QUFDQSxTQUFBLE1BQU0sY0FBQSxDQUFlO0FBQUEsSUFBQSxRQUFBO0FBQXJCLElBQUE7QUFBcUIsR0FBZixDQUFOO0FBRmtCLENBQXBCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0U2VjcmV0IH0gZnJvbSBcIi4vc2VjcmV0c1wiXG5pbXBvcnQgKiBhcyBNZXRhIGZyb20gXCJAZGFzaGtpdGUvam95L21ldGFjbGFzc1wiXG5pbXBvcnQgKiBhcyBGbiBmcm9tIFwiQGRhc2hraXRlL2pveS9mdW5jdGlvblwiXG5pbXBvcnQgKiBhcyBUaW1lIGZyb20gXCJAZGFzaGtpdGUvam95L3RpbWVcIlxuaW1wb3J0IGZldGNoIGZyb20gXCJub2RlLWZldGNoXCJcbmltcG9ydCBkaXNjb3ZlciBmcm9tIFwicGFuZGEtc2t5LWNsaWVudFwiXG5pbXBvcnQgTWltZSBmcm9tIFwibWltZS10eXBlc1wiXG5cbmNhY2hlID1cbiAgdXJsOiBcImh0dHBzOi8vZ3JhcGhlbmUtYWxwaGEuZGFzaGtpdGUuaW9cIlxuICBhcGlLZXk6IG51bGxcbiAgY2xpZW50OiBudWxsXG5cbmggPSBcbiAgcmVzb3VyY2U6IEZuLmN1cnJ5IEZuLnJ0ZWUgKHJlc291cmNlLCBjb250ZXh0KSAtPlxuICAgIGNvbnRleHQucmVzb3VyY2UgPSByZXNvdXJjZVxuXG4gIG1ldGhvZDogRm4uY3VycnkgRm4ucnRlZSAobWV0aG9kLCBjb250ZXh0KSAtPlxuICAgIGNvbnRleHQubWV0aG9kID0gbWV0aG9kIFxuXG4gIHBhcmFtZXRlcnM6IEZuLmN1cnJ5IEZuLnJ0ZWUgKHBhcmFtZXRlcnMsIGNvbnRleHQpIC0+XG4gICAgY29udGV4dC5wYXJhbWV0ZXJzID0gcGFyYW1ldGVyc1xuXG4gIGNvbnRlbnQ6IEZuLmN1cnJ5IEZuLnJ0ZWUgKGNvbnRlbnQsIGNvbnRleHQpIC0+XG4gICAgY29udGV4dC5jb250ZW50ID0gY29udGVudFxuXG4gIGhlYWRlcnM6IEZuLmN1cnJ5IEZuLnJ0ZWUgKGhlYWRlcnMsIGNvbnRleHQpIC0+XG4gICAgY29udGV4dC5oZWFkZXJzID89IHt9XG4gICAgT2JqZWN0LmFzc2lnbiBjb250ZXh0LmhlYWRlcnMsIGhlYWRlcnNcblxuY3JlYXRlUmVxdWVzdCA9IChmeCkgLT5cbiAgaXNzdWU6IC0+XG4gICAgYXBpS2V5ID0gYXdhaXQgZG8gLT4gXG4gICAgICBjYWNoZS5hcGlLZXkgPz0gYXdhaXQgZ2V0U2VjcmV0IFwiZGFzaGtpdGUtYXBpLWtleVwiXG5cbiAgICBjbGllbnQgPSBhd2FpdCBkbyAtPlxuICAgICAgY2FjaGUuY2xpZW50ID89IGF3YWl0IGRpc2NvdmVyIGNhY2hlLnVybCwgXG4gICAgICAgIGZldGNoOiBmZXRjaFxuICAgICAgICBoZWFkZXJzOiBcIngtYXBpLWtleVwiOiBhcGlLZXlcblxuICAgIGNvbnRleHQgPSBkbyBGbi5waXBlIFtcbiAgICAgIC0+IHt9XG4gICAgICBmeC4uLlxuICAgICAgaC5oZWFkZXJzIFwieC1hcGkta2V5XCI6IGFwaUtleVxuICAgIF1cblxuICAgIHsgcmVzb3VyY2UsIHBhcmFtZXRlcnMsIG1ldGhvZCwgY29udGVudDpib2R5LCBoZWFkZXJzIH0gPSBjb250ZXh0XG5cbiAgICByZXNwb25zZSA9IGF3YWl0IGNsaWVudFsgcmVzb3VyY2UgXShwYXJhbWV0ZXJzKVttZXRob2RdKHsgYm9keSwgaGVhZGVycyB9KVxuXG4gICAgaWYgcmVzcG9uc2Uuc3RhdHVzICE9IDIwNFxuICAgICAganNvbiA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICBcbiAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1c1xuICAgIGpzb246IGpzb25cblxuXG5nZXRDb250ZW50VHlwZSA9IChwYXRoKSAtPlxuICAoIE1pbWUubG9va3VwIHBhdGggICkgPyBcImFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbVwiXG5cbmNsYXNzIEl0ZW1cbiAgQGNyZWF0ZTogKF8pIC0+XG4gICAgT2JqZWN0LmFzc2lnbiAobmV3IEApLCB7IF8gfVxuXG4gIE1ldGEubWl4aW4gQDo6LCBbXG4gICAgTWV0YS5nZXR0ZXJzXG4gICAgICBkYXRhYmFzZTogLT4gQF8uZGF0YWJhc2VcbiAgICAgIGNvbGxlY3Rpb246IC0+IEBfLmNvbGxlY3Rpb25cbiAgICAgIGtleTogLT4gQF8ua2V5XG4gICAgICBjcmVhdGVkOiAtPiBAXy5jcmVhdGVkXG4gICAgICB1cGRhdGVkOiAtPiBAXy51cGRhdGVkXG4gICAgICBleHBpcmVzOiAtPiBAXy5leHBpcmVzXG4gICAgICBjb250ZW50OiAtPiBAXy5jb250ZW50XG4gICAgICB0eXBlOiAtPiBnZXRDb250ZW50VHlwZSBAa2V5XG4gIF1cblxuICB0b0pTT046IC0+IHsgQGRhdGFiYXNlLCBAY29sbGVjdGlvbiwgQGtleSwgQGNvbnRlbnQsIEBjcmVhdGVkLCBAdXBkYXRlZCwgQGV4cGlyZXMgfVxuICAgIFxuXG5nZXRJdGVtID0gKHsgZGF0YWJhc2UsIGNvbGxlY3Rpb24sIGtleSB9KSAtPlxuICByZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdCBbXG4gICAgaC5yZXNvdXJjZSBcIml0ZW1cIlxuICAgIGgubWV0aG9kIFwiZ2V0XCJcbiAgICBoLnBhcmFtZXRlcnMgeyBkYXRhYmFzZSwgY29sbGVjdGlvbiwga2V5IH1cbiAgXVxuICB0cnlcbiAgICByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QuaXNzdWUoKVxuICAgIEl0ZW0uY3JlYXRlIHJlc3BvbnNlLmpzb25cbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBlcnJvci5zdGF0dXMgPT0gNDA0XG4gICAgICBudWxsXG4gICAgZWxzZSBpZiBlcnJvci5zdGF0dXM/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJncmFwaGVuZTogZ2V0IGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyBlcnJvci5zdGF0dXMgfSBmb3IgWyAje2RhdGFiYXNlfSBdWyAje2NvbGxlY3Rpb259IF1bICN7a2V5fSBdXCJcbiAgICBlbHNlXG4gICAgICB0aHJvdyBlcnJvclxuICBcbnB1dEl0ZW0gPSAoeyBkYXRhYmFzZSwgY29sbGVjdGlvbiwga2V5LCBjb250ZW50IH0pIC0+XG4gIGl0ZW0gPSBJdGVtLmNyZWF0ZSB7IGRhdGFiYXNlLCBjb2xsZWN0aW9uLCBrZXksIGNvbnRlbnQgfVxuICByZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdCBbXG4gICAgaC5yZXNvdXJjZSBcIml0ZW1cIlxuICAgIGgubWV0aG9kIFwicHV0XCJcbiAgICBoLnBhcmFtZXRlcnMgaXRlbVxuICAgIGguY29udGVudCBpdGVtXG4gIF1cbiAgdHJ5XG4gICAgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0Lmlzc3VlKClcbiAgICBJdGVtLmNyZWF0ZSByZXNwb25zZS5qc29uXG4gIGNhdGNoIGVycm9yXG4gICAgaWYgZXJyb3Iuc3RhdHVzP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZ3JhcGhlbmU6IHB1dCBmYWlsZWQgd2l0aCBzdGF0dXNcbiAgICAgICAgI3sgZXJyb3Iuc3RhdHVzIH0gZm9yIFsgI3tkYXRhYmFzZX0gXVsgI3tjb2xsZWN0aW9ufSBdWyAje2tleX0gXVwiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuZGVsZXRlSXRlbSA9ICh7IGRhdGFiYXNlLCBjb2xsZWN0aW9uLCBrZXkgfSkgLT5cbiAgcmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QgW1xuICAgIGgucmVzb3VyY2UgXCJpdGVtXCJcbiAgICBoLm1ldGhvZCBcImRlbGV0ZVwiXG4gICAgaC5wYXJhbWV0ZXJzIHsgZGF0YWJhc2UsIGNvbGxlY3Rpb24sIGtleSB9XG4gIF1cbiAgdHJ5XG4gICAgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0Lmlzc3VlKClcbiAgICBpdGVtRGVsZXRlZDogdHJ1ZVxuICBjYXRjaCBlcnJvclxuICAgIGlmIGVycm9yLnN0YXR1cyA9PSA0MDRcbiAgICAgIGl0ZW1EZWxldGVkOiBmYWxzZVxuICAgIGVsc2UgaWYgZXJyb3Iuc3RhdHVzP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZ3JhcGhlbmU6IGRlbGV0ZSBmYWlsZWQgd2l0aCBzdGF0dXNcbiAgICAgICAgI3sgZXJyb3Iuc3RhdHVzIH0gZm9yIFsgI3tkYXRhYmFzZX0gXVsgI3tjb2xsZWN0aW9ufSBdWyAje2tleX0gXVwiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3Jcblxuc2NhbiA9ICh7IGRhdGFiYXNlLCBjb2xsZWN0aW9uLCBmaWx0ZXIsIHRva2VuIH0pIC0+XG4gIF8gPSBpZiBmaWx0ZXI/IHRoZW4gSlNPTi5zdHJpbmdpZnkgZmlsdGVyXG5cbiAgcmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QgW1xuICAgIGgucmVzb3VyY2UgXCJpdGVtc1wiXG4gICAgaC5tZXRob2QgXCJnZXRcIlxuICAgIGgucGFyYW1ldGVycyB7IGRhdGFiYXNlLCBjb2xsZWN0aW9uLCBmaWx0ZXI6IF8sIHRva2VuIH1cbiAgXSBcbiAgdHJ5XG4gICAgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0Lmlzc3VlKClcbiAgICBsaXN0OiAoICggSXRlbS5jcmVhdGUgXyApIGZvciBfIGluIHJlc3BvbnNlLmpzb24ubGlzdCApXG4gICAgdG9rZW46IHJlc3BvbnNlLmpzb24udG9rZW5cbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBlcnJvci5zdGF0dXM/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJncmFwaGVuZTogc2NhbiBmYWlsZWQgd2l0aCBzdGF0dXNcbiAgICAgICAgI3sgZXJyb3Iuc3RhdHVzIH0gZm9yIFsgI3tkYXRhYmFzZX0gXVsgI3tjb2xsZWN0aW9ufSBdXCJcbiAgICBlbHNlXG4gICAgICB0aHJvdyBlcnJvclxuXG5pbmNyZW1lbnRJdGVtID0gKHsgZGF0YWJhc2UsIGNvbGxlY3Rpb24sIGtleSwgaW5jcmVtZW50cyB9KSAtPlxuICByZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdCBbXG4gICAgaC5yZXNvdXJjZSBcImluY3JlbWVudFwiXG4gICAgaC5tZXRob2QgXCJwb3N0XCJcbiAgICBoLnBhcmFtZXRlcnMgeyBkYXRhYmFzZSwgY29sbGVjdGlvbiwga2V5IH1cbiAgICBoLmNvbnRlbnQgeyBpbmNyZW1lbnRzIH1cbiAgXVxuICB0cnlcbiAgICBhd2FpdCByZXF1ZXN0Lmlzc3VlKClcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBlcnJvci5zdGF0dXMgPT0gNDA0XG4gICAgICBpdGVtRGVsZXRlZDogZmFsc2VcbiAgICBlbHNlIGlmIGVycm9yLnN0YXR1cz9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcImdyYXBoZW5lOiBpdGVtIGluY3JlbWVudCBmYWlsZWQgd2l0aCBzdGF0dXNcbiAgICAgICAgI3sgZXJyb3Iuc3RhdHVzIH0gZm9yIFsgI3tkYXRhYmFzZX0gXVsgI3tjb2xsZWN0aW9ufSBdWyAje2tleX0gXVwiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuXG5jcmVhdGVEYXRhYmFzZSA9ICh7IG5hbWUgfSkgLT5cbiAgcmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QgW1xuICAgIGgucmVzb3VyY2UgXCJkYXRhYmFzZXNcIlxuICAgIGgubWV0aG9kIFwicG9zdFwiXG4gICAgaC5wYXJhbWV0ZXJzIHsgbmFtZSB9XG4gIF1cbiAgdHJ5XG4gICAgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0Lmlzc3VlKClcbiAgICByZXNwb25zZS5qc29uXG4gIGNhdGNoIGVycm9yXG4gICAgaWYgZXJyb3Iuc3RhdHVzP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZ3JhcGhlbmU6IGRhdGFiYXNlIGNyZWF0aW9uIGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyBlcnJvci5zdGF0dXMgfVwiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuZ2V0RGF0YWJhc2UgPSAoeyBhZGRyZXNzIH0pIC0+XG4gIHJlcXVlc3QgPSBjcmVhdGVSZXF1ZXN0IFtcbiAgICBoLnJlc291cmNlIFwiZGF0YWJhc2VcIlxuICAgIGgubWV0aG9kIFwiZ2V0XCJcbiAgICBoLnBhcmFtZXRlcnMgeyBhZGRyZXNzIH1cbiAgXVxuICB0cnlcbiAgICByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QuaXNzdWUoKVxuICAgIHJlc3BvbnNlLmpzb25cbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBlcnJvci5zdGF0dXMgPT0gNDA0XG4gICAgICBudWxsXG4gICAgZWxzZSBpZiBlcnJvci5zdGF0dXM/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJncmFwaGVuZTogZGF0YWJhc2UgZ2V0IGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyBlcnJvci5zdGF0dXMgfSBmb3IgWyAje2FkZHJlc3N9IF1cIlxuICAgIGVsc2VcbiAgICAgIHRocm93IGVycm9yXG5cbmRlbGV0ZURhdGFiYXNlID0gKHsgYWRkcmVzcyB9KSAtPlxuICByZXF1ZXN0ID0gY3JlYXRlUmVxdWVzdCBbXG4gICAgaC5yZXNvdXJjZSBcImRhdGFiYXNlXCJcbiAgICBoLm1ldGhvZCBcImRlbGV0ZVwiXG4gICAgaC5wYXJhbWV0ZXJzIHsgYWRkcmVzcyB9XG4gIF1cbiAgdHJ5XG4gICAgYXdhaXQgcmVxdWVzdC5pc3N1ZSgpXG4gICAgZGF0YWJhc2VEZWxldGVkOiB0cnVlXG4gIGNhdGNoIGVycm9yXG4gICAgaWYgZXJyb3Iuc3RhdHVzID09IDQwNFxuICAgICAgZGF0YWJhc2VEZWxldGVkOiBmYWxzZVxuICAgIGVsc2UgaWYgZXJyb3Iuc3RhdHVzP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZ3JhcGhlbmU6IGRhdGFiYXNlIGRlbGV0ZSBmYWlsZWQgd2l0aCBzdGF0dXNcbiAgICAgICAgI3sgZXJyb3Iuc3RhdHVzIH0gZm9yIFsgI3thZGRyZXNzfSBdXCJcbiAgICBlbHNlXG4gICAgICB0aHJvdyBlcnJvclxuXG51cHNlcnRDb2xsZWN0aW9uID0gKHsgZGF0YWJhc2UsIGJ5bmFtZSwgbmFtZSwgdmlld3MgfSkgLT5cbiAgcmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QgW1xuICAgIGgucmVzb3VyY2UgXCJjb2xsZWN0aW9uXCJcbiAgICBoLm1ldGhvZCBcInBvc3RcIlxuICAgIGgucGFyYW1ldGVycyB7IGRhdGFiYXNlLCBieW5hbWUgfVxuICAgIGguY29udGVudCB7IGRhdGFiYXNlLCBieW5hbWUsIG5hbWUsIHZpZXdzIH1cbiAgXVxuICB0cnlcbiAgICByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QuaXNzdWUoKVxuICAgIHJlc3BvbnNlLmpzb25cbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBlcnJvci5zdGF0dXM/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCJncmFwaGVuZTogY29sbGVjdGlvbiBwb3N0IGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyBlcnJvci5zdGF0dXMgfSBmb3IgWyAje2RhdGFiYXNlfSBdWyAje2NvbGxlY3Rpb259IF1cIlxuICAgIGVsc2VcbiAgICAgIHRocm93IGVycm9yXG4gIFxuZ2V0Q29sbGVjdGlvbiA9ICh7IGRhdGFiYXNlLCBieW5hbWUgfSkgLT5cbiAgcmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QgW1xuICAgIGgucmVzb3VyY2UgXCJjb2xsZWN0aW9uXCJcbiAgICBoLm1ldGhvZCBcImdldFwiXG4gICAgaC5wYXJhbWV0ZXJzIHsgZGF0YWJhc2UsIGJ5bmFtZSB9XG4gIF1cbiAgdHJ5XG4gICAgcmVzcG9uc2UgPSBhd2FpdCByZXF1ZXN0Lmlzc3VlKClcbiAgICByZXNwb25zZS5qc29uXG4gIGNhdGNoIGVycm9yXG4gICAgaWYgZXJyb3Iuc3RhdHVzID09IDQwNFxuICAgICAgbnVsbFxuICAgIGVsc2UgaWYgZXJyb3Iuc3RhdHVzP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwiZ3JhcGhlbmU6IGNvbGxlY3Rpb24gZ2V0IGZhaWxlZCB3aXRoIHN0YXR1c1xuICAgICAgICAjeyBlcnJvci5zdGF0dXMgfSBmb3IgWyAje2RhdGFiYXNlfSBdWyAje2J5bmFtZX0gXVwiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3JcblxuZGVsZXRlQ29sbGVjdGlvbiA9ICh7IGRhdGFiYXNlLCBieW5hbWUgfSkgLT5cbiAgcmVxdWVzdCA9IGNyZWF0ZVJlcXVlc3QgW1xuICAgIGgucmVzb3VyY2UgXCJjb2xsZWN0aW9uXCJcbiAgICBoLm1ldGhvZCBcImRlbGV0ZVwiXG4gICAgaC5wYXJhbWV0ZXJzIHsgZGF0YWJhc2UsIGJ5bmFtZSB9XG4gIF1cbiAgdHJ5XG4gICAgYXdhaXQgcmVxdWVzdC5pc3N1ZSgpXG4gICAgY29sbGVjdGlvbkRlbGV0ZWQ6IHRydWVcbiAgY2F0Y2ggZXJyb3JcbiAgICBpZiBlcnJvci5zdGF0dXMgPT0gNDA0XG4gICAgICBjb2xsZWN0aW9uRGVsZXRlZDogZmFsc2VcbiAgICBlbHNlIGlmIGVycm9yLnN0YXR1cz9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcImdyYXBoZW5lOiBkYXRhYmFzZSBkZWxldGUgZmFpbGVkIHdpdGggc3RhdHVzXG4gICAgICAgICN7IGVycm9yLnN0YXR1cyB9IGZvciBbICN7YWRkcmVzc30gXVwiXG4gICAgZWxzZVxuICAgICAgdGhyb3cgZXJyb3Jcblxud2FpdENvbGxlY3Rpb24gPSAoeyBkYXRhYmFzZSwgYnluYW1lIH0pIC0+XG4gIGNvbGxlY3Rpb24gPSBhd2FpdCBnZXRDb2xsZWN0aW9uIHsgZGF0YWJhc2UsIGJ5bmFtZSB9XG4gIGNvdW50ID0gMFxuICB3aGlsZSB0cnVlXG4gICAgaWYgY291bnQrKyA+IDVcbiAgICAgIHRocm93IG5ldyBFcnJvciBcImdyYXBoZW5lOiBjb2xsZWN0aW9uIFsgI3tkYXRhYmFzZX0gXVsgI3tieW5hbWV9IF0gZmFpbGVkIHRvIHN0YWJpbGl6ZVwiXG4gICAgZWxzZSBpZiAhY29sbGVjdGlvbj9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcImdyYXBoZW5lOiBjb2xsZWN0aW9uIFsgI3tkYXRhYmFzZX0gXVsgI3tieW5hbWV9IF0gaXMgbm90IGZvdW5kXCJcbiAgICBlbHNlIGlmIGNvbGxlY3Rpb24uc3RhdHVzICE9IFwicmVhZHlcIlxuICAgICAgY291bnQrK1xuICAgICAgYXdhaXQgVGltZS5zbGVlcCA1MDAwXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb25cblxucHVibGlzaENvbGxlY3Rpb24gPSAoeyBkYXRhYmFzZSwgYnluYW1lLCBuYW1lLCB2aWV3cyB9KSAtPlxuICBhd2FpdCB1cHNlcnRDb2xsZWN0aW9uIHsgZGF0YWJhc2UsIGJ5bmFtZSwgbmFtZSwgdmlld3MgfVxuICBhd2FpdCB3YWl0Q29sbGVjdGlvbiB7IGRhdGFiYXNlLCBieW5hbWUgfVxuXG5cbiAgICBcblxuZXhwb3J0IHsgXG4gIEl0ZW1cbiAgZ2V0SXRlbSwgcHV0SXRlbSwgZGVsZXRlSXRlbSxcbiAgc2NhbiwgaW5jcmVtZW50SXRlbVxuICBjcmVhdGVEYXRhYmFzZSwgZ2V0RGF0YWJhc2UsIGRlbGV0ZURhdGFiYXNlXG4gIHVwc2VydENvbGxlY3Rpb24sIGdldENvbGxlY3Rpb24sIGRlbGV0ZUNvbGxlY3Rpb24sIHdhaXRDb2xsZWN0aW9uLCBwdWJsaXNoQ29sbGVjdGlvblxufSJdLCJzb3VyY2VSb290IjoiIn0=
//# sourceURL=src/graphene-alpha.coffee