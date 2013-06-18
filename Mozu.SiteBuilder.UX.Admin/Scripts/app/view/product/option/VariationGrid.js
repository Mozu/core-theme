


Ext.define('Taco.view.product.option.VariationGrid', {
    extend: 'Ext.grid.Panel',

    requires: ['Ext.grid.plugin.CellEditing'],

    plugins: [
        Ext.create('Ext.grid.plugin.CellEditing', {
            clicksToEdit: 1
        })
    ],

    initComponent: function () {
        var optionColumns = [],
            staticColumns;

        staticColumns = [{
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
        }];


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

        this.columns = optionColumns.concat(staticColumns);

        this.store = this.product.getVariations();

        this.callParent(arguments);
    },

    findAttributeName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));

        if (!option) return;

        return  option.get('attributeName');
    }
});