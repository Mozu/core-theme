define(["modules/jquery-mozu", "shim!vendor/underscore>_", "modules/api", "hyperlive", "shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone"], function ($, _, api, HyperLive, Backbone) {

    var Model = Backbone.Model,
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

    var Message = Backbone.Model.extend({
        toJSON: function () {
            var j = Backbone.Model.prototype.toJSON.apply(this);
            if (!j.Message) j.Message = j.message || "Unknown error!";
            return j;
        }
    }),
    MessagesCollection = Backbone.Collection.extend({
        model: Message
    });

    var ValidationCallbacks = {
        valid: function(view, attr) {
            view.$('[data-mz-value="' + attr + '"]').removeClass('mz-invalid');
            view.$('[data-mz-validation-message-for="' + attr + '"]').text('');
        },
        invalid: function(view, attr, error) {
            view.$('[data-mz-value="' + attr + '"]').addClass('mz-invalid');
            view.$('[data-mz-validation-message-for="' + attr + '"]').text(error);
        }
    };

    Backbone.MozuModel = Backbone.Model.extend({
        idAttribute: "Id",
        constructor: function (conf) {
            this.helpers = (this.helpers || []).concat(['isLoading','isValid']);
            Backbone.Model.apply(this, arguments);
            if (this.mozuType) this.initApiModel(conf);
            if (this.handlesMessages) this.initMessages();
        },
        get: function (propName) {
            var prop = propName.split('.'), ret = this, level;
            while (ret && (level = prop.shift())) ret = Backbone.Model.prototype.get.call(ret, level);
            if (!ret && this.relations && (propName in this.relations)) {
                ret = this.setRelation(propName, {}, { silent: true });
                this.attributes[propName] = ret;
            }
            return ret;
        },
        setRelation: function (attr, val, options) {
        var relation = this.attributes[attr],
            id = this.idAttribute || "Id",
            modelToSet, modelsToAdd = [], modelsToRemove = [];

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
                modelsToAdd = _.clone(val);

                relation.each(function (model, i) {

                    // If the model does not have an "id" skip logic to detect if it already
                    // exists and simply add it to the collection
                    if (typeof model.id == 'undefined') return;

                    // If the incoming model also exists within the existing collection,
                    // call set on that model. If it doesn't exist in the incoming array,
                    // then add it to a list that will be removed.
                    var rModel = _.find(val, function (_model) {
                        return _model[id] === model.id;
                    });

                    if (rModel) {
                        model.set(rModel.toJSON ? rModel.toJSON() : rModel);

                        // Remove the model from the incoming list because all remaining models
                        // will be added to the relation
                        modelsToAdd.splice(i, 1);
                    } else {
                        modelsToRemove.push(model);
                    }

                });

                _.each(modelsToRemove, function (model) {
                    relation.remove(model);
                });

                relation.add(modelsToAdd);

            } else {

                // The incoming val that is being set is not an array or collection, then it represents
                // a single model.  Go through each of the models in the existing relation and remove
                // all models that aren't the same as this one (by id). If it is the same, call set on that
                // model.

                relation.each(function (model) {
                    if (val && val[id] === model[id]) {
                        model.set(val);
                    } else {
                        relation.remove(model);
                    }
                });
            }

            return relation;
        }

        if (relation && relation instanceof Model) {
            relation.set(val);
            return relation;
        }

        options._parent = this;

        val = new this.relations[attr](val, options);
        val.parent = this;
    }

    return val;
},
        // Preprocess attributes to set data types before they're stored in the attrs hash.
        set: function (key, val, options) {
            var attr, attrs, unset, changes, silent, changing, prev, current;
            if (key == null) return this;

            // Handle both `"key", value` and `{key: value}` -style arguments.
            if (typeof key === 'object') {
                attrs = key;
                options = val;
            } else {
                (attrs = {})[key] = val;
            }

            options || (options = {});

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
            current = this.attributes, prev = this._previousAttributes;

            // Check for changes of `id`.
            if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

            // For each `set` attribute, update or delete the current value.
            for (attr in attrs) {
                val = attrs[attr];

                // Inject in the relational lookup
                val = this.setRelation(attr, val, options);

                if (this.dataTypes && attr in this.dataTypes) {
                    val = this.dataTypes[attr](val);
                }

                if (!_.isEqual(current[attr], val)) changes.push(attr);
                if (!_.isEqual(prev[attr], val)) {
                    this.changed[attr] = val;
                } else {
                    delete this.changed[attr];
                }
                unset ? delete current[attr] : current[attr] = val;
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
                    this.trigger('change', this, options);
                }
            }
            this._pending = false;
            this._changing = false;
            return this;
        },
        initApiModel: function (conf) {
            var me = this;
            this.apiModel = api.createSync(this.mozuType, conf);
            this.apiModel.on('action', function () {
                me.isLoading(true);
                me.trigger('request');
            });
            this.apiModel.on('sync', function (rawJSON) {
                me.isLoading(false);
                if (rawJSON) me.set(rawJSON);
                me.trigger('sync', rawJSON);
            });
            this.apiModel.on('spawn', function (rawJSON) {
                me.isLoading(false);
            });
            this.apiModel.on('error', function (err) {
                me.isLoading(false);
                me.trigger('error', err);
            });
            this.on('change', function () {
                me.apiModel.prop(me.changedAttributes());
            });
        },
        initMessages: function () {
            var me = this;
            me.messages = new MessagesCollection();
            me.hasMessages = function () {
                return me.messages.length > 0;
            };
            me.helpers.push('hasMessages');
            me.on('error', function (err) {
                if (err.Items && err.Items.length) {
                    me.messages.reset(err.Items);
                } else {
                    me.messages.reset([err]);
                }
            });
            me.on('sync', function (raw) {
                if (!raw || !raw.Messages || raw.Messages.length === 0) me.messages.reset();
            });
            _.each(this.relations, function (v, key) {
                var relInstance = me.get(key);
                if (relInstance) me.listenTo(relInstance, 'error', function (err) {
                    me.trigger('error', err);
                });
            });
        },
        sync: function (method, model, options) {
            method = methodMap[method] || method;
            model.apiModel.action(method, model.attributes).then(function (model) {
                options.success(model.data);
            }, function (error) {
                options.error(error);
            });
        },
        isLoading: function(yes, opts) {
            if (arguments.length == 0) return !!this._isLoading;
            this._isLoading = yes;
            if (!opts || !opts.silent) this.trigger('loadingchange', yes);
        },
        getHelpers: function() {
            return this.helpers;
        },
        toJSON: function (options) {
            var attrs = _.clone(this.attributes);
            if (options && options.helpers) {
                _.each(this.getHelpers(), function (helper) {
                    attrs[helper] = this[helper]();
                }, this);
                if (this.hasMessages) attrs.messages = this.messages.toJSON();
                if (this.validation) attrs.isValid = this.isValid(options.forceValidation);
            }
            
            _.each(this.relations, function (rel, key) {
                if (_.has(attrs, key)) {
                    attrs[key] = attrs[key].toJSON(options);
                }
            });

            return attrs;
        }
    }, {
        fromCurrent: function () {
            return new this(require.mozuData(this.prototype.mozuType), { silent: true });
        },
        DataTypes: {
            "Int": function (val) {
                val = parseInt(val);
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
    }
    );

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
            _.each(api.getAvailableActionsFor(conf.mozuType), function (actionName) {
                var apiActionName = "api" + actionName.charAt(0).toUpperCase() + actionName.substring(1);
                if (!(apiActionName in conf)) {
                    conf[apiActionName] = function (data) {
                        // include self by default...
                        if (actionName in { 'create': true, 'update': true }) data = data || this.toJSON();
                        if (typeof data === "object" && !$.isArray(data) && !$.isPlainObject(data)) data = null;
                        return this.apiModel.action(actionName, data);
                    };
                }
            });
                
        }
        return Backbone.Model.extend.call(this, conf, statics);
    };

    Backbone.Collection.prototype.resetRelations = function (options) {
        _.each(this.models, function (model) {
            _.each(model.relations, function (rel, key) {
                if (model.get(key) instanceof Backbone.Collection) {
                    model.get(key).trigger('reset', model, options);
                }
            });
        })
    };

    Backbone.Collection.prototype.reset = function (models, options) {
        options || (options = {});
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

    Backbone.MozuView = Backbone.View.extend({
        constructor: function(conf) {
            Backbone.View.apply(this, arguments);
            this.template = HyperLive.getTemplate(this.options.templateName || this.templateName);
            this.listenTo(this.model, "sync", this.render);
            this.listenTo(this.model, "loadingchange", this.handleLoadingChange);
            if (this.model.handlesMessages && this.options.messagesEl) {
                this.messageView = new Backbone.MozuMessageView({
                    el: this.options.messagesEl,
                    model: this.model.messages,
                    templateName: 'Modules/Common/MessageBar'
                });
            }
            if (this.renderOnChange) {
                _.each(this.renderOnChange, function (prop) {
                    var model = this.model;
                    if (prop.indexOf('.') !== -1) {
                        var level, hier = prop.split('.');
                        while (hier.length > 1) {
                            level = hier.shift();
                            model = model[level] || model.get(level);
                        }
                        prop = hier[0];
                    }
                    this.listenTo(model, 'change:' + prop, this.render, this);
                }, this);
            }
            Backbone.Validation.bind(this, ValidationCallbacks);
            
        },
        events: function () {
            var defaults = _.object(_.flatten(_.map(this.$('[data-mz-value]'), function (el) {
                var val = el.getAttribute('data-mz-value');
                return _.map(['change', 'blur'], function (ev) {
                    return [ev + ' [data-mz-value="' + val + '"]', "update" + val];
                });
            }).concat(_.map(this.$('[data-mz-action]'), function (el) {
                var action = el.getAttribute('data-mz-action');
                return _.map(['click'], function (ev) {
                    return [ev + ' [data-mz-action="' + action + '"]', action];
                });
            })), true));
            return this.additionalEvents ? _.extend(defaults, this.additionalEvents) : defaults;
        },
        handleLoadingChange: function(isLoading) {
            this.$el[isLoading ? 'addClass' : 'removeClass']('mz-loading');
        },
        render: function () {
            var thenFocus = this.el && document.activeElement && $.contains(this.el, document.activeElement) && {
                'id': document.activeElement.id,
                'mzvalue': document.activeElement.getAttribute('data-mz-value')
            };
            Backbone.Validation.unbind(this);
            this.undelegateEvents();
            var model = this.model.toJSON({ helpers: true });
            this.$el.html(this.template.render({
                Model: model
            }));
            this.delegateEvents();
            Backbone.Validation.bind(this, ValidationCallbacks);
            if (thenFocus) {
                if (thenFocus.id) {
                    $(document.getElementById(thenFocus.id)).focus();
                } else {
                    $('[data-mz-value="' + thenFocus.mzvalue + '"]').focus();
                }
            }
        }
    });

    Backbone.MozuView.extend = function (conf, statics) {
        if (conf.autoUpdate) {
            _.each(conf.autoUpdate, function (prop) {
                conf['update' + prop] = _.debounce(function (e) {
                    var attrs = {},
                        $target = $(e.currentTarget),
                        value = e.currentTarget.type === "checkbox" ? $target.prop('checked') : $target.val();
                    attrs[prop] = value;
                    this.model.set(attrs);
                    this.model.validate(attrs);
                }, 300);
            });
        }
        return Backbone.View.extend.call(this, conf, statics)
    };

    Backbone.MozuMessageView = Backbone.MozuView.extend({
        templateName: 'Modules/Common/MessageBar',
        initialize: function () {
            this.model.on('reset', this.render, this)
        }
    });

    // Backbone.Validation v0.8.1
    //
    // Copyright (c) 2011-2013 Thomas Pedersen
    // Modified by Volusion for Mozu, not officially forked (yet)
    // Distributed under MIT License
    //
    // Documentation and full license available at:
    // http://thedersen.com/projects/backbone-validation
    Backbone.Validation = (function (_) {
        'use strict';

        // Default options
        // ---------------

        var defaultOptions = {
            forceUpdate: false,
            selector: 'name',
            labelFormatter: 'sentenceCase',
            valid: Function.prototype,
            invalid: Function.prototype
        };


        // Helper functions
        // ----------------

        // Formatting functions used for formatting error messages
        var formatFunctions = {
            // Uses the configured label formatter to format the attribute name
            // to make it more readable for the user
            formatLabel: function (attrName, model) {
                return defaultLabelFormatters[defaultOptions.labelFormatter](attrName, model);
            },

            // Replaces nummeric placeholders like {0} in a string with arguments
            // passed to the function
            format: function () {
                var args = Array.prototype.slice.call(arguments),
                    text = args.shift();
                return text.replace(/\{(\d+)\}/g, function (match, number) {
                    return typeof args[number] !== 'undefined' ? args[number] : match;
                });
            }
        };

        // Flattens an object
        // eg:
        //
        //     var o = {
        //       address: {
        //         street: 'Street',
        //         zip: 1234
        //       }
        //     };
        //
        // becomes:
        //
        //     var o = {
        //       'address.street': 'Street',
        //       'address.zip': 1234
        //     };
        var flatten = function (obj, into, prefix) {
            into = into || {};
            prefix = prefix || '';

            if (obj instanceof Backbone.Model) {
                obj = obj.attributes;
            }

            _.each(obj, function (val, key) {
                if (obj.hasOwnProperty(key)) {
                    if (val && typeof val === 'object' && !(
                      val instanceof Array ||
                      val instanceof Date ||
                      val instanceof RegExp ||
                      val instanceof Backbone.Collection)
                    ) {
                        flatten(val, into, prefix + key + '.');
                    }
                    else {
                        into[prefix + key] = val;
                    }
                }
            });

            return into;
        };

        // Validation
        // ----------

        var Validation = (function () {

            // Returns an object with undefined properties for all
            // attributes on the model that has defined one or more
            // validation rules.
            var getValidatedAttrs = function (model) {
                return _.reduce(_.keys(model.validation || {}), function (memo, key) {
                    memo[key] = void 0;
                    return memo;
                }, {});
            };

            // Looks on the model for validations for a specified
            // attribute. Returns an array of any validators defined,
            // or an empty array if none is defined.
            var getValidators = function (model, attr) {
                var attrValidationSet = model.validation ? model.validation[attr] || {} : {};

                // If the validator is a function or a string, wrap it in a function validator
                if (_.isFunction(attrValidationSet) || _.isString(attrValidationSet)) {
                    attrValidationSet = {
                        fn: attrValidationSet
                    };
                }

                // Stick the validator object into an array
                if (!_.isArray(attrValidationSet)) {
                    attrValidationSet = [attrValidationSet];
                }

                // Reduces the array of validators into a new array with objects
                // with a validation method to call, the value to validate against
                // and the specified error message, if any
                return _.reduce(attrValidationSet, function (memo, attrValidation) {
                    _.each(_.without(_.keys(attrValidation), 'msg'), function (validator) {
                        memo.push({
                            fn: defaultValidators[validator],
                            val: attrValidation[validator],
                            msg: attrValidation.msg
                        });
                    });
                    return memo;
                }, []);
            };

            // Validates an attribute against all validators defined
            // for that attribute. If one or more errors are found,
            // the first error message is returned.
            // If the attribute is valid, an empty string is returned.
            var validateAttr = function (model, attr, value, computed) {
                // Reduces the array of validators to an error message by
                // applying all the validators and returning the first error
                // message, if any.
                return _.reduce(getValidators(model, attr), function (memo, validator) {
                    // Pass the format functions plus the default
                    // validators as the context to the validator
                    var ctx = _.extend({}, formatFunctions, defaultValidators),
                        result = validator.fn.call(ctx, value, attr, validator.val, model, computed);

                    if (result === false || memo === false) {
                        return false;
                    }
                    if (result && !memo) {
                        return validator.msg || result;
                    }
                    return memo;
                }, '');
            };

            // Loops through the model's attributes and validates them all.
            // Returns and object containing names of invalid attributes
            // as well as error messages.
            var validateModel = function (model, attrs) {
                var error,
                    invalidAttrs = {},
                    isValid = true,
                    computed = _.clone(attrs),
                    flattened = flatten(attrs);

                _.each(flattened, function (val, attr) {
                    error = validateAttr(model, attr, val, computed);
                    if (error) {
                        invalidAttrs[attr] = error;
                        isValid = false;
                    }
                });

                return {
                    invalidAttrs: invalidAttrs,
                    isValid: isValid
                };
            };

            // Contains the methods that are mixed in on the model when binding
            var mixin = function (view, options) {
                return {

                    // Check whether or not a value passes validation
                    // without updating the model
                    preValidate: function (attr, value) {
                        return validateAttr(this, attr, value, _.extend({}, this.attributes));
                    },

                    // Check to see if an attribute, an array of attributes or the
                    // entire model is valid. Passing true will force a validation
                    // of the model.
                    isValid: function (option) {
                        var flattened = flatten(this.attributes);

                        if (_.isString(option)) {
                            return !validateAttr(this, option, flattened[option], _.extend({}, this.attributes));
                        }
                        if (_.isArray(option)) {
                            return _.reduce(option, function (memo, attr) {
                                return memo && !validateAttr(this, attr, flattened[attr], _.extend({}, this.attributes));
                            }, true, this);
                        }
                        if (option === true) {
                            this.validate(null, { silent: true });
                        }
                        return this.validation ? this._isValid : true;
                    },

                    // This is called by Backbone when it needs to perform validation.
                    // You can call it manually without any parameters to validate the
                    // entire model.
                    validate: function (attrs, setOptions) {
                        var model = this,
                            validateAll = !attrs,
                            opt = _.extend({}, options, setOptions),
                            validatedAttrs = getValidatedAttrs(model),
                            allAttrs = _.extend({}, validatedAttrs, model.attributes, attrs),
                            changedAttrs = flatten(attrs || allAttrs),

                            result = validateModel(model, allAttrs);

                        model._isValid = result.isValid;

                        // After validation is performed, loop through all changed attributes
                        // and call the valid callbacks so the view is updated.
                        _.each(validatedAttrs, function (val, attr) {
                            var invalid = result.invalidAttrs.hasOwnProperty(attr);
                            if (!invalid && !options.silent) {
                                opt.valid(view, attr, opt.selector);
                            }
                        });

                        // After validation is performed, loop through all changed attributes
                        // and call the invalid callback so the view is updated.
                        _.each(validatedAttrs, function (val, attr) {
                            var invalid = result.invalidAttrs.hasOwnProperty(attr),
                                changed = changedAttrs.hasOwnProperty(attr);

                            if (invalid && (changed || validateAll) && !options.silent) {
                                opt.invalid(view, attr, result.invalidAttrs[attr], opt.selector);
                            }
                        });

                        // Trigger validated events.
                        // Need to defer this so the model is actually updated before
                        // the event is triggered.
                        _.defer(function () {
                            model.trigger('validated', model._isValid, model, result.invalidAttrs);
                            model.trigger('validated:' + (model._isValid ? 'valid' : 'invalid'), model, result.invalidAttrs);
                        });

                        // Return any error messages to Backbone, unless the forceUpdate flag is set.
                        // Then we do not return anything and fools Backbone to believe the validation was
                        // a success. That way Backbone will update the model regardless.
                        if (!opt.forceUpdate && _.intersection(_.keys(result.invalidAttrs), _.keys(changedAttrs)).length > 0) {
                            return result.invalidAttrs;
                        }
                    }
                };
            };

            // Helper to mix in validation on a model
            var bindModel = function (view, model, options) {
                _.extend(model, mixin(view, options));
            };

            // Removes the methods added to a model
            var unbindModel = function (model) {
                delete model.validate;
                delete model.preValidate;
                delete model.isValid;
            };

            // Mix in validation on a model whenever a model is
            // added to a collection
            var collectionAdd = function (model) {
                bindModel(this.view, model, this.options);
            };

            // Remove validation from a model whenever a model is
            // removed from a collection
            var collectionRemove = function (model) {
                unbindModel(model);
            };

            // Returns the public methods on Backbone.Validation
            return {

                // Current version of the library
                version: '0.8.1',

                // Called to configure the default options
                configure: function (options) {
                    _.extend(defaultOptions, options);
                },

                // Hooks up validation on a view with a model
                // or collection
                bind: function (view, options) {
                    var model = view.model,
                        collection = view.collection;

                    options = _.extend({}, defaultOptions, defaultCallbacks, options);

                    if (typeof model === 'undefined' && typeof collection === 'undefined') {
                        throw 'Before you execute the binding your view must have a model or a collection.\n' +
                              'See http://thedersen.com/projects/backbone-validation/#using-form-model-validation for more information.';
                    }

                    if (model) {
                        bindModel(view, model, options);
                    }
                    else if (collection) {
                        collection.each(function (model) {
                            bindModel(view, model, options);
                        });
                        collection.bind('add', collectionAdd, { view: view, options: options });
                        collection.bind('remove', collectionRemove);
                    }
                },

                // Removes validation from a view with a model
                // or collection
                unbind: function (view) {
                    var model = view.model,
                        collection = view.collection;

                    if (model) {
                        unbindModel(view.model);
                    }
                    if (collection) {
                        collection.each(function (model) {
                            unbindModel(model);
                        });
                        collection.unbind('add', collectionAdd);
                        collection.unbind('remove', collectionRemove);
                    }
                },

                // Used to extend the Backbone.Model.prototype
                // with validation
                mixin: mixin(null, defaultOptions)
            };
        }());


        // Callbacks
        // ---------

        var defaultCallbacks = Validation.callbacks = {

            // Gets called when a previously invalid field in the
            // view becomes valid. Removes any error message.
            // Should be overridden with custom functionality.
            valid: function (view, attr, selector) {
                view.$('[' + selector + '~="' + attr + '"]')
                    .removeClass('invalid')
                    .removeAttr('data-error');
            },

            // Gets called when a field in the view becomes invalid.
            // Adds a error message.
            // Should be overridden with custom functionality.
            invalid: function (view, attr, error, selector) {
                view.$('[' + selector + '~="' + attr + '"]')
                    .addClass('invalid')
                    .attr('data-error', error);
            }
        };


        // Patterns
        // --------

        var defaultPatterns = Validation.patterns = {
            // Matches any digit(s) (i.e. 0-9)
            digits: /^\d+$/,

            // Matched any number (e.g. 100.000)
            number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/,

            // Matches a valid email address (e.g. mail@example.com)
            email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

            // Mathes any valid url (e.g. http://www.xample.com)
            url: /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
        };


        // Error messages
        // --------------

        // Error message for the build in validators.
        // {x} gets swapped out with arguments form the validator.
        var defaultMessages = Validation.messages = {
            required: '{0} is required',
            acceptance: '{0} must be accepted',
            min: '{0} must be greater than or equal to {1}',
            max: '{0} must be less than or equal to {1}',
            range: '{0} must be between {1} and {2}',
            length: '{0} must be {1} characters',
            minLength: '{0} must be at least {1} characters',
            maxLength: '{0} must be at most {1} characters',
            rangeLength: '{0} must be between {1} and {2} characters',
            oneOf: '{0} must be one of: {1}',
            equalTo: '{0} must be the same as {1}',
            pattern: '{0} must be a valid {1}'
        };

        // Label formatters
        // ----------------

        // Label formatters are used to convert the attribute name
        // to a more human friendly label when using the built in
        // error messages.
        // Configure which one to use with a call to
        //
        //     Backbone.Validation.configure({
        //       labelFormatter: 'label'
        //     });
        var defaultLabelFormatters = Validation.labelFormatters = {

            // Returns the attribute name with applying any formatting
            none: function (attrName) {
                return attrName;
            },

            // Converts attributeName or attribute_name to Attribute name
            sentenceCase: function (attrName) {
                return attrName.replace(/(?:^\w|[A-Z]|\b\w)/g, function (match, index) {
                    return index === 0 ? match.toUpperCase() : ' ' + match.toLowerCase();
                }).replace(/_/g, ' ');
            },

            // Looks for a label configured on the model and returns it
            //
            //      var Model = Backbone.Model.extend({
            //        validation: {
            //          someAttribute: {
            //            required: true
            //          }
            //        },
            //
            //        labels: {
            //          someAttribute: 'Custom label'
            //        }
            //      });
            label: function (attrName, model) {
                return (model.labels && model.labels[attrName]) || defaultLabelFormatters.sentenceCase(attrName, model);
            }
        };


        // Built in validators
        // -------------------

        var defaultValidators = Validation.validators = (function () {
            // Use native trim when defined
            var trim = String.prototype.trim ?
              function (text) {
                  return text === null ? '' : String.prototype.trim.call(text);
              } :
              function (text) {
                  var trimLeft = /^\s+/,
                      trimRight = /\s+$/;

                  return text === null ? '' : text.toString().replace(trimLeft, '').replace(trimRight, '');
              };

            // Determines whether or not a value is a number
            var isNumber = function (value) {
                return _.isNumber(value) || (_.isString(value) && value.match(defaultPatterns.number));
            };

            // Determines whether or not a value is empty
            var hasValue = function (value) {
                return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && trim(value) === '') || (_.isArray(value) && _.isEmpty(value)));
            };

            return {
                // Function validator
                // Lets you implement a custom function used for validation
                fn: function (value, attr, fn, model, computed) {
                    if (_.isString(fn)) {
                        var hier = attr.split('.');
                        if (hier.length > 1) {
                            hier.pop();
                            model = model.get(hier.join('.'));
                        }
                        fn = model[fn];
                    }
                    return fn.call(model, value, attr, computed);
                },

                // Required validator
                // Validates if the attribute is required or not
                required: function (value, attr, required, model, computed) {
                    var isRequired = _.isFunction(required) ? required.call(model, value, attr, computed) : required;
                    if (!isRequired && !hasValue(value)) {
                        return false; // overrides all other validators
                    }
                    if (isRequired && !hasValue(value)) {
                        return this.format(defaultMessages.required, this.formatLabel(attr, model));
                    }
                },

                // Acceptance validator
                // Validates that something has to be accepted, e.g. terms of use
                // `true` or 'true' are valid
                acceptance: function (value, attr, accept, model) {
                    if (value !== 'true' && (!_.isBoolean(value) || value === false)) {
                        return this.format(defaultMessages.acceptance, this.formatLabel(attr, model));
                    }
                },

                // Min validator
                // Validates that the value has to be a number and equal to or greater than
                // the min value specified
                min: function (value, attr, minValue, model) {
                    if (!isNumber(value) || value < minValue) {
                        return this.format(defaultMessages.min, this.formatLabel(attr, model), minValue);
                    }
                },

                // Max validator
                // Validates that the value has to be a number and equal to or less than
                // the max value specified
                max: function (value, attr, maxValue, model) {
                    if (!isNumber(value) || value > maxValue) {
                        return this.format(defaultMessages.max, this.formatLabel(attr, model), maxValue);
                    }
                },

                // Range validator
                // Validates that the value has to be a number and equal to or between
                // the two numbers specified
                range: function (value, attr, range, model) {
                    if (!isNumber(value) || value < range[0] || value > range[1]) {
                        return this.format(defaultMessages.range, this.formatLabel(attr, model), range[0], range[1]);
                    }
                },

                // Length validator
                // Validates that the value has to be a string with length equal to
                // the length value specified
                length: function (value, attr, length, model) {
                    if (!hasValue(value) || trim(value).length !== length) {
                        return this.format(defaultMessages.length, this.formatLabel(attr, model), length);
                    }
                },

                // Min length validator
                // Validates that the value has to be a string with length equal to or greater than
                // the min length value specified
                minLength: function (value, attr, minLength, model) {
                    if (!hasValue(value) || trim(value).length < minLength) {
                        return this.format(defaultMessages.minLength, this.formatLabel(attr, model), minLength);
                    }
                },

                // Max length validator
                // Validates that the value has to be a string with length equal to or less than
                // the max length value specified
                maxLength: function (value, attr, maxLength, model) {
                    if (!hasValue(value) || trim(value).length > maxLength) {
                        return this.format(defaultMessages.maxLength, this.formatLabel(attr, model), maxLength);
                    }
                },

                // Range length validator
                // Validates that the value has to be a string and equal to or between
                // the two numbers specified
                rangeLength: function (value, attr, range, model) {
                    if (!hasValue(value) || trim(value).length < range[0] || trim(value).length > range[1]) {
                        return this.format(defaultMessages.rangeLength, this.formatLabel(attr, model), range[0], range[1]);
                    }
                },

                // One of validator
                // Validates that the value has to be equal to one of the elements in
                // the specified array. Case sensitive matching
                oneOf: function (value, attr, values, model) {
                    if (!_.include(values, value)) {
                        return this.format(defaultMessages.oneOf, this.formatLabel(attr, model), values.join(', '));
                    }
                },

                // Equal to validator
                // Validates that the value has to be equal to the value of the attribute
                // with the name specified
                equalTo: function (value, attr, equalTo, model, computed) {
                    if (value !== computed[equalTo]) {
                        return this.format(defaultMessages.equalTo, this.formatLabel(attr, model), this.formatLabel(equalTo, model));
                    }
                },

                // Pattern validator
                // Validates that the value has to match the pattern specified.
                // Can be a regular expression or the name of one of the built in patterns
                pattern: function (value, attr, pattern, model) {
                    if (!hasValue(value) || !value.toString().match(defaultPatterns[pattern] || pattern)) {
                        return this.format(defaultMessages.pattern, this.formatLabel(attr, model), pattern);
                    }
                }
            };
        }());

        return Validation;
    }(_));

    return Backbone;
});
