/**
 * @class  Taco.view.searchTuningRule.PinnedProductForm
 * @description Search Tuning Rule Pinned Product Form
 */
Ext.define('Taco.view.searchTuningRule.PinnedProductForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-pinned',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation'
    ],
    ui: 'subform',
    cls: 'taco-subform-noborder taco-subform-nopadding taco-subform-nohr',
    margin: '0 0 39 0',

    title: 'Promoted Products',
    config: {
        isCreateMode: false
    },

    initComponent: function() {

        Ext.tip.QuickTipManager.init();

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    {
                        xtype: 'label',
                        text: 'Placeholder'
                    }
                ]
            }
        ];

        this.callParent(arguments);
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});