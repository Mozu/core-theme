/**
 * @class Taco.view.tbd.Index
 */
Ext.define('Taco.view.tbd.Index', {
    extend: 'Taco.core.ux.content.Container',

    header: {
        title: 'Coming Soon'
    },

    initComponent: function () {
        var cmp;

        cmp = Ext.create('Ext.Component', {
            cls: Taco.baseCSSPrefix + 'tbd-placeholder',
            html: '<div class="taco-tbd-placeholder-text">This feature is coming soon!</div>'
        });

        // put it all together
        Ext.apply(this.body, {
            layout: 'auto',
            items: [cmp]
        });

        this.callParent(arguments);        
    }
});
