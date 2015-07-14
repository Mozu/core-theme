define(['jquery', 'shim!vendor/datetimepicker/jquery-simple-datetimepicker[jquery=jquery]>jquery' ], function ($) { 

    $(document).ready(function() {
        var DateTimePicker = function() {
                var me = this;
                this.handler = $('#mz-date-display');
                this.urlBar = $('#mz-url-copy');
                this.setQueryString(this.getCookie(), true);
                this.showUrl();
                this.options = {
                    autodateOnStart: true,
                    currentTime: this.getCookie(),
                    onInit: function(handler) {
                        me.picker = handler;
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
                this.isShown = true;
            },
            ShareAction = function() {
                ButtonHandler.apply(this, arguments);
            };

        ShareAction.prototype = new ButtonHandler();

        ShowHideAction.prototype = new ButtonHandler();

        ShowHideAction.prototype.init = function(){

            this.handler.on('click', (function(){
                this.headerbar.addClass('mz-header-hidden');
                this.setIsShown();
                $(document).find('.datepicker').hide();
            }).bind(this));

            $(window).on('scroll', (function() {
                if (this.isShown) this.headerbar[$(window).scrollTop() > 0 ? 'addClass' : 'removeClass']('mz-header-hidden');
            }).bind(this));
        };

        ShowHideAction.prototype.setIsShown = function() {
            this.isShown = !this.isShown;
        };

        DateTimePicker.prototype.init = function() {
            this.plugin = this.handler.appendDtpicker(this.options);

            $('#mz-date-icon').on('click', (function() {
                this.picker.show();
            }).bind(this));
            
            $(document).on('click', (function(){

                if (!this.picker.isShow()) {
                    if (this.dateHasChanged.call(this)) location.search = 'mz_now=' + new Date(this.plugin.val()).toISOString();   
                }

            }).bind(this));

            this.handler.on('change', (function(){
                this.changedValue = true;
            }).bind(this));

            $(document).on('click', '.icon-home', this.setCookie.bind(this));
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
                window.history.pushState('MOZU', document.title, '?mz_now=' + str);
            }
        };

        DateTimePicker.prototype.dateHasChanged = function() {

            // no query string
            if (window.location.search === '' && this.changedValue) {
                return true;
            } 

            else if (window.location.search !== ''){
                return new Date(this.plugin.val()).toISOString().substring(0, 23) !== this.getCookie().substring(0, 23);
            }
            
        };

        DateTimePicker.prototype.showUrl = function() {
            this.urlBar.val(location.href);
            this.urlBar.on('click', function() { $(this).select(); });
        };

        ShareAction.prototype.init = function() {
            this.handler.on('click', (function() {
                this.urlBar.select();
            }).bind(this));
        };


        var datetimepicker = new DateTimePicker(),
            showhideaction = new ShowHideAction('#mz-showhide-preview-bar'),
            shareaction = new ShareAction('#mz-share');
        
        datetimepicker.init();
        showhideaction.init();
        shareaction.init();
    });

});