//     Uppercut.Knockout.js 0.1.0
//     Copyright (c) 2012 Todd Lucas
//     Uppercut.Knockout may be freely distributed under the MIT license.

// **Uppercut.Knockout** implements a set of models and collections that
// are compatible with [Knockout.js](http://knockoutjs.com).

// Setup
// -----

(function (uc, $) {
    uc.Knockout = uc.ko = {};
    
    // Uppercut.Knockout.Model
    // -----------------------

    // Implements a Knockout compatible `Uppercut.Model`.
    uc.Knockout.Model = Uppercut.Model.derive({
        getId: function () {
            if (this.id && ko.isSubscribable(this.id)) {
                return this.id();
            }
            return this.id;
        },

        // Performs a shallow copy. To handle deep copying, the
        // model may provide its own set method.
        set: function (data) {
            setModel(this, data);
            return true;
        },

        get: function () {
            return getModel({}, this);
        }
    });

    // Uppercut.Knockout.ModelAdapter
    // ------------------------------

    // Knockout models can be simple JavaScript objects defined in terms
    // of a constructor function. Those models may be wrapped with
    // an `Uppercut.Knockout.ModelAdapter` to access the features of
    // Uppercut without alterning their Knockout model representation.
    uc.Knockout.ModelAdapter = uc.Model.derive({
        init: function (model, options) {
            this.model = model;
            if (options) {
                if (options.url) this.url = options.url;
            }
        },

        getId: function () {
            if (this.model.id && ko.isSubscribable(this.model.id)) {
                return this.model.id();
            }
            return this.model.id;
        },

        getUrl: function () {
            return this.url;
        },

        // Performs a shallow copy. To handle deep copying, the
        // model may provide its own set method.
        set: function (data) {
            setModel(this.model, data);
            return true;
        },

        get: function () {
            return getModel({}, this.model);
        }
    });
    
    // Uppercut.Knockout.Collection
    // ----------------------------

    // Implements a Knockout compatible `Uppercut.Collection`.
    // The `models` property is a `ko.observableArray`.
    uc.Knockout.Collection = uc.Collection.derive({
        clear: function () {
            this.models || (this.models = ko.observableArray());
            this.models.removeAll();
        }
    });

    // Helpers
    // -------

    // Copies any non-function properties to the model, observing observable conventions.
    var setModel = function (model, data) {
        for (var name in data) {
            var src = data[name];
            if (Uppercut.isFunction(src)) {
                continue;
            }

            if (model.hasOwnProperty(name)) {
                var prop = model[name];
                if (prop && ko.isSubscribable(prop)) {
                    prop(src);
                } else {
                    model[name] = src;
                }
            } else {
                model[name] = src;
            }
        }
        return model;
    };

    // Copies any model properties and values of observable properties to an object.
    var getModel = function (data, model) {
        for (var name in model) {
            var prop = model[name];
            if (prop && ko.isSubscribable(prop)) {
                data[name] = prop();
            }
            else if (!Uppercut.isFunction(prop)) {
                data[name] = prop;
            }
        }
        return data;
    };
})(Uppercut, jQuery || Zepto);
