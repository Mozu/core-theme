/**
 * Error controller.
 * @author james_zetlen
 */
Ext.define('Taco.controller.Errors', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.error.Http404', 'Taco.view.error.Http500', 'Taco.view.error.Index'],
    /**
     * Generate an HTTP 404 page.
     */
    Http404: function () {
        this.createContentView('Taco.view.error.Http404');
    },
    /**
     * Generate an HTTP 500 page.
     */
    Http500: function () {
        this.createContentView('Taco.view.error.Http500');
    }
});