/*! 
 * Mozu JavaScript SDK - v0.1.0 - 2013-03-05
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
                        var promise, deferred;
                        if (promiseOrValue instanceof Promise) {
                            promise = promiseOrValue;
                        } else {
                            if (isPromise(promiseOrValue)) {
                                deferred = defer();
                                promiseOrValue.then(function(value) {
                                    deferred.resolve(value);
                                }, function(reason) {
                                    deferred.reject(reason);
                                }, function(update) {
                                    deferred.progress(update);
                                });
                                promise = deferred.promise;
                            } else {
                                promise = fulfilled(promiseOrValue);
                            }
                        }
                        return promise;
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
                        var deferred, promise, handlers, progressHandlers, _then, _progress, _resolve;
                        promise = new Promise(then);
                        deferred = {
                            then: then,
                            resolve: promiseResolve,
                            reject: promiseReject,
                            progress: promiseProgress,
                            promise: promise,
                            resolver: {
                                resolve: promiseResolve,
                                reject: promiseReject,
                                progress: promiseProgress
                            }
                        };
                        handlers = [];
                        progressHandlers = [];
                        _then = function(onFulfilled, onRejected, onProgress) {
                            var deferred, progressHandler;
                            deferred = defer();
                            progressHandler = typeof onProgress === "function" ? function(update) {
                                try {
                                    deferred.progress(onProgress(update));
                                } catch (e) {
                                    deferred.progress(e);
                                }
                            } : function(update) {
                                deferred.progress(update);
                            };
                            handlers.push(function(promise) {
                                promise.then(onFulfilled, onRejected).then(deferred.resolve, deferred.reject, progressHandler);
                            });
                            progressHandlers.push(progressHandler);
                            return deferred.promise;
                        };
                        _progress = function(update) {
                            processQueue(progressHandlers, update);
                            return update;
                        };
                        _resolve = function(value) {
                            _then = value.then;
                            _resolve = resolve;
                            _progress = identity;
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
                        function promiseProgress(update) {
                            return _progress(update);
                        }
                    }
                    function isPromise(promiseOrValue) {
                        return promiseOrValue && typeof promiseOrValue.then === "function";
                    }
                    function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {
                        checkCallbacks(2, arguments);
                        return when(promisesOrValues, function(promisesOrValues) {
                            var toResolve, toReject, values, reasons, deferred, fulfillOne, rejectOne, progress, len, i;
                            len = promisesOrValues.length >>> 0;
                            toResolve = Math.max(0, Math.min(howMany, len));
                            values = [];
                            toReject = len - toResolve + 1;
                            reasons = [];
                            deferred = defer();
                            if (!toResolve) {
                                deferred.resolve(values);
                            } else {
                                progress = deferred.progress;
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
                                        when(promisesOrValues[i], fulfiller, rejecter, progress);
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
                        }, resolver.progress);
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
                ajax: function(method, url, headers, data, success, failure) {
                    if (typeof data !== "string") data = JSON.stringify(data);
                    var xhr = new (window.XMLHttpRequest ? window.XMLHttpRequest : window.ActiveXObject("Microsoft.XMLHTTP"))();
                    var timeout = setTimeout(function() {
                        clearTimeout(timeout);
                        failure(xhr, "Request timed out.");
                    }, 2e4);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            clearTimeout(timeout);
                            if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                                var json;
                                try {
                                    json = JSON.parse(xhr.responseText);
                                } catch (e) {
                                    failure(xhr, e);
                                }
                                if (json) success(json, xhr);
                            } else {
                                failure(xhr);
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
                uritemplate: amds[1]
            };
            var ApiReference = function() {
                var basicOps = {
                    get: "GET",
                    update: "PUT",
                    create: "POST",
                    del: "DELETE"
                };
                var ApiObject = function(type, data, iapi) {
                    this.data = data;
                    this.api = iapi;
                    this.type = type;
                };
                ApiObject.prototype = {
                    action: function(actionName, data) {
                        var me = this;
                        var url = ApiReference.getUrlFor(actionName, this.type, this.data, this.api.context);
                        return this.api.request(null, url, data).then(function(rawJSON) {
                            if (utils.areSameType(rawJSON, me.data)) {
                                me.data = rawJSON;
                                return me;
                            } else {
                                return ApiReference.tryCreateApiObject(null, rawJSON, me.api);
                            }
                        });
                    },
                    getAvailableActions: function() {
                        return ApiReference.getActionsFor(this.type);
                    }
                };
                var setOp = function(fnName) {
                    ApiObject.prototype[fnName] = function(conf) {
                        return this.action(fnName, conf);
                    };
                };
                for (var i in basicOps) {
                    if (basicOps.hasOwnProperty(i)) setOp(i);
                }
                var genericQueryTpt = "{?_*}";
                var pub = {
                    basicOps: basicOps,
                    urls: {
                        product: "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/products/",
                        cart: "http://aus01pdweb001.ads.volusion.com:9090/mozu.Cart.WebApi/carts/",
                        user: "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/users/",
                        order: "http://aus01pdweb001.ads.volusion.com:9090/mozu.Order.WebApi/orders/",
                        search: "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/productsearch/",
                        cms: "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/documents/"
                    },
                    getActionsFor: function(shortcutName) {
                        if (!urlShortcuts[shortcutName]) return false;
                        var actions = [];
                        for (var a in urlShortcuts[shortcutName]) {
                            actions.push(a);
                        }
                        return actions;
                    },
                    getUrlFor: function(operation, shortcutName, conf, context) {
                        var shortcut = urlShortcuts[shortcutName];
                        if (!shortcut) return shortcutName;
                        if (shortcut[operation]) shortcut = shortcut[operation];
                        if (!shortcut) throw "No known URL for '" + shortcutName + "' type.";
                        if (typeof shortcut === "string") return shortcut;
                        var returnUrl;
                        if (shortcut.url) {
                            returnUrl = shortcut.url;
                        } else if (shortcut.template) {
                            if (typeof shortcut.template === "string") shortcut.template = utils.uritemplate.parse(shortcut.template);
                            var tptData = {};
                            if (typeof conf === "string") {
                                if (!shortcut.shortcutParam) throw "No shortcut parameter available for '" + shortcutName + "'. Please supply a configuration object instead of '" + conf + "'.";
                                tptData[shortcut.shortcutParam] = conf;
                            } else if (conf) {
                                utils.extend(tptData, conf.query || conf);
                            }
                            if (shortcut.defaults) tptData = utils.extend({}, shortcut.defaults, tptData);
                            returnUrl = shortcut.template.expand(utils.extend({
                                _: tptData
                            }, context.asObject("context-"), tptData));
                        } else {
                            throw "URLs beyond simple strings and templates are not implemented.";
                        }
                        return shortcut.verb ? {
                            verbOverride: shortcut.verb,
                            url: returnUrl
                        } : returnUrl;
                    },
                    tryCreateApiObject: function(type, rawJSON, api) {
                        return type in urlShortcuts ? new ApiObject(type, rawJSON, api) : ApiReference.getTypeFromObject(rawJSON) ? new ApiObject(ApiReference.getTypeFromObject(rawJSON), rawJSON, api) : rawJSON;
                    },
                    getTypeFromObject: function(rawJSON) {
                        return null;
                    },
                    ApiObject: ApiObject
                };
                var typeSignatures = {};
                var urlShortcuts = {
                    products: {
                        template: pub.urls.product + genericQueryTpt,
                        defaults: {
                            startIndex: 0,
                            pageSize: 25
                        }
                    },
                    search: {
                        template: pub.urls.search + genericQueryTpt,
                        shortcutParam: "q",
                        defaults: {}
                    },
                    product: {
                        template: pub.urls.product + "{productCode}?{&allowInactive*}",
                        shortcutParam: "productCode",
                        defaults: {
                            allowInactive: false
                        }
                    },
                    cart: {
                        get: pub.urls.cart + "current",
                        addproduct: {
                            verb: "POST",
                            template: pub.urls.cart + "current/items/"
                        },
                        empty: {
                            verb: "DELETE",
                            template: pub.urls.cart + "current/items/"
                        }
                    },
                    me: {
                        get: {
                            template: pub.urls.user + "{id}",
                            shortcutParam: "id"
                        },
                        login: {
                            template: pub.urls.user + "Login"
                        }
                    },
                    order: {
                        create: {
                            template: pub.urls.order + "{?cartId*}",
                            shortcutParam: "cartId"
                        }
                    },
                    document: {
                        get: {
                            template: pub.urls.cms + "{documentListName}/{documentId}/?version={version}&status={status}",
                            shortcutParam: "documentId",
                            defaults: {
                                documentListName: "default"
                            }
                        }
                    },
                    documentbyname: {
                        get: {
                            template: pub.urls.cms + "{documentListName}/named/{documentName}/?folderPath={folderPath}&version={version}&status={status}",
                            shortcutParam: "documentName",
                            defaults: {
                                documentListName: "default"
                            }
                        }
                    }
                };
                return pub;
            }();
            var ApiInterface = function(context) {
                if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
                if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
                if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
                this.context = context;
            };
            ApiInterface.prototype = {
                request: function(method, url, conf) {
                    var me = this;
                    if (url.verbOverride) {
                        method = url.verbOverride;
                        url = url.url;
                    }
                    var deferred = utils.when.defer();
                    var data;
                    if (conf) {
                        data = conf.data || conf;
                    }
                    var xhr = utils.ajax(method, url, this.context.asObject("x-vol-"), data, function(rawJSON) {
                        deferred.resolve(rawJSON, xhr);
                    }, function(error) {
                        deferred.reject(error, xhr, url);
                    });
                    deferred.promise.otherwise(function(failedXhr) {
                        me.onError(deferred.promise, failedXhr, url);
                    });
                    return deferred.promise;
                },
                all: function() {
                    return utils.when.join.apply(utils.when, arguments);
                },
                steps: function() {
                    return utils.pipeline(Array.prototype.slice.call(arguments));
                },
                onError: function(badPromise, xhr, url) {
                    window.console && console.error("Error communicating with Mozu API at " + url, badPromise, xhr);
                }
            };
            var setOp = function(fnName) {
                ApiInterface.prototype[fnName] = function(type, conf) {
                    var me = this;
                    return this.request(ApiReference.basicOps[fnName], ApiReference.getUrlFor(fnName, type, conf, this.context), conf).then(function(rawJSON) {
                        return ApiReference.tryCreateApiObject(type, rawJSON, me);
                    });
                };
            };
            for (var i in ApiReference.basicOps) {
                if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
            }
            var ApiContext = function(conf) {
                utils.extend(this, conf);
            };
            ApiContext.prototype = {
                api: function() {
                    return this._apiInstance || (this._apiInstance = new ApiInterface(this));
                },
                Store: function(conf) {
                    return new ApiContext(conf);
                },
                asObject: function(prefix) {
                    var allvars = [ "app-claims", "user-claims", "callchain", "currency", "locale", "tenant", "site-group", "site" ], headerObj = {};
                    prefix = prefix || "";
                    for (var i = 0; i < allvars.length; i++) {
                        headerObj[prefix + allvars[i]] = this[allvars[i]];
                    }
                    return headerObj;
                },
                currency: "usd",
                locale: "en-US"
            };
            var immutableAccessors = {
                tenant: "Tenant",
                site: "Site",
                "site-group": "SiteGroup"
            };
            var setImmutableAccessor = function(propName, fnName) {
                ApiContext.prototype[fnName] = function(val) {
                    if (val === undefined) return this[propName];
                    var newConf = {};
                    for (var k in immutableAccessors) {
                        newConf[k] = this[k];
                    }
                    newConf[propName] = val;
                    return new ApiContext(newConf);
                };
            };
            for (var j in immutableAccessors) {
                if (immutableAccessors.hasOwnProperty(j)) setImmutableAccessor(j, immutableAccessors[j]);
            }
            var mutableAccessors = {
                "app-claims": "AppClaims",
                "user-claims": "UserClaims",
                callchain: "CallChain",
                currency: "Currency",
                locale: "Locale",
                "bypass-cache": "BypassCache"
            };
            var setMutableAccessor = function(propName, fnName) {
                ApiContext.prototype[fnName] = function(val) {
                    if (val === undefined) return this[propName];
                    this[propName] = val;
                    return this;
                };
            };
            for (var k in mutableAccessors) {
                if (mutableAccessors.hasOwnProperty(k)) setMutableAccessor(k, mutableAccessors[k]);
            }
            var Mozu = new ApiContext();
            return Mozu;
        });
    })(internalDefine, typeof define === "function" && define.amd ? define : function(fn) {
        typeof exports === "object" && typeof module === "object" ? module.exports = fn() : this.Mozu = fn();
    });
})();