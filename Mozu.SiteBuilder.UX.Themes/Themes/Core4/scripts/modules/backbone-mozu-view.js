/**
 * Extends the BackboneJS View object to create a Backbone.MozuView with extra
 * features for connecting to Backbone.MozuModels, and re-rendering HTML elements
 * using HyprLive templates.
 */
define([
    "modules/jquery-mozu",
    "shim!vendor/underscore>_",
    "hyprlive",
    "shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone",
    "modules/views-messages"
], function ($, _, HyprLive, Backbone, messageViewFactory) {

        Backbone.MozuView = Backbone.View.extend({
            constructor: function (conf) {
                Backbone.View.apply(this, arguments);
                this.template = HyprLive.getTemplate(this.options.templateName || this.templateName);
                this.listenTo(this.model, "sync", this.render);
                this.listenTo(this.model, "loadingchange", this.handleLoadingChange);
                if (this.model.handlesMessages && this.options.messagesEl) {
                    this.messageView = messageViewFactory({
                        el: this.options.messagesEl,
                        model: this.model.messages
                    });
                }
                if (this.renderOnChange) {
                    _.each(this.renderOnChange, function (prop) {
                        var model = this.model;
                        if (prop.indexOf('.') !== -1) {
                            var level, hier = prop.split('.');
                            while (hier.length > 1) {
                                level = hier.shift();
                                model = model[level] || model.get(level);
                            }
                            prop = hier[0];
                        }
                        this.listenTo(model, 'change', this.dequeueRender, this);
                        this.listenTo(model, 'change:' + prop, this.enqueueRender, this);
                    }, this);
                }
                Backbone.Validation.bind(this);

            },
            enqueueRender: function() {
                this.renderQueued = true;
            },
            dequeueRender: _.debounce(function () {
                if (this.renderQueued) {
                    this.render();
                    this.renderQueued = false;
                }
            }, 150),
            events: function () {
                var defaults = _.object(_.flatten(_.map(this.$('[data-mz-value]'), function (el) {
                    var val = el.getAttribute('data-mz-value');
                    return _.map(['change', 'blur', 'keyup'], function (ev) {
                        return [ev + ' [data-mz-value="' + val + '"]', "update" + val.charAt(0).toUpperCase() + val.substring(1)];
                    });
                }).concat(_.map(this.$('[data-mz-action]'), function (el) {
                    var action = el.getAttribute('data-mz-action');
                    return _.map(['click'], function (ev) {
                        return [ev + ' [data-mz-action="' + action + '"]', action];
                    });
                })), true));
                return this.additionalEvents ? _.extend(defaults, this.additionalEvents) : defaults;
            },
            handleLoadingChange: function (isLoading) {
                this.$el[isLoading ? 'addClass' : 'removeClass']('is-loading');
            },
            render: function () {
                var thenFocus = this.el && document.activeElement && $.contains(this.el, document.activeElement) && {
                    'id': document.activeElement.id,
                    'mzvalue': document.activeElement.getAttribute('data-mz-value')
                };
                Backbone.Validation.unbind(this);
                this.undelegateEvents();
                var model = this.model.toJSON({ helpers: true });
                this.$el.html(this.template.render({
                    Model: model,
                    model: model
                }));
                this.delegateEvents();
                Backbone.Validation.bind(this);
                if (thenFocus) {
                    if (thenFocus.id) {
                        $(document.getElementById(thenFocus.id)).focus();
                    } else {
                        $('[data-mz-value="' + thenFocus.mzvalue + '"]').focus();
                    }
                }
            }
        });

        Backbone.MozuView.extend = function (conf, statics) {
            if (conf.autoUpdate) {
                _.each(conf.autoUpdate, function (prop) {
                    conf['update' + prop.charAt(0).toUpperCase() + prop.substring(1)] = _.debounce(function (e) {
                        var attrs = {},
                            $target = $(e.currentTarget),
                            value = e.currentTarget.type === "checkbox" ? $target.prop('checked') : $target.val();
                        attrs[prop] = value;
                        this.model.set(attrs);
                        //this.model.validate(attrs);
                    }, 50);
                });
            }
            return Backbone.View.extend.call(this, conf, statics)
        };
});
