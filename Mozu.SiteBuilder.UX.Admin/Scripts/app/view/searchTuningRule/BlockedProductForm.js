/**
 * @class  Taco.view.searchTuningRule.BlockedProductForm
 * @description Search Tuning Rule Blocked Product Form
 */
Ext.define('Taco.view.searchTuningRule.BlockedProductForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-blocked',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.view.searchTuningRule.BlockedProductGrid'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Blocked Products',
    config: {
        isCreateMode: false
    },

    initComponent: function() {

        var me = this;

        Ext.tip.QuickTipManager.init();

        me.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                defaults: {
                    flex: 1
                },
                items: [
                    me.blockedGrid
                ]
            }
        ];

        me.callParent(arguments);
    },

    blockedGrid: Ext.create('Taco.view.searchTuningRule.BlockedProductGrid', {
        enableSearch: false
    }),

    onDestroy: function () {
        var me = this;

        this.callParent(arguments);
    }
});