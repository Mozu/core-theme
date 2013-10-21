/*! 
 * Mozu JavaScript SDK - v0.1.0 - 2013-10-21
 *
 * Copyright (c) 2013 Volusion, Inc.
 *
 */

(function(root) {
    var amds = [], internalDefine = function() {
        var fac = [].pop.apply(arguments);
        amds.push(typeof fac == "function" ? fac() : fac);
    };
    internalDefine.amd = {};
    var externalDefine = root.define;
    var define = root.define = internalDefine;
    (function(exportFn) {
        exportFn(function() {
            (function(define, global) {
                "use strict";
                define(function(require) {
                    when.promise = promise;
                    when.resolve = resolve;
                    when.reject = reject;
                    when.defer = defer;
                    when.join = join;
                    when.all = all;
                    when.map = map;
                    when.reduce = reduce;
                    when.settle = settle;
                    when.any = any;
                    when.some = some;
                    when.isPromise = isPromiseLike;
                    when.isPromiseLike = isPromiseLike;
                    function when(promiseOrValue, onFulfilled, onRejected, onProgress) {
                        return resolve(promiseOrValue).then(onFulfilled, onRejected, onProgress);
                    }
                    function Promise(sendMessage, inspect) {
                        this._message = sendMessage;
                        this.inspect = inspect;
                    }
                    Promise.prototype = {
                        then: function(onFulfilled, onRejected, onProgress) {
                            var args, sendMessage;
                            args = arguments;
                            sendMessage = this._message;
                            return _promise(function(resolve, reject, notify) {
                                sendMessage("when", args, resolve, notify);
                            }, this._status && this._status.observed());
                        },
                        otherwise: function(onRejected) {
                            return this.then(undef, onRejected);
                        },
                        ensure: function(onFulfilledOrRejected) {
                            return this.then(injectHandler, injectHandler)["yield"](this);
                            function injectHandler() {
                                return resolve(onFulfilledOrRejected());
                            }
                        },
                        yield: function(value) {
                            return this.then(function() {
                                return value;
                            });
                        },
                        tap: function(onFulfilledSideEffect) {
                            return this.then(onFulfilledSideEffect)["yield"](this);
                        },
                        spread: function(onFulfilled) {
                            return this.then(function(array) {
                                return all(array, function(array) {
                                    return onFulfilled.apply(undef, array);
                                });
                            });
                        },
                        always: function(onFulfilledOrRejected, onProgress) {
                            return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
                        }
                    };
                    function resolve(value) {
                        return promise(function(resolve) {
                            resolve(value);
                        });
                    }
                    function reject(promiseOrValue) {
                        return when(promiseOrValue, rejected);
                    }
                    function defer() {
                        var deferred, pending, resolved;
                        deferred = {
                            promise: undef,
                            resolve: undef,
                            reject: undef,
                            notify: undef,
                            resolver: {
                                resolve: undef,
                                reject: undef,
                                notify: undef
                            }
                        };
                        deferred.promise = pending = promise(makeDeferred);
                        return deferred;
                        function makeDeferred(resolvePending, rejectPending, notifyPending) {
                            deferred.resolve = deferred.resolver.resolve = function(value) {
                                if (resolved) {
                                    return resolve(value);
                                }
                                resolved = true;
                                resolvePending(value);
                                return pending;
                            };
                            deferred.reject = deferred.resolver.reject = function(reason) {
                                if (resolved) {
                                    return resolve(rejected(reason));
                                }
                                resolved = true;
                                rejectPending(reason);
                                return pending;
                            };
                            deferred.notify = deferred.resolver.notify = function(update) {
                                notifyPending(update);
                                return update;
                            };
                        }
                    }
                    function promise(resolver) {
                        return _promise(resolver, monitorApi.PromiseStatus && monitorApi.PromiseStatus());
                    }
                    function _promise(resolver, status) {
                        var self, value, consumers = [];
                        self = new Promise(_message, inspect);
                        self._status = status;
                        try {
                            resolver(promiseResolve, promiseReject, promiseNotify);
                        } catch (e) {
                            promiseReject(e);
                        }
                        return self;
                        function _message(type, args, resolve, notify) {
                            consumers ? consumers.push(deliver) : enqueue(function() {
                                deliver(value);
                            });
                            function deliver(p) {
                                p._message(type, args, resolve, notify);
                            }
                        }
                        function inspect() {
                            return value ? value.inspect() : toPendingState();
                        }
                        function promiseResolve(val) {
                            if (!consumers) {
                                return;
                            }
                            value = coerce(val);
                            scheduleConsumers(consumers, value);
                            consumers = undef;
                            if (status) {
                                updateStatus(value, status);
                            }
                        }
                        function promiseReject(reason) {
                            promiseResolve(rejected(reason));
                        }
                        function promiseNotify(update) {
                            if (consumers) {
                                scheduleConsumers(consumers, progressed(update));
                            }
                        }
                    }
                    function fulfilled(value) {
                        return near(new NearFulfilledProxy(value), function() {
                            return toFulfilledState(value);
                        });
                    }
                    function rejected(reason) {
                        return near(new NearRejectedProxy(reason), function() {
                            return toRejectedState(reason);
                        });
                    }
                    function near(proxy, inspect) {
                        return new Promise(function(type, args, resolve) {
                            try {
                                resolve(proxy[type].apply(proxy, args));
                            } catch (e) {
                                resolve(rejected(e));
                            }
                        }, inspect);
                    }
                    function progressed(update) {
                        return new Promise(function(type, args, _, notify) {
                            var onProgress = args[2];
                            try {
                                notify(typeof onProgress === "function" ? onProgress(update) : update);
                            } catch (e) {
                                notify(e);
                            }
                        });
                    }
                    function coerce(x) {
                        if (x instanceof Promise) {
                            return x;
                        }
                        if (!(x === Object(x) && "then" in x)) {
                            return fulfilled(x);
                        }
                        return promise(function(resolve, reject, notify) {
                            enqueue(function() {
                                try {
                                    var untrustedThen = x.then;
                                    if (typeof untrustedThen === "function") {
                                        fcall(untrustedThen, x, resolve, reject, notify);
                                    } else {
                                        resolve(fulfilled(x));
                                    }
                                } catch (e) {
                                    reject(e);
                                }
                            });
                        });
                    }
                    function NearFulfilledProxy(value) {
                        this.value = value;
                    }
                    NearFulfilledProxy.prototype.when = function(onResult) {
                        return typeof onResult === "function" ? onResult(this.value) : this.value;
                    };
                    function NearRejectedProxy(reason) {
                        this.reason = reason;
                    }
                    NearRejectedProxy.prototype.when = function(_, onError) {
                        if (typeof onError === "function") {
                            return onError(this.reason);
                        } else {
                            throw this.reason;
                        }
                    };
                    function scheduleConsumers(handlers, value) {
                        enqueue(function() {
                            var handler, i = 0;
                            while (handler = handlers[i++]) {
                                handler(value);
                            }
                        });
                    }
                    function updateStatus(value, status) {
                        value.then(statusFulfilled, statusRejected);
                        function statusFulfilled() {
                            status.fulfilled();
                        }
                        function statusRejected(r) {
                            status.rejected(r);
                        }
                    }
                    function isPromiseLike(x) {
                        return x && typeof x.then === "function";
                    }
                    function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {
                        return when(promisesOrValues, function(promisesOrValues) {
                            return promise(resolveSome).then(onFulfilled, onRejected, onProgress);
                            function resolveSome(resolve, reject, notify) {
                                var toResolve, toReject, values, reasons, fulfillOne, rejectOne, len, i;
                                len = promisesOrValues.length >>> 0;
                                toResolve = Math.max(0, Math.min(howMany, len));
                                values = [];
                                toReject = len - toResolve + 1;
                                reasons = [];
                                if (!toResolve) {
                                    resolve(values);
                                } else {
                                    rejectOne = function(reason) {
                                        reasons.push(reason);
                                        if (!--toReject) {
                                            fulfillOne = rejectOne = identity;
                                            reject(reasons);
                                        }
                                    };
                                    fulfillOne = function(val) {
                                        values.push(val);
                                        if (!--toResolve) {
                                            fulfillOne = rejectOne = identity;
                                            resolve(values);
                                        }
                                    };
                                    for (i = 0; i < len; ++i) {
                                        if (i in promisesOrValues) {
                                            when(promisesOrValues[i], fulfiller, rejecter, notify);
                                        }
                                    }
                                }
                                function rejecter(reason) {
                                    rejectOne(reason);
                                }
                                function fulfiller(val) {
                                    fulfillOne(val);
                                }
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
                        return _map(promisesOrValues, identity).then(onFulfilled, onRejected, onProgress);
                    }
                    function join() {
                        return _map(arguments, identity);
                    }
                    function settle(array) {
                        return _map(array, toFulfilledState, toRejectedState);
                    }
                    function map(array, mapFunc) {
                        return _map(array, mapFunc);
                    }
                    function _map(array, mapFunc, fallback) {
                        return when(array, function(array) {
                            return _promise(resolveMap);
                            function resolveMap(resolve, reject, notify) {
                                var results, len, toResolve, i;
                                toResolve = len = array.length >>> 0;
                                results = [];
                                if (!toResolve) {
                                    resolve(results);
                                    return;
                                }
                                for (i = 0; i < len; i++) {
                                    if (i in array) {
                                        resolveOne(array[i], i);
                                    } else {
                                        --toResolve;
                                    }
                                }
                                function resolveOne(item, i) {
                                    when(item, mapFunc, fallback).then(function(mapped) {
                                        results[i] = mapped;
                                        notify(mapped);
                                        if (!--toResolve) {
                                            resolve(results);
                                        }
                                    }, reject);
                                }
                            }
                        });
                    }
                    function reduce(promise, reduceFunc) {
                        var args = fcall(slice, arguments, 1);
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
                    function toFulfilledState(x) {
                        return {
                            state: "fulfilled",
                            value: x
                        };
                    }
                    function toRejectedState(x) {
                        return {
                            state: "rejected",
                            reason: x
                        };
                    }
                    function toPendingState() {
                        return {
                            state: "pending"
                        };
                    }
                    var reduceArray, slice, fcall, nextTick, handlerQueue, setTimeout, funcProto, call, arrayProto, monitorApi, cjsRequire, undef;
                    cjsRequire = require;
                    handlerQueue = [];
                    function enqueue(task) {
                        if (handlerQueue.push(task) === 1) {
                            nextTick(drainQueue);
                        }
                    }
                    function drainQueue() {
                        var task, i = 0;
                        while (task = handlerQueue[i++]) {
                            task();
                        }
                        handlerQueue = [];
                    }
                    setTimeout = global.setTimeout;
                    monitorApi = typeof console != "undefined" ? console : when;
                    if (typeof setImmediate === "function") {
                        nextTick = setImmediate.bind(global);
                    } else if (typeof MessageChannel !== "undefined") {
                        var channel = new MessageChannel();
                        channel.port1.onmessage = drainQueue;
                        nextTick = function() {
                            channel.port2.postMessage(0);
                        };
                    } else if (typeof process === "object" && process.nextTick) {
                        nextTick = process.nextTick;
                    } else {
                        try {
                            nextTick = cjsRequire("vertx").runOnLoop || cjsRequire("vertx").runOnContext;
                        } catch (ignore) {
                            nextTick = function(t) {
                                setTimeout(t, 0);
                            };
                        }
                    }
                    funcProto = Function.prototype;
                    call = funcProto.call;
                    fcall = funcProto.bind ? call.bind(call) : function(f, context) {
                        return f.apply(context, slice.call(arguments, 2));
                    };
                    arrayProto = [];
                    slice = arrayProto.slice;
                    reduceArray = arrayProto.reduce || function(reduceFunc) {
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
            })(typeof define === "function" && define.amd ? define : function(factory) {
                module.exports = factory(require);
            }, this);
            (function(exportCallback) {
                "use strict";
                var UriTemplateError = function() {
                    function UriTemplateError(options) {
                        this.options = options;
                    }
                    UriTemplateError.prototype.toString = function() {
                        if (JSON && JSON.stringify) {
                            return JSON.stringify(this.options);
                        } else {
                            return this.options;
                        }
                    };
                    return UriTemplateError;
                }();
                var objectHelper = function() {
                    function isArray(value) {
                        return Object.prototype.toString.apply(value) === "[object Array]";
                    }
                    function isString(value) {
                        return Object.prototype.toString.apply(value) === "[object String]";
                    }
                    function isNumber(value) {
                        return Object.prototype.toString.apply(value) === "[object Number]";
                    }
                    function isBoolean(value) {
                        return Object.prototype.toString.apply(value) === "[object Boolean]";
                    }
                    function join(arr, separator) {
                        var result = "", first = true, index;
                        for (index = 0; index < arr.length; index += 1) {
                            if (first) {
                                first = false;
                            } else {
                                result += separator;
                            }
                            result += arr[index];
                        }
                        return result;
                    }
                    function map(arr, mapper) {
                        var result = [], index = 0;
                        for (;index < arr.length; index += 1) {
                            result.push(mapper(arr[index]));
                        }
                        return result;
                    }
                    function filter(arr, predicate) {
                        var result = [], index = 0;
                        for (;index < arr.length; index += 1) {
                            if (predicate(arr[index])) {
                                result.push(arr[index]);
                            }
                        }
                        return result;
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
                        isString: isString,
                        isNumber: isNumber,
                        isBoolean: isBoolean,
                        join: join,
                        map: map,
                        filter: filter,
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
                            result += "%" + (octet < 16 ? "0" : "") + octet.toString(16).toUpperCase();
                        }
                        return result;
                    }
                    function isPercentDigitDigit(text, start) {
                        return text.charAt(start) === "%" && charHelper.isHexDigit(text.charAt(start + 1)) && charHelper.isHexDigit(text.charAt(start + 2));
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
                        var chr = text.charAt(startIndex);
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
                    function encodeLiteralCharacter(literal, index) {
                        var chr = pctEncoder.pctCharAt(literal, index);
                        if (chr.length > 1) {
                            return chr;
                        } else {
                            return rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
                        }
                    }
                    function encodeLiteral(literal) {
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
                    }
                    return {
                        encode: encode,
                        encodePassReserved: encodePassReserved,
                        encodeLiteral: encodeLiteral,
                        encodeLiteralCharacter: encodeLiteralCharacter
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
                                return null;
                            }
                            return bySymbol[""];
                        }
                    };
                }();
                function isDefined(object) {
                    var propertyName;
                    if (object === null || object === undefined) {
                        return false;
                    }
                    if (objectHelper.isArray(object)) {
                        return object.length > 0;
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
                        this.literal = encodingHelper.encodeLiteral(literal);
                    }
                    LiteralExpression.prototype.expand = function() {
                        return this.literal;
                    };
                    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;
                    return LiteralExpression;
                }();
                var parse = function() {
                    function parseExpression(expressionText) {
                        var operator, varspecs = [], varspec = null, varnameStart = null, maxLengthStart = null, index, chr = "";
                        function closeVarname() {
                            var varname = expressionText.substring(varnameStart, index);
                            if (varname.length === 0) {
                                throw new UriTemplateError({
                                    expressionText: expressionText,
                                    message: "a varname must be specified",
                                    position: index
                                });
                            }
                            varspec = {
                                varname: varname,
                                exploded: false,
                                maxLength: null
                            };
                            varnameStart = null;
                        }
                        function closeMaxLength() {
                            if (maxLengthStart === index) {
                                throw new UriTemplateError({
                                    expressionText: expressionText,
                                    message: "after a ':' you have to specify the length",
                                    position: index
                                });
                            }
                            varspec.maxLength = parseInt(expressionText.substring(maxLengthStart, index), 10);
                            maxLengthStart = null;
                        }
                        operator = function(operatorText) {
                            var op = operators.valueOf(operatorText);
                            if (op === null) {
                                throw new UriTemplateError({
                                    expressionText: expressionText,
                                    message: "illegal use of reserved operator",
                                    position: index,
                                    operator: operatorText
                                });
                            }
                            return op;
                        }(expressionText.charAt(0));
                        index = operator.symbol.length;
                        varnameStart = index;
                        for (;index < expressionText.length; index += chr.length) {
                            chr = pctEncoder.pctCharAt(expressionText, index);
                            if (varnameStart !== null) {
                                if (chr === ".") {
                                    if (varnameStart === index) {
                                        throw new UriTemplateError({
                                            expressionText: expressionText,
                                            message: "a varname MUST NOT start with a dot",
                                            position: index
                                        });
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
                                    throw new UriTemplateError({
                                        expressionText: expressionText,
                                        message: "A :prefix must not start with digit 0",
                                        position: index
                                    });
                                }
                                if (charHelper.isDigit(chr)) {
                                    if (index - maxLengthStart >= 4) {
                                        throw new UriTemplateError({
                                            expressionText: expressionText,
                                            message: "A :prefix must have max 4 digits",
                                            position: index
                                        });
                                    }
                                    continue;
                                }
                                closeMaxLength();
                            }
                            if (chr === ":") {
                                if (varspec.maxLength !== null) {
                                    throw new UriTemplateError({
                                        expressionText: expressionText,
                                        message: "only one :maxLength is allowed per varspec",
                                        position: index
                                    });
                                }
                                if (varspec.exploded) {
                                    throw new UriTemplateError({
                                        expressionText: expressionText,
                                        message: "an exploeded varspec MUST NOT be varspeced",
                                        position: index
                                    });
                                }
                                maxLengthStart = index + 1;
                                continue;
                            }
                            if (chr === "*") {
                                if (varspec === null) {
                                    throw new UriTemplateError({
                                        expressionText: expressionText,
                                        message: "exploded without varspec",
                                        position: index
                                    });
                                }
                                if (varspec.exploded) {
                                    throw new UriTemplateError({
                                        expressionText: expressionText,
                                        message: "exploded twice",
                                        position: index
                                    });
                                }
                                if (varspec.maxLength) {
                                    throw new UriTemplateError({
                                        expressionText: expressionText,
                                        message: "an explode (*) MUST NOT follow to a prefix",
                                        position: index
                                    });
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
                            throw new UriTemplateError({
                                expressionText: expressionText,
                                message: "illegal character",
                                character: chr,
                                position: index
                            });
                        }
                        if (varnameStart !== null) {
                            closeVarname();
                        }
                        if (maxLengthStart !== null) {
                            closeMaxLength();
                        }
                        varspecs.push(varspec);
                        return new VariableExpression(expressionText, operator, varspecs);
                    }
                    function parse(uriTemplateText) {
                        var index, chr, expressions = [], braceOpenIndex = null, literalStart = 0;
                        for (index = 0; index < uriTemplateText.length; index += 1) {
                            chr = uriTemplateText.charAt(index);
                            if (literalStart !== null) {
                                if (chr === "}") {
                                    throw new UriTemplateError({
                                        templateText: uriTemplateText,
                                        message: "unopened brace closed",
                                        position: index
                                    });
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
                                    throw new UriTemplateError({
                                        templateText: uriTemplateText,
                                        message: "brace already opened",
                                        position: index
                                    });
                                }
                                if (chr === "}") {
                                    if (braceOpenIndex + 1 === index) {
                                        throw new UriTemplateError({
                                            templateText: uriTemplateText,
                                            message: "empty braces",
                                            position: braceOpenIndex
                                        });
                                    }
                                    try {
                                        expressions.push(parseExpression(uriTemplateText.substring(braceOpenIndex + 1, index)));
                                    } catch (error) {
                                        if (error.prototype === UriTemplateError.prototype) {
                                            throw new UriTemplateError({
                                                templateText: uriTemplateText,
                                                message: error.options.message,
                                                position: braceOpenIndex + error.options.position,
                                                details: error.options
                                            });
                                        }
                                        throw error;
                                    }
                                    braceOpenIndex = null;
                                    literalStart = index + 1;
                                }
                                continue;
                            }
                            throw new Error("reached unreachable code");
                        }
                        if (braceOpenIndex !== null) {
                            throw new UriTemplateError({
                                templateText: uriTemplateText,
                                message: "unclosed brace",
                                position: braceOpenIndex
                            });
                        }
                        if (literalStart < uriTemplateText.length) {
                            expressions.push(new LiteralExpression(uriTemplateText.substr(literalStart)));
                        }
                        return new UriTemplate(uriTemplateText, expressions);
                    }
                    return parse;
                }();
                var VariableExpression = function() {
                    function prettyPrint(value) {
                        return JSON && JSON.stringify ? JSON.stringify(value) : value;
                    }
                    function isEmpty(value) {
                        if (!isDefined(value)) {
                            return true;
                        }
                        if (objectHelper.isString(value)) {
                            return value === "";
                        }
                        if (objectHelper.isNumber(value) || objectHelper.isBoolean(value)) {
                            return false;
                        }
                        if (objectHelper.isArray(value)) {
                            return value.length === 0;
                        }
                        for (var propertyName in value) {
                            if (value.hasOwnProperty(propertyName)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    function propertyArray(object) {
                        var result = [], propertyName;
                        for (propertyName in object) {
                            if (object.hasOwnProperty(propertyName)) {
                                result.push({
                                    name: propertyName,
                                    value: object[propertyName]
                                });
                            }
                        }
                        return result;
                    }
                    function VariableExpression(templateText, operator, varspecs) {
                        this.templateText = templateText;
                        this.operator = operator;
                        this.varspecs = varspecs;
                    }
                    VariableExpression.prototype.toString = function() {
                        return this.templateText;
                    };
                    function expandSimpleValue(varspec, operator, value) {
                        var result = "";
                        value = value.toString();
                        if (operator.named) {
                            result += encodingHelper.encodeLiteral(varspec.varname);
                            if (value === "") {
                                result += operator.ifEmpty;
                                return result;
                            }
                            result += "=";
                        }
                        if (varspec.maxLength !== null) {
                            value = value.substr(0, varspec.maxLength);
                        }
                        result += operator.encode(value);
                        return result;
                    }
                    function valueDefined(nameValue) {
                        return isDefined(nameValue.value);
                    }
                    function expandNotExploded(varspec, operator, value) {
                        var arr = [], result = "";
                        if (operator.named) {
                            result += encodingHelper.encodeLiteral(varspec.varname);
                            if (isEmpty(value)) {
                                result += operator.ifEmpty;
                                return result;
                            }
                            result += "=";
                        }
                        if (objectHelper.isArray(value)) {
                            arr = value;
                            arr = objectHelper.filter(arr, isDefined);
                            arr = objectHelper.map(arr, operator.encode);
                            result += objectHelper.join(arr, ",");
                        } else {
                            arr = propertyArray(value);
                            arr = objectHelper.filter(arr, valueDefined);
                            arr = objectHelper.map(arr, function(nameValue) {
                                return operator.encode(nameValue.name) + "," + operator.encode(nameValue.value);
                            });
                            result += objectHelper.join(arr, ",");
                        }
                        return result;
                    }
                    function expandExplodedNamed(varspec, operator, value) {
                        var isArray = objectHelper.isArray(value), arr = [];
                        if (isArray) {
                            arr = value;
                            arr = objectHelper.filter(arr, isDefined);
                            arr = objectHelper.map(arr, function(listElement) {
                                var tmp = encodingHelper.encodeLiteral(varspec.varname);
                                if (isEmpty(listElement)) {
                                    tmp += operator.ifEmpty;
                                } else {
                                    tmp += "=" + operator.encode(listElement);
                                }
                                return tmp;
                            });
                        } else {
                            arr = propertyArray(value);
                            arr = objectHelper.filter(arr, valueDefined);
                            arr = objectHelper.map(arr, function(nameValue) {
                                var tmp = encodingHelper.encodeLiteral(nameValue.name);
                                if (isEmpty(nameValue.value)) {
                                    tmp += operator.ifEmpty;
                                } else {
                                    tmp += "=" + operator.encode(nameValue.value);
                                }
                                return tmp;
                            });
                        }
                        return objectHelper.join(arr, operator.separator);
                    }
                    function expandExplodedUnnamed(operator, value) {
                        var arr = [], result = "";
                        if (objectHelper.isArray(value)) {
                            arr = value;
                            arr = objectHelper.filter(arr, isDefined);
                            arr = objectHelper.map(arr, operator.encode);
                            result += objectHelper.join(arr, operator.separator);
                        } else {
                            arr = propertyArray(value);
                            arr = objectHelper.filter(arr, function(nameValue) {
                                return isDefined(nameValue.value);
                            });
                            arr = objectHelper.map(arr, function(nameValue) {
                                return operator.encode(nameValue.name) + "=" + operator.encode(nameValue.value);
                            });
                            result += objectHelper.join(arr, operator.separator);
                        }
                        return result;
                    }
                    VariableExpression.prototype.expand = function(variables) {
                        var expanded = [], index, varspec, value, valueIsArr, oneExploded = false, operator = this.operator;
                        for (index = 0; index < this.varspecs.length; index += 1) {
                            varspec = this.varspecs[index];
                            value = variables[varspec.varname];
                            if (value === null || value === undefined) {
                                continue;
                            }
                            if (varspec.exploded) {
                                oneExploded = true;
                            }
                            valueIsArr = objectHelper.isArray(value);
                            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                                expanded.push(expandSimpleValue(varspec, operator, value));
                            } else if (varspec.maxLength && isDefined(value)) {
                                throw new Error("Prefix modifiers are not applicable to variables that have composite values. You tried to expand " + this + " with " + prettyPrint(value));
                            } else if (!varspec.exploded) {
                                if (operator.named || !isEmpty(value)) {
                                    expanded.push(expandNotExploded(varspec, operator, value));
                                }
                            } else if (isDefined(value)) {
                                if (operator.named) {
                                    expanded.push(expandExplodedNamed(varspec, operator, value));
                                } else {
                                    expanded.push(expandExplodedUnnamed(operator, value));
                                }
                            }
                        }
                        if (expanded.length === 0) {
                            return "";
                        } else {
                            return operator.first + objectHelper.join(expanded, operator.separator);
                        }
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
                    UriTemplate.UriTemplateError = UriTemplateError;
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
                    var indexOfFunc = this._events[event].indexOf(fct);
                    if (indexOfFunc !== -1) {
                        this._events[event].splice(indexOfFunc, 1);
                    } else {
                        this._events[event] = [];
                    }
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
                    if (typeof destObject === "function") {
                        destObject.prototype[props[i]] = MicroEvent.prototype[props[i]];
                    } else {
                        destObject[props[i]] = MicroEvent.prototype[props[i]];
                    }
                }
            };
            if (typeof module !== "undefined" && "exports" in module) {
                module.exports = MicroEvent;
            }
            if (typeof define !== "undefined") {
                define([], function() {
                    return MicroEvent;
                });
            }
            var utils = function() {
                return {
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
                                if (xhr.responseText && xhr.responseText.length > 0) {
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
                        var runTask = function(args, task) {
                            runTask = function(arg, task) {
                                return task(arg);
                            };
                            return task.apply(null, args);
                        };
                        return utils.when.all(Array.prototype.slice.call(arguments, 1)).then(function(args) {
                            return utils.when.reduce(tasks, function(arg, task) {
                                return runTask(arg, task);
                            }, args);
                        });
                    },
                    when: amds[0],
                    uritemplate: amds[1],
                    addEvents: function(ctor) {
                        MicroEvent.mixin(ctor);
                        ctor.prototype.on = ctor.prototype.bind;
                        ctor.prototype.off = ctor.prototype.unbind;
                        ctor.prototype.fire = ctor.prototype.trigger;
                    },
                    Exceptions: {
                        NoRequestConfigFound: function(type, op) {
                            var str = "No request configuration was found for " + type + ".";
                            if (op) str = str + op + ".";
                            return {
                                name: "No Request Configuration Error",
                                level: 1,
                                message: str,
                                htmlMessage: str,
                                toString: errorToString
                            };
                        },
                        NoShortcutParamFound: function(type, conf) {
                            var str = "No shortcut parameter available for '" + typeName + "'. Please supply a configuration object instead of '" + conf + "'.";
                            return {
                                name: "No Shortcut Parameter Error",
                                level: 1,
                                message: str,
                                htmlMessage: str,
                                toString: errorToString
                            };
                        }
                    }
                };
                function errorToString() {
                    return this.name + ": " + this.message;
                }
            }();
            var ApiPostProcessors = {
                login: function(obj) {
                    var newClaims = obj.prop("AuthTicket");
                    if (newClaims && newClaims.AccessToken) {
                        obj.api.context.UserClaims(newClaims.AccessToken);
                        obj.api.fire("login", newClaims);
                    }
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
                var copyToConf = [ "verb", "returnType", "noBody", "includeUserClaims" ], copyToConfLength = copyToConf.length;
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
                        if (!oType) throw Mozu.Utils.Exceptions.NoRequestConfigFound(typeName, operation);
                        if (operation) operation = utils.dashCase(operation);
                        if (oType[operation]) oType = oType[operation];
                        if (typeof oType === "string") oType = {
                            template: oType
                        };
                        if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);
                        if (!oType.template) throw Mozu.Utils.Exceptions.NoRequestConfigFound(typeName, operation);
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
                            if (!oType.shortcutParam) throw Mozu.Utils.Exceptions.NoShortcutParamFound(typeName, conf);
                            tptData[oType.shortcutParam] = conf;
                        } else if (conf) {
                            utils.extend(tptData, conf);
                        }
                        if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);
                        for (var tvar in tptData) {
                            if (utils.getType(tptData[tvar]) == "Array") tptData[tvar] = JSON.stringify(tptData[tvar]);
                        }
                        returnObj.url = oType.template.expand(utils.extend({
                            _: tptData
                        }, context.asObject("context-"), tptData, ApiReference.urls));
                        for (var j = 0; j < copyToConfLength; j++) {
                            if (copyToConf[j] in oType) returnObj[copyToConf[j]] = oType[copyToConf[j]];
                        }
                        if (oType.overridePostData) {
                            var overriddenData;
                            if (utils.getType(oType.overridePostData) == "Array") {
                                overriddenData = {};
                                for (var tOK = 0; tOK < oType.overridePostData.length; tOK++) {
                                    overriddenData[oType.overridePostData[tOK]] = tptData[oType.overridePostData[tOK]];
                                }
                            } else {
                                overriddenData = tptData;
                            }
                            returnObj.overridePostData = overriddenData;
                        }
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
                            pageSize: 15
                        },
                        collectionOf: "product"
                    },
                    categories: {
                        template: "{+CategoryService}" + genericQueryTpt,
                        shortcutParam: "filter",
                        defaultParams: {
                            startIndex: 0,
                            pageSize: 15
                        },
                        collectionOf: "category"
                    },
                    category: {
                        template: "{+CategoryService}{Id}(?allowInactive}",
                        shortcutParam: "Id",
                        defaultParams: {
                            allowInactive: false
                        }
                    },
                    search: {
                        template: "{+SearchService}searchz{?query,filter,facetTemplate,facetTemplateSubset,facet,facetFieldRangeQuery,facetHierPrefix,facetHierValue,facetHierDepth,facetStartIndex,facetPageSize,facetSettings,facetValueFilter,sortBy,pageSize,PageSize,startIndex,StartIndex}",
                        shortcutParam: "query",
                        defaultParams: {
                            startIndex: 0,
                            query: "*:*",
                            pageSize: 15
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
                            includeUserClaims: true,
                            template: "{+ProductService}{ProductCode}/configure{?includeOptionDetails}",
                            defaultParams: {
                                includeOptionDetails: true
                            },
                            includeSelf: true
                        },
                        "add-to-cart": {
                            verb: "POST",
                            includeUserClaims: true,
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
                        defaults: {
                            includeUserClaims: true
                        },
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
                            template: "{+CartService}current/items/{Id}",
                            shortcutParam: "Id",
                            includeUserClaims: true
                        },
                        "update-quantity": {
                            verb: "PUT",
                            template: "{+CartService}current/items{/Id,quantity}",
                            shortcutParam: "quantity",
                            includeSelf: true,
                            noBody: true
                        }
                    },
                    user: {
                        defaults: {
                            includeUserClaims: true
                        },
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
                        defaults: {
                            includeUserClaims: true
                        },
                        template: "{+CustomerService}{Id}",
                        shortcutParam: "Id",
                        includeSelf: true
                    },
                    login: "{+UserService}Login",
                    address: {
                        defaults: {
                            includeUserClaims: true
                        },
                        "validate-address": {
                            verb: "POST",
                            template: "{+AddressValidationService}",
                            includeSelf: {
                                asProperty: "Address"
                            },
                            overridePostData: true,
                            returnType: "address"
                        }
                    },
                    order: {
                        defaults: {
                            includeUserClaims: true
                        },
                        template: "{+OrderService}{Id}",
                        includeSelf: true,
                        create: {
                            template: "{+OrderService}{?cartId*}",
                            shortcutParam: "cartId",
                            noBody: true
                        },
                        "update-shipping-info": {
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
                            shortcutParam: "ActionName",
                            overridePostData: [ "ActionName" ],
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
                            includeUserClaims: true,
                            template: "{+OrderService}{orderId}/shippinginfo",
                            includeSelf: true
                        },
                        "get-shipping-methods": {
                            template: "{+OrderService}{orderId}/shipments/methods",
                            returnType: "shippingmethods"
                        }
                    },
                    payment: {
                        defaults: {
                            includeUserClaims: true
                        },
                        template: "{+OrderService}{orderId}/billinginfo",
                        includeSelf: true
                    },
                    ordernote: {
                        defaults: {
                            includeUserClaims: true
                        },
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
                    this.data = data || {};
                    this.api = iapi;
                    this.type = type;
                    if (ApiPostProcessors[this.type]) {
                        this.postProcessor = ApiPostProcessors[this.type];
                        this.postProcessor(this);
                    }
                };
                ApiObjectConstructor.prototype = {
                    constructor: ApiObjectConstructor,
                    action: function(actionName, data) {
                        var me = this;
                        me.fire("action", actionName, data);
                        me.api.fire("action", me, actionName, data);
                        var requestConf = ApiReference.getRequestConfig(actionName, this.type, data || this.data, this.api.context, this);
                        return this.api.request(ApiReference.basicOps[actionName], requestConf, data).then(function(rawJSON) {
                            if (requestConf.returnType) {
                                var returnObj = ApiReference.tryCreateApiObject(requestConf.returnType, rawJSON, me.api);
                                me.fire("spawn", returnObj);
                                me.api.fire("spawn", returnObj, me);
                                return returnObj;
                            } else {
                                me.data = JSON.parse(JSON.stringify(rawJSON));
                                if (me.postProcessor) me.postProcessor(me);
                                delete me.unsynced;
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
                    getIndex: function(newIndex) {
                        var index = this.currentIndex;
                        if (!index && index !== 0) index = this.prop("StartIndex");
                        if (!index && index !== 0) index = 0;
                        return index;
                    },
                    setIndex: function(newIndex, req) {
                        var me = this;
                        var p = this.get(utils.extend(req, {
                            startIndex: newIndex
                        }));
                        p.then(function() {
                            me.currentIndex = newIndex;
                        });
                        return p;
                    },
                    firstPage: function(req) {
                        var currentIndex = this.getIndex();
                        if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
                        return this.setIndex(0, req);
                    },
                    prevPage: function(req) {
                        var currentIndex = this.getIndex(), pageSize = this.prop("PageSize"), newIndex = Math.max(currentIndex - pageSize, 0);
                        if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
                        return this.setIndex(newIndex, req);
                    },
                    nextPage: function(req) {
                        var currentIndex = this.getIndex(), pageSize = this.prop("PageSize"), newIndex = currentIndex + pageSize;
                        if (!(newIndex < this.prop("TotalCount"))) throw "This " + this.type + " collection is already at its last page and has no next page.";
                        return this.setIndex(newIndex, req);
                    },
                    lastPage: function(req) {
                        var totalCount = this.prop("TotalCount"), pageSize = this.prop("PageSize"), newIndex = totalCount - pageSize;
                        if (newIndex <= 0) throw "This " + this.type + " collection has only one page.";
                        return this.setIndex(newIndex, req);
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
                        if (requestConf.verb) method = requestConf.verb;
                        var deferred = utils.when.defer();
                        var data;
                        if (requestConf.overridePostData) {
                            data = requestConf.overridePostData;
                        } else if (conf && !requestConf.noBody) {
                            data = conf.data || conf;
                        }
                        var contextHeaders = this.context.asObject("x-vol-");
                        if (!requestConf.includeUserClaims) delete contextHeaders["x-vol-user-claims"];
                        var xhr = utils.ajax(method, url, contextHeaders, data, function(rawJSON) {
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
                    action: function(type, actionName, conf) {
                        var me = this, requestConf = ApiReference.getRequestConfig(actionName, type, conf, this.context);
                        return this.request(ApiReference.basicOps[actionName], requestConf, conf).then(function(rawJSON) {
                            var newObj = me.createSync(requestConf.returnType || type, rawJSON);
                            delete newObj.unsynced;
                            return newObj;
                        });
                    },
                    all: function() {
                        return utils.when.join.apply(utils.when, arguments);
                    },
                    steps: function() {
                        var args = Object.prototype.toString.call(arguments[0]) === "[object Array]" ? arguments[0] : Array.prototype.slice.call(arguments);
                        return utils.pipeline(Array.prototype.slice.call(args));
                    },
                    getAvailableActionsFor: function(type) {
                        return ApiReference.getActionsFor(type);
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
                ApiInterfaceConstructor.prototype.createSync = function(type, conf) {
                    var newApiObject = ApiReference.tryCreateApiObject(type, conf, this);
                    newApiObject.unsynced = true;
                    this.fire("spawn", newApiObject);
                    return newApiObject;
                };
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
                    getServiceUrls: function() {
                        return utils.extend({}, ApiReference.urls);
                    },
                    currency: "usd",
                    locale: "en-US"
                };
                for (j = 0; j < immutableAccessors.length; j++) setImmutableAccessor(immutableAccessors[j]);
                for (j = 0; j < mutableAccessors.length; j++) setMutableAccessor(mutableAccessors[j]);
                return ApiContextConstructor;
            }();
            var Mozu = new ApiContext();
        });
    })(typeof externalDefine === "function" && externalDefine.amd ? externalDefine : function(factory) {
        typeof exports === "object" && typeof module === "object" ? module.exports = factory() : root.Mozu = factory();
    });
    root.define = externalDefine;
})(this);