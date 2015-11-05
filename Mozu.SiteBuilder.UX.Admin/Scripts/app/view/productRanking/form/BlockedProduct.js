/**
 * @class  Taco.view.productRanking.form.BlockedProduct
 * @description Product Ranking Rule Blocked Product Form
 */
Ext.define('Taco.view.productRanking.form.BlockedProduct', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-productRanking-blocked',
    requires: [
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.productRanking.grid.BlockedProduct'
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

        me.blockedGrid = Ext.create('Taco.view.productRanking.grid.BlockedProduct', {
            enableSearch: false
        });

        me.productList = Ext.create('Taco.shared.view.field.ProductPickerField', {            
            name: 'categoryFilters',
            flex: 1,
            emptyText: 'Search for products',
            margin: '10 0 10 0',            
            listeners: {
                select: function (cmp, record) {
                    me.blockedGrid.fireEvent('recordadded', record);
                    cmp.setValue('');
                },
                scope: this
            }
        });

        me.productForm = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                flex: 1
            },
            items: [ me.productList]
        })

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
                    me.blockedGrid
                ]
            }
        ];

        me.callParent(arguments);
    },

    beforeSave: function () {
        var prodCodes = Ext.Array.map(this.blockedGrid.getValues(), function(prod){
            return {productCode: prod.get('productCode')};
        });
        this.record.set('blockedProducts', prodCodes);
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});