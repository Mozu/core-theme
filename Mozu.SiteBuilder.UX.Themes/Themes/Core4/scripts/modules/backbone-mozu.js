/**
 * This is a convenience script which combines Backbone.MozuModel,
 * Backbone.MozuView, and Backbone.Validation into a single package, all on the
 * Backbone object as is BackboneJS convention.
 */
define([
    "modules/backbone-mozu-validation",
    "modules/backbone-mozu-model",
    "modules/backbone-mozu-view"
], function (Backbone) {
    return Backbone;
});
