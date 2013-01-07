define(["jquery", "modules/knockout-plus", "modules/mixin-events", "modules/hal-resource"], function ($, ko, EventEmitter, HALResource) {

    var trailingSlashRE = /\/$/;

    // due to a bug in jQuery.data that won't fully parse JSON embedded in attributes, we have to use a polyfill plugin.
    $.fn.mozuData = function (dataAttr) {
        var d = this.attr("data-mz-" + dataAttr);
        return (typeof d === 'string' && d.charAt(0).match(/[\{\[\(]/)) ? $.parseJSON(d) : d;
    };

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
                var res = obj._embedded["mz:" + name];
                if (self[name] && self[name].populate && self[name].initialized) {
                    if ($.isArray(res)) {
                        self[name](res);
                    } else {
                        self[name].populate(res);
                    }
                } else {
                    if ($.isArray(res)) {
                        self[name] = ko.observableArray().extend({ arrayOfType: conf });
                        self[name](res);
                    } else {
                        self[name] = new conf(res);
                    }
                }
                delete obj[name];
            });

            // add whatever's left, including statics
            $.extend(self, obj);
            self.trigger('populate');
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
            invalid = invalidCount > 0;
            self.trigger('validated', !invalid);
            return !invalid;
        },

        getURI: function () {
            return this.getLink('self').href;
        },
        isOfType: function (json) {
            return json._links && json._links.type && json._links.type.href === this.getLink('type').href;
        },
        sync: function (options) {
            var self = this;
            options = $.extend({}, {
                url: this.getURI(),
                type: 'POST',
                contentType: "application/json",
                dataType: "json",
                validate: true,
                autoPopulate: true
            }, options || {});
            if (!options.validate || this.validate()) {
                this.submitting(true);
                // i know, i know, but it works
                if (options.type && options.type.charAt(0).toUpperCase() === "P" && !("data" in options)) options.data = JSON.stringify(this.toJS());
                return $.ajax(options)
                .always(function () {
                    self.submitting(false);
                }).done(function (r) {
                    self.trigger("sync", r);
                    if (self.isOfType(r))
                        self.populate(r);
                }).fail(function (r) {
                    self.trigger("syncerror", r);
                });
            } else {
                return false;
            }
        },
        create: function (conf) {
            return this.sync(conf);
        },
        retrieve: function (conf) {
            return this.sync($.extend({ type: 'GET'}, conf));
        },
        update: function(conf) {
            return this.sync($.extend({ type: 'PUT' }, conf));
        },
        del: function (conf) {
            return this.sync($.extend({ type: 'DELETE' }, conf));
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
        },
        bindView: function (view) {
            return ko.applyBindings(this, view || this.viewElm);
        },
        removeMessage: function (msg) {
            this.messages.remove(msg);
        }
    };

    $.extend(ptype, EventEmitter, HALResource);

    return {
        extend: function (conf, initFunc) {
            var ctor = function (obj, viewElm) {
                if (obj instanceof $) {
                    viewElm = obj[0];
                    obj = obj.mozuData('model');
                }
                this.viewElm = viewElm;
                this.constructor = ctor;
                if (conf) $.extend(this, conf);
                this.exclusionList = makeExclusionList(this);
                this.messages = ko.observableArray([]);
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
