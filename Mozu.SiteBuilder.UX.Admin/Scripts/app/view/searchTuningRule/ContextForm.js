/**
 * @class  Taco.view.searchTuningRule.ContextForm
 * @author Travis Johnson
 * @description SearchTuningRule Context Form
 */
Ext.define('Taco.view.searchTuningRule.ContextForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-searchTuningRule-context',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation'
    ],
    ui: 'subform',
    cls: 'taco-subform-noborder taco-subform-nopadding taco-subform-nohr',
    margin: '0 0 39 0',

    title: 'Contexts',
    config: {
        isCreateMode: false
    },

    initComponent: function() {

        Ext.tip.QuickTipManager.init();

        this.keywordGrid = Ext.create('Taco.view.searchTuningRule.KeywordGrid', {
            record: this.record,
            width: '50%'
        });

        this.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                width: '100%',
                items: [
                    this.keywordGrid,
                    {
                        xtype: 'label',
                        text: 'Categories Placeholder',
                        width: '50%'
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