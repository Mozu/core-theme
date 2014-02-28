define([
    "modules/jquery-mozu",
    "shim!vendor/underscore>_",
    "hyprlive",
    "shim!vendor/backbone[shim!vendor/underscore>_=_,jquery=jQuery]>Backbone",
    "modules/views-messages"
], function ($, _, Hypr, Backbone, messageViewFactory) {

    var MozuView = Backbone.MozuView = Backbone.View.extend(


        /** @lends MozuView.prototype */
        {

            /**
             * Extends the BackboneJS View object to create a Backbone.MozuView with extra features for Hypr integration, queued rendering, simple one-way data binding, and automatic accessor generation.
             * @class MozuView
             * @augments external:Backbone.View
             */


            /**
             * Array of properties of the model to autogenerate update handlers for. The handlers created follow the naming convention `updatePropName` for a property `propName`. They're designed to be attached to an input element using the `events` or `additionalEvents` hash; they expect a jQuery Event from which they determine the original target element, then they try to get that target element's value and set the model property.
             * @member {Array} autoUpdate
             * @memberOf MozuView.prototype
             * @public
             * @example
             * var FullNameView = Backbone.MozuView.extend({
             *  autoUpdate: ['firstName','lastNameOrSurname']
             * });
             * var fullNameView = new FullNameView({ model: someModel, el: $someElement });
             * typeof fullNameView.updateFirstName; // --> "function" that takes a jQuery Event as its argument
             * typeof fullNameView.updateLastNameOrSurname; // --> same as above
             */


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
            enqueueRender: function () {
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
            /**
             * Get the context that will be sent to the template by the MozuView#render method. In the base implementation, this returns an object with a single property, `model`, whose value is the JSON representation of the `model` property of this view. This object is sent to Hypr, which extends it on to the global context object always present in every template, which includes `siteContext`, `labels`, etc. 
             * 
             * Override this method to add another base-level variable to be available in this template.
             * @example
             * // base implementation
             * productView.getRenderContext(); // --> { model: { [...product data] } }
             * // an example override
             * var ViewWithExtraRootVariable = MozuView.extend({
             *   getRenderContext: function() {
             *      // first get the parent method's output
             *      var context = MozuView.prototype.getRenderContext.apply(this, arguments);
             *      context.foo = "bar";
             *      return context;
             *   }
             * });
             * var anotherView = new ViewWithExtraRootVariable({
             *   model: someModel,
             *   templateName: "path/to/template",
             *   el: $('some-selector')
             * });
             * anotherView.getRenderContext(); // --> { model: { [...model data] }, foo: "bar" }
             * // now, the template bound to this view can say {{ foo }} to render bar.
             * @param {MozuModel} substituteModel A model to use, for this render cycle only instead of the view's model.
             */
            getRenderContext: function (substituteModel) {
                var model = (substituteModel || this.model).toJSON({ helpers: true });
                return {
                    Model: model,
                    model: model
                };
            },

            /**
             * Renders the template into the element specified at the `el` property, using the JSON representation of the `model` and whatever else is added by {@link MozuView#getRenderContext}.
             */
            render: function (options) {
                var thenFocus = this.el && document.activeElement && document.activeElement.type !== "radio" && document.activeElement.type !== "checkbox" && $.contains(this.el, document.activeElement) && {
                    'id': document.activeElement.id,
                    'mzvalue': document.activeElement.getAttribute('data-mz-value'),
                    'mzFocusBookmark': document.activeElement.getAttribute('data-mz-focus-bookmark'),
                    'value': document.activeElement.value
                };
                Backbone.Validation.unbind(this);
                this.undelegateEvents();
                var newHtml = this.template.render(this.getRenderContext());
                this.$el.html(newHtml);
                this.delegateEvents();
                Backbone.Validation.bind(this);
                if (thenFocus) {
                    if (thenFocus.id) {
                        $(document.getElementById(thenFocus.id)).focus();
                    } else if (thenFocus.mzFocusBookmark) {
                        this.$('[data-mz-focus-bookmark="' + thenFocus.mzFocusBookmark + '"]').focus();
                    } else if (thenFocus.mzvalue) {
                        this.$('[data-mz-value="' + thenFocus.mzvalue + '"]').focus();
                    }
                }
                if (!options || !options.silent) {
                    this.trigger('render', newHtml);
                    Backbone.MozuView.trigger('render', this, newHtml);
                }
            }

            /**
             * Array of properties of the model to autogenerate update handlers for. The handlers created follow the naming convention `updatePropName` for a property `propName`. They're designed to be attached to an input element using the `events` or `additionalEvents` hash; they expect a jQuery Event from which they determine the original target element, then they try to get that target element's value and set the model property.
             * @member {Array} autoUpdate
             * @memberOf MozuView.prototype
             * @public
             * @example
             * var FullNameView = Backbone.MozuView.extend({
             *  autoUpdate: ['firstName','lastNameOrSurname']
             * });
             * var fullNameView = new FullNameView({ model: someModel, el: $someElement });
             * typeof fullNameView.updateFirstName; // --> "function" that takes a jQuery Event as its argument
             * typeof fullNameView.updateLastNameOrSurname; // --> same as above
             */


        });
    _.extend(Backbone.MozuView, Backbone.Events, {
        extend: function (conf, statics) {
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
        }
    });
});
