/**
 * @class Taco.core.ux.content.Body
 * Body of a Taco.core.ux.content.Container.
 */

Ext.define('Taco.core.ux.content.Body', {
    extend: 'Ext.container.Container',
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
