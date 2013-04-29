define([], function () {

    // Stolen, unashamedly, from Underscore. Function throttling is a commonly used feature, so we shouldn't need all of Underscore to get it.

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. If the throttled function is
     * invoked more than once during the `wait` timeout, `func` will also be called
     * on the trailing edge of the timeout. Pass an `options` object to indicate
     * that `func` should be invoked on the leading and/or trailing edge of the
     * `wait` timeout. Subsequent calls to the throttled function will return
     * the result of the last `func` call.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {Number} wait The number of milliseconds to throttle executions to.
     * @param {Object} options The options object.
     *  [leading=true] A boolean to specify execution on the leading edge of the timeout.
     *  [trailing=true] A boolean to specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * var throttled = throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     */
    return function throttle(func, wait, options) {
        var args,
            result,
            thisArg,
            timeoutId,
            lastCalled = 0,
            leading = true,
            trailing = true;

        function trailingCall() {
            lastCalled = new Date;
            timeoutId = null;

            if (trailing) {
                result = func.apply(thisArg, args);
            }
        }
        if (options === false) {
            leading = false;
        } else if (options && typeof options === "object") {
            leading = 'leading' in options ? options.leading : leading;
            trailing = 'trailing' in options ? options.trailing : trailing;
        }
        return function () {
            var now = new Date;
            if (!timeoutId && !leading) {
                lastCalled = now;
            }
            var remaining = wait - (now - lastCalled);
            args = arguments;
            thisArg = this;

            if (remaining <= 0) {
                clearTimeout(timeoutId);
                timeoutId = null;
                lastCalled = now;
                result = func.apply(thisArg, args);
            }
            else if (!timeoutId) {
                timeoutId = setTimeout(trailingCall, remaining);
            }
            return result;
        };
    }
});