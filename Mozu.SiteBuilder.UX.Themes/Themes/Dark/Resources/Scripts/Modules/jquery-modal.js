/*!
*
*	Volusion
*	Modal - jQuery Plugin
*
*/

define(["jquery"], function ($) {

    "use strict";

    var methods,
		privateMethods,
		type = "modal";

    methods = {
        init: function (options) {
            var data,
				$this = this;

            data = $.extend({
                autoOpen: true,
                openDuration: 150,
                closeDuration: 200,
                title: "",
                beforeClose: undefined,
                close: undefined,
                open: undefined,
                create: undefined
            }, options);

            this.data(type, data);

            data.$modal = $("<div>").addClass("mz-modal");

            if (data.title) {
                $("<h1>").text(data.title).appendTo(data.$modal);
            }

            data.$modal.insertAfter(this).append(this);

            data.$cover = $("<div>").addClass("mz-modal-cover").insertAfter(data.$modal);

            if (data.buttons && data.buttons.length > 0) {
                privateMethods.buildButtons.apply(this);
            }

            data.fontSize = parseInt(data.$modal.css("fontSize"), 0);

            if (typeof data.create === "function") {
                data.create.apply(this);
            }

            if (data.autoOpen) {
                methods.open.apply(this);
            }

            return this;
        },

        open: function (callback) {
            var data = this.data(type),
				$this = this,
				start,
				stop;

            data.$cover.show();

            data.$modal.stop(true).css({
                marginTop: -2000,
                marginLeft: -2000,
                opacity: 0,
                fontSize: data.fontSize
            }).show();

            stop = {
                marginTop: data.$modal.innerHeight() / -2,
                marginLeft: data.$modal.innerWidth() / -2
            };

            data.$modal.css("fontSize", 6);

            data.$modal.css({
                marginTop: data.$modal.innerHeight() / -2,
                marginLeft: data.$modal.innerWidth() / -2
            }).animate({
                opacity: 1,
                fontSize: data.fontSize,
                marginTop: stop.marginTop,
                marginLeft: stop.marginLeft
            }, data.openDuration, function () {
                if (typeof callback === "function") {
                    callback.apply($this);
                }
                if (typeof data.open === "function") {
                    data.open.apply($this);
                }
            });

            data.$modal.show();

            return this;
        },

        close: function (callback) {
            var data = this.data(type),
				$this = this,
                cancelClose = false;

            if (typeof data.beforeClose === "function") {
                cancelClose = (data.beforeClose.apply(this) === false);
            }

            if (cancelClose) {
                return this;
            }

            data.$cover.hide();

            data.$modal.stop(true).animate({ opacity: 0 }, data.closeDuration, function () {
                data.$modal.hide();
                if (typeof callback === "function") {
                    callback.apply($this);
                }
                if (typeof data.close === "function") {
                    data.close.apply($this);
                }
            });

            return this;
        },

        destroy: function () {
            var data = this.data(type);

            this.insertAfter(data.$modal);
            data.$modal.remove();

            console.log('stuff');

            return this;
        },

        isOpen: function () {
            return !this.data(type).$modal.is(":hidden");
        }
    };

    privateMethods = {
        buildButtons: function () {
            var data = this.data(type),
				$this = this;

            data.$actions = $("<section>").addClass("mz-actions");

            $(data.buttons).each(function () {
                var button = this,
					$button = $("<button>").addClass("mz-button").text(button.text);

                if (button.click === "close") {
                    $button.click(function () { methods.close.apply($this); });
                } else if (typeof button.click === "function") {
                    $button.click(function () { button.click.apply($this); });
                }

                if (button.primary) {
                    $button.addClass("mz-button-primary");
                }

                data.$actions.append($button);
            });

            data.$modal.append(data.$actions);
        }
    };

    $.fn[type] = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.' + type);
        }
        return null;
    };
});