/**
 * @class  Taco.view.productRanking.form.PinnedProduct
 * @description Product Ranking Rule Pinned Product Form
 */
Ext.define('Taco.view.productRanking.form.PinnedProduct', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-productRanking-pinned',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.productRanking.grid.PinnedProduct'
    ],
    ui: 'subform',
    itemId: 'taco-pinnedProduct-form',

    title: 'Promoted Products',

    margin: '0 0 20 0',

    config: {
        isCreateMode: false
    },

    initComponent: function() {

        var me = this;

        Ext.tip.QuickTipManager.init();

        me.header =
            Taco.core.ux.TooltipLabel.wrapConfig('productRanking.form.pinnedProduct.header', me, {
                fieldLabel: "Promoted Products",
                labelCls: 'x-header-text x-panel-header-text x-panel-header-text-subform',
                margin: '20 0 35 0'
            });
        me.header.xtype = 'fieldcontainer';

        me.pinnedGrid = Ext.create('Taco.view.productRanking.grid.PinnedProduct', {
            enableSearch: false
        });

        
        me.productList = Ext.create('Taco.shared.view.field.ProductPickerField', {            
            name: 'categoryFilters',
            flex: 1,
            emptyText: 'Search for products',
            margin: '10 10 10 0',
            listeners: {
                select: function (cmp, record) {
                    me.pinnedGrid.fireEvent('recordadded', record);
                    cmp.setValue('');
                },
                afterrender: function (cmp) {
                    cmp.setValue('');
                },
                scope: this
            }
        });

        me.placementSelect = Ext.create('Ext.form.ComboBox', {
            queryMode: 'local',
            displayField: 'text',
            valueField: 'value',
            forceSelection: true,
            editable: false,
            margin: '10 0 10 10',
            store: Ext.create('Ext.data.Store', {
                fields: ['text', 'value'],
                data: [
                    { text: 'Insert at bottom', value: 'bottom' },
                    { text: 'Insert at top', value: 'top' },
                    { text: 'Insert above selected', value: 'above' },
                    { text: 'Insert below selected', value: 'below' }
                ]
            }),
            listeners: {
                afterrender: function (args) {
                    this.select(this.getStore().getAt(0));
                }
            }
        });

        me.productForm = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'left'
            },
            items: [ me.productList, me.placementSelect, Ext.create('Ext.panel.Panel', {
                flex: 1
            })]
        });

        me.items = [
            {
                xtype: 'fieldcontainer',
                layout: 'fit',
                width: '100%',
                defaults: {
                    flex: 1
                },
                items: [
                    me.productForm,
                    me.pinnedGrid
                ]
            }
        ];

        me.callParent(arguments);
    },

    beforeSave: function() {
        var prodCodes = Ext.Array.map(this.pinnedGrid.getValues(), function(prod){
            return {productCode: prod.get('productCode')};
        });
        this.record.set('boostedProducts', prodCodes);
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});