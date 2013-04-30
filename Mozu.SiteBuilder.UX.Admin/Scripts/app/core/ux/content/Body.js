/**
 * @class Taco.core.ux.content.Body
 * Body of a Taco.core.ux.content.Container.
 */

Ext.define('Taco.core.ux.content.Body', {
    extend: 'Ext.container.Container',
    alias: 'widget.contentbody',

    bubbleEvents: ['add','remove','save','cancel'],

    cls: 'taco-content-body',
    layout: 'auto',

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            boxready: this.setMinHeight,
            scope: this
        });
    },

    onSetMessage: function (message, type) {
        console.log (message + ', ' + type);
    },

    setMinHeight: function () {
        var el = this.getEl(),
            vpHeight = Ext.getBody().getHeight() - 171;

        vpHeight = Ext.dom.AbstractElement.addUnits(vpHeight, 'px');
        Ext.fly(el).applyStyles({ minHeight: vpHeight });
    }
});