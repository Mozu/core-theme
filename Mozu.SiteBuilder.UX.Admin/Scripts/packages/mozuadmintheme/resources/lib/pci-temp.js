if (!window.JSON) {
    window.JSON = {};
    (function () {
        function k(a) { return a < 10 ? "0" + a : a } function o(a) { p.lastIndex = 0; return p.test(a) ? '"' + a.replace(p, function (a) { var c = r[a]; return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + a + '"' } function l(a, j) {
            var c, d, h, m, g = e, f, b = j[a]; b && typeof b === "object" && typeof b.toJSON === "function" && (b = b.toJSON(a)); typeof i === "function" && (b = i.call(j, a, b)); switch (typeof b) {
                case "string": return o(b); case "number": return isFinite(b) ? String(b) : "null"; case "boolean": case "null": return String(b); case "object": if (!b) return "null";
                    e += n; f = []; if (Object.prototype.toString.apply(b) === "[object Array]") { m = b.length; for (c = 0; c < m; c += 1) f[c] = l(c, b) || "null"; h = f.length === 0 ? "[]" : e ? "[\n" + e + f.join(",\n" + e) + "\n" + g + "]" : "[" + f.join(",") + "]"; e = g; return h } if (i && typeof i === "object") { m = i.length; for (c = 0; c < m; c += 1) typeof i[c] === "string" && (d = i[c], (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h)) } else for (d in b) Object.prototype.hasOwnProperty.call(b, d) && (h = l(d, b)) && f.push(o(d) + (e ? ": " : ":") + h); h = f.length === 0 ? "{}" : e ? "{\n" + e + f.join(",\n" + e) + "\n" + g + "}" : "{" + f.join(",") +
"}"; e = g; return h
            }
        } if (typeof Date.prototype.toJSON !== "function") Date.prototype.toJSON = function () { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + k(this.getUTCMonth() + 1) + "-" + k(this.getUTCDate()) + "T" + k(this.getUTCHours()) + ":" + k(this.getUTCMinutes()) + ":" + k(this.getUTCSeconds()) + "Z" : null }, String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () { return this.valueOf() }; var q = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
p = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, e, n, r = { "\u0008": "\\b", "\t": "\\t", "\n": "\\n", "\u000c": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, i; if (typeof JSON.stringify !== "function") JSON.stringify = function (a, j, c) {
    var d; n = e = ""; if (typeof c === "number") for (d = 0; d < c; d += 1) n += " "; else typeof c === "string" && (n = c); if ((i = j) && typeof j !== "function" && (typeof j !== "object" || typeof j.length !== "number")) throw Error("JSON.stringify"); return l("",
{ "": a })
}; if (typeof JSON.parse !== "function") JSON.parse = function (a, e) {
    function c(a, d) { var g, f, b = a[d]; if (b && typeof b === "object") for (g in b) Object.prototype.hasOwnProperty.call(b, g) && (f = c(b, g), f !== void 0 ? b[g] = f : delete b[g]); return e.call(a, d, b) } var d, a = String(a); q.lastIndex = 0; q.test(a) && (a = a.replace(q, function (a) { return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4) })); if (/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
"]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) return d = eval("(" + a + ")"), typeof e === "function" ? c({ "": d }, "") : d; throw new SyntaxError("JSON.parse");
}
    })();

}

(function (w) {

    var firefoxVersion = (function () {
        var ua = navigator.userAgent,
            re = /Firefox\/(\d+)/i,
            match = ua.match(re),
            versionStr = parseInt(match ? (match[1] || false) : false),
            version = isNaN(versionStr) ? false : versionStr;

        return version;
    }()),

        _receiver,

        apiCall = {
            base: {
                uri: function () { return removeTrailingSlash(settings.get('apiBase')); }
            },
            save: {
                uri: function () { return apiCall.base.uri(); },
                method: "POST"
            },
            update: {
                uri: function (cardId) { return apiCall.base.uri() + '/' + cardId.toString(); },
                method: "PUT"
            }
        },

        interval_id,
        last_hash,
        cache_bust = 1,
        rm_callback,
        FALSE = !1,
        addEventListener = 'addEventListener',
        receiveMessage,
        has_postMessage = window.postMessage && navigator.userAgent.indexOf("Opera") === -1,

        getFramePath = function () {
            return settings.get("framePath") + "?&parenturl=" + encodeURIComponent(location.href) + "&parentdomain=" + encodeURIComponent(location.protocol + '//' + location.host)
        },

        messageOriginIsLegit = function (e) {
            var regex = /^https?:\/\/[^/]+/i;
            return (settings.get('apiBase').toLowerCase().match(regex)[0] === e.origin.toLowerCase().match(regex)[0]);
        },

        _receiveMessage = has_postMessage ? function (callback) {
            if (callback) {
                rm_callback && _receiveMessage(false);
                rm_callback = function (e) {

                    if (!e) e = window.event;

                    if (e.data === "ready") {
                        w.requestCallback();
                        return false;
                    }

                    if (!messageOriginIsLegit(e)) {
                        return false;
                    }
                    callback(e);
                };
            }

            if (firefoxVersion && firefoxVersion < 4) {
                window.addEventListener('message', rm_callback, false);
            } else {
                window.onmessage = rm_callback;
            }

        } : function (callback) {
            interval_id && clearInterval(interval_id);
            interval_id = null;
            interval_id = setInterval(function () {
                var hash = document.location.hash,
                    re = /^#?\d+&/;

                if (hash !== last_hash && hash.replace(re, '') === "ready") {
                    w.requestCallback();
                    return;
                }

                if (hash !== last_hash && re.test(hash)) {
                    last_hash = hash;
                    callback({ data: hash.replace(re, '') });
                }
            }, 100);
        },

        _postMessage = has_postMessage ? function (data, windowObject) {
            windowObject.postMessage(data, removeTrailingSlash(settings.get('apiBase')));
        } : function (data, windowObject) {
            var locationToGoTo = (removeTrailingSlash(settings.get('apiBase')) + getFramePath()).replace(/#.*$/, '') + '#' + (+new Date) + (cache_bust++) + '&' + data;
            windowObject.location = locationToGoTo;
        },

        postMessageDelimiter = '|||||',

        request = function (url, body, httpVerb, merchantId, siteId, tenantId) {
            var messageBody = Array.prototype.slice.call(arguments).join(postMessageDelimiter);
            var requestCallback = function () {
                _postMessage(messageBody, _receiver.contentWindow || _receiver);
            };

            w.requestCallback = requestCallback;

            _receiveMessage(function (e) {
                processSuccess(e.data);
            }, removeTrailingSlash(settings.get('apiBase')));

            //create and append iframe
            _receiver = document.createElement('iframe');
            _receiver.style.position = "absolute";
            _receiver.style.left = "-9999px";
            _receiver.style.width = "1px";
            _receiver.style.height = "1px";
            _receiver.src = removeTrailingSlash(settings.get('apiBase')) + getFramePath();

            document.getElementsByTagName('body')[0].appendChild(_receiver);
        },

    DEFAULTS = {
        maskPattern: "^(\\d+?)\\d{4}$",
        maskCharacter: "*",
        apiBase: window.location.protocol + "//pci." + window.location.hostname.replace('www.', ''),
        framePath: "/../Assets/pci_receiver.html"
    },

    events = {
        // implementor can and should replace this error handler.
        error: function (errorObj) {
            for (var i = 0; i < errorObj.length; i++) {
                throw "PCIaaS Error " + errorObj[i].majorCode + ': ' + errorObj[i].minorCode + ': ' + errorObj[i].message;
            };
        }

    },

    // simple storage object for settings, pulls defaults when setting is unset -- overloaded to take a hash, but can also take
    // individual settings
    settings = {
        get: function (settingName) {
            var rval = settingName in settings ? settings[settingName] : DEFAULTS[settingName];
            if (rval) {
                return rval;
            } else {
                errors.add('-1', '2', formatErrorMessage(errorMessages.settingMissing, settingName));
            }
        },

        set: function (settingName, settingValue) {
            if (typeof settingName === 'object') {
                for (setting in settingName) {
                    settings[setting] = settingName[setting];
                }
            } else {
                settings[settingName] = settingValue !== undefined ? settingValue : DEFAULTS[settingName];
            }
            return settings;
        }
    },

    // normalize API base, in case user submits something with a trailing slash
    _trailingSlashRE = /\/$/,
    removeTrailingSlash = function (urlstr) {
        if (urlstr) {
            return urlstr.replace(_trailingSlashRE, '');
        }
    },

    // error messages in one place, suitable for internationalization
    errorMessages = {
        cardNumberInvalid: "The card number is missing or in an unrecognized format.",
        unknownError: "There was a processing error. Please try again.",
        crossDomainError: "Cannot make request due to same-origin policy. {0} cannot be accessed via AJAX from {1}.",
        maskFailure: "The masking pattern provided does not match the card number.",
        missingFields: "Missing fields object. Pass a fields object to the PCIaaS function.",
        fieldMissing: "Field \"{0}\" missing or invalid.",
        settingMissing: "Setting \"{0}\" missing or invalid."
    },

    // String.Format analogue, takes variable arguments -- first is error message to format
    formatErrorMessage = function () {
        var values = Array.prototype.slice.call(arguments, 1), message = arguments[0];
        for (var i = 0; i < values.length; i++) {
            message = message.replace("{" + i + "}", values[i]);
        };
        return message;
    },

    _stripCharsInCardNumRE = new RegExp('[\\s-]', 'g'),

    // simple validation of card number etc, runs on process
    validate = (function () {
        var routines = [
        // luhn 10 algorithm javascript
            [function () {
                var s = fields.getValue('CardNumber', true),
                    m = settings.get('maskCharacter');
                if (!s) return false;
                if (s.indexOf(m) != -1) { // if it's already masked, don't run the algorithm

                    // bugfix 9/30/2011: unknown issue causes card number to be sent as all mask characters.
                    if (s.match(new RegExp('[^' + m + '\\d]')) || !s.match(/\d/)) {
                        return false;
                    }

                    // card number is masked, so validate as true
                    return true;

                } else {

                    // strip out spaces
                    s = s.replace(_stripCharsInCardNumRE, '');

                    var i, n, c, r, t;
                    r = "";
                    for (i = 0; i < s.length; i++) {
                        c = parseInt(s.charAt(i), 10);
                        if (c >= 0 && c <= 9) r = c + r;
                    }
                    if (r.length <= 1) return false;
                    t = "";
                    for (i = 0; i < r.length; i++) {
                        c = parseInt(r.charAt(i), 10);
                        if (i % 2 != 0) c *= 2;
                        t = t + c;
                    }
                    n = 0;
                    for (i = 0; i < t.length; i++) {
                        c = parseInt(t.charAt(i), 10);
                        n = n + c;
                    }
                    if (n != 0 && n % 10 == 0) return true;
                    else return false;
                }
            }, "-1", "3", errorMessages.cardNumberInvalid]
        ];
        return function () {
            for (var i = routines.length - 1; i >= 0; i--) {
                if (!routines[i][0]()) {
                    errors.add(routines[i][1], routines[i][2], routines[i][3]);
                }
            };
            return errors.number() === 0;
        }
    }()),

    // global error stack, used ultimately to send errors to the events.error function
    // which can be redefined by the user

    errors = {
        add: function (major, minor, message) {
            if (!(message in errors._register)) {
                errors._stack.push({ "majorCode": major, "minorCode": minor, "message": message });
                errors._register[message] = true;
            }
        },
        clear: function () {
            errors._stack = [];
            errors._register = {};
        },
        get: function (type) {
            var r = errors._stack.slice(0); // to clone array
            errors.clear();
            return r;
        },
        number: function () {
            return errors._stack.length;
        },
        _register: {},
        _stack: []
    },

    // quick convenience function for the common "field missing error"
    addFieldMissingError = function (name) {
        return errors.add('-1', '2', formatErrorMessage(errorMessages.fieldMissing, name));
    },

    // fields object -- can store DOM objects, but doesn't have to; will work if the fields are strings,
    // or functions which return a string
    fields = {
        // get original field object. throw error unless request is marked "optional".
        get: function (fieldName, isOptional) {
            return isOptional ? fields[fieldName] : ((fieldName in fields) ? fields[fieldName] : addFieldMissingError(fieldName));
        },
        // detect type of field object and return value. throw error unless request is marked "optional".
        getValue: function (fieldName, isOptional) {
            var rval = '';
            if (fields[fieldName]) {
                if (fields[fieldName].tagName) {
                    switch (fields[fieldName].tagName.toLowerCase()) {
                        case "select":
                            rval = fields[fieldName].getElementsByTagName('option')[fields[fieldName].selectedIndex].value;
                            break;
                        case "textarea":
                            rval = fields[fieldName].innerHTML;
                            break;
                        case "input":
                            switch (fields[fieldName].type) {
                                case "checkbox":
                                case "radio":
                                    rval = fields[fieldName].checked;
                                    break;
                                default:
                                    rval = fields[fieldName].value;
                            }
                            break;
                    }
                } else {
                    rval = (typeof fields[fieldName] === "function") ? fields[fieldName]() : '';
                }
            }
            return isOptional ? rval : ((rval === '') ? addFieldMissingError(fieldName) : rval);
        },
        // set field object (not value), can take a hash
        set: function (fieldName, fieldValue) {
            if (typeof fieldName === 'object') {
                for (field in fieldName) {
                    fields.set(field, fieldName[field]);
                }
            } else {
                fields[fieldName] = (fieldValue.nodeType) ? fieldValue : (document.getElementById(fieldValue) || (typeof fieldValue === "function" ? fieldValue : ""));
            }

            return fields;
        },
        setValue: function (fieldName, fieldValue) {
            var field = fields.get(fieldName, true);
            if (field.nodeType) {
                return field.value = fieldValue;
            }
            if (typeof field === 'function') {
                return field(fieldValue);
            }
            if (typeof field === 'string' || typeof field === 'boolean') {
                return fields[fieldName] = fieldValue;
            }
        }
    },

    // cache of last payload, used to string compare payloads
    lastPostSent = null,

    // these fields will be added to the payload
    _optionalFields = ["PersistCard", "CardHolderName", "ExpireMonth", "ExpireYear", "CVV"],
    _requiredFields = ["CardType"],//, "CardHolderName"],

    //this function takes a boolean which forces it to build a payload that doesn't include the saved card ID
    // so that we can accurately string compare it with a prior post that may not have contained a saved card ID
    makePayload = function (isTest) {
        var merchantPayload = {}, //MerchantId: settings.get('merchantID') },
            cardID = fields.getValue("HiddenCardID", true),
            cardNumber = fields.getValue("CardNumber", isTest);

        if (!cardNumber) {
            errors.add('-1', '4', errorMessages.cardNumberInvalid);
            return false;
        }

        merchantPayload.NumberPart = (cardNumber.indexOf(settings.get('maskCharacter')) === -1) ? getMask("nocache", isTest).toSend : '';

        for (var i = 0; i < _requiredFields.length; i++) {
            merchantPayload[_requiredFields[i]] = fields.getValue(_requiredFields[i], isTest);
        }
        for (var j = 0; j < _optionalFields.length; j++) {
            if (_optionalFields[j] in fields) {
                if (fields.getValue(_optionalFields[j], true).toString() != "") {
                    merchantPayload[_optionalFields[j]] = fields.getValue(_optionalFields[j], true);
                }
            }
        }

        if (cardID && !isTest) {
            merchantPayload.CardId = cardID;
        }
        return JSON.stringify(merchantPayload);
    },

    // string compare last payload sent with payload that would send, to prevent unnecessary requests
    fieldsChanged = function () {
        return makePayload(true) !== lastPostSent;
    },

    // let's roll!
    process = function () {
        var cardID = fields.getValue("HiddenCardID", true);
        errors.clear();
        if (fieldsChanged()) {
            if (!validate()) {
                events.error(errors.get());
                return false;
            }
            var preprocessReturn,
                payload = makePayload();

            if (!payload) {
                events.error(errors.get());
                return false;
            }
            // if user specified a preprocess event, they may have something they want to do to the payload
            if (events.preprocess) {
                preprocessReturn = events.preprocess(payload);
            }
            if (preprocessReturn === false) {
                return false;
            }
            // if preprocess function returned a string, set it as payload
            if (typeof preprocessReturn === "string") {
                payload = preprocessReturn;
            }
            if (errors.number() !== 0) {
                events.error(errors.get());
                return false;
            }
            lastPostSent = makePayload(true); // payload without CardID, for compare
            // run the request!
            var requestUri = (cardID) ? apiCall.update.uri(cardID) : apiCall.save.uri();
            var requestMethod = (cardID) ? apiCall.update.method : apiCall.save.method;
            request(requestUri, payload, requestMethod, settings.get('merchantID'), settings.get('siteId'), settings.get('tenantId'));
            return true;
        } else {
            // fields haven't changed, so just run success function
            events.success && events.success(JSON.stringify({ IsSuccessful: true, CardId: cardID }), fields.getValue("CardNumber"), null);
            return true;
        }
    },

    // iframe XHR will call this function on success, and pass it the XHR and the responsetext.
    processSuccess = function (response) {
        //remove iframe
        document.getElementsByTagName("body")[0].removeChild(_receiver);
        // parse JSON
        response = JSON.parse(response);
        if (response.IsSuccessful) {
            // set CardId if CardID is a DOM element
            if (response.CardId) fields.setValue('HiddenCardID', response.CardId);
            // get cached mask, no reason to run this function twice
            var mask = getMask("cached", true);
            // send the response, mask, and original xhr to success function
            events.success && events.success(response, mask);
        } else {
            processError(response);
        }
    },

    // iframe XHR will call this function on error, and pass it the XHR and the responsetext.
    processError = function (response) {
        // build error stack and pass to errors function.
        if (response && response.Items) {
            for (var i = 0; i < response.Items.length; i++) {
                errors.add(response.Items[i].MajorCode, response.Items[i].MinorCode, response.Items[i].Message);
            }
        } else {
            errors.add("-1", "-1", errorMessages.unknownError);
        }
        events.error(errors.get());
    },

    _cachedMask = '',

    // create a mask using the regex, and return an object containing two strings with opposite chars masked
    getMask = function (getCache, noError) {
        if (getCache == "cached" && _cachedMask !== '') { return _cachedMask; }
        var value = fields.getValue('CardNumber', noError).replace(_stripCharsInCardNumRE, ''),
            re1 = new RegExp(settings.get('maskPattern')),
            matches = value.match(re1),
            MaskedValueToDisplay = value,
            MaskedValueToSend = [],
            maskChar = settings.get('maskCharacter'),
            tmpMask = "";
        if (matches !== null) {
            for (var i = 1; i < matches.length; i++) {
                //this is the information to MASK!!
                tmpMask = "";
                for (var x = 0; x < matches[i].length; x++) {
                    tmpMask += maskChar;
                }
                MaskedValueToDisplay = MaskedValueToDisplay.replace(matches[i], tmpMask);
            }
            for (var j = MaskedValueToDisplay.length - 1; j >= 0; j--) {
                if (MaskedValueToDisplay.charAt(j) === maskChar) {
                    MaskedValueToSend.unshift(value.charAt(j));
                } else {
                    MaskedValueToSend.unshift(maskChar);
                }
            }
            _cachedMask = {
                toDisplay: MaskedValueToDisplay,
                toSend: MaskedValueToSend.join('')
            };
            return _cachedMask;
        } else {
            return { toDisplay: value, toSend: value };
        }

    },

    // this function is available to you in the success function, and is appropriate for HTML forms
    applyMask = function (alteredMask) {

        var mask = alteredMask || getMask("cached");
        if (!mask) { return; }

        fields.setValue('CardNumber', mask.toDisplay);
        if (fields.getValue('CVV')) {
            fields.setValue('CVV', fields.getValue('CVV').replace(/./g, settings.get('maskCharacter')));
        }

        //        var field, toDisable = [fields.CVV2];
        //        while (field = toDisable.pop())
        //            if (field && field.nodeType) field.disabled = "disabled";
    },

    // PCI object constructor. accepts settings, fields, events, etc.
    create = function (conf) {
        conf.settings && settings.set(conf.settings);
        // events object is simpler since it must be functions. simply replace.
        if (conf.events) {
            for (var e in conf.events) {
                events[e] = conf.events[e];
            }
        }
        // wait until dom ready to try and grab dom elements if they're passed via ID
        if (conf.fields) {
            fields.set(conf.fields);
        } else {
            errors.add('-1', '2', errorMessages.missingFields);
            events.error(errors.get());
        }

        // here is the public interface to the PCI object.
        return {
            settings: settings,
            fields: fields,
            events: events,
            process: process,
            applyMask: applyMask
        };
    };

    // load as an AMD module if AMD loader exists. No CommonJS loading as yet, since the script still depends on window.location and iframes
    if (typeof define === "function" && define.amd)
        define(function () { return create });

    // make it available through the global "PCIaaS"
    w.PCIaaS = create;
}(window));