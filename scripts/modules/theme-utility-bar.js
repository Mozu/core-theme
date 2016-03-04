define(['jquery', 'shim!modules/jquery-simple-datetimepicker[jquery=jquery]>jquery' ], function ($) { 
    
    var DateTimePicker = function() {
            var me = this;
            this.handler = $('#mz-date-display');
            this.displayBar = $('#mz-date-display-cover');
            this.urlBar = $('#mz-url-copy');
            this.dateField = $('.visible-date');
            this.setQueryString(this.getCookie(), true);
            this.showUrl();
            this.options = {
                autodateOnStart: true,
                currentTime: this.getCookie(),
                futureOnly: true,
                onInit: function(handler) {
                    me.picker = handler;
                    me.setDate(me.getCookie());
                }
            };
        },
        ButtonHandler = function(selector) {
            this.handler = $(selector);
            this.urlBar = $('#mz-url-copy');
        },
        ShowHideAction = function() {
            ButtonHandler.apply(this, arguments);
            this.headerbar = $('.mz-future-date-header');
            this.indicator = $('.mz-future-bar-indicator');
            this.isShown = (function() {
                if (!document.cookie.split(';').filter(function(str) {return str.indexOf('MZ_SHOW_FUTURE_BAR') > 0;})) {
                    return true;
                }
                else {
                    var cookie  = document.cookie.split(';').filter(function(str) {return str.indexOf('MZ_SHOW_FUTURE_BAR') > 0;})[0];
                    if (!cookie) return true;
                    return cookie.indexOf('true') !== -1;
                }
            })();
        },
        ShareAction = function() {
            ButtonHandler.apply(this, arguments);
        },
        PriceListPicker = function() {
            var me = this;
            this.handler = $('#mz-pricelist-display');
            this.handler.blur(function(){
                me.setQueryString(this.value);
            });
            this.handler.keypress(function(evt){
                var enterKey = 13;
                if (evt.which === enterKey) {
                    me.setQueryString(this.value);
                }
            });
        },
        sanitizeQueryString = function (qs) {
            var result = qs;
            if (qs.substring(0,1) === '&') {
                result = '?' + qs.substring(1);
            }
            result = result.replace(/(&)+/g, '&');
            result = result.replace(/(\?)+/g, '?');
            result = result.replace(/(\?&)/g, '?');
            return result;
        };

    ShareAction.prototype = new ButtonHandler();

    ShowHideAction.prototype = new ButtonHandler();

    ShowHideAction.prototype.init = function(){
        this.handler.on('click', this.action.bind(this));
        this.indicator.on('click', this.action.bind(this));
    };

    ShowHideAction.prototype.action = function() {
        this.indicator.toggleClass('hidden');
        this.headerbar.toggleClass('mz-header-hidden');
        this.setIsShown();
        $(document).find('.datepicker').hide();
        this.setCookie();
    };

    ShowHideAction.prototype.setIsShown = function() {
        this.isShown = !this.isShown;
    };

    ShowHideAction.prototype.setCookie = function() {
        document.cookie = ' MZ_SHOW_FUTURE_BAR=' + this.isShown + '; Path=/; Expires=';
    };

    DateTimePicker.prototype.init = function() {
        this.plugin = this.handler.appendDtpicker(this.options);

        this.displayBar.on('click', (function() {
            this.picker.show();
        }).bind(this));
        
        $(document).on('click', (function(){

            if (!this.picker.isShow()) {
                if (this.dateHasChanged.call(this)) location.search = this.getQueryString(this.sanitizeDate());   
            }

        }).bind(this));

        this.handler.on('change', (function(){
            this.changedValue = true;
        }).bind(this));

        $(document).on('click', '.icon-home', this.setCookie.bind(this));
    };

    DateTimePicker.prototype.sanitizeDate = function() {
        return new Date(this.plugin.val().replace(/-/g, '/')).toISOString();
    };

    DateTimePicker.prototype.setDate = function(date) {
        date = date ? new Date(date).toDateString() + ', ' + new Date(date).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) + ' CST': 'Now';
        this.dateField.text(date);
    };

    DateTimePicker.prototype.getCookie = function() {
        var cookie = document.cookie.split(';').filter(function(str) {return str.indexOf('MZ_NOW') > 0;});
        return cookie.length > 0 ? cookie[0].replace(' MZ_NOW=', '') : '';
    };

    DateTimePicker.prototype.setCookie = function() {
        var date = new Date();
        date.setDate(date.getDate() -1);
        document.cookie = ' MZ_NOW' + '=; Path=/; Expires=' + date;
        location.search = '';
    };

    DateTimePicker.prototype.setQueryString = function(str, soft) {
        if (soft && str) {

            window.history.replaceState('MOZU', document.title, this.getQueryString(str));
        }
    };

    DateTimePicker.prototype.sanitizeQueryString = sanitizeQueryString;

    DateTimePicker.prototype.getQueryString = function(str) {
        var queryString = '';
        //same
        if (location.search.match("mz_now="+str)) {
            return location.search;
        }

        if (location.search.indexOf('?') !== -1 && location.search.indexOf('mz_now') === -1) {
            queryString = location.search + '&mz_now=' + str;
        } else if (location.search.indexOf('?') !== -1) {
            queryString = location.search.replace(/[&?]*mz_now[^&]*/gi, '');
            if (queryString.length === 0) {
                queryString = '?';
            }
            else if (queryString.length > 1) {
                queryString += '&';
            }
            queryString += 'mz_now=' + str;
        }  else {
            queryString = '?mz_now=' + str;
        }
        return this.sanitizeQueryString(queryString);
    };

    DateTimePicker.prototype.dateHasChanged = function() {

        // no query string
        if (window.location.search === '' && this.changedValue) {
            return true;
        }

        else if (window.location.search !== ''){
            return this.sanitizeDate().substring(0, 23) !== this.getCookie().substring(0, 23);
        }

    };

    DateTimePicker.prototype.showUrl = function() {
        this.urlBar.val(location.href);
        this.urlBar.on('click', function() { $(this).select(); });
    };

    PriceListPicker.prototype.init = function () {
        this.handler.on('change', (function(){
            this.changedValue = true;
        }).bind(this));

        this.handler.val(this.getCookie());
    };

    PriceListPicker.prototype.getCookie = function() {
        var cookie = document.cookie.split(';').filter(function(str) {return str.indexOf('MZ_PRICELIST') > 0;});
        return cookie.length > 0 ? cookie[0].replace(' MZ_PRICELIST=', '') : '';
    };

    PriceListPicker.prototype.setCookie = function(val) {
        var sessionExpDate = new Date();
        sessionExpDate.setDate(sessionExpDate.getDate() -1);
        document.cookie = ' MZ_PRICELIST=' + val + '; Path=/; Expires=' + sessionExpDate;
    };

    PriceListPicker.prototype.getQueryString = function(priceListVal) {
        var queryString = location.search;

        if (priceListVal && queryString.match("mz_pricelist="+priceListVal)){
            return queryString;
        }

        if (queryString.indexOf('?') !== -1 && queryString.indexOf('mz_pricelist') === -1) {
            queryString = queryString + '&mz_pricelist=' + priceListVal;
            queryString = queryString.replace(/(&)+/g, '&');
        } else if (queryString.indexOf('?') !== -1) {
            queryString = queryString.replace(/[&?]*mz_pricelist[^&]*/gi, '');
            if (priceListVal) {
                if (!queryString) {
                    queryString = '?';
                } else {
                    queryString += '&';
                }
                queryString += 'mz_pricelist=' + priceListVal;
            }
        } else {
            queryString = '?mz_pricelist=' + priceListVal;
        }
        return this.sanitizeQueryString(queryString);
    };

    PriceListPicker.prototype.sanitizeQueryString = sanitizeQueryString;

    PriceListPicker.prototype.setQueryString = function(priceListValue){
        var queryString = this.getQueryString(priceListValue);
        if (location.search !== queryString) {
            this.setCookie(priceListValue);
            location.search = queryString;
        }
    };

    ShareAction.prototype.init = function() {
        this.handler.on('click', (function() {
            this.urlBar.select();
        }).bind(this));
    };

    var datetimepicker = new DateTimePicker(),
        showhideaction = new ShowHideAction('#mz-showhide-preview-bar'),
        shareaction = new ShareAction('#mz-share'),
        priceListPicker = new PriceListPicker();
    
    datetimepicker.init();
    showhideaction.init();
    shareaction.init();
    priceListPicker.init();

});