define([
    "modules/jquery-mozu",
    "underscore",
    "modules/api",
    "backbone",
    "modules/models-messages",
    "modules/backbone-mozu-validation"], function ($, _, api, Backbone, MessageModels) {


        var $window = $(window),
            Model = Backbone.Model,
           Collection = Backbone.Collection;

        // Detects dot notation in named properties and deepens a flat object to respect those property names.
        // Pessimistically, prefers dot-notated properties over properly deep ones
        function deepen(obj) {
            var ret = {};
            _.each(obj, function (val, key) {
                var ctx = ret, level;
                key = key.split('.');
                while (key.length > 1) {
                    level = key.shift();
                    ctx = ctx[level] || (ctx[level] = {});
                }
                ctx[key[0]] = val;
            });
            return ret;
        }

        var methodMap = {
            'read': 'get',
            'delete': 'del'
        };

        var modelProto = _.extend({}, Backbone.Validation.mixin,

            /** @lends MozuModel.prototype */
        {
            /**
             * @classdesc Extends the BackboneJS Model object to create a Backbone.MozuModel with extra features for model nesting, error handling, validation, and connection to the JavaScript SDK.
             * @class MozuModel
             * @param {object} json A JSON representation of the model to preload into the MozuModel. If you create a new MozuModel with no arguments, its attributes will be blank.
             * @augments external:Backbone.Model
             */


            /**
             * Array of the names of methods whose return values should be added to the JSON serialization of this model that is sent to the view, when MozuModel#toJSON is called with `{ helpers: true }`, which it is in the default implementation of {@ link MozuView#getRenderContext}.
             * The base MozuModel has helpers `['isLoading', 'isValid']`. When you subclass a MozuModel, any helpers you specify will be added to this array, rather than replacing it.
             * @member {string[]} helpers
             * @memberof MozuModel.prototype
             * @public
             */

            /**
             * If `true`, then this MozuModel will gain a `messages` property that is a {@ link Messages.MessageCollection }. It will also subscribe to the `error` event on its `apiModel` and update the `messages` collection as error messages come in from the service.
             * If `false`, this MozuModel will traverse up any existing tree of relations to find a parent or ancestor model that does handle messages, and use its `messages` collection instead.
             * @member {Boolean} handlesMessages
             * @memberof MozuModel.prototype
             * @default false
             */

            /**
             * Find the nearest parent model that handles error messages and pass all subsequent errors thrown on this model to that model. Run on contruct.
             * @private
             */
            passErrors: function() {
                var self = this;
                _.defer(function() {
                    var ctx = self,
                        passFn = function(e, c) {
                            ctx.trigger('error', e, c);
                        };
                    do {
                        if (ctx.handlesMessages) {
                            self.on('error', passFn);
                            break;
                        }
                        ctx = ctx.parent;
                    } while (ctx);
                }, 300);
            },


            /**
             * Dictionary of related models or collections.
             * @member {Object} relations
             * @memberof MozuModel.prototype
             * @public
             * @example
             * var Product = Backbone.MozuModel.extend({
             *   relations: {
             *     content: ProductContent, // another Backbone.MozuModel or Backbone.Model class
             *     options: Backbone.Collection.extend(
             *       model: ProductOption
             *     }) // a "has many" relationship
             *   }
             * });
             *
             * new Product(someJSON).get('content') // --> an instance of ProductContent
             */

            /**
             * Get the value of an attribute. Unlike the `get()` method on the plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on {@link Backbone.MozuModel#relations}).
             * @example
             * // returns the value of Product.ProductContent.ProductName
             * productModel.get('content.productName');
             * @param {string} attr The name, or dot-separated path, of the property to return.
             * @returns {Object} The value of the named attribute, and `undefined` if it was never set.
             */
            get: function(attr) {
                var prop = attr.split('.'), ret = this, level;
                while (ret && (level = prop.shift())) ret = Backbone.Model.prototype.get.call(ret, level);
                if (!ret && this.relations && (attr in this.relations)) {
                    ret = this.setRelation(attr, null, { silent: true });
                    this.attributes[attr] = ret;
                }
                return ret;
            },

            /** @private */
            setRelation: function(attr, val, options) {
                var relation = this.attributes[attr],
                    id = this.idAttribute || "id";

                if (!("parse" in options)) options.parse = true;

                //if (options.unset && relation) delete relation.parent;

                if (this.relations && _.has(this.relations, attr)) {

                    // If the relation already exists, we don't want to replace it, rather
                    // update the data within it whether it is a collection or model
                    if (relation && relation instanceof Collection) {

                        id = relation.model.prototype.idAttribute || id;

                        // If the val that is being set is already a collection, use the models
                        // within the collection.
                        if (val instanceof Collection || val instanceof Array) {
                            val = val.models || val;

                            relation.reset(_.clone(val), options);

                        } else {

                            // The incoming val that is being set is not an array or collection, then it represents
                            // a single model.  Go through each of the models in the existing relation and remove
                            // all models that aren't the same as this one (by id). If it is the same, call set on that
                            // model.

                            relation.each(function(model) {
                                if (val && val[id] === model[id]) {
                                    model.set(val, options);
                                } else {
                                    relation.remove(model);
                                }
                            });
                        }

                        return relation;
                    }

                    if (relation && relation instanceof Model) {
                        if (options.unset) {
                            relation.clear(options);
                        } else {
                            relation.set((val && val.toJSON) ? val.toJSON() : val, options);
                        }
                        return relation;
                    }

                    options._parent = this;
                    
                    if (!(val instanceof this.relations[attr])) val = new this.relations[attr](val, options);
                    val.parent = this;
                }

                return val;
            },


            /**
             * Set the value of an attribute or a hash of attributes. Unlike the `set()` method on he plain `Backbone.Model`, this method accepts a dot-separated path to a property on a child model (child models are defined on {@link Backbone.MozuModel#relations}).
             * @example
             * // sets the value of Customer.EditingContact.FirstName
             * customerModel.set('editingContact.firstName');
             * @param {string} key The name, or dot-separated path, of the property to return.
             * @returns {Object} Returns the value of the named attribute, and `undefined` if it was never set.
             */
            set: function(key, val, options) {
                var attr, attrs, unset, changes, silent, changing, prev, current, syncRemovedKeys, containsPrice;
                if (!key && key !== 0) return this;

                containsPrice = new RegExp('price', 'i');
                
                // Remove any properties from the current model 
                // where there are properties no longer present in the latest api model.
                // This is to fix an issue when sale price is only on certain configurations or volume price bands, 
                // so that the sale price does not persist.
                syncRemovedKeys = function (currentModel, attrKey) {
                    _.each(_.difference(_.keys(currentModel[attrKey].toJSON()), _.keys(attrs[attrKey])), function (keyName) {
                        changes.push(keyName);
                        currentModel[attrKey].unset(keyName);
                    });
                };

                // Handle both `"key", value` and `{key: value}` -style arguments.
                if (typeof key === 'object') {
                    attrs = key;
                    options = val;
                } else {
                    (attrs = {})[key] = val;
                }

                options = options || {};

                // allow for dot notation in setting properties remotely on related models, by shifting context!
                attrs = deepen(attrs);

                // Run validation.
                if (!this._validate(attrs, options)) return false;

                // Extract attributes and options.
                unset = options.unset;
                silent = options.silent;
                changes = [];
                changing = this._changing;
                this._changing = true;

                if (!changing) {
                    this._previousAttributes = _.clone(this.attributes);
                    this.changed = {};
                }
                current = this.attributes;
                prev = this._previousAttributes;

                // Check for changes of `id`.
                if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

                // For each `set` attribute, update or delete the current value.
                for (attr in attrs) {
                    val = attrs[attr];

                    // Inject in the relational lookup
                    val = this.setRelation(attr, val, options);

                    if (this.dataTypes && attr in this.dataTypes && (val !== null || !containsPrice.test(attr))) {
                        val = this.dataTypes[attr](val);
                    }

                    if (!_.isEqual(current[attr], val)) changes.push(attr);
                    if (!_.isEqual(prev[attr], val)) {
                        this.changed[attr] = val;
                    } else {
                        delete this.changed[attr];
                    }
                    var isARelation = this.relations && this.relations[attr] && (val instanceof this.relations[attr]);
                    if (unset && !isARelation) {
                        delete current[attr];
                    } else {
                        current[attr] = val;
                    }

                    if (current[attr] instanceof Backbone.Model && containsPrice.test(attr)) {
                        syncRemovedKeys(current, attr);
                    }
                }

                // Trigger all relevant attribute changes.
                if (!silent) {
                    if (changes.length) this._pending = true;
                    for (var i = 0, l = changes.length; i < l; i++) {
                        this.trigger('change:' + changes[i], this, current[changes[i]], options);
                    }
                }

                if (changing) return this;
                if (!silent) {
                    while (this._pending) {
                        this._pending = false;
                        this.trigger('change', this, options, attrs);
                    }
                }
                this._pending = false;
                this._changing = false;
                return this;
            },
            initApiModel: function(conf) {
                var me = this;
                this.apiModel = api.createSync(this.mozuType, _.extend({}, _.result(this, 'defaults') || {}, conf));
                if (!this.apiModel || !this.apiModel.on) return;
                this.apiModel.on('action', function() {
                    me.isLoading(true);
                    me.trigger('request');
                });
                this.apiModel.on('sync', function(rawJSON) {
                    me.isLoading(false);
                    if (rawJSON) {
                        me._isSyncing = true;
                        me.set(rawJSON);
                        me._isSyncing = false;
                    }
                    me.trigger('sync', rawJSON);
                });
                this.apiModel.on('spawn', function(rawJSON) {
                    me.isLoading(false);
                });
                this.apiModel.on('error', function(err) {
                    me.isLoading(false);
                    me.trigger('error', err);
                });
                this.on('change', function() {
                    if (!me._isSyncing) {
                        var changedAttributes = me.changedAttributes();
                        _.each(changedAttributes, function(v, k, l) {
                            if (v && typeof v.toJSON === "function")
                                l[k] = v.toJSON();
                        });
                        me.apiModel.prop(changedAttributes);
                    }
                });
            },

            /**
             * The type of Mozu API object that this model represents; when you specify a `mozuType`, then an SDK object corresponding to that type is created and exposed at the {@link MozuModel#apiModel} property. Its methods are also added to the MozuModel, all prefixed with "api". For example, the SDK `product` object has a method `addToCart`. A Backbone.MozuModel with mozuType `product` will therefore have a method `apiAddToCart`.
             * member {string} mozuType
             * @memberOf MozuModel.prototype
             */

            /**
             * The underlying SDK object created if you specified a MozuModel#mozuType.
             * MozuModels do not use the default Backbone.sync function used by standard Backbone.Models. Instead, MozuModels can communicate with the Mozu API if a {@link MozuModel#mozuType mozuType} is specified.
             * When a new instance of such a model is created, then it will create an SDK object of its `mozuType`, use event listeners to link up `sync` and `error` events between the SDK object and the MozuModel, and add methods for all the methods provided by the SDK object (see {@link MozuModel#mozuType mozuType}.)
             *
             * @member {object} apiModel
             * @memberOf MozuModel.prototype
             */


            /**
             * Ensure that the underlying SDK object has exactly the same data as the live Backbone model. In conflicts, Backbone always wins.
             * The underlying SDK object has event hooks into changes to the Backbone model, but under some circumstances a change may be unnoticed and they'll get out of sync.
             * For instance, if models are nested several layers deep, or if you changed a model attribute with `{ silent: true }` set. Run this method prior to doing any API action
             * to ensure that the SDK object is up to date.
             * @returns {null}
             */
            syncApiModel: function() {
                this.apiModel.prop(this.toJSON());
            },

            /**
             * A helper method for use in templates. True if there are one or more messages in this model's `messages` cllection.
             * Added to the list of {@link MozuModel#helpers } if {@link MozuModel#handlesMessages } is set to `true`.
             * @returns {boolean} True if there are one or more messages in this model's `messages` collection.
             * @method hasMessages
             * @memberof MozuModel.prototype
             */

            initMessages: function() {
                var me = this;
                me.messages = new MessageModels.MessagesCollection();
                me.hasMessages = function() {
                    return me.messages.length > 0;
                };
                me.helpers.push('hasMessages');
                me.on('error', function(err) {
                    if (err.items && err.items.length) {
                        me.messages.reset(err.items);
                    } else {
                        me.messages.reset([err]);
                    }
                });
                me.on('sync', function(raw) {
                    if (!raw || !raw.messages || raw.messages.length === 0) me.messages.reset();
                });
                _.each(this.relations, function(v, key) {
                    var relInstance = me.get(key);
                    if (relInstance) me.listenTo(relInstance, 'error', function(err) {
                        me.trigger('error', err);
                    });
                });
            },
            fetch: function() {
                var self = this;
                return this.apiModel.get().then(function() {
                    return self;
                });
            },
            sync: function(method, model, options) {
                method = methodMap[method] || method;
                model.apiModel[method](model.attributes).then(function(model) {
                    options.success(model.data);
                }, function(error) {
                    options.error(error);
                });
            },

            /**
             * Called whenever an API request begins. You may call this manually to trigger a `loadingchange` event, which {@link MozuView} automatically listens to and displays loading state in the DOM.
             * Added to the list of {@link MozuModel#helpers } automatically, to provide a boolean `model.isLoading` inside HyprLive templates.
             * @returns {boolean} True if the model is currently loading.
             * @param {boolean} yes Set this to true to trigger a `loadingchange` event.
             */
            isLoading: function(yes, opts) {
                if (arguments.length === 0) return !!this._isLoading;
                this._isLoading = yes;
                // firefox bfcache fix
                if (yes) {
                    this._cleanup = this._cleanup || _.bind(this.isLoading, this, false);
                    this._isWatchingUnload = true;
                    $window.on('beforeunload', this._cleanup);
                } else if (this._isWatchingUnload) {
                    delete this._isWatchingUnload;
                    $window.off('beforeunload', this._cleanup);
                }
                if (!opts || !opts.silent) this.trigger('loadingchange', yes);
            },
            getHelpers: function() {
                return this.helpers;
            },

            /**
             * Calls the provided callback immediately if `isLoading` is false, or queues it to be called the next time `isLoading` becomes false.
             * Good for queueing user actions while waiting for an API request to complete.
             * @param {function} cb The callback function to be called when the `isLoading` is false.
             */
            whenReady: function(cb) {
                var me = this,
                    isLoading = this.isLoading();
                if (!isLoading) return cb();
                var handler = function(yes) {
                    if (!yes) {
                        me.off('loadingchange', handler);
                        cb();
                    }
                };
                me.on('loadingchange', handler);
            },

            /**
             * Convert the data in this model to a plain JavaScript object that could be passed to `JSON.stringify`.
             * MozuModel extends the Backbone.Model#toJSON method with two configuration options.
             * @param {object} options The configuration options.
             * @param {boolean} options.helpers Include helper methods specified in the {@link MozuModel#helpers} collection.
             * @param {boolean} options.ensureCopy Ensure that the returned JSON is a complete in-memory copy of the attributes, with no references. Use this helper if you're going to transform the JSON.
             * @returns {object}
             */
            toJSON: function(options) {
                var attrs = _.clone(this.attributes);
                if (options && options.helpers) {
                    _.each(this.getHelpers(), function(helper) {
                        attrs[helper] = this[helper]();
                    }, this);
                    if (this.hasMessages) attrs.messages = this.messages.toJSON();
                    if (this.validation) attrs.isValid = this.isValid(options.forceValidation);
                }

                _.each(this.relations, function(rel, key) {
                    if (_.has(attrs, key)) {
                        attrs[key] = attrs[key].toJSON(options);
                    }
                });

                return (options && options.ensureCopy) ? JSON.parse(JSON.stringify(attrs)) : attrs;
            }
        });

        // we have to attach the constructor to the prototype via direct assignment,
        // because iterative extend methods don't work on the 'constructor' property
        // in IE8

        modelProto.constructor = function(conf) {
            this.helpers = (this.helpers || []).concat(['isLoading', 'isValid']);
            Backbone.Model.apply(this, arguments);
            if (this.mozuType) this.initApiModel(conf);
            if (this.handlesMessages) {
                this.initMessages();
            } else {
                this.passErrors();
            }
        };


        var MozuModel = Backbone.MozuModel = Backbone.Model.extend(modelProto, {
            /**
             * Create a mozuModel from any preloaded JSON present for this type.
             * @example
             *     var Product = Backbone.MozuModel.extend({
             *         mozuType: 'product'
             *     });
             *     
             *     // the fromCurrent static factory method is a shortcut for a common pattern.
             *     var thisProduct = Product.fromCurrent();
             *     
             *     // the above is equivalent to:
             *     var thisProduct = new Product(require.mozuData('product'));
             * @memberof MozuModel
             * @static
             */
            fromCurrent: function () {
                return new this(require.mozuData(this.prototype.mozuType), { silent: true, parse: true });
            },
            DataTypes: {
                "Int": function (val) {
                    val = parseInt(val, 10);
                    return isNaN(val) ? 0 : val;
                },
                "Float": function (val) {
                    val = parseFloat(val);
                    return isNaN(val) ? 0 : val;
                },
                "Boolean": function (val) {
                    return typeof val === "string" ? val.toLowerCase() === "true" : !!val;
                }
            }
        });

        function flattenValidation(proto, into, prefix) {
            _.each(proto.validation, function (val, key) {
                into[prefix + key] = val;
            });
            if (!proto.__validationFlattened) {
                _.each(proto.relations, function (val, key) {
                    flattenValidation(val.prototype, into, key + '.');
                });
            }
            proto.__validationFlattened = true;
            return into;
        }

        Backbone.MozuModel.extend = function (conf, statics) {
            if (conf) conf.validation = flattenValidation(conf, {}, '');
            if (conf && conf.mozuType) {
                // reflect all methods
                var actions = api.getAvailableActionsFor(conf.mozuType);
                if (actions) _.each(actions, function (actionName) {
                    var apiActionName = "api" + actionName.charAt(0).toUpperCase() + actionName.substring(1);
                    if (!(apiActionName in conf)) {
                        conf[apiActionName] = function (data) {
                            var self = this;
                            // include self by default...
                            if (actionName in { 'create': true, 'update': true }) data = data || this.toJSON();
                            if (typeof data === "object" && !$.isArray(data) && !$.isPlainObject(data)) data = null;
                            this.syncApiModel();
                            this.isLoading(true);
                            var p = this.apiModel[actionName](data);
                            p.ensure(function () {
                                self.isLoading(false);
                            });
                            return p;
                        };
                    }
                });

            }
            var ret = Backbone.Model.extend.call(this, conf, statics);
            if (conf && conf.helpers && conf.helpers.length > 0 && this.prototype.helpers && this.prototype.helpers.length > 0) ret.prototype.helpers = _.union(this.prototype.helpers, conf.helpers);
            return ret;
        };

        Backbone.Collection.prototype.resetRelations = function (options) {
            _.each(this.models, function(model) {
                _.each(model.relations, function(rel, key) {
                    if (model.get(key) instanceof Backbone.Collection) {
                        model.get(key).trigger('reset', model, options);
                    }
                });
            });
        };

        Backbone.Collection.prototype.reset = function (models, options) {
            options = options || {};
            for (var i = 0, l = this.models.length; i < l; i++) {
                this._removeReference(this.models[i]);
            }
            options.previousModels = this.models;
            this._reset();
            this.add(models, _.extend({ silent: true }, options));
            if (!options.silent) {
                this.trigger('reset', this, options);
                this.resetRelations(options);
            }
            return this;
        };
        return Backbone;
});
