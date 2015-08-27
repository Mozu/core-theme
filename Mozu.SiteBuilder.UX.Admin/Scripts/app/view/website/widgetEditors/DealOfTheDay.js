/**
 * @class Taco.view.website.widgetEditors.DealOfTheDay
 * @author Jimmy Sanford
 *
 * The deal of the day widget.
 */

Ext.define('Taco.view.website.widgetEditors.DealOfTheDay', {
    extend: 'Taco.view.website.WidgetEditor',
    alias: 'widget.taco-dealoftheday-widgeteditor',
    requires: [
        'Taco.store.Discounts'
    ],

    height: 480,
    width: 480,

    initComponent: function () {
        this.discountStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Discounts');

        this.form = Ext.create('Taco.core.ux.form.Form', {
            items: [{
                xtype: 'combobox',
                name: 'discountId',
                fieldLabel: 'Discount',
                queryMode: 'remote',
                displayField: 'name',
                valueField: 'id',
                pageSize: 30,
                width: 400,
                store: this.discountStore,
                listeners: {
                    change: {
                        scope: this,
                        fn: 'handleDiscountChange'
                    }
                }
            }, {
                xtype: 'component',
                itemId: 'productCount',
                padding: '10 10 10 10',
                tpl: [
                    '<tpl if="all">',
                        'Applies to all products',
                    '<tpl else>',
                        'Applies to {count} product(s)',
                    '</tpl>'
                ]
            }, {
                xtype: 'radiogroup',
                fieldLabel: 'Choose the display format:',
                vertical: true,
                columns: 2,
                items: [{
                    name: 'displayStyle',
                    boxLabel: 'Single product',
                    inputValue: 'product'
                }, {
                    name: 'displayStyle',
                    boxLabel: 'Category listing',
                    inputValue: 'category'
                }]
            }, {
                xtype: 'checkboxgroup',
                fieldLabel: 'Show the following:',
                vertical: true,
                columns: 2,
                items: [{
                    name: 'savings',
                    boxLabel: '% of savings'
                }, {
                    name: 'expirationDate',
                    boxLabel: 'Expiration date'
                }]
            }]
        });

        this.callParent(arguments);
    },

    handleDiscountChange: function (field, newValue, oldValue) {
        var record = field.getStore().getById(newValue),
            cmp = this.down('#productCount');

        if (cmp && record) {
            cmp.update({
                all: record.get('includeAllProducts'),
                count: record.get('products').length
            });
        }

        console.log(cmp, record.get('products'), record.get('includeAllProducts'));
    },

    /**
     * Cleanup.
     * 
     * @private
     */
    beforeDestroy: function () {
        this.callParent(arguments);
    }
});
