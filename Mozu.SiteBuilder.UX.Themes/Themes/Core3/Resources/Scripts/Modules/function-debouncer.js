define([], function () {

    // Stolen, unashamedly, from Underscore. Function debouncing is a commonly used feature, so we shouldn't need all of Underscore to get it.

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {Number} wait The number of milliseconds to debounce executions for.
     * @param {Boolean} immediate Trigger function on the leading edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * var debounced = debounce(updatePosition, 100);
     * jQuery(window).on('scroll', debounced);
     */
    return function debounce(func, wait, immediate) {
        var result;
        var timeout = null;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(context, args);
            return result;
        };
    };
});