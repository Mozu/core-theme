define(["jquery", "knockout", "i18n!nls/messages"], function ($, ko, messages) {
    /**
    *
    * @param constructor The constructor function that each value in this observable will be passed through.
    * @return {Object} The modified observable array.
    */
    var arrayOfTypePassThrus = ['indexOf', 'slice', 'pop', 'shift', 'reverse', 'sort', 'splice', 'remove', 'removeAll'],
        arrayOfTypePassThrusLength = arrayOfTypePassThrus.length,
        arrayOfTypeConstructorGates = ['push', 'unshift'],
        arrayOfTypeConstructorGatesLength = arrayOfTypeConstructorGates.length;
    ko.extenders.arrayOfType = function (target, constr) {
        // private, underlying observablearray
        var _array = ko.observableArray();
        // public proxy observable
        var publicArray = ko.computed({
            read: _array,
            write: function(newArray) {
                if ($.isArray(newArray)) {
                    _array($.map(newArray, function (conf) {
                        return new constr(conf);
                    }));
                } else {
                    // allow blanking the array out
                    _array(null);
                }
            },
        });
        for (var i = 0, m; i < arrayOfTypePassThrusLength; i++) {
            m = arrayOfTypePassThrus[i];
            publicArray[m] = $.proxy(_array[m], _array);
        }
        for (var j = 0; j < arrayOfTypeConstructorGatesLength; j++) {
            m = arrayOfTypeConstructorGates[j];
            publicArray[m] = function (conf) {
                _array[m](new constr(conf));
            };
        }

        return publicArray;
    };

    ko.extenders.defaultValue = function (target, defaultVal) {
        if (target() === undefined) target(defaultVal);
        return target;
    };
    /**
    *
    * @param target The observable this method is acting on.
    * @param testFn {Function} Test that should return true if this observable should be blank.
    * May be an object or a string:
    * - String: A string to be displayed when this field is invalid.
    * - Object: An object with a property 'message' that defines a string to show if the field is deemed invalid,
    *           and a property 'pattern' that defines a RegEx pattern to validate the field against.
    * @return {Object} The modified 'target' observable.
    */
    ko.extenders.blankIf = function (target, testFn) {
        return ko.computed({
            read: function () {
                return testFn(target) ? "" : target();
            },
            write: target
        })
    };

    // Allows for arbitrarily nested observables in viewmodels, with application of the "nested" property. 
    ko.extenders.nested = function (target, subprops) {
        for (var p1 in subprops) {
            if (subprops.hasOwnProperty(p1))
                target[p1] = ko.observable().extend(subprops[p1]);
        }
        return ko.computed({
            read: function () {
                var ret = {};
                for (var p2 in subprops) {
                    if (subprops.hasOwnProperty(p2))
                        ret[p2] = target[p2]();
                }
                return ret;
            },
            write: function (newValue) {
                for (var p3 in newValue) {
                    if (subprops.hasOwnProperty(p3))
                        target[p3](newValue[p3]);
                }
            }
        });
    };

    /**
    *
    * @param target The observable this method is acting on.
    * @param opts The value paired with the "required" key when extending 'target' observable.
    * May be an object or a string:
    * - String: A string to be displayed when this field is invalid.
    * - Object: An object with a property 'message' that defines a string to show if the field is deemed invalid,
    *           and a property 'pattern' that defines a RegEx pattern to validate the field against OR a property
    *           'fn' that defines a function to use to validate the field.
    * @return {Object} The modified 'target' observable.
    */
    ko.extenders.required = function (target, opts) {

        var msg = "This field is required",
            testFn;
        opts = opts || {};

        if (opts.onlyIf) {
            target.validationActive = ko.computed(opts.onlyIf);
            target.validationActive.subscribe(function(isActive){
                if (!isActive) {
                    target.invalid(false);
                    target.validationMessage("");
                }
            })
        }

        testFn = function(val) {
            return target.validationActive && !target.validationActive() ?
                true :
                opts.fn ?
                    opts.fn(val) :
                    ( opts.pattern ?
                        (val === null || val === undefined ? "" : val).toString().match(opts.pattern) :
                        (val || val === 0)
                    );
        };

        if (messages && messages.GenericRequired) // *** For internationalization
            msg = messages.GenericRequired;
        if (typeof opts === "string")
            msg = opts;
        if (opts.message)
            msg = opts.message;

        target.required = true;
        target.autoValidates = opts.invalidateOnChange !== false;
        target.invalid = ko.observable();
        target.validationMessage = ko.observable("");
        target.validate = function (newValue) {
            var valid = testFn(newValue === undefined ? target() : newValue);
            target.invalid(!valid);
            target.validationMessage(valid ? "" : msg);
            return valid;
        };

        target.subscribe(target.autoValidates ? target.validate : function (newValue) {
            // don't invalidate on change, but still remove invalidation if we're now valid
            if (testFn(newValue)) {
                target.invalid(false);
                target.validationMessage("");
            }
        });

        return target;
    };

    /**
    *
    * @param target The observable this method is acting on.
    * @param precision {Number} Number of decimal places to force display/
    * @return {Object} The modified 'target' observable.
    */
    ko.extenders.numeric = function (target, precision) {
        //create a writeable computed observable to intercept writes to our observable
        var result = ko.computed({
            read: target,  //always return the original observables value
            write: function (newValue) {
                var current = target(),
                roundingMultiplier = Math.pow(10, precision),
                newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

                //only write if it changed
                if (valueToWrite !== current) {
                    target(valueToWrite);
                } else {
                    //if the rounded value is the same, but a different value was written, force a notification for the current field
                    if (newValue !== current) {
                        target.notifySubscribers(valueToWrite);
                    }
                }
            }
        });

        //initialize with current value to make sure it is rounded appropriately
        result(target());

        //return the new computed observable
        return result;
    };

    /**
     * Sets a CSS class based on an observable value
     */
    ko.bindingHandlers.cssClassFrom = {
        update: function (el, valueAccessor, allBindingsAccessor) {
            var prefix = allBindingsAccessor().cssClassFromPrefix || "obsval-",
                existingClasses = $.map((el.className || "").split(" "), function (clsName) {
                    if (clsName) {
                        clsName = $.trim(clsName);
                        return clsName.indexOf(prefix) === 0 ? null : clsName;
                    }
                });
            existingClasses.push(prefix + ko.utils.unwrapObservable(valueAccessor()));
            el.className = existingClasses.join(" ");
        }
    };

    /**
     * Monitors an observable whose changes indicate a change in the height of an element. The value of the observable is unimportant; we only care that it has changed.
     */
    ko.bindingHandlers.changeHeightOn = {
        init: function (element, vAcc) {
            var $el = $(element);
            setTimeout(function () { $el.parent().css({ 'overflow-y': 'hidden', 'height': $el.outerHeight() }); }, 250);
        },
        update: (function(func) {
            var timeout, result, func = function (element, vAcc) {
                var $el = $(element);
                $el.parent().animate({ height: $el.outerHeight() }, 200);
            }
            return function() {
                var context = this, args = arguments;
                var later = function() {
                    timeout = null;
                    result = func.apply(context, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, 250);
                return result;
            };
        }())
    };

    ko.bindingHandlers.valueBlankZero = {
        'init': ko.bindingHandlers.value.init,
        'update': function (element, valueAccessor) {
            var newValue = ko.utils.unwrapObservable(valueAccessor()),
                elementValue,
                valueHasChanged;

            if (parseInt(newValue) === 0)
                newValue = "";

            elementValue = ko.selectExtensions.readValue(element);
            valueHasChanged = (newValue != elementValue);

            if (valueHasChanged)
                ko.selectExtensions.writeValue(element, newValue);
        }
    };

    ko.bindingHandlers.currencyValue = {
        'init': ko.bindingHandlers.value.init,
        'update': function (element, valueAccessor) {
            var newValue = (parseFloat(ko.utils.unwrapObservable(valueAccessor())) || 0).toFixed(2),
                elementValue = ko.selectExtensions.readValue(element);
            if (newValue != elementValue)
                ko.selectExtensions.writeValue(element, newValue);
        }
    };

    ko.bindingHandlers.currencyText = {
        'init': ko.bindingHandlers.text.init,
        'update': function (element, valueAccessor) {
            var newValue = (parseFloat(ko.utils.unwrapObservable(valueAccessor())) || 0).toFixed(2);
            newValue = groupDigits(newValue);
            ko.bindingHandlers.text.update(element, function () { return messages.CurrencySymbol + newValue });
        }
    };

    /**
    * Returns a comma-delimited number (groups of three: 1,000,000)
    * @param ungroupedNum
    * @return {Number}
    */
    function groupDigits(original){
        original+= '';
        var x = original.split('.'),
        x1 = x[0],
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
     
    }

    return ko;

});
