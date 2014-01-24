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
                xtype: 'container',
                layout: 'hbox',
                items: [{
                    xtype: 'combobox',
                    name: 'discount',
                    fieldLabel: 'Discount',
                    queryMode: 'local',
                    displayField: 'name',
                    valueField: 'id',
                    width: 200,
                    store: this.discountStore,
                    listeners: {
                        change: {
                            scope: this,
                            fn: 'handleDiscountChange'
                        }
                    }
                }, {
                    xtype: 'numberfield',
                    name: 'productCount',
                    fieldLabel: 'Number of products',
                    margin: '0 0 5 20',
                    width: 200,
                    hideTrigger: true,
                    mouseWheelEnabled: false
                }]
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
                    name: 'price',
                    boxLabel: 'Regular price'
                    // inputValue: 'price'
                }, {
                    name: 'savings',
                    boxLabel: '% of savings'
                    // inputValue: 'savings'
                }, {
                    name: 'expirationDate',
                    boxLabel: 'Expiration date'
                    // inputValue: 'expirationDate'
                }, {
                    name: 'shortDescription',
                    boxLabel: 'Short description'
                    // inputValue: 'shortDescription'
                }, {
                    name: 'longDescription',
                    boxLabel: 'Long description'
                    // inputValue: 'longDescription'
                }]
            }]
        });

        this.callParent(arguments);
    },

    handleDiscountChange: function (field, newValue, oldValue) {
        var record = field.getStore().getById(newValue);

        console.log(record);
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
