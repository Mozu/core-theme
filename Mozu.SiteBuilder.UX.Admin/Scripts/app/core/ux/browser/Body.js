/**
 * @class Taco.core.ux.browser.BrowserPageBody
 * Body of a Taco.core.ux.content.BrowserPage.
 */

Ext.define('Taco.core.ux.browser.BrowserPageBody', {
    extend: 'Taco.core.ux.content.Body',
    alias: 'widget.contentbody',

    bubbleEvents: ['add','remove','save','cancel'],

    cls: 'taco-content-body',
    flex: 1,

  
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    autoScroll: true,
    onSetMessage: function (message, type) {
        console.log (message + ', ' + type);
    }
});
