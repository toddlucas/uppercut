//     Uppercut.js 0.1.0
//     Copyright (c) 2012 Todd Lucas
//     Uppercut may be freely distributed under the MIT license.
//     Portions of Uppercut were inspired by or borrowed from 
//     Underscore, Backbone, jQuery, and Knockout.

// **Uppercut** is a lightweight library for interacting with REST services.
// It is inspired by [Backbone](http://documentcloud.github.com/backbone) and
// aims to be compatible with services that work with Backbone. Although it
// is model agnostic, it was designed to support [Knockout.js](http://knockoutjs.com).
// Like Backbone, Uppercut requires [jQuery](http://jquery.com) or 
// [Zepto](http://zeptojs.com) to make AJAX requests and 
// [json2.js](https://github.com/douglascrockford/JSON-js)
//  to support older browsers.

// Setup
// -----

(function ($) {
    var root = this;

    var _Uppercut = this.Uppercut,
        _uc = this.uc;

    var Uppercut = root.Uppercut = root.uc = {};

    Uppercut.VERSION = '0.1.0';

    // Runs Upercut in *noConflict* mode, returning the `Uppercut` and `uc` 
    // variables to their previous owners. Returns a reference to this object.
    Uppercut.noConflict = function () {
        root.Uppercut = _Uppercut;
        root.uc = _uc;
        return this;
    };

    // Uppercut.inherit
    // ----------------

    // Copy any source properties to the destination.
    var extend = function (dst, src) {
        for (var prop in src) {
            dst[prop] = src[prop];
        }
        return dst;
    };

    // Derive a new class constructor from an existing base constructor.
    // New prototype methods may be added using the extensions object.
    // If an `init` method is provided, it will be called at object creation
    // time with any arguments passed to the constructor.
    var inherit = function (base, extensions, statics) {
        var Class = function () {
            this._ctor.call(this, arguments);
        };

        deriving = true;
        Class.prototype = new base();
        Class.prototype.constructor = Class;
        deriving = false;

        if (extensions) extend(Class.prototype, extensions);
        if (statics) extend(Class, statics);

        // The `_ctor` method ensures that any `init` methods are called in 
        // base-first order at construction time.
        Class.prototype._ctor = function (args) {
            if (deriving)
                return;
            if (base.prototype.hasOwnProperty('_ctor'))
                base.prototype._ctor.call(this, args);
            if (Class.prototype.hasOwnProperty('init'))
                Class.prototype.init.apply(this, args);
        };
        return Class;
    };

    var derive = function (extensions, statics) {
        var child = inherit(this, extensions, statics);
        child.derive = this.derive;
        return child;
    };

    Uppercut.inherit = inherit;

    // Uppercut.Model
    // --------------

    // A model is an `Object` that may be used to read and write to
    // a REST API using an `Uppercut.Endpoint`.
    Uppercut.Model = inherit(Object, {
        init: function (data, options) {
            if (data) copyProperties(this, data);
        },

        getId: function () {
            return this.id;
        },

        isNew: function () {
            return !this.getId();
        },

        getUrl: function () {
            return this.url;
        },

        set: function (data) {
            copyProperties(this, data);
            return true;
        },

        get: function () {
            return copyProperties({}, this);
        },

        parse: function (resp, xhr) {
            return resp;
        },

        onError: function (options) {
        },

        onDestroy: function (options) {
        }
    });

    Uppercut.Model.derive = derive;

    // Uppercut.Collection
    // -------------------

    // A collection is a simple wrapper around an `Array` that provides
    // methods to read and write to a REST API using an `Uppercut.Endpoint`.
    Uppercut.Collection = inherit(Object, {
        init: function (models, options) {
            options || (options = {});
            if (options.url) this.url = options.url;
            if (options.model) this.model = options.model;

            this.clear();
            if (models) this.append(models, { parse: options.parse });
        },

        getUrl: function () {
            return this.url;
        },

        clear: function (options) {
            this.models = [];
        },

        push: function (model, options) {
            this.models.push(model);
        },

        reset: function (models, options) {
            this.clear(options);
            this.append(models, options);
        },

        append: function (models, options) {
            if (Uppercut.isArray(models)) {
                for (var index in models) {
                    this.push(this.coerce(models[index], options), options);
                }
            }
            else {
                this.push(this.coerce(models, options), options);
            }
        },

        parse: function (resp, xhr) {
            return resp;
        },

        // Instantiate an object, typicaly an `Uppercut.Model` or dervied type,
        // from a server side representation. Used when fetching collections.
        coerce: function (data, options) {
            if (options && options.model)
                return new options.model(data);
            return data;
        },

        onError: function (options) {
        }
    });

    Uppercut.Collection.derive = derive;

    // Uppercut.Endpoint
    // -----------------

    // An endpoint represents a locial connection to an HTTP server. 
    // It implements REST operations in a model-centric fashion using 
    // `Uppercut.sync`. Default server mappings are as follows:
    //
    //     HTTP    CRUD        URL                 Uppercut
    //     -----   ----        ---                 --------
    //     POST    create      /resource*          create()
    //     GET     read        /resource[/@id]     read() or fetch()
    //     PUT     update      /resource/@id       update()
    //     DELETE  delete      /resource/@id       destroy()
    //
    // URLs may be overriden at several levels. Priority is: `options.url`, 
    // model/collection `getUrl()`, and the endpoint `url` property.
    //
    Uppercut.Endpoint = inherit(Object, {

        // A default `url` property may be specified as a fallback. The
        // endpoint would typically not be shared between models in this 
        // configuration.
        init: function (options) {
            options || (options = {});
            if (options.url) this.url = options.url;
        },

        // Provides default URL mapping rules for models. Derived endpoints 
        // may supply their own implementation.
        getUrl: function (model) {
            var base = model.getUrl() || this.url || urlError();
            if (model.isNew()) return base;
            return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + encodeURIComponent(model.getId());
        },

        // ### CRUD

        // Creates a model and returns an updated model with a new ID.
        create: function (model, options) {
            this.rest('create', model, options);
        },

        // Reads a model with the specified ID.
        read: function (model, options) {
            this.rest('read', model, options);
        },

        // Updates the model with the specified ID.
        update: function (model, options) {
            this.rest('update', model, options);
        },

        // Deletes the model with the specified ID.
        destroy: function (model, options) {
            options || (options = {});
            if (model.isNew()) return model.onDestroy(options);
            options.url || (options.url = this.getUrl(model));
            var success = options.success;
            options.success = function (resp, status, xhr) {
                model.onDestroy(options);
                if (success) success(model, resp);
            };
            options.error = wrapError(options.error, model, options);
            var data = model.get();
            return Uppercut.sync('delete', data, options);
        },

        // Creates or updates the model, depending on whether `isNew()` is 
        // true or not.
        save: function (model, options) {
            var method = model.isNew() ? 'create' : 'update';
            this.rest(method, model, options);
        },

        // Creates a new model and adds it to the collection if successful.
        add: function (collection, model, options) {
            options || (options = {});
            options.url || (options.url = collection.getUrl()) || this.url || urlError();
            var success = options.success;
            options.success = function (model, resp, xhr) {
                if (!model.set(model.parse(resp, xhr), options)) return false;
                collection.push(model, options);
                if (success) success(collection, model, resp);
            };
            this.create(model, options);
        },

        // Loads a collection from the server.
        // Set `append` to true to add to the collection.
        fetch: function (collection, options) {
            options || (options = {});
            options.url || (options.url = collection.getUrl()) || this.url || urlError();
            options.model || (options.model = collection.model) || (modelError());
            var success = options.success;
            options.success = function (resp, status, xhr) {
                if (!options.append) collection.clear();
                collection.append(collection.parse(resp, xhr), options);
                if (success) success(collection, resp);
            };
            options.error = wrapError(options.error, collection, options);
            return Uppercut.sync('read', null, options);
        },

        // Implements most model-centric CRUD operations by wrapping 
        // `Uppercut.sync` with `get` and `set` semantics.
        rest: function (method, model, options) {
            options || (options = {});
            options.url || (options.url = this.getUrl(model));
            var success = options.success;
            options.success = function (resp, status, xhr) {
                if (!model.set(model.parse(resp, xhr), options)) return false;
                if (success) success(model, resp);
            };
            options.error = wrapError(options.error, model, options);
            var data = model.get();
            return Uppercut.sync(method, data, options);
        }
    });

    // Uppercut.sync
    // -------------

    // Map from CRUD to HTTP for our default `Uppercut.sync` implementation.
    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read': 'GET'
    };

    // Override this function to change the manner in which Uppercut persists
    // models to the server. You will be passed the type of request, and the
    // model in question. By default, uses makes a RESTful Ajax request
    // to the model's `getUrl()`.
    //
    // Turn on `Uppercut.emulateHTTP` in order to send `PUT` and `DELETE` requests
    // as `POST`, with a `_method` parameter containing the true HTTP method,
    // as well as all requests with the body as `application/x-www-form-urlencoded` instead of
    // `application/json` with the model in a param named `model`.
    // Useful when interfacing with server-side languages like **PHP** that make
    // it difficult to read the body of `PUT` requests.
    //
    // *NOTE: This method is borrowed from Backbone in its entirety. This should
    // make it easier to have an interoperable server implementation that
    // uses Backbone and/or Uppercut.*
    //
    Uppercut.sync = function (method, model, options) {
        var type = methodMap[method];

        // Default JSON-request options.
        var params = extend({
            type: type,
            dataType: 'json'
        }, options);

        // Ensure that we have a URL.
        if (!params.url) {
            urlError();
        }

        // Ensure that we have the appropriate request data.
        if (!params.data && model && (method == 'create' || method == 'update')) {
            params.contentType = 'application/json';
            params.data = JSON.stringify(model);
        }

        // For older servers, emulate JSON by encoding the request into an HTML-form.
        if (Uppercut.emulateJSON) {
            params.contentType = 'application/x-www-form-urlencoded';
            params.data = params.data ? { model: params.data} : {};
        }

        // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
        // And an `X-HTTP-Method-Override` header.
        if (Uppercut.emulateHTTP) {
            if (type === 'PUT' || type === 'DELETE') {
                if (Uppercut.emulateJSON) params.data._method = type;
                params.type = 'POST';
                params.beforeSend = function (xhr) {
                    xhr.setRequestHeader('X-HTTP-Method-Override', type);
                };
            }
        }

        // Don't process data on a non-GET request.
        if (params.type !== 'GET' && !Uppercut.emulateJSON) {
            params.processData = false;
        }

        // Make the request.
        return $.ajax(params);
    };

    // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option will
    // fake `"PUT"` and `"DELETE"` requests via the `_method` parameter and set a
    // `X-Http-Method-Override` header.
    Uppercut.emulateHTTP = false;

    // Turn on `emulateJSON` to support legacy servers that can't deal with direct
    // `application/json` requests ... will encode the body as
    // `application/x-www-form-urlencoded` instead and will send the model in a
    // form param named `model`.
    Uppercut.emulateJSON = false;

    // Utilities
    // ---------

    Uppercut.isArray = Array.isArray || function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    Uppercut.isFunction = function (obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    };

    // Helpers
    // -------

    // Copy non-function properties from the source to the destination object.
    var copyProperties = function (dst, src) {
        for (var prop in src) {
            var sp = src[prop];
            if (sp !== void 0 && !Uppercut.isFunction(sp)) {
                var dp = dst[prop];
                if (!Uppercut.isFunction(dp)) {
                    dst[prop] = sp;
                }
            }
        }
        return dst;
    };

    // Throw an error when a URL is needed, and none is supplied.
    var urlError = function () {
        throw new Error('A "url" property or function must be specified');
    };

    // Throw an error when a model constructor is needed, and none is supplied.
    var modelError = function () {
        throw new Error('A "model" property must be specified');
    };

    // Wrap an optional error callback with a fallback error event.
    var wrapError = function (onError, model, options) {
        return function (resp) {
            if (onError) {
                onError(model, resp, options);
            } else {
                model.onError(resp, options);
            }
        };
    };
})(jQuery || Zepto);
