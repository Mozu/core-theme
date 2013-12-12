/**
 * Extends the BackboneJS View object to create a Backbone.MozuView with extra
 * features for connecting to Backbone.MozuModels, and re-rendering HTML elements
 * using Hypr templates.
 */
define([
    "modules/jquery-mozu",
    "shim!vendor/underscore>_",
    "hyprlive",
    "shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone",
    "modules/views-messages"
], function ($, _, Hypr, Backbone, messageViewFactory) {

    Backbone.MozuView = Backbone.View.extend({
        constructor: function (conf) {
            Backbone.View.apply(this, arguments);
            this.template = Hypr.getTemplate(this.options.templateName || this.templateName);
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
                    this.listenTo(model, 'change', _.debounce(this.dequeueRender, 150), this);
                    this.listenTo(model, 'change:' + prop, this.enqueueRender, this);
                }, this);
            }
            Backbone.Validation.bind(this);

        },
        enqueueRender: function() {
            this.renderQueued = true;
        },
        dequeueRender: function () {
            if (this.renderQueued) {
                this.render();
                this.renderQueued = false;
            }
        },
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
        getRenderContext: function(substituteModel) {
            var model = (substituteModel || this.model).toJSON({ helpers: true });
                return {
                    Model: model,
                    model: model
                };
            },
            
            render: function () {
                var thenFocus = this.el && document.activeElement && document.activeElement.type !== "radio" && document.activeElement.type !== "checkbox" && $.contains(this.el, document.activeElement) && {
                    'id': document.activeElement.id,
                    'mzvalue': document.activeElement.getAttribute('data-mz-value'),
                    'value': document.activeElement.value
                };
                Backbone.Validation.unbind(this);
                this.undelegateEvents();
                this.$el.html(this.template.render(this.getRenderContext()));
                this.delegateEvents();
                Backbone.Validation.bind(this);
                if (thenFocus) {
                    if (thenFocus.id) {
                        $(document.getElementById(thenFocus.id)).focus();
                    } else {
                        this.$('[data-mz-value="' + thenFocus.mzvalue + '"]').focus();
                    }
                }
            }
        });

        Backbone.MozuView.extend = function (conf, statics) {
            if (conf.autoUpdate) {
                _.each(conf.autoUpdate, function (prop) {
                    var methodName = 'update' + prop.charAt(0).toUpperCase() + prop.substring(1);
                    conf[methodName] = _.debounce(conf[methodName] || function (e) {
                        var attrs = {},
                            $target = $(e.currentTarget),
                            checked = $target.prop('checked'),
                            value = e.currentTarget.type === "checkbox" ? checked : $target.val();
                        if (!(e.currentTarget.type === "radio" && !checked)) {
                            attrs[prop] = value;
                            this.model.set(attrs);
                        }
                    }, 50);
                });
            }
            return Backbone.View.extend.call(this, conf, statics)
        };
});
