/*! 
 * Mozu JavaScript SDK - v0.1.0 - 2013-06-11
 *
 * Copyright (c) 2013 Volusion, Inc.
 *
 */

(function() {
    var amds = [], internalDefine = function(deps, fn) {
        if (typeof deps === "function") fn = deps;
        amds.push(fn());
    };
    internalDefine.amd = true;
    (function(define, exportFn) {
        exportFn(function() {
            (function(define) {
                "use strict";
                define(function() {
                    var reduceArray, slice, undef;
                    when.defer = defer;
                    when.resolve = resolve;
                    when.reject = reject;
                    when.join = join;
                    when.all = all;
                    when.map = map;
                    when.reduce = reduce;
                    when.any = any;
                    when.some = some;
                    when.chain = chain;
                    when.isPromise = isPromise;
                    function when(promiseOrValue, onFulfilled, onRejected, onProgress) {
                        return resolve(promiseOrValue).then(onFulfilled, onRejected, onProgress);
                    }
                    function resolve(promiseOrValue) {
                        var promise;
                        if (promiseOrValue instanceof Promise) {
                            promise = promiseOrValue;
                        } else if (isPromise(promiseOrValue)) {
                            promise = assimilate(promiseOrValue);
                        } else {
                            promise = fulfilled(promiseOrValue);
                        }
                        return promise;
                    }
                    function assimilate(thenable) {
                        var d = defer();
                        try {
                            thenable.then(function(value) {
                                d.resolve(value);
                            }, function(reason) {
                                d.reject(reason);
                            }, function(update) {
                                d.progress(update);
                            });
                        } catch (e) {
                            d.reject(e);
                        }
                        return d.promise;
                    }
                    function reject(promiseOrValue) {
                        return when(promiseOrValue, rejected);
                    }
                    function Promise(then) {
                        this.then = then;
                    }
                    Promise.prototype = {
                        always: function(onFulfilledOrRejected, onProgress) {
                            return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
                        },
                        otherwise: function(onRejected) {
                            return this.then(undef, onRejected);
                        },
                        yield: function(value) {
                            return this.then(function() {
                                return value;
                            });
                        },
                        spread: function(onFulfilled) {
                            return this.then(function(array) {
                                return all(array, function(array) {
                                    return onFulfilled.apply(undef, array);
                                });
                            });
                        }
                    };
                    function fulfilled(value) {
                        var p = new Promise(function(onFulfilled) {
                            try {
                                return resolve(typeof onFulfilled == "function" ? onFulfilled(value) : value);
                            } catch (e) {
                                return rejected(e);
                            }
                        });
                        return p;
                    }
                    function rejected(reason) {
                        var p = new Promise(function(_, onRejected) {
                            try {
                                return resolve(typeof onRejected == "function" ? onRejected(reason) : rejected(reason));
                            } catch (e) {
                                return rejected(e);
                            }
                        });
                        return p;
                    }
                    function defer() {
                        var deferred, promise, handlers, progressHandlers, _then, _notify, _resolve;
                        promise = new Promise(then);
                        deferred = {
                            then: then,
                            resolve: promiseResolve,
                            reject: promiseReject,
                            progress: promiseNotify,
                            notify: promiseNotify,
                            promise: promise,
                            resolver: {
                                resolve: promiseResolve,
                                reject: promiseReject,
                                progress: promiseNotify,
                                notify: promiseNotify
                            }
                        };
                        handlers = [];
                        progressHandlers = [];
                        _then = function(onFulfilled, onRejected, onProgress) {
                            var deferred, progressHandler;
                            deferred = defer();
                            progressHandler = typeof onProgress === "function" ? function(update) {
                                try {
                                    deferred.notify(onProgress(update));
                                } catch (e) {
                                    deferred.notify(e);
                                }
                            } : function(update) {
                                deferred.notify(update);
                            };
                            handlers.push(function(promise) {
                                promise.then(onFulfilled, onRejected).then(deferred.resolve, deferred.reject, progressHandler);
                            });
                            progressHandlers.push(progressHandler);
                            return deferred.promise;
                        };
                        _notify = function(update) {
                            processQueue(progressHandlers, update);
                            return update;
                        };
                        _resolve = function(value) {
                            _then = value.then;
                            _resolve = resolve;
                            _notify = identity;
                            processQueue(handlers, value);
                            progressHandlers = handlers = undef;
                            return value;
                        };
                        return deferred;
                        function then(onFulfilled, onRejected, onProgress) {
                            return _then(onFulfilled, onRejected, onProgress);
                        }
                        function promiseResolve(val) {
                            return _resolve(resolve(val));
                        }
                        function promiseReject(err) {
                            return _resolve(rejected(err));
                        }
                        function promiseNotify(update) {
                            return _notify(update);
                        }
                    }
                    function isPromise(promiseOrValue) {
                        return promiseOrValue && typeof promiseOrValue.then === "function";
                    }
                    function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {
                        checkCallbacks(2, arguments);
                        return when(promisesOrValues, function(promisesOrValues) {
                            var toResolve, toReject, values, reasons, deferred, fulfillOne, rejectOne, notify, len, i;
                            len = promisesOrValues.length >>> 0;
                            toResolve = Math.max(0, Math.min(howMany, len));
                            values = [];
                            toReject = len - toResolve + 1;
                            reasons = [];
                            deferred = defer();
                            if (!toResolve) {
                                deferred.resolve(values);
                            } else {
                                notify = deferred.notify;
                                rejectOne = function(reason) {
                                    reasons.push(reason);
                                    if (!--toReject) {
                                        fulfillOne = rejectOne = noop;
                                        deferred.reject(reasons);
                                    }
                                };
                                fulfillOne = function(val) {
                                    values.push(val);
                                    if (!--toResolve) {
                                        fulfillOne = rejectOne = noop;
                                        deferred.resolve(values);
                                    }
                                };
                                for (i = 0; i < len; ++i) {
                                    if (i in promisesOrValues) {
                                        when(promisesOrValues[i], fulfiller, rejecter, notify);
                                    }
                                }
                            }
                            return deferred.promise.then(onFulfilled, onRejected, onProgress);
                            function rejecter(reason) {
                                rejectOne(reason);
                            }
                            function fulfiller(val) {
                                fulfillOne(val);
                            }
                        });
                    }
                    function any(promisesOrValues, onFulfilled, onRejected, onProgress) {
                        function unwrapSingleResult(val) {
                            return onFulfilled ? onFulfilled(val[0]) : val[0];
                        }
                        return some(promisesOrValues, 1, unwrapSingleResult, onRejected, onProgress);
                    }
                    function all(promisesOrValues, onFulfilled, onRejected, onProgress) {
                        checkCallbacks(1, arguments);
                        return map(promisesOrValues, identity).then(onFulfilled, onRejected, onProgress);
                    }
                    function join() {
                        return map(arguments, identity);
                    }
                    function map(promise, mapFunc) {
                        return when(promise, function(array) {
                            var results, len, toResolve, resolve, i, d;
                            toResolve = len = array.length >>> 0;
                            results = [];
                            d = defer();
                            if (!toResolve) {
                                d.resolve(results);
                            } else {
                                resolve = function resolveOne(item, i) {
                                    when(item, mapFunc).then(function(mapped) {
                                        results[i] = mapped;
                                        if (!--toResolve) {
                                            d.resolve(results);
                                        }
                                    }, d.reject);
                                };
                                for (i = 0; i < len; i++) {
                                    if (i in array) {
                                        resolve(array[i], i);
                                    } else {
                                        --toResolve;
                                    }
                                }
                            }
                            return d.promise;
                        });
                    }
                    function reduce(promise, reduceFunc) {
                        var args = slice.call(arguments, 1);
                        return when(promise, function(array) {
                            var total;
                            total = array.length;
                            args[0] = function(current, val, i) {
                                return when(current, function(c) {
                                    return when(val, function(value) {
                                        return reduceFunc(c, value, i, total);
                                    });
                                });
                            };
                            return reduceArray.apply(array, args);
                        });
                    }
                    function chain(promiseOrValue, resolver, resolveValue) {
                        var useResolveValue = arguments.length > 2;
                        return when(promiseOrValue, function(val) {
                            val = useResolveValue ? resolveValue : val;
                            resolver.resolve(val);
                            return val;
                        }, function(reason) {
                            resolver.reject(reason);
                            return rejected(reason);
                        }, function(update) {
                            typeof resolver.notify === "function" && resolver.notify(update);
                            return update;
                        });
                    }
                    function processQueue(queue, value) {
                        var handler, i = 0;
                        while (handler = queue[i++]) {
                            handler(value);
                        }
                    }
                    function checkCallbacks(start, arrayOfCallbacks) {
                        var arg, i = arrayOfCallbacks.length;
                        while (i > start) {
                            arg = arrayOfCallbacks[--i];
                            if (arg != null && typeof arg != "function") {
                                throw new Error("arg " + i + " must be a function");
                            }
                        }
                    }
                    function noop() {}
                    slice = [].slice;
                    reduceArray = [].reduce || function(reduceFunc) {
                        var arr, args, reduced, len, i;
                        i = 0;
                        arr = Object(this);
                        len = arr.length >>> 0;
                        args = arguments;
                        if (args.length <= 1) {
                            for (;;) {
                                if (i in arr) {
                                    reduced = arr[i++];
                                    break;
                                }
                                if (++i >= len) {
                                    throw new TypeError();
                                }
                            }
                        } else {
                            reduced = args[1];
                        }
                        for (;i < len; ++i) {
                            if (i in arr) {
                                reduced = reduceFunc(reduced, arr[i], i, arr);
                            }
                        }
                        return reduced;
                    };
                    function identity(x) {
                        return x;
                    }
                    return when;
                });
            })(typeof define == "function" && define.amd ? define : function(factory) {
                typeof exports === "object" ? module.exports = factory() : this.when = factory();
            });
            (function(exportCallback) {
                "use strict";
                var objectHelper = function() {
                    function isArray(value) {
                        return Object.prototype.toString.apply(value) === "[object Array]";
                    }
                    function objectReduce(object, callback, initialValue) {
                        var propertyName, currentValue = initialValue;
                        for (propertyName in object) {
                            if (object.hasOwnProperty(propertyName)) {
                                currentValue = callback(currentValue, object[propertyName], propertyName, object);
                            }
                        }
                        return currentValue;
                    }
                    function arrayReduce(array, callback, initialValue) {
                        var index, currentValue = initialValue;
                        for (index = 0; index < array.length; index += 1) {
                            currentValue = callback(currentValue, array[index], index, array);
                        }
                        return currentValue;
                    }
                    function reduce(arrayOrObject, callback, initialValue) {
                        return isArray(arrayOrObject) ? arrayReduce(arrayOrObject, callback, initialValue) : objectReduce(arrayOrObject, callback, initialValue);
                    }
                    function deepFreezeUsingObjectFreeze(object) {
                        if (typeof object !== "object" || object === null) {
                            return object;
                        }
                        Object.freeze(object);
                        var property, propertyName;
                        for (propertyName in object) {
                            if (object.hasOwnProperty(propertyName)) {
                                property = object[propertyName];
                                if (typeof property === "object") {
                                    deepFreeze(property);
                                }
                            }
                        }
                        return object;
                    }
                    function deepFreeze(object) {
                        if (typeof Object.freeze === "function") {
                            return deepFreezeUsingObjectFreeze(object);
                        }
                        return object;
                    }
                    return {
                        isArray: isArray,
                        reduce: reduce,
                        deepFreeze: deepFreeze
                    };
                }();
                var charHelper = function() {
                    function isAlpha(chr) {
                        return chr >= "a" && chr <= "z" || chr >= "A" && chr <= "Z";
                    }
                    function isDigit(chr) {
                        return chr >= "0" && chr <= "9";
                    }
                    function isHexDigit(chr) {
                        return isDigit(chr) || chr >= "a" && chr <= "f" || chr >= "A" && chr <= "F";
                    }
                    return {
                        isAlpha: isAlpha,
                        isDigit: isDigit,
                        isHexDigit: isHexDigit
                    };
                }();
                var pctEncoder = function() {
                    var utf8 = {
                        encode: function(chr) {
                            return unescape(encodeURIComponent(chr));
                        },
                        numBytes: function(firstCharCode) {
                            if (firstCharCode <= 127) {
                                return 1;
                            } else if (194 <= firstCharCode && firstCharCode <= 223) {
                                return 2;
                            } else if (224 <= firstCharCode && firstCharCode <= 239) {
                                return 3;
                            } else if (240 <= firstCharCode && firstCharCode <= 244) {
                                return 4;
                            }
                            return 0;
                        },
                        isValidFollowingCharCode: function(charCode) {
                            return 128 <= charCode && charCode <= 191;
                        }
                    };
                    function encodeCharacter(chr) {
                        var result = "", octets = utf8.encode(chr), octet, index;
                        for (index = 0; index < octets.length; index += 1) {
                            octet = octets.charCodeAt(index);
                            result += "%" + octet.toString(16).toUpperCase();
                        }
                        return result;
                    }
                    function isPercentDigitDigit(text, start) {
                        return text[start] === "%" && charHelper.isHexDigit(text[start + 1]) && charHelper.isHexDigit(text[start + 2]);
                    }
                    function parseHex2(text, start) {
                        return parseInt(text.substr(start, 2), 16);
                    }
                    function isPctEncoded(chr) {
                        if (!isPercentDigitDigit(chr, 0)) {
                            return false;
                        }
                        var firstCharCode = parseHex2(chr, 1);
                        var numBytes = utf8.numBytes(firstCharCode);
                        if (numBytes === 0) {
                            return false;
                        }
                        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
                            if (!isPercentDigitDigit(chr, 3 * byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(chr, 3 * byteNumber + 1))) {
                                return false;
                            }
                        }
                        return true;
                    }
                    function pctCharAt(text, startIndex) {
                        var chr = text[startIndex];
                        if (!isPercentDigitDigit(text, startIndex)) {
                            return chr;
                        }
                        var utf8CharCode = parseHex2(text, startIndex + 1);
                        var numBytes = utf8.numBytes(utf8CharCode);
                        if (numBytes === 0) {
                            return chr;
                        }
                        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
                            if (!isPercentDigitDigit(text, startIndex + 3 * byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(text, startIndex + 3 * byteNumber + 1))) {
                                return chr;
                            }
                        }
                        return text.substr(startIndex, 3 * numBytes);
                    }
                    return {
                        encodeCharacter: encodeCharacter,
                        isPctEncoded: isPctEncoded,
                        pctCharAt: pctCharAt
                    };
                }();
                var rfcCharHelper = function() {
                    function isVarchar(chr) {
                        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === "_" || pctEncoder.isPctEncoded(chr);
                    }
                    function isUnreserved(chr) {
                        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === "-" || chr === "." || chr === "_" || chr === "~";
                    }
                    function isReserved(chr) {
                        return chr === ":" || chr === "/" || chr === "?" || chr === "#" || chr === "[" || chr === "]" || chr === "@" || chr === "!" || chr === "$" || chr === "&" || chr === "(" || chr === ")" || chr === "*" || chr === "+" || chr === "," || chr === ";" || chr === "=" || chr === "'";
                    }
                    return {
                        isVarchar: isVarchar,
                        isUnreserved: isUnreserved,
                        isReserved: isReserved
                    };
                }();
                var encodingHelper = function() {
                    function encode(text, passReserved) {
                        var result = "", index, chr = "";
                        if (typeof text === "number" || typeof text === "boolean") {
                            text = text.toString();
                        }
                        for (index = 0; index < text.length; index += chr.length) {
                            chr = text.charAt(index);
                            result += rfcCharHelper.isUnreserved(chr) || passReserved && rfcCharHelper.isReserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
                        }
                        return result;
                    }
                    function encodePassReserved(text) {
                        return encode(text, true);
                    }
                    return {
                        encode: encode,
                        encodePassReserved: encodePassReserved
                    };
                }();
                var operators = function() {
                    var bySymbol = {};
                    function create(symbol) {
                        bySymbol[symbol] = {
                            symbol: symbol,
                            separator: symbol === "?" ? "&" : symbol === "" || symbol === "+" || symbol === "#" ? "," : symbol,
                            named: symbol === ";" || symbol === "&" || symbol === "?",
                            ifEmpty: symbol === "&" || symbol === "?" ? "=" : "",
                            first: symbol === "+" ? "" : symbol,
                            encode: symbol === "+" || symbol === "#" ? encodingHelper.encodePassReserved : encodingHelper.encode,
                            toString: function() {
                                return this.symbol;
                            }
                        };
                    }
                    create("");
                    create("+");
                    create("#");
                    create(".");
                    create("/");
                    create(";");
                    create("?");
                    create("&");
                    return {
                        valueOf: function(chr) {
                            if (bySymbol[chr]) {
                                return bySymbol[chr];
                            }
                            if ("=,!@|".indexOf(chr) >= 0) {
                                throw new Error('Illegal use of reserved operator "' + chr + '"');
                            }
                            return bySymbol[""];
                        }
                    };
                }();
                function isDefined(object) {
                    var index, propertyName;
                    if (object === null || object === undefined) {
                        return false;
                    }
                    if (objectHelper.isArray(object)) {
                        for (index = 0; index < object.length; index += 1) {
                            if (isDefined(object[index])) {
                                return true;
                            }
                        }
                        return false;
                    }
                    if (typeof object === "string" || typeof object === "number" || typeof object === "boolean") {
                        return true;
                    }
                    for (propertyName in object) {
                        if (object.hasOwnProperty(propertyName) && isDefined(object[propertyName])) {
                            return true;
                        }
                    }
                    return false;
                }
                var LiteralExpression = function() {
                    function LiteralExpression(literal) {
                        this.literal = LiteralExpression.encodeLiteral(literal);
                    }
                    LiteralExpression.encodeLiteral = function(literal) {
                        var result = "", index, chr = "";
                        for (index = 0; index < literal.length; index += chr.length) {
                            chr = pctEncoder.pctCharAt(literal, index);
                            if (chr.length > 1) {
                                result += chr;
                            } else {
                                result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
                            }
                        }
                        return result;
                    };
                    LiteralExpression.prototype.expand = function() {
                        return this.literal;
                    };
                    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;
                    return LiteralExpression;
                }();
                var parse = function() {
                    function parseExpression(outerText) {
                        var text, operator, varspecs = [], varspec = null, varnameStart = null, maxLengthStart = null, index, chr = "";
                        function closeVarname() {
                            varspec = {
                                varname: text.substring(varnameStart, index),
                                exploded: false,
                                maxLength: null
                            };
                            varnameStart = null;
                        }
                        function closeMaxLength() {
                            if (maxLengthStart === index) {
                                throw new Error("after a ':' you have to specify the length. position = " + index);
                            }
                            varspec.maxLength = parseInt(text.substring(maxLengthStart, index), 10);
                            maxLengthStart = null;
                        }
                        text = outerText.substr(1, outerText.length - 2);
                        operator = operators.valueOf(text.charAt(0));
                        index = operator.symbol === "" ? 0 : 1;
                        varnameStart = index;
                        for (;index < text.length; index += chr.length) {
                            chr = pctEncoder.pctCharAt(text, index);
                            if (varnameStart !== null) {
                                if (chr === ".") {
                                    if (varnameStart === index) {
                                        throw new Error("a varname MUST NOT start with a dot -- see position " + index);
                                    }
                                    continue;
                                }
                                if (rfcCharHelper.isVarchar(chr)) {
                                    continue;
                                }
                                closeVarname();
                            }
                            if (maxLengthStart !== null) {
                                if (index === maxLengthStart && chr === "0") {
                                    throw new Error("A :prefix must not start with digit 0 -- see position " + index);
                                }
                                if (charHelper.isDigit(chr)) {
                                    if (index - maxLengthStart >= 4) {
                                        throw new Error("A :prefix must max 4 digits -- see position " + index);
                                    }
                                    continue;
                                }
                                closeMaxLength();
                            }
                            if (chr === ":") {
                                if (varspec.maxLength !== null) {
                                    throw new Error("only one :maxLength is allowed per varspec at position " + index);
                                }
                                maxLengthStart = index + 1;
                                continue;
                            }
                            if (chr === "*") {
                                if (varspec === null) {
                                    throw new Error("explode exploded at position " + index);
                                }
                                if (varspec.exploded) {
                                    throw new Error("explode exploded twice at position " + index);
                                }
                                if (varspec.maxLength) {
                                    throw new Error("an explode (*) MUST NOT follow to a prefix, see position " + index);
                                }
                                varspec.exploded = true;
                                continue;
                            }
                            if (chr === ",") {
                                varspecs.push(varspec);
                                varspec = null;
                                varnameStart = index + 1;
                                continue;
                            }
                            throw new Error("illegal character '" + chr + "' at position " + index + ' of "' + text + '"');
                        }
                        if (varnameStart !== null) {
                            closeVarname();
                        }
                        if (maxLengthStart !== null) {
                            closeMaxLength();
                        }
                        varspecs.push(varspec);
                        return new VariableExpression(outerText, operator, varspecs);
                    }
                    function parseTemplate(uriTemplateText) {
                        var index, chr, expressions = [], braceOpenIndex = null, literalStart = 0;
                        for (index = 0; index < uriTemplateText.length; index += 1) {
                            chr = uriTemplateText.charAt(index);
                            if (literalStart !== null) {
                                if (chr === "}") {
                                    throw new Error("brace was closed in position " + index + " but never opened");
                                }
                                if (chr === "{") {
                                    if (literalStart < index) {
                                        expressions.push(new LiteralExpression(uriTemplateText.substring(literalStart, index)));
                                    }
                                    literalStart = null;
                                    braceOpenIndex = index;
                                }
                                continue;
                            }
                            if (braceOpenIndex !== null) {
                                if (chr === "{") {
                                    throw new Error("brace was opened in position " + braceOpenIndex + " and cannot be reopened in position " + index);
                                }
                                if (chr === "}") {
                                    if (braceOpenIndex + 1 === index) {
                                        throw new Error("empty braces on position " + braceOpenIndex);
                                    }
                                    expressions.push(parseExpression(uriTemplateText.substring(braceOpenIndex, index + 1)));
                                    braceOpenIndex = null;
                                    literalStart = index + 1;
                                }
                                continue;
                            }
                            throw new Error("reached unreachable code");
                        }
                        if (braceOpenIndex !== null) {
                            throw new Error("brace was opened on position " + braceOpenIndex + ", but never closed");
                        }
                        if (literalStart < uriTemplateText.length) {
                            expressions.push(new LiteralExpression(uriTemplateText.substr(literalStart)));
                        }
                        return new UriTemplate(uriTemplateText, expressions);
                    }
                    return parseTemplate;
                }();
                var VariableExpression = function() {
                    function prettyPrint(value) {
                        return JSON ? JSON.stringify(value) : value;
                    }
                    function VariableExpression(templateText, operator, varspecs) {
                        this.templateText = templateText;
                        this.operator = operator;
                        this.varspecs = varspecs;
                    }
                    VariableExpression.prototype.toString = function() {
                        return this.templateText;
                    };
                    VariableExpression.prototype.expand = function(variables) {
                        var result = "", index, varspec, value, valueIsArr, isFirstVarspec = true, operator = this.operator;
                        function reduceUnexploded(result, currentValue, currentKey) {
                            if (isDefined(currentValue)) {
                                if (result.length > 0) {
                                    result += ",";
                                }
                                if (!valueIsArr) {
                                    result += operator.encode(currentKey) + ",";
                                }
                                result += operator.encode(currentValue);
                            }
                            return result;
                        }
                        function reduceNamedExploded(result, currentValue, currentKey) {
                            if (isDefined(currentValue)) {
                                if (result.length > 0) {
                                    result += operator.separator;
                                }
                                result += valueIsArr ? LiteralExpression.encodeLiteral(varspec.varname) : operator.encode(currentKey);
                                result += "=" + operator.encode(currentValue);
                            }
                            return result;
                        }
                        function reduceUnnamedExploded(result, currentValue, currentKey) {
                            if (isDefined(currentValue)) {
                                if (result.length > 0) {
                                    result += operator.separator;
                                }
                                if (!valueIsArr) {
                                    result += operator.encode(currentKey) + "=";
                                }
                                result += operator.encode(currentValue);
                            }
                            return result;
                        }
                        for (index = 0; index < this.varspecs.length; index += 1) {
                            varspec = this.varspecs[index];
                            value = variables[varspec.varname];
                            if (!isDefined(value)) {
                                continue;
                            }
                            if (isFirstVarspec) {
                                result += operator.first;
                                isFirstVarspec = false;
                            } else {
                                result += operator.separator;
                            }
                            valueIsArr = objectHelper.isArray(value);
                            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                                value = value.toString();
                                if (operator.named) {
                                    result += LiteralExpression.encodeLiteral(varspec.varname);
                                    if (value === "") {
                                        result += operator.ifEmpty;
                                        continue;
                                    }
                                    result += "=";
                                }
                                if (varspec.maxLength !== null) {
                                    value = value.substr(0, varspec.maxLength);
                                }
                                result += operator.encode(value);
                            } else if (varspec.maxLength) {
                                throw new Error("Prefix modifiers are not applicable to variables that have composite values. You tried to expand " + this + " with " + prettyPrint(value));
                            } else if (!varspec.exploded) {
                                if (operator.named) {
                                    result += LiteralExpression.encodeLiteral(varspec.varname);
                                    if (!isDefined(value)) {
                                        result += operator.ifEmpty;
                                        continue;
                                    }
                                    result += "=";
                                }
                                result += objectHelper.reduce(value, reduceUnexploded, "");
                            } else {
                                result += objectHelper.reduce(value, operator.named ? reduceNamedExploded : reduceUnnamedExploded, "");
                            }
                        }
                        if (isFirstVarspec) {
                            var oneExploded = false;
                            for (index = 0; index < this.varspecs.length; index += 1) {
                                if (this.varspecs[index].exploded) {
                                    oneExploded = true;
                                    break;
                                }
                            }
                            if (operator.named && !oneExploded) {
                                result += operator.symbol;
                                result += varspec.varname + operator.ifEmpty;
                            }
                        }
                        return result;
                    };
                    return VariableExpression;
                }();
                var UriTemplate = function() {
                    function UriTemplate(templateText, expressions) {
                        this.templateText = templateText;
                        this.expressions = expressions;
                        objectHelper.deepFreeze(this);
                    }
                    UriTemplate.prototype.toString = function() {
                        return this.templateText;
                    };
                    UriTemplate.prototype.expand = function(variables) {
                        var index, result = "";
                        for (index = 0; index < this.expressions.length; index += 1) {
                            result += this.expressions[index].expand(variables);
                        }
                        return result;
                    };
                    UriTemplate.parse = parse;
                    return UriTemplate;
                }();
                exportCallback(UriTemplate);
            })(function(UriTemplate) {
                "use strict";
                if (typeof module !== "undefined") {
                    module.exports = UriTemplate;
                } else if (typeof define === "function") {
                    define([], function() {
                        return UriTemplate;
                    });
                } else if (typeof window !== "undefined") {
                    window.UriTemplate = UriTemplate;
                } else {
                    global.UriTemplate = UriTemplate;
                }
            });
            var MicroEvent = function() {};
            MicroEvent.prototype = {
                bind: function(event, fct) {
                    this._events = this._events || {};
                    this._events[event] = this._events[event] || [];
                    this._events[event].push(fct);
                },
                unbind: function(event, fct) {
                    this._events = this._events || {};
                    if (event in this._events === false) return;
                    this._events[event].splice(this._events[event].indexOf(fct), 1);
                },
                trigger: function(event) {
                    this._events = this._events || {};
                    if (event in this._events === false) return;
                    for (var i = 0; i < this._events[event].length; i++) {
                        this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
                    }
                }
            };
            MicroEvent.mixin = function(destObject) {
                var props = [ "bind", "unbind", "trigger" ];
                for (var i = 0; i < props.length; i++) {
                    destObject.prototype[props[i]] = MicroEvent.prototype[props[i]];
                }
            };
            if (typeof module !== "undefined" && "exports" in module) {
                module.exports = MicroEvent;
            }
            var utils = {
                extend: function() {
                    var src, copy, name, options, target = arguments[0], i = 1, length = arguments.length;
                    for (;i < length; i++) {
                        if ((options = arguments[i]) != null) {
                            for (name in options) {
                                copy = options[name];
                                if (target === copy) {
                                    continue;
                                }
                                if (copy !== undefined) {
                                    target[name] = copy;
                                }
                            }
                        }
                    }
                    return target;
                },
                map: function(arr, fn, scope) {
                    var newArr = [], len = arr.length;
                    scope = scope || window;
                    for (var i = 0; i < len; i++) {
                        newArr[i] = fn.call(scope, arr[i]);
                    }
                    return newArr;
                },
                getType: function() {
                    var reType = /\[object (\w+)\]/;
                    return function(thing) {
                        var match = reType.exec(Object.prototype.toString.call(thing));
                        return match && match[1];
                    };
                }(),
                camelCase: function() {
                    var rdashAlpha = /-([\da-z])/gi, cccb = function(match, l) {
                        return l.toUpperCase();
                    };
                    return function(str, firstCap) {
                        return (firstCap ? str.charAt(0).toUpperCase() + str.substring(1) : str).replace(rdashAlpha, cccb);
                    };
                }(),
                dashCase: function() {
                    var rcase = /([a-z])([A-Z])/g, rstr = "$1-$2";
                    return function(str) {
                        return str.replace(rcase, rstr).toLowerCase();
                    };
                }(),
                ajax: function(method, url, headers, data, success, failure) {
                    if (typeof data !== "string") data = JSON.stringify(data);
                    var xhr = new (window.XMLHttpRequest ? window.XMLHttpRequest : window.ActiveXObject("Microsoft.XMLHTTP"))();
                    var timeout = setTimeout(function() {
                        clearTimeout(timeout);
                        failure({
                            Items: [ {
                                Message: "Request timed out.",
                                ErrorCode: "TIMEOUT"
                            } ]
                        }, xhr);
                    }, 6e4);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            clearTimeout(timeout);
                            var json = null;
                            if (xhr.responseText.length > 0) {
                                try {
                                    json = JSON.parse(xhr.responseText);
                                } catch (e) {
                                    failure({
                                        Items: [ {
                                            Message: "Unable to parse response: " + xhr.responseText,
                                            ErrorCode: "UNKNOWN"
                                        } ]
                                    }, xhr, e);
                                }
                            }
                            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                                success(json, xhr);
                            } else {
                                failure(json || {
                                    Items: [ {
                                        Message: "Request failed, no response given.",
                                        ErrorCode: xhr.status
                                    } ]
                                }, xhr);
                            }
                        }
                    };
                    xhr.open(method || "GET", url);
                    if (headers) {
                        for (var h in headers) {
                            if (headers[h]) xhr.setRequestHeader(h, headers[h]);
                        }
                    }
                    xhr.setRequestHeader("Content-type", "application/json");
                    xhr.setRequestHeader("Accept", "application/json");
                    xhr.send(method !== "GET" && data);
                    return xhr;
                },
                pipeline: function(tasks) {
                    var initialArgs, runTask;
                    initialArgs = Array.prototype.slice.call(arguments, 1);
                    runTask = function(task, args) {
                        runTask = function(task, arg) {
                            return task(arg);
                        };
                        return task.apply(null, args);
                    };
                    return utils.when.reduce(tasks, function(args, task) {
                        return runTask(task, args);
                    }, initialArgs);
                },
                areSameType: function(ljson, rjson) {
                    return Object.keys(ljson).join() === Object.keys(rjson).join();
                },
                when: amds[0],
                uritemplate: amds[1],
                addEvents: function(ctor) {
                    MicroEvent.mixin(ctor);
                    ctor.prototype.on = ctor.prototype.bind;
                    ctor.prototype.off = ctor.prototype.unbind;
                    ctor.prototype.fire = function() {
                        try {
                            return ctor.prototype.trigger.apply(this, arguments);
                        } catch (e) {}
                    };
                }
            };
            var ApiReference = function() {
                var basicOps = {
                    get: "GET",
                    update: "PUT",
                    create: "POST",
                    del: "DELETE"
                };
                var genericQueryTpt = "{?_*}";
                var defaultHost = window.location.protocol + "//" + window.location.host + "/";
                var pub = {
                    basicOps: basicOps,
                    urls: {
                        ProductService: defaultHost + "mozu.ProductRuntime.WebApi/commerce/catalog/storefront/products/",
                        CategoryService: defaultHost + "mozu.ProductRuntime.WebApi/commerce/catalog/storefront/categories/",
                        CartService: defaultHost + "mozu.Cart.WebApi/commerce/carts/",
                        UserService: defaultHost + "mozu.User.WebApi/platform/user/accounts/",
                        CustomerService: defaultHost + "mozu.Customer.WebApi/commerce/customer/accounts",
                        OrderService: defaultHost + "mozu.CommerceRuntime.WebApi/commerce/orders",
                        SearchService: defaultHost + "mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch",
                        CmsService: defaultHost + "mozu.Content.WebApi/documentLists/",
                        ReferenceService: defaultHost + "mozu.reference.WebApi/platform/reference/"
                    },
                    getActionsFor: function(typeName) {
                        if (!objectTypes[typeName]) return false;
                        var actions = [];
                        for (var a in basicOps) {
                            if (!(a in objectTypes[typeName])) actions.push(a);
                        }
                        for (a in objectTypes[typeName]) {
                            if (a && objectTypes[typeName].hasOwnProperty(a) && !reservedWords[a]) actions.push(utils.camelCase(a));
                        }
                        return actions;
                    },
                    getRequestConfig: function(operation, typeName, conf, context, obj) {
                        var returnObj, tptData;
                        var oType = objectTypes[typeName];
                        if (!oType) return typeName;
                        if (operation) operation = utils.dashCase(operation);
                        if (oType[operation]) oType = oType[operation];
                        if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);
                        if (typeof oType === "string") oType = {
                            template: oType
                        };
                        if (!oType.template) "No URL template found for '" + typeName + "'.";
                        returnObj = {};
                        tptData = {};
                        if (typeof oType.template === "string") oType.template = utils.uritemplate.parse(oType.template);
                        if (oType.includeSelf && obj) {
                            if (oType.includeSelf.asProperty) {
                                tptData[oType.includeSelf.asProperty] = obj.data;
                            } else {
                                tptData = utils.extend(tptData, obj.data);
                            }
                        }
                        if (conf !== undefined && typeof conf !== "object") {
                            if (!oType.shortcutParam) throw "No shortcut parameter available for '" + typeName + "'. Please supply a configuration object instead of '" + conf + "'.";
                            tptData[oType.shortcutParam] = conf;
                        } else if (conf) {
                            utils.extend(tptData, conf.query || conf);
                        }
                        if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);
                        returnObj.url = oType.template.expand(utils.extend({
                            _: tptData
                        }, context.asObject("context-"), tptData, ApiReference.urls));
                        if (oType.verb) returnObj.verbOverride = oType.verb;
                        if (oType.returnType) returnObj.returnType = oType.returnType;
                        if (oType.noBody) returnObj.noBody = oType.noBody;
                        if (oType.overridePostData) returnObj.overridePostData = tptData;
                        return returnObj;
                    },
                    tryCreateApiObject: function(type, rawJSON, api) {
                        return type in objectTypes ? objectTypes[type].collectionOf ? this.createApiCollection(type, rawJSON, api, objectTypes[type].collectionOf) : new ApiObject(type, rawJSON, api) : rawJSON;
                    },
                    createApiCollection: function(type, rawJSON, api, memberType) {
                        return new ApiCollection(type, rawJSON, api, memberType);
                    }
                };
                var reservedWords = {
                    template: true,
                    defaultParams: true,
                    shortcutParam: true,
                    defaults: true,
                    verb: true,
                    returnType: true,
                    noBody: true,
                    includeSelf: true,
                    collectionOf: true
                };
                var objectTypes = {
                    products: {
                        template: "{+ProductService}" + genericQueryTpt,
                        shortcutParam: "filter",
                        defaultParams: {
                            startIndex: 0,
                            pageSize: 25
                        },
                        collectionOf: "product"
                    },
                    categories: {
                        template: "{+CategoryService}" + genericQueryTpt,
                        shortcutParam: "filter",
                        defaultParams: {
                            startIndex: 0,
                            pageSize: 25
                        },
                        collectionOf: "category"
                    },
                    category: {
                        template: "{+CategoryService}{Id}?{&allowInactive*}",
                        shortcutParam: "Id",
                        defaultParams: {
                            allowInactive: false
                        }
                    },
                    search: {
                        template: "{+SearchService}searchz" + genericQueryTpt,
                        shortcutParam: "q",
                        defaultParams: {
                            startIndex: 0,
                            query: "*:*",
                            pageSize: 25
                        },
                        collectionOf: "product"
                    },
                    product: {
                        get: {
                            template: "{+ProductService}{ProductCode}?{&allowInactive*}",
                            shortcutParam: "ProductCode",
                            defaultParams: {
                                allowInactive: false
                            }
                        },
                        configure: {
                            verb: "POST",
                            template: "{+ProductService}{ProductCode}/configure{?includeOptionDetails}",
                            defaultParams: {
                                includeOptionDetails: true
                            },
                            includeSelf: true
                        },
                        "add-to-cart": {
                            verb: "POST",
                            includeSelf: {
                                asProperty: "Product"
                            },
                            overridePostData: true,
                            shortcutParam: "Quantity",
                            returnType: "cartitem",
                            template: "{+CartService}current/items/"
                        }
                    },
                    cart: {
                        get: "{+CartService}current",
                        "add-product": {
                            verb: "POST",
                            returnType: "cartitem",
                            template: "{+CartService}current/items/"
                        },
                        empty: {
                            verb: "DELETE",
                            template: "{+CartService}current/items/"
                        },
                        checkout: {
                            verb: "POST",
                            template: "{+OrderService}?cartId={Id}",
                            returnType: "order",
                            noBody: true,
                            includeSelf: true
                        }
                    },
                    cartitem: {
                        defaults: {
                            template: "{+CartService}current/items/{CartItemId}",
                            shortcutParam: "CartItemId"
                        },
                        "update-quantity": {
                            verb: "PUT",
                            template: "{+CartService}current/items{/CartItemId,quantity}",
                            shortcutParam: "quantity",
                            includeSelf: true,
                            noBody: true
                        }
                    },
                    user: {
                        create: {
                            verb: "POST",
                            template: "{+UserService}"
                        },
                        get: {
                            template: "{+UserService}{Id}",
                            shortcutParam: "id"
                        },
                        "get-by-email": {
                            template: "{+UserService}{?emailAddress*}",
                            shortcutParam: "emailAddress"
                        },
                        login: {
                            verb: "POST",
                            template: "{+UserService}Login",
                            includeSelf: true,
                            returnType: "login"
                        },
                        "change-password": {
                            verb: "POST",
                            includeSelf: true,
                            template: "{+UserService}{Id}/changepassword"
                        }
                    },
                    customer: {
                        template: "{+CustomerService}{Id}",
                        shortcutParam: "Id",
                        includeSelf: true
                    },
                    login: "{+UserService}Login",
                    order: {
                        get: {
                            template: "{+OrderService}{Id}"
                        },
                        create: {
                            template: "{+OrderService}{?cartId*}",
                            shortcutParam: "cartId",
                            noBody: true
                        },
                        "update-shipping-address": {
                            template: "{+OrderService}{Id}/shippinginfo",
                            verb: "PUT",
                            returnType: "shipment",
                            includeSelf: true
                        },
                        "set-user-id": {
                            verb: "PUT",
                            template: "{+OrderService}{Id}/users",
                            noBody: true,
                            includeSelf: true,
                            returnType: "user"
                        },
                        "apply-coupon": {
                            verb: "PUT",
                            template: "{+OrderService}{Id}/coupons/{couponCode}",
                            shortcutParam: "couponCode",
                            includeSelf: true,
                            noBody: true,
                            returnType: "coupon"
                        },
                        "remove-coupon": {
                            verb: "DELETE",
                            template: "{+OrderService}{Id}/coupons/{couponCode}",
                            shortcutParam: "couponCode",
                            includeSelf: true
                        },
                        "remove-all-coupons": {
                            verb: "DELETE",
                            template: "{+OrderService}{Id}/coupons",
                            includeSelf: true
                        },
                        "get-available-actions": {
                            template: "{+OrderService}{Id}/actions",
                            includeSelf: true,
                            returnType: "orderactions"
                        },
                        "perform-order-action": {
                            verb: "POST",
                            template: "{+OrderService}{Id}/actions",
                            includeSelf: true
                        },
                        "add-order-note": {
                            verb: "POST",
                            template: "{+OrderService}{Id}/notes",
                            includeSelf: true,
                            returnType: "ordernote"
                        }
                    },
                    shipment: {
                        defaults: {
                            template: "{+OrderService}{orderId}/shippinginfo",
                            includeSelf: true
                        },
                        "get-shipping-methods": {
                            template: "{+OrderService}{orderId}/shipments/methods",
                            returnType: "shippingmethods"
                        }
                    },
                    payment: {
                        template: "{+OrderService}{orderId}/payment",
                        includeSelf: true
                    },
                    ordernote: {
                        template: "{+OrderService}{orderId}/notes/{Id}"
                    },
                    document: {
                        get: {
                            template: "{+CmsService}{/documentListName,documentId}/{?version,status}",
                            shortcutParam: "documentId",
                            defaultParams: {
                                documentListName: "default"
                            }
                        }
                    },
                    documentbyname: {
                        get: {
                            template: "{+CmsService}{documentListName}/named/{documentName}/{?folderPath,version,status}",
                            shortcutParam: "documentName",
                            defaultParams: {
                                documentListName: "default"
                            }
                        }
                    },
                    addressschemas: "{+ReferenceService}addressschemas"
                };
                return pub;
            }();
            var ApiObject = function() {
                var ApiObjectConstructor = function(type, data, iapi) {
                    this.data = data;
                    this.api = iapi;
                    this.type = type;
                };
                ApiObjectConstructor.prototype = {
                    constructor: ApiObjectConstructor,
                    action: function(actionName, data) {
                        var me = this;
                        var requestConf = ApiReference.getRequestConfig(actionName, this.type, data || this.data, this.api.context, this);
                        me.fire("action", actionName, data, requestConf);
                        me.api.fire("action", me, actionName, data, requestConf);
                        return this.api.request(ApiReference.basicOps[actionName], requestConf, data).then(function(rawJSON) {
                            if (requestConf.returnType) {
                                var returnObj = ApiReference.tryCreateApiObject(requestConf.returnType, rawJSON, me.api);
                                me.fire("spawn", returnObj);
                                me.api.fire("spawn", returnObj, me);
                                return returnObj;
                            } else {
                                utils.extend(me.data, rawJSON);
                                delete me.data.unsynced;
                                me.fire("sync", rawJSON, me.data);
                                me.api.fire("sync", me, rawJSON, me.data);
                                return me;
                            }
                        }, function(errorJSON) {
                            me.fire("error", errorJSON);
                            me.api.fire("error", errorJSON, me);
                            throw errorJSON;
                        });
                    },
                    getAvailableActions: function() {
                        return ApiReference.getActionsFor(this.type);
                    },
                    prop: function(k, v) {
                        switch (arguments.length) {
                          case 1:
                            if (typeof k === "string") return this.data[k];
                            if (typeof k === "object") {
                                for (var hashkey in k) {
                                    if (k.hasOwnProperty(hashkey)) this.prop(hashkey, k[hashkey]);
                                }
                            }
                            break;

                          case 2:
                            this.data[k] = v;
                        }
                        return this;
                    }
                };
                var setOp = function(fnName) {
                    ApiObjectConstructor.prototype[fnName] = function(conf) {
                        return this.action(fnName, conf);
                    };
                };
                for (var i in ApiReference.basicOps) {
                    if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
                }
                utils.addEvents(ApiObjectConstructor);
                return ApiObjectConstructor;
            }();
            var ApiCollection = function() {
                function convertItem(raw) {
                    return new ApiReference.tryCreateApiObject(this.itemType, raw, this.api);
                }
                var ApiCollectionConstructor = function(type, data, api, itemType) {
                    var self = this;
                    ApiObject.apply(this, arguments);
                    this.itemType = itemType;
                    if (data.Items.length > 0) this.add(data.Items, true);
                    this.on("sync", function(raw) {
                        self.removeAll();
                        self.add(raw.Items);
                    });
                };
                ApiCollectionConstructor.prototype = utils.extend(new ApiObject(), {
                    isCollection: true,
                    constructor: ApiCollectionConstructor,
                    add: function(newItems, noUpdate) {
                        if (utils.getType(newItems) !== "Array") newItems = [ newItems ];
                        Array.prototype.push.apply(this, utils.map(newItems, convertItem, this));
                        if (!noUpdate) {
                            var rawItems = this.prop("Items");
                            this.prop("Items", rawItems.concat(newItems));
                        }
                    },
                    remove: function(indexOrItem) {},
                    replace: function(newItems, noUpdate) {
                        Array.prototype.splice.call(this, 0, this.length, utils.map(newItems, convertItem, this));
                        if (!noUpdate) {
                            this.prop("Items", rawItems);
                        }
                    },
                    removeAll: function(noUpdate) {
                        Array.prototype.splice.call(this, 0, this.length);
                        if (!noUpdate) {
                            this.prop("Items", []);
                        }
                    },
                    firstPage: function() {
                        var currentIndex = this.prop("StartIndex");
                        if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
                        return this.get({
                            startIndex: 0
                        });
                    },
                    index: function(newIndex) {
                        return this.get({
                            startIndex: newIndex
                        });
                    },
                    prevPage: function() {
                        var currentIndex = this.prop("StartIndex"), pageSize = this.prop("PageSize"), newIndex = currentIndex - pageSize + 1;
                        if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
                        return this.index(newIndex);
                    },
                    nextPage: function() {
                        var currentIndex = this.prop("StartIndex"), pageSize = this.prop("PageSize"), newIndex = currentIndex + pageSize - 1;
                        if (!(newIndex < this.prop("TotalCount"))) throw "This " + this.type + " collection is already at its last page and has no next page.";
                        return this.index(newIndex);
                    },
                    lastPage: function() {
                        var totalCount = this.prop("TotalCount"), pageSize = this.prop("PageSize"), newIndex = totalCount - pageSize;
                        if (newIndex <= 0) throw "This " + this.type + " collection has only one page.";
                        return this.index(newIndex);
                    }
                });
                return ApiCollectionConstructor;
            }();
            var ApiInterface = function() {
                var ApiInterfaceConstructor = function(context) {
                    if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
                    if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
                    if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
                    this.context = context;
                };
                ApiInterfaceConstructor.prototype = {
                    constructor: ApiInterfaceConstructor,
                    request: function(method, requestConf, conf) {
                        var me = this, url = typeof requestConf === "string" ? requestConf : requestConf.url;
                        if (requestConf.verbOverride) method = requestConf.verbOverride;
                        var deferred = utils.when.defer();
                        var data;
                        if (requestConf.overridePostData) {
                            data = requestConf.overridePostData;
                        } else if (conf && !requestConf.noBody) {
                            data = conf.data || conf;
                        }
                        var xhr = utils.ajax(method, url, this.context.asObject("x-vol-"), data, function(rawJSON) {
                            me.fire("success", rawJSON, xhr, requestConf);
                            deferred.resolve(rawJSON, xhr);
                        }, function(error) {
                            deferred.reject(error, xhr, url);
                        });
                        var cancelled = false, canceller = function() {
                            cancelled = true;
                            xhr.abort();
                            deferred.reject("Request cancelled.");
                        };
                        this.fire("request", xhr, canceller, deferred.promise, requestConf, conf);
                        deferred.promise.otherwise(function(error) {
                            var res;
                            if (!cancelled) {
                                me.fire("error", error, xhr, requestConf);
                                throw error;
                            }
                        });
                        return deferred.promise;
                    },
                    action: function(type, actionName, conf, isRemote) {
                        var me = this, fulfill = function(rawJSON) {
                            var newApiObject = ApiReference.tryCreateApiObject(type, rawJSON, me);
                            me.fire("spawn", newApiObject);
                            return newApiObject;
                        };
                        isRemote = isRemote === false ? false : true;
                        if (isRemote) {
                            return this.request(ApiReference.basicOps[actionName], ApiReference.getRequestConfig(actionName, type, conf, this.context), conf).then(fulfill);
                        } else {
                            return utils.when(conf, fulfill);
                        }
                    },
                    all: function() {
                        return utils.when.join.apply(utils.when, arguments);
                    },
                    steps: function() {
                        var args = Object.prototype.toString.call(arguments[0]) === "[object Array]" ? arguments[0] : Array.prototype.slice.call(arguments);
                        return utils.pipeline(Array.prototype.slice.call(args));
                    }
                };
                var setOp = function(fnName) {
                    ApiInterfaceConstructor.prototype[fnName] = function(type, conf, isRemote) {
                        return this.action(type, fnName, conf, isRemote);
                    };
                };
                for (var i in ApiReference.basicOps) {
                    if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
                }
                utils.addEvents(ApiInterfaceConstructor);
                return ApiInterfaceConstructor;
            }();
            var ApiContext = function() {
                var ApiContextConstructor = function(conf) {
                    utils.extend(this, conf);
                }, mutableAccessors = [ "app-claims", "user-claims", "callchain", "currency", "locale" ], immutableAccessors = [ "tenant", "site", "site-group" ], immutableAccessorLength = immutableAccessors.length, allAccessors = mutableAccessors.concat(immutableAccessors), allAccessorsLength = allAccessors.length, j;
                var setImmutableAccessor = function(propName) {
                    ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function(val) {
                        if (val === undefined) return this[propName];
                        var newConf = this.asObject();
                        newConf[propName] = val;
                        return new ApiContextConstructor(newConf);
                    };
                };
                var setMutableAccessor = function(propName) {
                    ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function(val) {
                        if (val === undefined) return this[propName];
                        this[propName] = val;
                        return this;
                    };
                };
                ApiContextConstructor.prototype = {
                    constructor: ApiContextConstructor,
                    api: function() {
                        return this._apiInstance || (this._apiInstance = new ApiInterface(this));
                    },
                    Store: function(conf) {
                        return new ApiContextConstructor(conf);
                    },
                    asObject: function(prefix) {
                        var obj = {};
                        prefix = prefix || "";
                        for (var i = 0; i < allAccessorsLength; i++) {
                            obj[prefix + allAccessors[i]] = this[allAccessors[i]];
                        }
                        return obj;
                    },
                    setServiceUrls: function(urls) {
                        ApiReference.urls = urls;
                    },
                    currency: "usd",
                    locale: "en-US"
                };
                for (j = 0; j < immutableAccessors.length; j++) setImmutableAccessor(immutableAccessors[j]);
                for (j = 0; j < mutableAccessors.length; j++) setMutableAccessor(mutableAccessors[j]);
                return ApiContextConstructor;
            }();
            var Mozu = new ApiContext();
            return Mozu;
        });
    })(internalDefine, typeof define === "function" && define.amd ? define : function(fn) {
        typeof exports === "object" && typeof module === "object" ? module.exports = fn() : this.Mozu = fn();
    });
})();