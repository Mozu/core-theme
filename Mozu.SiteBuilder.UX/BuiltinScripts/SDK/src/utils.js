// BEGIN UTILS
var utils = (function () {
    return {
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
        map: function (arr, fn, scope) {
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
                cccb = function (match, l) {
                    return l.toUpperCase();
                };
            return function (str, firstCap) {
                return (firstCap ? str.charAt(0).toUpperCase() + str.substring(1) : str).replace(rdashAlpha, cccb);
            };
        }()),

        dashCase: (function () {
            var rcase = /([a-z])([A-Z])/g,
                rstr = "$1-$2";
            return function (str) {
                return str.replace(rcase, rstr).toLowerCase();
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
                    if (xhr.responseText && xhr.responseText.length > 0) {
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
            // Self-optimizing function to run first task with multiple
            // args using apply, but subsequence tasks via direct invocation
            var runTask = function (args, task) {
                runTask = function (arg, task) {
                    return task(arg);
                };

                return task.apply(null, args);
            };

            return utils.when.all(Array.prototype.slice.call(arguments, 1)).then(function (args) {
                return utils.when.reduce(tasks, function (arg, task) {
                    return runTask(arg, task);
                }, args);
            });
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
            ctor.prototype.fire = ctor.prototype.trigger;
        },

        Exceptions: {
            NoRequestConfigFound: function (type, op) {
                var str = "No request configuration was found for " + type + ".";
                if (op) str = str + op + ".";
                return {
                    name: 'No Request Configuration Error',
                    level: 1,
                    message: str,
                    htmlMessage: str,
                    toString: errorToString
                };
            },
            NoShortcutParamFound: function (type, conf) {
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
}());
// END UTILS

/*********/