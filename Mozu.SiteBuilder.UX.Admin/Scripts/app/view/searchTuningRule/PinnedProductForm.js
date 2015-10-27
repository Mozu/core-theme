/**
 * @class  Taco.view.searchTuningRule.PinnedProductForm
 * @description Search Tuning Rule Pinned Product Form
 */
Ext.define('Taco.view.searchTuningRule.PinnedProductForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-pinned',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.searchTuningRule.PinnedProductGrid'
    ],
    ui: 'subform',

    margin: '0 0 20 0',

    title: 'Promoted Products',
    config: {
        isCreateMode: false
    },

    initComponent: function() {

        var me = this;

        Ext.tip.QuickTipManager.init();

        me.pinnedGrid = Ext.create('Taco.view.searchTuningRule.PinnedProductGrid', {
            enableSearch: false
        });

        me.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                defaults: {
                    flex: 1
                },
                items: [
                    me.pinnedGrid
                ]
            }
        ];

        me.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        this.callParent(arguments);
    }
});