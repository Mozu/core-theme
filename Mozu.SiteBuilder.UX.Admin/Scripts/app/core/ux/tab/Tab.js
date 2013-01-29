/**
 * @class Taco.core.ux.tab.Tab
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.tab.Tab', {
    extend: 'Ext.Component',
    alias: 'widget.formtab',

    componentCls: Taco.baseCSSPrefix + 'form-tab',

    activeCls: Taco.baseCSSPrefix + 'form-tab-active',
    card: undefined,
    invalidCls: Taco.baseCSSPrefix + 'form-tab-invalid',
    text: '',

    initComponent: function () {
        var me = this;

        Ext.applyIf(this, {
            html: this.text
        });

        this.callParent(arguments);

        this.on({
            click: {
                element: 'el',
                fn: this.setActive
            },
            scope: this
        });
    },

    setActive: function () {
        var card = this.card,
            panel = card.ownerCt;

        panel.setActiveItem(card);
    }
});