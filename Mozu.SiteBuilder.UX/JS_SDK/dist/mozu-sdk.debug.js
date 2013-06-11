/*! 
 * Mozu JavaScript SDK - v0.1.0 - 2013-06-11
 *
 * Copyright (c) 2013 Volusion, Inc.
 *
 */


(function() {	// the definewrapper.tpl uses a super-slim override of "define" that pushes AMD deps into an array.
    // this allows us to cleanly vendor AMD-compatible scripts without polluting scope.
    // only downside is, you have to refer to the build script (Gruntfile) to see what order you brought them in.
	var amds = [],
	internalDefine = function(deps, fn) {
		if (typeof deps === "function") fn = deps;
		amds.push(fn());
	};
	internalDefine.amd = true;
	(function (define, exportFn) {
		exportFn(function () {
			/**
 * A lightweight CommonJS Promises/A and when() implementation
 * when is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * @author Brian Cavalier
 * @author John Hann
 *
 * @version 1.8.1
 */

(function(define) { 'use strict';
define(function () {
	var reduceArray, slice, undef;

	//
	// Public API
	//

	when.defer     = defer;     // Create a deferred
	when.resolve   = resolve;   // Create a resolved promise
	when.reject    = reject;    // Create a rejected promise

	when.join      = join;      // Join 2 or more promises

	when.all       = all;       // Resolve a list of promises
	when.map       = map;       // Array.map() for promises
	when.reduce    = reduce;    // Array.reduce() for promises

	when.any       = any;       // One-winner race
	when.some      = some;      // Multi-winner race

	when.chain     = chain;     // Make a promise trigger another resolver

	when.isPromise = isPromise; // Determine if a thing is a promise

	/**
	 * Register an observer for a promise or immediate value.
	 *
	 * @param {*} promiseOrValue
	 * @param {function?} [onFulfilled] callback to be called when promiseOrValue is
	 *   successfully fulfilled.  If promiseOrValue is an immediate value, callback
	 *   will be invoked immediately.
	 * @param {function?} [onRejected] callback to be called when promiseOrValue is
	 *   rejected.
	 * @param {function?} [onProgress] callback to be called when progress updates
	 *   are issued for promiseOrValue.
	 * @returns {Promise} a new {@link Promise} that will complete with the return
	 *   value of callback or errback or the completion value of promiseOrValue if
	 *   callback and/or errback is not supplied.
	 */
	function when(promiseOrValue, onFulfilled, onRejected, onProgress) {
		// Get a trusted promise for the input promiseOrValue, and then
		// register promise handlers
		return resolve(promiseOrValue).then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Returns promiseOrValue if promiseOrValue is a {@link Promise}, a new Promise if
	 * promiseOrValue is a foreign promise, or a new, already-fulfilled {@link Promise}
	 * whose value is promiseOrValue if promiseOrValue is an immediate value.
	 *
	 * @param {*} promiseOrValue
	 * @returns {Promise} Guaranteed to return a trusted Promise.  If promiseOrValue
	 *   is trusted, returns promiseOrValue, otherwise, returns a new, already-resolved
	 *   when.js promise whose resolution value is:
	 *   * the resolution value of promiseOrValue if it's a foreign promise, or
	 *   * promiseOrValue if it's a value
	 */
	function resolve(promiseOrValue) {
		var promise;

		if(promiseOrValue instanceof Promise) {
			// It's a when.js promise, so we trust it
			promise = promiseOrValue;

		} else if(isPromise(promiseOrValue)) {
			// Assimilate foreign promises
			promise = assimilate(promiseOrValue);
		} else {
			// It's a value, create a fulfilled promise for it.
			promise = fulfilled(promiseOrValue);
		}

		return promise;
	}

	/**
	 * Assimilate an untrusted thenable by introducing a trusted middle man.
	 * Not a perfect strategy, but possibly the best we can do.
	 * IMPORTANT: This is the only place when.js should ever call an untrusted
	 * thenable's then() on an. Don't expose the return value to the untrusted thenable
	 *
	 * @param {*} thenable
	 * @param {function} thenable.then
	 * @returns {Promise}
	 */
	function assimilate(thenable) {
		var d = defer();

		// TODO: Enqueue this for future execution in 2.0
		try {
			thenable.then(
				function(value)  { d.resolve(value); },
				function(reason) { d.reject(reason); },
				function(update) { d.progress(update); }
			);
		} catch(e) {
			d.reject(e);
		}

		return d.promise;
	}

	/**
	 * Returns a rejected promise for the supplied promiseOrValue.  The returned
	 * promise will be rejected with:
	 * - promiseOrValue, if it is a value, or
	 * - if promiseOrValue is a promise
	 *   - promiseOrValue's value after it is fulfilled
	 *   - promiseOrValue's reason after it is rejected
	 * @param {*} promiseOrValue the rejected value of the returned {@link Promise}
	 * @return {Promise} rejected {@link Promise}
	 */
	function reject(promiseOrValue) {
		return when(promiseOrValue, rejected);
	}

	/**
	 * Trusted Promise constructor.  A Promise created from this constructor is
	 * a trusted when.js promise.  Any other duck-typed promise is considered
	 * untrusted.
	 * @constructor
	 * @name Promise
	 */
	function Promise(then) {
		this.then = then;
	}

	Promise.prototype = {
		/**
		 * Register a callback that will be called when a promise is
		 * fulfilled or rejected.  Optionally also register a progress handler.
		 * Shortcut for .then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress)
		 * @param {function?} [onFulfilledOrRejected]
		 * @param {function?} [onProgress]
		 * @return {Promise}
		 */
		always: function(onFulfilledOrRejected, onProgress) {
			return this.then(onFulfilledOrRejected, onFulfilledOrRejected, onProgress);
		},

		/**
		 * Register a rejection handler.  Shortcut for .then(undefined, onRejected)
		 * @param {function?} onRejected
		 * @return {Promise}
		 */
		otherwise: function(onRejected) {
			return this.then(undef, onRejected);
		},

		/**
		 * Shortcut for .then(function() { return value; })
		 * @param  {*} value
		 * @return {Promise} a promise that:
		 *  - is fulfilled if value is not a promise, or
		 *  - if value is a promise, will fulfill with its value, or reject
		 *    with its reason.
		 */
		'yield': function(value) {
			return this.then(function() {
				return value;
			});
		},

		/**
		 * Assumes that this promise will fulfill with an array, and arranges
		 * for the onFulfilled to be called with the array as its argument list
		 * i.e. onFulfilled.apply(undefined, array).
		 * @param {function} onFulfilled function to receive spread arguments
		 * @return {Promise}
		 */
		spread: function(onFulfilled) {
			return this.then(function(array) {
				// array may contain promises, so resolve its contents.
				return all(array, function(array) {
					return onFulfilled.apply(undef, array);
				});
			});
		}
	};

	/**
	 * Create an already-resolved promise for the supplied value
	 * @private
	 *
	 * @param {*} value
	 * @return {Promise} fulfilled promise
	 */
	function fulfilled(value) {
		var p = new Promise(function(onFulfilled) {
			try {
				return resolve(typeof onFulfilled == 'function' ? onFulfilled(value) : value);
			} catch(e) {
				return rejected(e);
			}
		});

		return p;
	}

	/**
	 * Create an already-rejected {@link Promise} with the supplied
	 * rejection reason.
	 * @private
	 *
	 * @param {*} reason
	 * @return {Promise} rejected promise
	 */
	function rejected(reason) {
		var p = new Promise(function(_, onRejected) {
			try {
				return resolve(typeof onRejected == 'function' ? onRejected(reason) : rejected(reason));
			} catch(e) {
				return rejected(e);
			}
		});

		return p;
	}

	/**
	 * Creates a new, Deferred with fully isolated resolver and promise parts,
	 * either or both of which may be given out safely to consumers.
	 * The Deferred itself has the full API: resolve, reject, progress, and
	 * then. The resolver has resolve, reject, and progress.  The promise
	 * only has then.
	 *
	 * @return {Deferred}
	 */
	function defer() {
		var deferred, promise, handlers, progressHandlers,
			_then, _notify, _resolve;

		/**
		 * The promise for the new deferred
		 * @type {Promise}
		 */
		promise = new Promise(then);

		/**
		 * The full Deferred object, with {@link Promise} and {@link Resolver} parts
		 * @class Deferred
		 * @name Deferred
		 */
		deferred = {
			then:     then, // DEPRECATED: use deferred.promise.then
			resolve:  promiseResolve,
			reject:   promiseReject,
			progress: promiseNotify, // DEPRECATED: use deferred.notify
			notify:   promiseNotify,

			promise:  promise,

			resolver: {
				resolve:  promiseResolve,
				reject:   promiseReject,
				progress: promiseNotify, // DEPRECATED: use deferred.notify
				notify:   promiseNotify
			}
		};

		handlers = [];
		progressHandlers = [];

		/**
		 * Pre-resolution then() that adds the supplied callback, errback, and progback
		 * functions to the registered listeners
		 * @private
		 *
		 * @param {function?} [onFulfilled] resolution handler
		 * @param {function?} [onRejected] rejection handler
		 * @param {function?} [onProgress] progress handler
		 */
		_then = function(onFulfilled, onRejected, onProgress) {
			var deferred, progressHandler;

			deferred = defer();

			progressHandler = typeof onProgress === 'function'
				? function(update) {
					try {
						// Allow progress handler to transform progress event
						deferred.notify(onProgress(update));
					} catch(e) {
						// Use caught value as progress
						deferred.notify(e);
					}
				}
				: function(update) { deferred.notify(update); };

			handlers.push(function(promise) {
				promise.then(onFulfilled, onRejected)
					.then(deferred.resolve, deferred.reject, progressHandler);
			});

			progressHandlers.push(progressHandler);

			return deferred.promise;
		};

		/**
		 * Issue a progress event, notifying all progress listeners
		 * @private
		 * @param {*} update progress event payload to pass to all listeners
		 */
		_notify = function(update) {
			processQueue(progressHandlers, update);
			return update;
		};

		/**
		 * Transition from pre-resolution state to post-resolution state, notifying
		 * all listeners of the resolution or rejection
		 * @private
		 * @param {*} value the value of this deferred
		 */
		_resolve = function(value) {
			// Replace _then with one that directly notifies with the result.
			_then = value.then;
			// Replace _resolve so that this Deferred can only be resolved once
			_resolve = resolve;
			// Make _progress a noop, to disallow progress for the resolved promise.
			_notify = identity;

			// Notify handlers
			processQueue(handlers, value);

			// Free progressHandlers array since we'll never issue progress events
			progressHandlers = handlers = undef;

			return value;
		};

		return deferred;

		/**
		 * Wrapper to allow _then to be replaced safely
		 * @param {function?} [onFulfilled] resolution handler
		 * @param {function?} [onRejected] rejection handler
		 * @param {function?} [onProgress] progress handler
		 * @return {Promise} new promise
		 */
		function then(onFulfilled, onRejected, onProgress) {
			// TODO: Promises/A+ check typeof onFulfilled, onRejected, onProgress
			return _then(onFulfilled, onRejected, onProgress);
		}

		/**
		 * Wrapper to allow _resolve to be replaced
		 */
		function promiseResolve(val) {
			return _resolve(resolve(val));
		}

		/**
		 * Wrapper to allow _reject to be replaced
		 */
		function promiseReject(err) {
			return _resolve(rejected(err));
		}

		/**
		 * Wrapper to allow _notify to be replaced
		 */
		function promiseNotify(update) {
			return _notify(update);
		}
	}

	/**
	 * Determines if promiseOrValue is a promise or not.  Uses the feature
	 * test from http://wiki.commonjs.org/wiki/Promises/A to determine if
	 * promiseOrValue is a promise.
	 *
	 * @param {*} promiseOrValue anything
	 * @returns {boolean} true if promiseOrValue is a {@link Promise}
	 */
	function isPromise(promiseOrValue) {
		return promiseOrValue && typeof promiseOrValue.then === 'function';
	}

	/**
	 * Initiates a competitive race, returning a promise that will resolve when
	 * howMany of the supplied promisesOrValues have resolved, or will reject when
	 * it becomes impossible for howMany to resolve, for example, when
	 * (promisesOrValues.length - howMany) + 1 input promises reject.
	 *
	 * @param {Array} promisesOrValues array of anything, may contain a mix
	 *      of promises and values
	 * @param howMany {number} number of promisesOrValues to resolve
	 * @param {function?} [onFulfilled] resolution handler
	 * @param {function?} [onRejected] rejection handler
	 * @param {function?} [onProgress] progress handler
	 * @returns {Promise} promise that will resolve to an array of howMany values that
	 * resolved first, or will reject with an array of (promisesOrValues.length - howMany) + 1
	 * rejection reasons.
	 */
	function some(promisesOrValues, howMany, onFulfilled, onRejected, onProgress) {

		checkCallbacks(2, arguments);

		return when(promisesOrValues, function(promisesOrValues) {

			var toResolve, toReject, values, reasons, deferred, fulfillOne, rejectOne, notify, len, i;

			len = promisesOrValues.length >>> 0;

			toResolve = Math.max(0, Math.min(howMany, len));
			values = [];

			toReject = (len - toResolve) + 1;
			reasons = [];

			deferred = defer();

			// No items in the input, resolve immediately
			if (!toResolve) {
				deferred.resolve(values);

			} else {
				notify = deferred.notify;

				rejectOne = function(reason) {
					reasons.push(reason);
					if(!--toReject) {
						fulfillOne = rejectOne = noop;
						deferred.reject(reasons);
					}
				};

				fulfillOne = function(val) {
					// This orders the values based on promise resolution order
					// Another strategy would be to use the original position of
					// the corresponding promise.
					values.push(val);

					if (!--toResolve) {
						fulfillOne = rejectOne = noop;
						deferred.resolve(values);
					}
				};

				for(i = 0; i < len; ++i) {
					if(i in promisesOrValues) {
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

	/**
	 * Initiates a competitive race, returning a promise that will resolve when
	 * any one of the supplied promisesOrValues has resolved or will reject when
	 * *all* promisesOrValues have rejected.
	 *
	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
	 *      of {@link Promise}s and values
	 * @param {function?} [onFulfilled] resolution handler
	 * @param {function?} [onRejected] rejection handler
	 * @param {function?} [onProgress] progress handler
	 * @returns {Promise} promise that will resolve to the value that resolved first, or
	 * will reject with an array of all rejected inputs.
	 */
	function any(promisesOrValues, onFulfilled, onRejected, onProgress) {

		function unwrapSingleResult(val) {
			return onFulfilled ? onFulfilled(val[0]) : val[0];
		}

		return some(promisesOrValues, 1, unwrapSingleResult, onRejected, onProgress);
	}

	/**
	 * Return a promise that will resolve only once all the supplied promisesOrValues
	 * have resolved. The resolution value of the returned promise will be an array
	 * containing the resolution values of each of the promisesOrValues.
	 * @memberOf when
	 *
	 * @param {Array|Promise} promisesOrValues array of anything, may contain a mix
	 *      of {@link Promise}s and values
	 * @param {function?} [onFulfilled] resolution handler
	 * @param {function?} [onRejected] rejection handler
	 * @param {function?} [onProgress] progress handler
	 * @returns {Promise}
	 */
	function all(promisesOrValues, onFulfilled, onRejected, onProgress) {
		checkCallbacks(1, arguments);
		return map(promisesOrValues, identity).then(onFulfilled, onRejected, onProgress);
	}

	/**
	 * Joins multiple promises into a single returned promise.
	 * @return {Promise} a promise that will fulfill when *all* the input promises
	 * have fulfilled, or will reject when *any one* of the input promises rejects.
	 */
	function join(/* ...promises */) {
		return map(arguments, identity);
	}

	/**
	 * Traditional map function, similar to `Array.prototype.map()`, but allows
	 * input to contain {@link Promise}s and/or values, and mapFunc may return
	 * either a value or a {@link Promise}
	 *
	 * @param {Array|Promise} promise array of anything, may contain a mix
	 *      of {@link Promise}s and values
	 * @param {function} mapFunc mapping function mapFunc(value) which may return
	 *      either a {@link Promise} or value
	 * @returns {Promise} a {@link Promise} that will resolve to an array containing
	 *      the mapped output values.
	 */
	function map(promise, mapFunc) {
		return when(promise, function(array) {
			var results, len, toResolve, resolve, i, d;

			// Since we know the resulting length, we can preallocate the results
			// array to avoid array expansions.
			toResolve = len = array.length >>> 0;
			results = [];
			d = defer();

			if(!toResolve) {
				d.resolve(results);
			} else {

				resolve = function resolveOne(item, i) {
					when(item, mapFunc).then(function(mapped) {
						results[i] = mapped;

						if(!--toResolve) {
							d.resolve(results);
						}
					}, d.reject);
				};

				// Since mapFunc may be async, get all invocations of it into flight
				for(i = 0; i < len; i++) {
					if(i in array) {
						resolve(array[i], i);
					} else {
						--toResolve;
					}
				}

			}

			return d.promise;

		});
	}

	/**
	 * Traditional reduce function, similar to `Array.prototype.reduce()`, but
	 * input may contain promises and/or values, and reduceFunc
	 * may return either a value or a promise, *and* initialValue may
	 * be a promise for the starting value.
	 *
	 * @param {Array|Promise} promise array or promise for an array of anything,
	 *      may contain a mix of promises and values.
	 * @param {function} reduceFunc reduce function reduce(currentValue, nextValue, index, total),
	 *      where total is the total number of items being reduced, and will be the same
	 *      in each call to reduceFunc.
	 * @returns {Promise} that will resolve to the final reduced value
	 */
	function reduce(promise, reduceFunc /*, initialValue */) {
		var args = slice.call(arguments, 1);

		return when(promise, function(array) {
			var total;

			total = array.length;

			// Wrap the supplied reduceFunc with one that handles promises and then
			// delegates to the supplied.
			args[0] = function (current, val, i) {
				return when(current, function (c) {
					return when(val, function (value) {
						return reduceFunc(c, value, i, total);
					});
				});
			};

			return reduceArray.apply(array, args);
		});
	}

	/**
	 * Ensure that resolution of promiseOrValue will trigger resolver with the
	 * value or reason of promiseOrValue, or instead with resolveValue if it is provided.
	 *
	 * @param promiseOrValue
	 * @param {Object} resolver
	 * @param {function} resolver.resolve
	 * @param {function} resolver.reject
	 * @param {*} [resolveValue]
	 * @returns {Promise}
	 */
	function chain(promiseOrValue, resolver, resolveValue) {
		var useResolveValue = arguments.length > 2;

		return when(promiseOrValue,
			function(val) {
				val = useResolveValue ? resolveValue : val;
				resolver.resolve(val);
				return val;
			},
			function(reason) {
				resolver.reject(reason);
				return rejected(reason);
			},
			function(update) {
				typeof resolver.notify === 'function' && resolver.notify(update);
				return update;
			}
		);
	}

	//
	// Utility functions
	//

	/**
	 * Apply all functions in queue to value
	 * @param {Array} queue array of functions to execute
	 * @param {*} value argument passed to each function
	 */
	function processQueue(queue, value) {
		var handler, i = 0;

		while (handler = queue[i++]) {
			handler(value);
		}
	}

	/**
	 * Helper that checks arrayOfCallbacks to ensure that each element is either
	 * a function, or null or undefined.
	 * @private
	 * @param {number} start index at which to start checking items in arrayOfCallbacks
	 * @param {Array} arrayOfCallbacks array to check
	 * @throws {Error} if any element of arrayOfCallbacks is something other than
	 * a functions, null, or undefined.
	 */
	function checkCallbacks(start, arrayOfCallbacks) {
		// TODO: Promises/A+ update type checking and docs
		var arg, i = arrayOfCallbacks.length;

		while(i > start) {
			arg = arrayOfCallbacks[--i];

			if (arg != null && typeof arg != 'function') {
				throw new Error('arg '+i+' must be a function');
			}
		}
	}

	/**
	 * No-Op function used in method replacement
	 * @private
	 */
	function noop() {}

	slice = [].slice;

	// ES5 reduce implementation if native not available
	// See: http://es5.github.com/#x15.4.4.21 as there are many
	// specifics and edge cases.
	reduceArray = [].reduce ||
		function(reduceFunc /*, initialValue */) {
			/*jshint maxcomplexity: 7*/

			// ES5 dictates that reduce.length === 1

			// This implementation deviates from ES5 spec in the following ways:
			// 1. It does not check if reduceFunc is a Callable

			var arr, args, reduced, len, i;

			i = 0;
			// This generates a jshint warning, despite being valid
			// "Missing 'new' prefix when invoking a constructor."
			// See https://github.com/jshint/jshint/issues/392
			arr = Object(this);
			len = arr.length >>> 0;
			args = arguments;

			// If no initialValue, use first item of array (we know length !== 0 here)
			// and adjust i to start at second item
			if(args.length <= 1) {
				// Skip to the first real element in the array
				for(;;) {
					if(i in arr) {
						reduced = arr[i++];
						break;
					}

					// If we reached the end of the array without finding any real
					// elements, it's a TypeError
					if(++i >= len) {
						throw new TypeError();
					}
				}
			} else {
				// If initialValue provided, use it
				reduced = args[1];
			}

			// Do the actual reduce
			for(;i < len; ++i) {
				// Skip holes
				if(i in arr) {
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
})(typeof define == 'function' && define.amd
	? define
	: function (factory) { typeof exports === 'object'
		? (module.exports = factory())
		: (this.when      = factory());
	}
	// Boilerplate for AMD, Node, and browser global
);

/*global unescape, module, define, window, global*/

/*
 UriTemplate Copyright (c) 2012-2013 Franz Antesberger. All Rights Reserved.
 Available via the MIT license.
*/

(function (exportCallback) {
    "use strict";
var objectHelper = (function () {
    function isArray (value) {
        return Object.prototype.toString.apply(value) === '[object Array]';
    }

    // performs an array.reduce for objects
    // TODO handling if initialValue is undefined
    function objectReduce (object, callback, initialValue) {
        var
            propertyName,
            currentValue = initialValue;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                currentValue = callback(currentValue, object[propertyName], propertyName, object);
            }
        }
        return currentValue;
    }

    // performs an array.reduce, if reduce is not present (older browser...)
    // TODO handling if initialValue is undefined
    function arrayReduce (array, callback, initialValue) {
        var
            index,
            currentValue = initialValue;
        for (index = 0; index < array.length; index += 1) {
            currentValue = callback(currentValue, array[index], index, array);
        }
        return currentValue;
    }

    function reduce (arrayOrObject, callback, initialValue) {
        return isArray(arrayOrObject) ? arrayReduce(arrayOrObject, callback, initialValue) : objectReduce(arrayOrObject, callback, initialValue);
    }

    function deepFreezeUsingObjectFreeze (object) {
        if (typeof object !== "object" || object === null) {
            return object;
        }
        Object.freeze(object);
        var property, propertyName;
        for (propertyName in object) {
            if (object.hasOwnProperty(propertyName)) {
                property = object[propertyName];
                // be aware, arrays are 'object', too
                if (typeof property === "object") {
                    deepFreeze(property);
                }
            }
        }
        return object;
    }

    function deepFreeze (object) {
        if (typeof Object.freeze === 'function') {
            return deepFreezeUsingObjectFreeze(object);
        }
        return object;
    }


    return {
        isArray: isArray,
        reduce: reduce,
        deepFreeze: deepFreeze
    };
}());

var charHelper = (function () {

    function isAlpha(chr) {
        return (chr >= 'a' && chr <= 'z') || ((chr >= 'A' && chr <= 'Z'));
    }

    function isDigit(chr) {
        return chr >= '0' && chr <= '9';
    }

    function isHexDigit(chr) {
        return isDigit(chr) || (chr >= 'a' && chr <= 'f') || (chr >= 'A' && chr <= 'F');
    }

    return {
        isAlpha: isAlpha,
        isDigit: isDigit,
        isHexDigit: isHexDigit
    };
}());

var pctEncoder = (function () {
    var utf8 = {
        encode: function (chr) {
            // see http://ecmanaut.blogspot.de/2006/07/encoding-decoding-utf8-in-javascript.html
            return unescape(encodeURIComponent(chr));
        },
        numBytes: function (firstCharCode) {
            if (firstCharCode <= 0x7F) {
                return 1;
            }
            else if (0xC2 <= firstCharCode && firstCharCode <= 0xDF) {
                return 2;
            }
            else if (0xE0 <= firstCharCode && firstCharCode <= 0xEF) {
                return 3;
            }
            else if (0xF0 <= firstCharCode && firstCharCode <= 0xF4) {
                return 4;
            }
            // no valid first octet
            return 0;
        },
        isValidFollowingCharCode: function (charCode) {
            return 0x80 <= charCode && charCode <= 0xBF;
        }
    };

    /**
     * encodes a character, if needed or not.
     * @param chr
     * @return pct-encoded character
     */
    function encodeCharacter (chr) {
        var
            result = '',
            octets = utf8.encode(chr),
            octet,
            index;
        for (index = 0; index < octets.length; index += 1) {
            octet = octets.charCodeAt(index);
            result += '%' + octet.toString(16).toUpperCase();
        }
        return result;
    }

    /**
     * Returns, whether the given text at start is in the form 'percent hex-digit hex-digit', like '%3F'
     * @param text
     * @param start
     * @return {boolean|*|*}
     */
    function isPercentDigitDigit (text, start) {
        return text[start] === '%' && charHelper.isHexDigit(text[start + 1]) && charHelper.isHexDigit(text[start + 2]);
    }

    /**
     * Parses a hex number from start with length 2.
     * @param text a string
     * @param start the start index of the 2-digit hex number
     * @return {Number}
     */
    function parseHex2 (text, start) {
        return parseInt(text.substr(start, 2), 16);
    }

    /**
     * Returns whether or not the given char sequence is a correctly pct-encoded sequence.
     * @param chr
     * @return {boolean}
     */
    function isPctEncoded (chr) {
        if (!isPercentDigitDigit(chr, 0)) {
            return false;
        }
        var firstCharCode = parseHex2(chr, 1);
        var numBytes = utf8.numBytes(firstCharCode);
        if (numBytes === 0) {
            return false;
        }
        for (var byteNumber = 1; byteNumber < numBytes; byteNumber += 1) {
            if (!isPercentDigitDigit(chr, 3*byteNumber) || !utf8.isValidFollowingCharCode(parseHex2(chr, 3*byteNumber + 1))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Reads as much as needed from the text, e.g. '%20' or '%C3%B6'. It does not decode!
     * @param text
     * @param startIndex
     * @return the character or pct-string of the text at startIndex
     */
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
}());

var rfcCharHelper = (function () {

    /**
     * Returns if an character is an varchar character according 2.3 of rfc 6570
     * @param chr
     * @return (Boolean)
     */
    function isVarchar (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '_' || pctEncoder.isPctEncoded(chr);
    }

    /**
     * Returns if chr is an unreserved character according 1.5 of rfc 6570
     * @param chr
     * @return {Boolean}
     */
    function isUnreserved (chr) {
        return charHelper.isAlpha(chr) || charHelper.isDigit(chr) || chr === '-' || chr === '.' || chr === '_' || chr === '~';
    }

    /**
     * Returns if chr is an reserved character according 1.5 of rfc 6570
     * or the percent character mentioned in 3.2.1.
     * @param chr
     * @return {Boolean}
     */
    function isReserved (chr) {
        return chr === ':' || chr === '/' || chr === '?' || chr === '#' || chr === '[' || chr === ']' || chr === '@' || chr === '!' || chr === '$' || chr === '&' || chr === '(' ||
            chr === ')' || chr === '*' || chr === '+' || chr === ',' || chr === ';' || chr === '=' || chr === "'";
    }

    return {
        isVarchar: isVarchar,
        isUnreserved: isUnreserved,
        isReserved: isReserved
    };

}());

/**
 * encoding of rfc 6570
 */
var encodingHelper = (function () {

    function encode (text, passReserved) {
        var
            result = '',
            index,
            chr = '';
        if (typeof text === "number" || typeof text === "boolean") {
            text = text.toString();
        }
        for (index = 0; index < text.length; index += chr.length) {
            chr = text.charAt(index);
            result += rfcCharHelper.isUnreserved(chr) || (passReserved && rfcCharHelper.isReserved(chr)) ? chr : pctEncoder.encodeCharacter(chr);
        }
        return result;
    }

    function encodePassReserved (text) {
        return encode(text, true);
    }

    return {
        encode: encode,
        encodePassReserved: encodePassReserved
    };

}());


// the operators defined by rfc 6570
var operators = (function () {

    var
        bySymbol = {};

    function create(symbol) {
        bySymbol[symbol] = {
            symbol: symbol,
            separator: (symbol === '?') ? '&' : (symbol === '' || symbol === '+' || symbol === '#') ? ',' : symbol,
            named: symbol === ';' || symbol === '&' || symbol === '?',
            ifEmpty: (symbol === '&' || symbol === '?') ? '=' : '',
            first: (symbol === '+' ) ? '' : symbol,
            encode: (symbol === '+' || symbol === '#') ? encodingHelper.encodePassReserved : encodingHelper.encode,
            toString: function () {
                return this.symbol;
            }
        };
    }

    create('');
    create('+');
    create('#');
    create('.');
    create('/');
    create(';');
    create('?');
    create('&');
    return {valueOf: function (chr) {
        if (bySymbol[chr]) {
            return bySymbol[chr];
        }
        if ("=,!@|".indexOf(chr) >= 0) {
            throw new Error('Illegal use of reserved operator "' + chr + '"');
        }
        return bySymbol[''];
    }};
}());


/**
 * Detects, whether a given element is defined in the sense of rfc 6570
 * Section 2.3 of the RFC makes clear defintions:
 * * undefined and null are not defined.
 * * the empty string is defined
 * * an array ("list") is defined, if it contains at least one defined element
 * * an object ("map") is defined, if it contains at least one defined property
 * @param object
 * @return {Boolean}
 */
function isDefined (object) {
    var
        index,
        propertyName;
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
        // falsy values like empty strings, false or 0 are "defined"
        return true;
    }
    // else Object
    for (propertyName in object) {
        if (object.hasOwnProperty(propertyName) && isDefined(object[propertyName])) {
            return true;
        }
    }
    return false;
}

var LiteralExpression = (function () {
    function LiteralExpression (literal) {
        this.literal = LiteralExpression.encodeLiteral(literal);
    }

    LiteralExpression.encodeLiteral = function (literal) {
        var
            result = '',
            index,
            chr = '';
        for (index = 0; index < literal.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(literal, index);
            if (chr.length > 1) {
                result += chr;
            }
            else {
                result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
            }
            // chr = literal.charAt(index);
            // result += rfcCharHelper.isReserved(chr) || rfcCharHelper.isUnreserved(chr) ? chr : pctEncoder.encodeCharacter(chr);
        }
        return result;
    };

    LiteralExpression.prototype.expand = function () {
        return this.literal;
    };

    LiteralExpression.prototype.toString = LiteralExpression.prototype.expand;

    return LiteralExpression;
}());

var parse = (function () {
    function parseExpression (outerText) {
        var
            text,
            operator,
            varspecs = [],
            varspec = null,
            varnameStart = null,
            maxLengthStart = null,
            index,
            chr = '';

        function closeVarname () {
            varspec = {varname: text.substring(varnameStart, index), exploded: false, maxLength: null};
            varnameStart = null;
        }

        function closeMaxLength () {
            if (maxLengthStart === index) {
                throw new Error("after a ':' you have to specify the length. position = " + index);
            }
            varspec.maxLength = parseInt(text.substring(maxLengthStart, index), 10);
            maxLengthStart = null;
        }

        // remove outer braces
        text = outerText.substr(1, outerText.length - 2);

        // determine operator
        operator = operators.valueOf(text.charAt(0));
        index = (operator.symbol === '') ? 0 : 1;
        varnameStart = index;

        for (; index < text.length; index += chr.length) {
            chr = pctEncoder.pctCharAt(text, index);
            if (varnameStart !== null) {
                // the spec says: varname =  varchar *( ["."] varchar )
                // so a dot is allowed except for the first char
                if (chr === '.') {
                    if (varnameStart === index) {
                        throw new Error('a varname MUST NOT start with a dot -- see position ' + index);
                    }
                    continue;
                }
                if (rfcCharHelper.isVarchar(chr)) {
                    continue;
                }
                closeVarname();
            }
            if (maxLengthStart !== null) {
                if (index === maxLengthStart && chr === '0') {
                    throw new Error('A :prefix must not start with digit 0 -- see position ' + index);
                }
                if (charHelper.isDigit(chr)) {
                    if (index - maxLengthStart >= 4) {
                        throw new Error('A :prefix must max 4 digits -- see position ' + index);
                    }
                    continue;
                }
                closeMaxLength();
            }
            if (chr === ':') {
                if (varspec.maxLength !== null) {
                    throw new Error('only one :maxLength is allowed per varspec at position ' + index);
                }
                maxLengthStart = index + 1;
                continue;
            }
            if (chr === '*') {
                if (varspec === null) {
                    throw new Error('explode exploded at position ' + index);
                }
                if (varspec.exploded) {
                    throw new Error('explode exploded twice at position ' + index);
                }
                if (varspec.maxLength) {
                    throw new Error('an explode (*) MUST NOT follow to a prefix, see position ' + index);
                }
                varspec.exploded = true;
                continue;
            }
            // the only legal character now is the comma
            if (chr === ',') {
                varspecs.push(varspec);
                varspec = null;
                varnameStart = index + 1;
                continue;
            }
            throw new Error("illegal character '" + chr + "' at position " + index + ' of "' + text + '"');
        } // for chr
        if (varnameStart !== null) {
            closeVarname();
        }
        if (maxLengthStart !== null) {
            closeMaxLength();
        }
        varspecs.push(varspec);
        return new VariableExpression(outerText, operator, varspecs);
    }

    function parseTemplate (uriTemplateText) {
        // assert filled string
        var
            index,
            chr,
            expressions = [],
            braceOpenIndex = null,
            literalStart = 0;
        for (index = 0; index < uriTemplateText.length; index += 1) {
            chr = uriTemplateText.charAt(index);
            if (literalStart !== null) {
                if (chr === '}') {
                    throw new Error('brace was closed in position ' + index + " but never opened");
                }
                if (chr === '{') {
                    if (literalStart < index) {
                        expressions.push(new LiteralExpression(uriTemplateText.substring(literalStart, index)));
                    }
                    literalStart = null;
                    braceOpenIndex = index;
                }
                continue;
            }

            if (braceOpenIndex !== null) {
                // here just { is forbidden
                if (chr === '{') {
                    throw new Error('brace was opened in position ' + braceOpenIndex + " and cannot be reopened in position " + index);
                }
                if (chr === '}') {
                    if (braceOpenIndex + 1 === index) {
                        throw new Error("empty braces on position " + braceOpenIndex);
                    }
                    expressions.push(parseExpression(uriTemplateText.substring(braceOpenIndex, index + 1)));
                    braceOpenIndex = null;
                    literalStart = index + 1;
                }
                continue;
            }
            throw new Error('reached unreachable code');
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
}());

var VariableExpression = (function () {
    // helper function if JSON is not available
    function prettyPrint (value) {
        return JSON ? JSON.stringify(value) : value;
    }

    function VariableExpression (templateText, operator, varspecs) {
        this.templateText = templateText;
        this.operator = operator;
        this.varspecs = varspecs;
    }

    VariableExpression.prototype.toString = function () {
        return this.templateText;
    };

    VariableExpression.prototype.expand = function (variables) {
        var
            result = '',
            index,
            varspec,
            value,
            valueIsArr,
            isFirstVarspec = true,
            operator = this.operator;

        // callback to be used within array.reduce
        function reduceUnexploded (result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += ',';
                }
                if (!valueIsArr) {
                    result += operator.encode(currentKey) + ',';
                }
                result += operator.encode(currentValue);
            }
            return result;
        }

        function reduceNamedExploded (result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += operator.separator;
                }
                result += (valueIsArr) ? LiteralExpression.encodeLiteral(varspec.varname) : operator.encode(currentKey);
                result += '=' + operator.encode(currentValue);
            }
            return result;
        }

        function reduceUnnamedExploded (result, currentValue, currentKey) {
            if (isDefined(currentValue)) {
                if (result.length > 0) {
                    result += operator.separator;
                }
                if (!valueIsArr) {
                    result += operator.encode(currentKey) + '=';
                }
                result += operator.encode(currentValue);
            }
            return result;
        }

        // expand each varspec and join with operator's separator
        for (index = 0; index < this.varspecs.length; index += 1) {
            varspec = this.varspecs[index];
            value = variables[varspec.varname];
            if (!isDefined(value)) {
                 continue;
            }
            if (isFirstVarspec) {
                result += operator.first;
                isFirstVarspec = false;
            }
            else {
                result += operator.separator;
            }
            valueIsArr = objectHelper.isArray(value);
            if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                value = value.toString();
                if (operator.named) {
                    result += LiteralExpression.encodeLiteral(varspec.varname);
                    if (value === '') {
                        result += operator.ifEmpty;
                        continue;
                    }
                    result += '=';
                }
                if (varspec.maxLength !== null) {
                    value = value.substr(0, varspec.maxLength);
                }
                result += operator.encode(value);
            }
            else if (varspec.maxLength) {
                // 2.4.1 of the spec says: "Prefix modifiers are not applicable to variables that have composite values."
                throw new Error('Prefix modifiers are not applicable to variables that have composite values. You tried to expand ' + this + " with " + prettyPrint(value));
            }
            else if (!varspec.exploded) {
                if (operator.named) {
                    result += LiteralExpression.encodeLiteral(varspec.varname);
                    if (!isDefined(value)) {
                        result += operator.ifEmpty;
                        continue;
                    }
                    result += '=';
                }
                result += objectHelper.reduce(value, reduceUnexploded, '');
            }
            else {
                // exploded and not string
                result += objectHelper.reduce(value, operator.named ? reduceNamedExploded : reduceUnnamedExploded, '');
            }
        }

        if (isFirstVarspec) {
            // so no varspecs produced output.
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
}());

var UriTemplate = (function () {
    function UriTemplate (templateText, expressions) {
        this.templateText = templateText;
        this.expressions = expressions;
        objectHelper.deepFreeze(this);
    }

    UriTemplate.prototype.toString = function () {
        return this.templateText;
    };

    UriTemplate.prototype.expand = function (variables) {
        // this.expressions.map(function (expression) {return expression.expand(variables);}).join('');
        var
            index,
            result = '';
        for (index = 0; index < this.expressions.length; index += 1) {
            result += this.expressions[index].expand(variables);
        }
        return result;
    };

    UriTemplate.parse = parse;
    return UriTemplate;
}());

    exportCallback(UriTemplate);

}(function (UriTemplate) {
        "use strict";
        // export UriTemplate, when module is present, or pass it to window or global
        if (typeof module !== "undefined") {
            module.exports = UriTemplate;
        }
        else if (typeof define === "function") {
            define([],function() {
                return UriTemplate;
            });
        }
        else if (typeof window !== "undefined") {
            window.UriTemplate = UriTemplate;
        }
        else {
            global.UriTemplate = UriTemplate;
        }
    }
));

var MicroEvent	= function(){}
MicroEvent.prototype	= {
	bind	: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},
	unbind	: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	trigger	: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
	}
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent
}

// BEGIN UTILS
var utils = {
    extend: function () {
        var src, copy, name, options,
            target = arguments[0],
            i = 1,
            length = arguments.length;

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) != null) {
                // Extend the base object
                for (name in options) {
                    copy = options[name];

                    // Prevent never-ending loop
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
            newArr[i] = fn.call(scope, arr[i])
        }
        return newArr;
    },
    getType: (function () {
        var reType = /\[object (\w+)\]/;
        return function (thing) {
            var match = reType.exec(Object.prototype.toString.call(thing));
            return match && match[1];
        };
    }()),
    camelCase: (function () {
        var rdashAlpha = /-([\da-z])/gi,
            cccb = function(match, l) {
                return l.toUpperCase();
            };
        return function(str, firstCap) {
            return (firstCap ? str.charAt(0).toUpperCase() + str.substring(1) : str).replace(rdashAlpha, cccb);
        };
    }()),

    dashCase: (function() {
        var rcase = /([a-z])([A-Z])/g,
            rstr = "$1-$2";
        return function(str) {
            return str.replace(rcase,rstr).toLowerCase();
        }
    }()),

    ajax: function (method, url, headers, data, success, failure) {
        if (typeof data !== "string") data = JSON.stringify(data);
        var xhr = new (window.XMLHttpRequest ? window.XMLHttpRequest : window.ActiveXObject("Microsoft.XMLHTTP"))();
        var timeout = setTimeout(function () {
            clearTimeout(timeout);
            failure({ 
                Items: [
                    { 
                        Message: 'Request timed out.',
                        ErrorCode: 'TIMEOUT'
                    }
                ]
            }, xhr);
        }, 60000);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                clearTimeout(timeout);
                    var json = null;
                    if (xhr.responseText.length > 0) {
                        try {
                            json = JSON.parse(xhr.responseText);
                        } catch (e) {
                            failure({
                                Items: [
                                    {
                                        Message: "Unable to parse response: " + xhr.responseText,
                                        ErrorCode: 'UNKNOWN'
                                    }
                                ]
                            }, xhr, e);
                        }
                    }
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    success(json, xhr);
                } else {
                    failure(json || {
                        Items: [
                            {
                                Message: 'Request failed, no response given.',
                                ErrorCode: xhr.status
                            }
                        ]
                    }, xhr);
                }
            }
        };
        xhr.open(method || 'GET', url);
        if (headers) {
            for (var h in headers) {
                if (headers[h]) xhr.setRequestHeader(h, headers[h]);
            }
        }
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(method !== 'GET' && data);
        return xhr;
    },

    pipeline: function (tasks /* initialArgs... */) {
        var initialArgs, runTask;

        initialArgs = Array.prototype.slice.call(arguments, 1);

        // Self-optimizing function to run first task with multiple
        // args using apply, but subsequence tasks via direct invocation
        runTask = function (task, args) {
            runTask = function(task, arg) {
                return task(arg);
            };

            return task.apply(null, args);
        };

        return utils.when.reduce(tasks,
            function(args, task) {
                return runTask(task, args);
            },
            initialArgs
        );
    },
    // TODO: the below is horrible. request that all types include their type parameter.
    areSameType: function(ljson, rjson) {
        return Object.keys(ljson).join() === Object.keys(rjson).join();
    },

    // the definewrapper.tpl uses a super-slim override of "define" that pushes AMD deps into an array.
    // this allows us to cleanly vendor AMD-compatible scripts without polluting scope.
    // only downside is, you have to refer to the build script (Gruntfile) to see what order you brought them in.
    when: amds[0],
    uritemplate: amds[1],

    addEvents: function (ctor) {
        MicroEvent.mixin(ctor);
        ctor.prototype.on = ctor.prototype.bind;
        ctor.prototype.off = ctor.prototype.unbind;
        ctor.prototype.fire = function () {
            try {
                return ctor.prototype.trigger.apply(this, arguments);
            } catch (e) { }
        };
    }
};
// END UTILS

/*********/
// BEGIN REFERENCE
var ApiReference = (function () {

    var basicOps = {
        get: 'GET',
        update: 'PUT',
        create: 'POST',
        del: 'DELETE'
    };

    var genericQueryTpt = '{?_*}';
    var defaultHost = window.location.protocol + '//' + window.location.host + '/';
    var pub = {

        basicOps: basicOps,
        urls: {
            "ProductService": defaultHost + 'mozu.ProductRuntime.WebApi/commerce/catalog/storefront/products/',
            "CategoryService": defaultHost + 'mozu.ProductRuntime.WebApi/commerce/catalog/storefront/categories/',
            "CartService": defaultHost + 'mozu.Cart.WebApi/commerce/carts/',
            "UserService": defaultHost + 'mozu.User.WebApi/platform/user/accounts/',
            "CustomerService": defaultHost + 'mozu.Customer.WebApi/commerce/customer/accounts',
            "OrderService": defaultHost + 'mozu.CommerceRuntime.WebApi/commerce/orders',
            "SearchService": defaultHost + 'mozu.ProductRuntime.WebApi/commerce/catalog/storefront/productsearch',
            "CmsService": defaultHost + 'mozu.Content.WebApi/documentLists/',
            "ReferenceService": defaultHost + 'mozu.reference.WebApi/platform/reference/'
        },

        getActionsFor: function(typeName) {
            if (!objectTypes[typeName]) return false;
            var actions = [];
            for (var a in basicOps) {
                if (!(a in objectTypes[typeName]))
                    actions.push(a);

            }
            for (a in objectTypes[typeName]) {
                if (a && objectTypes[typeName].hasOwnProperty(a) && !reservedWords[a])
                    actions.push(utils.camelCase(a));
            }
            return actions;
        },

        getRequestConfig: function (operation, typeName, conf, context, obj) {

            var returnObj, tptData;

            // get object type from our reference
            var oType = objectTypes[typeName];
            
            // there may not be one
            if (!oType) return typeName;

            // get specific details of the requested operation
            if (operation) operation = utils.dashCase(operation);
            if (oType[operation]) oType = oType[operation];

            // the defaults at the root object type should be copied into all operation configs
            if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);

            // some oTypes are a simple template as a string
            if (typeof oType === "string") oType = { template: oType };

            // a template is required
            if (!oType.template) "No URL template found for '" + typeName + "'.";

            returnObj = {};
            tptData = {};

            // cache templates lazily
            if (typeof oType.template === "string") oType.template = utils.uritemplate.parse(oType.template);

            // add the requesting object's data itself to the tpt context
            if (oType.includeSelf && obj) {
                if (oType.includeSelf.asProperty) {
                    tptData[oType.includeSelf.asProperty] = obj.data
                } else {
                    tptData = utils.extend(tptData, obj.data);
                }
            }

            // shortcutparam allows you to use the most commonly used conf property as a string or number argument
            if (conf !== undefined && typeof conf !== "object") {
                if (!oType.shortcutParam) throw "No shortcut parameter available for '" + typeName + "'. Please supply a configuration object instead of '" + conf + "'.";
                tptData[oType.shortcutParam] = conf;
            } else if (conf) {
                // add the conf argued directly into this request fn to the tpt context
                utils.extend(tptData, conf.query || conf);
            }


            if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);
            returnObj.url = oType.template.expand(utils.extend({ _: tptData }, context.asObject('context-'), tptData, ApiReference.urls));
            if (oType.verb) returnObj.verbOverride = oType.verb;
            if (oType.returnType) returnObj.returnType = oType.returnType;
            if (oType.noBody) returnObj.noBody = oType.noBody;
            if (oType.overridePostData) returnObj.overridePostData = tptData;
            return returnObj;
        },

        tryCreateApiObject: function (type, rawJSON, api) {
            return type in objectTypes ? (
                objectTypes[type].collectionOf ? 
                this.createApiCollection(type, rawJSON, api, objectTypes[type].collectionOf)
                : new ApiObject(type, rawJSON, api)
            ) : rawJSON;
        },

        createApiCollection: function (type, rawJSON, api, memberType) {
            return new ApiCollection(type, rawJSON, api, memberType)
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
        'products': {
            template: '{+ProductService}' + genericQueryTpt,
            shortcutParam: "filter",
            defaultParams: {
                startIndex: 0,
                pageSize: 25
            },
            collectionOf: 'product'
        },

        'categories': {
            template: '{+CategoryService}' + genericQueryTpt,
            shortcutParam: "filter",
            defaultParams: {
                startIndex: 0,
                pageSize: 25
            },
            collectionOf: 'category'
        },

        'category': {
            template: '{+CategoryService}{Id}?{&allowInactive*}',
            shortcutParam: 'Id',
            defaultParams: {
                allowInactive: false
            }
        },
        

        'search': {
            template: '{+SearchService}searchz' + genericQueryTpt,
            shortcutParam: 'q',
            defaultParams: {
                startIndex: 0,
                query: "*:*",
                pageSize: 25
            },
            collectionOf: 'product'
        },
        'product': {
            get: {
                template: '{+ProductService}{ProductCode}?{&allowInactive*}',
                shortcutParam: 'ProductCode',
                defaultParams: {
                    allowInactive: false
                }
            },
            configure: {
                verb: 'POST',
                template: '{+ProductService}{ProductCode}/configure{?includeOptionDetails}',
                defaultParams: {
                    includeOptionDetails: true
                },
                includeSelf: true
            },
            'add-to-cart': {
                verb: 'POST',
                includeSelf: {
                    asProperty: 'Product'
                },
                overridePostData: true,
                shortcutParam: 'Quantity',
                returnType: 'cartitem',
                template: '{+CartService}current/items/'
            }
        },
        'cart': {
            get: '{+CartService}current',
            'add-product': {
                verb: 'POST',
                returnType: 'cartitem',
                template: '{+CartService}current/items/'
            },
            empty: {
                verb: 'DELETE',
                template: '{+CartService}current/items/'
            },
            checkout: {
                verb: 'POST',
                template: '{+OrderService}?cartId={Id}',
                returnType: 'order',
                noBody: true,
                includeSelf: true
            }
        },
        'cartitem': {
            defaults: {
                template: '{+CartService}current/items/{CartItemId}',
                shortcutParam: 'CartItemId'
            },
            'update-quantity': {
                verb: 'PUT',
                template: '{+CartService}current/items{/CartItemId,quantity}',
                shortcutParam: "quantity",
                includeSelf: true,
                noBody: true
            }
        },
        'user': {
            create: {
                verb: 'POST',
                template: '{+UserService}'
            },
            get: {
                template: '{+UserService}{Id}',
                shortcutParam: 'id'
            },            'get-by-email': {
                template: '{+UserService}{?emailAddress*}',
                shortcutParam: 'emailAddress'
            },
            login: {
                verb: 'POST',
                template: '{+UserService}Login',
                includeSelf: true,
                returnType: 'login'
            },
            'change-password': {
                verb: 'POST',
                includeSelf: true,
                template: '{+UserService}{Id}/changepassword'
            }
        },
        customer: {
            template: '{+CustomerService}{Id}',
            shortcutParam: 'Id',
            includeSelf: true
        },
        'login': '{+UserService}Login',
        'order': {
            get: {
                template: '{+OrderService}{Id}',
            },
            create: {
                template: '{+OrderService}{?cartId*}',
                shortcutParam: 'cartId',
                noBody: true
            },
            "update-shipping-address": {
                template: '{+OrderService}{Id}/shippinginfo',
                verb: 'PUT',
                returnType: 'shipment',
                includeSelf: true
            },
            "set-user-id": {
                verb: 'PUT',
                template: '{+OrderService}{Id}/users',
                noBody: true,
                includeSelf: true,
                returnType: 'user'
            },
            'apply-coupon': {
                verb: 'PUT',
                template: '{+OrderService}{Id}/coupons/{couponCode}',
                shortcutParam: 'couponCode',
                includeSelf: true,
                noBody: true,
                returnType: 'coupon',
            },
            'remove-coupon': {
                verb: 'DELETE',
                template: '{+OrderService}{Id}/coupons/{couponCode}',
                shortcutParam: 'couponCode',
                includeSelf: true
            },
            'remove-all-coupons': {
                verb: 'DELETE',
                template: '{+OrderService}{Id}/coupons',
                includeSelf: true
            },
            'get-available-actions': {
                template: '{+OrderService}{Id}/actions',
                includeSelf: true,
                returnType: 'orderactions'
            },
            'perform-order-action': {
                verb: 'POST',
                template: '{+OrderService}{Id}/actions',
                includeSelf: true
            },
            'add-order-note': {
                verb: 'POST',
                template: '{+OrderService}{Id}/notes',
                includeSelf: true,
                returnType: 'ordernote'
            },
        },
        'shipment': {
            defaults: {
                template: '{+OrderService}{orderId}/shippinginfo',
                includeSelf: true,
            },
            "get-shipping-methods": {
                template: '{+OrderService}{orderId}/shipments/methods',
                returnType: 'shippingmethods'
            }
        },
        'payment': {
            template: '{+OrderService}{orderId}/billinginfo',
            includeSelf: true
        },
        'ordernote': {
            template: '{+OrderService}{orderId}/notes/{Id}'
        },
        'document': {
            get: {
                template: '{+CmsService}{/documentListName,documentId}/{?version,status}',
                shortcutParam: 'documentId',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        },
        'documentbyname': {
            get: {
                template: '{+CmsService}{documentListName}/named/{documentName}/{?folderPath,version,status}',
                shortcutParam: 'documentName',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        },
        'addressschemas': '{+ReferenceService}addressschemas'
    };

    return pub;

}());
// END REFERENCE

/***********/
// BEGIN OBJECT
var ApiObject = (function () {

    var ApiObjectConstructor = function (type, data, iapi) {
        this.data = data;
        this.api = iapi;
        this.type = type;
    }

    ApiObjectConstructor.prototype = {
        constructor: ApiObjectConstructor,
        action: function (actionName, data) {
            var me = this;
            var requestConf = ApiReference.getRequestConfig(actionName, this.type, data || this.data, this.api.context, this);
            me.fire('action', actionName, data, requestConf);
            me.api.fire('action', me, actionName, data, requestConf);
            return this.api.request(ApiReference.basicOps[actionName], requestConf, data).then(function (rawJSON) {
                if (requestConf.returnType) {
                    var returnObj = ApiReference.tryCreateApiObject(requestConf.returnType, rawJSON, me.api);
                    me.fire('spawn', returnObj);
                    me.api.fire('spawn', returnObj, me);
                    return returnObj;
                } else {
                    utils.extend(me.data, rawJSON);
                    delete me.data.unsynced;
                    me.fire('sync', rawJSON, me.data);
                    me.api.fire('sync', me, rawJSON, me.data);
                    return me;
                }
            }, function (errorJSON) {
                me.fire('error', errorJSON);
                me.api.fire('error', errorJSON, me);
                throw errorJSON;
            });
        },
        getAvailableActions: function () {
            return ApiReference.getActionsFor(this.type);
        },
        prop: function (k, v) {
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
        ApiObjectConstructor.prototype[fnName] = function (conf) {
            return this.action(fnName, conf);
        }
    };
    for (var i in ApiReference.basicOps) {
        if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
    }

    utils.addEvents(ApiObjectConstructor);

    return ApiObjectConstructor;

}());
// END OBJECT

/***********/
// BEGIN OBJECT
var ApiCollection = (function () {

    function convertItem(raw) {
        return new ApiReference.tryCreateApiObject(this.itemType, raw, this.api);
    }

    var ApiCollectionConstructor = function (type, data, api, itemType) {
        var self = this;
        ApiObject.apply(this, arguments);
        this.itemType = itemType;
        if (data.Items.length > 0) this.add(data.Items, true);
        this.on('sync', function (raw) {
            self.removeAll();
            self.add(raw.Items);
        });
    }

    ApiCollectionConstructor.prototype = utils.extend(new ApiObject(), {
        isCollection: true,
        constructor: ApiCollectionConstructor,
        add: function (newItems, /*private*/ noUpdate) {
            if (utils.getType(newItems) !== "Array") newItems = [newItems];
            Array.prototype.push.apply(this, utils.map(newItems, convertItem, this));
            if (!noUpdate) {
                var rawItems = this.prop("Items");
                this.prop("Items", rawItems.concat(newItems));
            }
        },
        remove: function(indexOrItem) {

        },
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
            return this.get({ startIndex: 0 });
        },
        index: function(newIndex) {
            return this.get({ startIndex: newIndex});
        },
        prevPage: function () {
            var currentIndex = this.prop("StartIndex"),
                pageSize = this.prop("PageSize"),
                newIndex = currentIndex - pageSize + 1;
            if (currentIndex === 0) throw "This " + this.type + " collection is already at record 0 and has no previous page.";
            return this.index(newIndex);
        },
        nextPage: function () {
            var currentIndex = this.prop("StartIndex"),
                pageSize = this.prop("PageSize"),
                newIndex = currentIndex + pageSize - 1;
            if (!(newIndex < this.prop("TotalCount"))) throw "This " + this.type + " collection is already at its last page and has no next page.";
            return this.index(newIndex);
        },
        lastPage: function () {
            var totalCount = this.prop("TotalCount"),
                pageSize = this.prop("PageSize"),
                newIndex = totalCount - pageSize;
            if (newIndex <= 0) throw "This " + this.type + " collection has only one page.";
            return this.index(newIndex);
        }
    });

    return ApiCollectionConstructor;

}());
// END OBJECT

/***********/
// BEGIN INTERFACE
var ApiInterface = (function () {

    var ApiInterfaceConstructor = function (context) {
        if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        //if (context.Host() === undefined) throw "API Base URL was not specified. Run Mozu.Host(host).Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        this.context = context;
    };

    ApiInterfaceConstructor.prototype = {
        constructor: ApiInterfaceConstructor,
        request: function (method, requestConf, conf) {
            var me = this,
                url = typeof requestConf === "string" ? requestConf : requestConf.url;
            if (requestConf.verbOverride)
                method = requestConf.verbOverride;

            var deferred = utils.when.defer();

            var data;
            if (requestConf.overridePostData) {
                data = requestConf.overridePostData;
            } else  if (conf && !requestConf.noBody) {
                data = conf.data || conf;
            }

            var xhr = utils.ajax(method, url, this.context.asObject("x-vol-"), data, function (rawJSON) {
                // update context with response headers
                me.fire('success', rawJSON, xhr, requestConf);
                deferred.resolve(rawJSON, xhr);
            }, function (error) {
                deferred.reject(error, xhr, url);
            });

            var cancelled = false,
                canceller = function () {
                    cancelled = true;
                    xhr.abort();
                    deferred.reject("Request cancelled.")
                };

            this.fire('request', xhr, canceller, deferred.promise, requestConf, conf);

            deferred.promise.otherwise(function (error) {
                var res;
                if (!cancelled) {
                    me.fire('error', error, xhr, requestConf);
                    throw error;
                }
            });

            
            return deferred.promise;
        },
        action: function (type, actionName, conf, isRemote) {
            var me = this,
                fulfill = function (rawJSON) {
                    var newApiObject = ApiReference.tryCreateApiObject(type, rawJSON, me);
                    me.fire('spawn', newApiObject);
                    return newApiObject;
                };
            isRemote = isRemote === false ? false : true;
            if (isRemote) {
                return this.request(ApiReference.basicOps[actionName], ApiReference.getRequestConfig(actionName, type, conf, this.context), conf).then(fulfill);
            } else {
                return utils.when(conf, fulfill);
            }
        },
        all: function () {
            return utils.when.join.apply(utils.when, arguments);
        },
        steps: function () {
            var args = Object.prototype.toString.call(arguments[0]) === "[object Array]" ? arguments[0] : Array.prototype.slice.call(arguments);
            return utils.pipeline(Array.prototype.slice.call(args));
        }
    };
        var setOp = function (fnName) {
            ApiInterfaceConstructor.prototype[fnName] = function (type, conf, isRemote) {
            return this.action(type, fnName, conf, isRemote);
        };
    };
    for (var i in ApiReference.basicOps) {
        if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
    }

    utils.addEvents(ApiInterfaceConstructor);

    return ApiInterfaceConstructor;
}());

// END INTERFACE

/*********/
// BEGIN CONTEXT
var ApiContext = (function () {
    var ApiContextConstructor = function (conf) {
        utils.extend(this, conf);
    },
    mutableAccessors = ['app-claims', 'user-claims', 'callchain', 'currency', 'locale'], //, 'bypass-cache'],
    immutableAccessors = ['tenant', 'site', 'site-group'],
    immutableAccessorLength = immutableAccessors.length,
    allAccessors = mutableAccessors.concat(immutableAccessors),
    allAccessorsLength = allAccessors.length,
    j;

    var setImmutableAccessor = function (propName) {
        ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function (val) {
            if (val === undefined) return this[propName];
            var newConf = this.asObject();
            newConf[propName] = val;
            return new ApiContextConstructor(newConf);
        };
    };

    var setMutableAccessor = function (propName) {
        ApiContextConstructor.prototype[utils.camelCase(propName, true)] = function (val) {
            if (val === undefined) return this[propName];
            this[propName] = val;
            return this;
        };
    };

    ApiContextConstructor.prototype = {
        constructor: ApiContextConstructor,
        api: function () {
            return this._apiInstance || (this._apiInstance = new ApiInterface(this));
        },
        Store: function (conf) {
            return new ApiContextConstructor(conf);
        },
        asObject: function (prefix) {
            var obj = {};
            prefix = prefix || '';
            for (var i = 0; i < allAccessorsLength; i++) {
                obj[prefix + allAccessors[i]] = this[allAccessors[i]];
            }
            return obj;
        },
        setServiceUrls: function (urls) {
            ApiReference.urls = urls;
        },
        currency: 'usd',
        locale: 'en-US'
    };

    for (j = 0; j < immutableAccessors.length; j++) setImmutableAccessor(immutableAccessors[j]);
    for (j = 0; j < mutableAccessors.length; j++) setMutableAccessor(mutableAccessors[j]);

    return ApiContextConstructor;

}());
// END CONTEXT

/********/
// BEGIN INIT
var Mozu = new ApiContext();
// END INIT
// EXPOSE DEBUGGING STUFF
Mozu.Utils = utils;
Mozu.ApiContext = ApiContext;
Mozu.ApiInterface = ApiInterface;
Mozu.ApiObject = ApiObject;
Mozu.ApiReference = ApiReference;

Mozu._expose = function (r) {
    Mozu.lastResult = r;
    console.log(r && r.inspect ? r.inspect() : r);
};

Mozu.ApiObject.prototype.inspect = function () {
    return JSON.stringify(this.data, true, 2);
};
			return Mozu;
		});
		// boilerplate below makes this library compatible with AMD, CJS, and a plain browser environment
	})(internalDefine,
		typeof define === "function" && define.amd
		? define
		: function (fn) {
			typeof exports === "object" && typeof module === "object"
				? (module.exports = fn())
				: (this.Mozu = fn())
		}
	);
}());