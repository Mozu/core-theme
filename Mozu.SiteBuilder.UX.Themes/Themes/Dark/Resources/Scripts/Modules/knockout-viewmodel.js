define(["jquery", "modules/knockout-plus"], function ($, ko) {

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
                if (val&&val.toJS) {
                    val = val.toJS();
                } else if (val&&val.toJSON) { // cover the standard, misleadingly-named toJSON method
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

    ptype = {
        endpoint: "",
        observables: {},
        observableArrays: {},
        submodels: {},
        statics: {},
        populate: function (obj) {
            var self = this,
            simpleAssign = function (name) {
                if (name in obj) self[name](obj[name]);
                delete obj[name];
            };
            obj = obj || {};
            $.each(this.observables, this.initialized ? simpleAssign : makeInitializer(self, obj, "observable"));
            $.each(this.observableArrays, this.initialized ? simpleAssign : makeInitializer(self, obj, "observableArray"));
            $.each(this.submodels, function (name, conf) {
                if (self[name] && self[name].populate && self[name].initialized) {
                    self[name].populate(obj[name]);
                } else {
                    self[name] = new conf(obj[name]);
                }
                delete obj[name];
            });

            // add whatever's left, including statics
            $.extend(self, obj);

        },
        validate: function () {
            var self = this,
                invalid,
                invalidCount = 0;
            $.each([this.observables, this.observableArrays], function (ix, collection) {
                $.each(collection, function (k) {
                    if (self[k].required) {
                        // TODO: figure out how to determine if validation has run, because the below doesn't work
                        //invalid = self[k].invalid(); // if validation has already run, what was its result?
                        //if (invalid === undefined || !self[k].autoValidates)
                            invalid = !self[k].validate(); // if validation did not run OR observable is not invalidating on change, run it now
                        if (invalid) {
                            invalidCount++;
                            console.log('invalid item:', k);
                        }
                    }
                });
            });
            $.each(this.submodels, function (k) {
                if (self[k].validate && !self[k].validate())
                    invalidCount++;
            });
            console.log('validation error count:', invalidCount);
            return invalidCount === 0;
        },

        /**
         *
         * @param {Function} cb  A callback function.
         * @return {Object}
         */
        whenServerUpdates: function (cb) {
            var self = this,
                index;

            this.updateCallbacks = this.updateCallbacks || [];
            index = this.updateCallbacks.length;

            if (cb) {
                this.updateCallbacks[index] = $.proxy(cb, this);
                return {
                    dispose: function () {
                        self.updateCallbacks[index] = null;
                    }
                }
            }
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

                deferred.always(function () {
                    self.submitting(false);
                });

                if (this.updateCallbacks)
                    deferred.always(this.updateCallbacks);

                return deferred;
            } else {
                return false;
            }
        },
        toJS: function () {
            var ret = {}, self = this;
            iterate = makeIterator(self, ret);
            $.each(
                [this.statics, this.observables, this.observableArrays, this.submodels],
                function (ix, collection) {
                    $.each(collection, iterate);
                }
            );
            return ko.toJS(ret);
        }
    };

    return {
        extend: function (conf, initFunc) {
            var ctor = function (obj) {
                this.constructor = ctor;
                if (conf) $.extend(this, conf);
                this.exclusionList = makeExclusionList(this);
                this.populate(obj);
                this.initialized = true;
                this.submitting = ko.observable(false);
                if (initFunc)
                    initFunc.apply(this, arguments);
            };
            ctor.prototype = ptype;

            return ctor;
        }
    };
});
