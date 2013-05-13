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
    overflowY: 'auto',

    initComponent: function () {
        this.callParent(arguments);

        this.on({
            scroll: {
                fn: this.onScroll,
                element: 'el',
                scope: this
            }
        });
    },

    onSetMessage: function (message, type) {
        console.log (message + ', ' + type);
    },

    onScroll: function (e, t) {
        var scroll = Ext.fly(t).getScroll().top,
            header = Ext.getCmp('primaryViewPort').getHeader();

        // gradual hiding (layout intensive but smooth)
        header.setHeight(scroll > 106 ? 0 : 106 - scroll);

        // snap hiding (performant but somewhat jarring)
        // if (!header.isHidden() && scroll >= 100) {
        //     header.hide();
        // } else if (header.isHidden() && scroll <= 100) {
        //     header.show();
        // }
    }
});