/** @license
 * RequireJS plugin for loading remote AJAX content
 * - pret-t-ty inspired by the json plugin by Miller Medeiros
 * Author: James Zetlen, Volusion
 * Version: 0.1.0 (2012/11/28)
 * Released under the MIT license
 */
define(function () {

    var CACHE_BUST_QUERY_PARAM = 'bust',
        CACHE_BUST_FLAG = '!bust',
        jsonParse = (typeof JSON !== 'undefined' && typeof JSON.parse === 'function') ? JSON.parse : function (val) {
            return eval('(' + val + ')'); //quick and dirty
        },
        DEFAULTS = {
            method: 'get',
            dataType: 'json',
            data: null
        },
        optsRE = /^((?:\[[^\]]*\])*)(.*)$/;

    function cacheBust(url) {
        url = url.replace(CACHE_BUST_FLAG, '');
        url += (url.indexOf('?') < 0) ? '?' : '&';
        return url + CACHE_BUST_QUERY_PARAM + '=' + Math.round(2147483647 * Math.random());
    }

    function parseOpts(name) {
        var m = optsRE.exec(name),
            conf = {},
            opt;
            conf.uri = m.pop();
        if (m && m[1]) {
            var arr = m[1].slice(1, -1).split('][');
            for (var i = 0; i < arr.length; i++) {
                opt = arr[i].split('=');
                conf[opt[0]] = opt[1];
            }
        }
        for (var d in DEFAULTS) {
            if (DEFAULTS.hasOwnProperty(d) && !conf.hasOwnProperty(d)) conf[d] = DEFAULTS[d];
        }
        return conf;
    }

    var createXhr = (function(){
        if (typeof XMLHttpRequest !== "undefined") {
            return function() {
                return new XMLHttpRequest();
            }
        }
        var xhr, i, progId;
        if (typeof ActiveXObject !== "undefined") {
            for (i = 0; i < 3; i += 1) {
                progId = progIds[i];
                try {
                    xhr = new ActiveXObject(progId);
                } catch (e) { }

                if (xhr) {
                    return function() {
                        return new ActiveXObject(progId);
                    }
                }
            }
        }
        return function(){};
    }());


    var responseParsers = {

        text: function(res) { return res.responseText; },
        json: function(res) { return jsonParse(res.responseText); },
        xml: function(res) { return res.responseXml; }

    }

        //API
        return {

            load: function (name, req, onLoad, config) {
                if (config.isBuild) {
                    onLoad(null);
                } else {

                    config.waitSeconds = 30;

                    var xhrConf = parseOpts(name);

                    var xhr = createXhr();

                    var parser = responseParsers[xhrConf.dataType] || responseParsers["text"];

                    xhr.open(xhrConf.method.toUpperCase(), xhrConf.uri, true);

                    xhr.onreadystatechange = function (evt) {
                        var status, err;
                        //Do not explicitly handle errors, those should be
                        //visible via console output in the browser.
                        if (xhr.readyState === 4) {
                            status = xhr.status;
                            if (status > 399 && status < 600) {
                                //An http 4xx or 5xx error. Signal an error.
                                err = new Error(url + ' HTTP status: ' + status);
                                err.xhr = xhr;
                                onLoad.error(err);
                            } else {
                                onLoad(parser(xhr));
                            }
                        }
                    };
                    xhr.send(xhrConf.data);

                }
            }



        };
    });