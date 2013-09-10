define(["jquery", "modules/knockout-plus", "modules/api", "i18n!nls/messages", "shim!vendor/json2>JSON"], function ($, ko, api, genericMsg, JSON) {

    var traverseObjectForFunctionsAndBind = function (obj, newContext, depth) {
        depth = depth || 0;
        if (depth > 20)
            return; // in case of circular references
        $.each(obj, function (k, v) {
            if (typeof v === "function")
                obj[k] = $.proxy(v, newContext);
            if ($.isArray(v) || $.isPlainObject(v))
                traverseObjectForFunctionsAndBind(v, newContext, ++depth);
        });
    },

    makeInitializer = function (target, source, obsType) {
        return function (name, conf) {
            if ($.isPlainObject(conf) && !$.isEmptyObject(conf)) {
                traverseObjectForFunctionsAndBind(conf, target);
                target[name] = ko[obsType](source[name]).extend(conf);
            } else {
                target[name] = ko[obsType](source[name]);
            }
            delete source[name];
        };
    },

    makeIterator = function (source, target) {
        return function (i) {
            var val, valIsArray;
            if (i in source && (!source.exclusionList || !(i in source.exclusionList))) {

                // first get the source property, unwrapping any observable
                val = ko.utils.unwrapObservable(source[i]);

                // then normalize the index if the target is an array and the index is an integer
                if (i > target.length) i = target.length;

                // if we have an undefined value at this point, don't extend it
                if (val === undefined) return;

                // then cache the value of $.isArray, since we use it twice
                valIsArray = $.isArray(val);

                // if the val is a KOViewModel it will have a toJS method
                if (val && val.toJS) {
                    val = val.toJS();
                } else if (val && val.toJSON) { // cover the standard, misleadingly-named toJSON method
                    val = val.toJSON();
                }

                // if the value remains an array or hash after all this, then walk it
                if (valIsArray || $.isPlainObject(val)) {
                    target[i] = valIsArray ? [] : {};
                    $.each(val, makeIterator(val, target[i]));
                } else if (val !== undefined) {
                    target[i] = val;
                }
            }
        };
    },

    // optimizing array lookup because this is an inner loop
    makeExclusionList = function (vm) {
        var l, xObj = {}, exclude = vm.doNotSubmit;
        if (!exclude) return;
        l = exclude.length;
        for (var i = 0; i < l; i++) {
            xObj[exclude[i]] = true;
        }
        return xObj;
    },

    makeEventBus = function () {
        return $({});
    },

    makeMessageBus = function (vm) {
        vm.messages = ko.observableArray([]);
        vm.removeMessage = function (msg) {
            vm.messages.remove(msg);
        }
        vm.unknownError = function () {
            vm.messages.push({ message: genericMsg.UnexpectedError });
        };
        vm.on('error', function (e, errors) {
            // TODO: get better consistency from the error messages as they come out!
            if (errors.Message && (!errors.Items || errors.Items.length === 0)) {
                vm.messages([errors]);
            } else {
                vm.messages(errors.Items);
            }
        });
        vm.on('update', function (newJSON) {
            vm.messages(newJSON.Messages || []);
        });
    },

    deepExtendProps = ['statics','observables','observableArrays','submodels','submodelArrays'],

    KnockoutVM = function(obj, parent) {
        var me = this,
            objCopy = $.extend(true, {}, obj),
            processedObj;
        this.__parentVM = parent;
        this.exclusionList = makeExclusionList(this);
        this.eventBus = makeEventBus(this);
        if (this.beforePopulate) processedObj = this.beforePopulate(obj);
        this.populate(processedObj || obj);
        this.submitting = ko.observable(false);
        if (this.mozuType) 
            this.createSDKObject(objCopy);
        if (this.hasMessages)
            makeMessageBus(this);
        this.initialize.apply(this, arguments);
        this.initialized = true;
    };

    $.extend(KnockoutVM.prototype, {
        constructor: KnockoutVM,
        endpoint: "",
        observables: {},
        observableArrays: {},
        submodels: {},
        submodelArrays: {},
        statics: {},
        populate: function (obj) {
            var self = this,
            simpleAssign = function (name) {
                if (name in obj) self[name](obj[name]);
                delete obj[name];
            };

            self.isUpdating = true;

            obj = obj || {};
            $.each(this.observables, this.initialized ? simpleAssign : makeInitializer(self, obj, "observable"));
            $.each(this.observableArrays, this.initialized ? simpleAssign : makeInitializer(self, obj, "observableArray"));
            $.each(this.submodels, function (name, conf) {
                if (self[name] && self[name].populate && self[name].initialized) {
                    self[name].populate(obj[name]);
                } else {
                    self[name] = new conf(obj[name], self);
                }
                delete obj[name];
            });
            $.each(this.submodelArrays, function (name, conf) {
                if (self[name] && typeof self[name] === "function" && self[name].push) {
                    self[name](obj[name]);
                } else {
                    var underlying = ko.observableArray(),
                        ctorSet = function(item) {
                            return item instanceof conf? item : new conf(item, self);
                        };
                    self[name] = ko.computed({
                        write: function(newArray) {
                            if ($.isArray(newArray)) {
                                underlying($.map(newArray, ctorSet));
                            } else {
                                underlying([]);
                            }
                        },
                        read: underlying
                    });

                    // proxying array methods
                    $.each(['pop','indexOf','slice','shift','reverse','sort','splice','remove','removeAll'], function(ix, fName) {
                        self[name][fName] = underlying[fName];
                    });
                    $.each(['push', 'unshift'], function (ix, fName) {
                        self[name][fName] = function(raws) {
                            if ($.isArray(raws)) {
                                underlying[fname]($.map(raws, ctorSet));
                            } else {
                                underlying[fname](ctorSet(raws));
                            }
                        };
                    });

                    self[name](obj[name]);
                }
                delete obj[name];
            });

            // add whatever's left, including statics
            $.extend(self, obj);
            self.isUpdating = false;
            return self;
        },
        validate: function (loudly) {
            var self = this,
                silently = loudly === false,
                invalid,
                invalidCount = 0;
            $.each([this.observables, this.observableArrays], function (ix, collection) {
                $.each(collection, function (k) {
                    if (self[k].required) {
                        // TODO: figure out how to determine if validation has run, because the below doesn't work
                        //invalid = self[k].invalid(); // if validation has already run, what was its result?
                        //if (invalid === undefined || !self[k].autoValidates)
                            invalid = !self[k].validate(undefined, silently); // if validation did not run OR observable is not invalidating on change, run it now
                        if (invalid) {
                            invalidCount++;
                        }
                    }
                });
            });
            var validateSubmodel = function (sm) {
                if (sm.validate && !sm.validate(loudly))
                    invalidCount++;
            };
            $.each(this.submodels, function(name) {
                validateSubmodel(self[name]);
            });
            $.each(this.submodelArrays, function (i) {
                $.each(self[i](), validateSubmodel);
            });
            return invalidCount === 0;
        },

        submit: function () {
            var self = this;
            if (this.validate()) {
                this.submitting(true);
                var deferred = $.ajax({
                    url: this.endpoint,
                    type: "POST",
                    contentType: "application/json",
                    dataType: "json",
                    data: JSON.stringify(this.toJS())
                });

                deferred.always(function (data) {
                    self.submitting(false);
                    self.publish('update', data);
                });

                return deferred;
            } else {
                return false;
            }
        },
        toJS: function () {
            var ret = {}, self = this,
            iterate = makeIterator(self, ret);
            $.each(
                [this.statics, this.observables, this.observableArrays, this.submodels, this.submodelArrays],
                function (ix, collection) {
                    $.each(collection, iterate);
                }
            );
            return ko.toJS(ret);
        },
        createSDKObject: function(obj) {
            var me = this,
            apiModel = this.apiModel = api.createSync(this.mozuType, obj);
            $.each(apiModel.getAvailableActions(), function (ix, actionName) {
                (actionName in me ? apiModel : me)[actionName] = function (data) {
                    // include self by default in update action
                    if (actionName in { 'create': true, 'update': true }) data = data || me.toJS();
                    // handle bad argument by nulling it--we don't want to stringify unstringifiable things
                    if (typeof data === 'object' && !$.isArray(data) && !$.isPlainObject(data)) data = null;
                    return apiModel.action(actionName, data);
                };
            });

            apiModel.on('sync', function (data) {
                me.populate($.extend(true, {}, data));
                me.publish('update', data);
            });

            apiModel.on('error', function () {
                me.submitting(false);
                me.publish.apply(me, ['error',arguments]);
            });

        },
        publish: function () {
            this.eventBus.trigger.apply(this.eventBus, arguments);
        },
        on: function () {
            this.eventBus.on.apply(this.eventBus, arguments);
        },
        off: function () {
            this.eventBus.off.apply(this.eventBus, arguments);
        },
        getParentModel: function () {
            return this.__parentVM;
        },
        isItemModulus: function (itemIndex, modulus) {
            itemIndex = ko.utils.unwrapObservable(itemIndex) + 1;
            return itemIndex !== 1 && itemIndex % modulus === 0;
        },
        initialize: function() {}
    });

    var extend = KnockoutVM.extend = function(props, staticProps, ctor) {
        var parent = this,
            child;

        if (typeof staticProps === "function") {
            ctor = staticProps;
            staticProps = null;
        }

        child = function() {
            parent.apply(this, arguments);
        };

        // Add static properties to the constructor function, if supplied.
        if (staticProps) $.extend(child, parent, staticProps);

        // Set the prototype chain to inherit from `parent`, without calling
        // `parent`'s constructor function.
        var Surrogate = function(){ 
            this.constructor = child;
        };
        Surrogate.prototype = parent.prototype;
        child.prototype = new Surrogate();

        if (props) {
            $.each(deepExtendProps, function(ix, name) {
                if (props[name]) {
                    child.prototype[name] = $.extend(true, {}, child.prototype[name] || {}, props[name]);
                    delete props[name];
                }
            });

            // Add prototype properties (instance properties) to the subclass,
            // if supplied.
            $.extend(child.prototype, props);
        }

        if (ctor) child.prototype.initialize = ctor;

        // Set a convenience property in case the parent's prototype is needed
        // later.
        child.__super__ = parent.prototype;

        child.prototype.superInit = function () {
            return child.__super__.initialize.apply(this, arguments);
        }

        // make extendable!
        child.extend = extend;

        return child;
    }

    return KnockoutVM;

});
