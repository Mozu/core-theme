/**
 * @class Taco.view.product.subform.Options
 * @author Travis Johnson
 */

Ext.define('Taco.view.product.subform.Options', {
    extend: 'Taco.core.ux.form.Form',

    title: 'Options',

    initComponent: function () {

        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        this.options = Ext.widget({
            xtype: 'container',
            items: [{
                html: 'THING 1'
            }]
        });

        this.variations = Ext.widget({
            xtype: 'container',
            items: [{
                html: 'THING 2'
            }]
        });

        this.items = [{
            xtype: 'container',
            items: [
                this.options,
                this.variations
            ]
        }];

        this.callParent(arguments);

        if (this.productTypeStore.loading) {
            this.productTypeStore.on('load', this.loadByProductTypeId, this, { single: true });
        } else {
            this.loadByProductTypeId();
        }
    },

    loadByProductTypeId: function () {
        var productTypeId = this.product.get('productTypeId');
        
        this.productType = this.productTypeStore.getById(productTypeId);

        if (!this.productType) return;

        this.productTypeOptions = this.productType.getOptions();

        this.buildOptions();
        this.buildVariations();
    },

    findAttributeName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));

        if (!option) return;

        return  option.get('attributeName');
    },

    buildOptions: function () {
        var items = [];

        this.productTypeOptions.each(function (ptAttribute) {
            items.push({
                xtype: 'component',
                html: ptAttribute.get('attributeName')
            });
        });

        items.push({
            xtype: 'primarybutton',
            text: 'Select Values'
        });

        this.options.removeAll();
        this.options.add(items);
    },

    buildVariations: function () {
        var columns = [{
                text: 'Product Code',
                dataIndex: 'productCode',
                editor: {
                    xtype: 'textfield'
                }
            }, {
                text: 'Quantity',
                dataIndex: 'stockOnHand',
                editor: {
                    xtype: 'numberfield',
                    minValue: 0,
                    decimalPrecision: 0,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                }
            }, {
                text: 'Extra Cost',
                dataIndex: 'deltaPrice',
                editor: {
                    xtype: 'currencyfield',
                    minValue: 0,
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                }
            }, {
                text: 'Extra Weight',
                dataIndex: 'deltaWeight',
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                }
            }],
            optionColumns = [];

        this.product.getOptions().each(function (option, index) {
            optionColumns.push({
                flex: 1,
                text: this.findAttributeName(option),
                dataIndex: 'options',
                sortable: false,
                renderer: function (value) {
                    return value[index].value;
                } 
            });
        }, this);



        this.grid = Ext.create('Ext.grid.Panel', {
            store: this.product.getVariations(),
            columns: optionColumns.concat(columns),
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        });

        this.variations.removeAll();
        this.variations.add(this.grid);
    }
});