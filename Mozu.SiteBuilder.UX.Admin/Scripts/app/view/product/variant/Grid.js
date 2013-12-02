
/**
 * @class  Taco.view.product.variant.Grid
 * @author Travis Johnson
 * @description The grid panelt to edit and enable variants
 */
Ext.define('Taco.view.product.variant.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-product-variant-grid',
    cls: 'taco-variant-grid',

    disableSelection: true,

    initComponent: function () {
        var optionColumns = [],
            staticColumns,
            tplColumnHeader;

        staticColumns = [{
            text: 'Product Code',
            dataIndex: 'productCode',
            editor: {
                xtype: 'textfield'
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
        }, {
            text: 'Enabled',
            dataIndex: 'isActive',
            align: 'center',
            renderer: function (value) {
                return value ? '<div class="check"></div>' : '';
                
            },
            editor: {
                xtype: 'checkbox'
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
        
        this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            clicksToEdit: 1,
            errorSummary: false,
            listeners: {
                edit: this.onRowEdit,
                canceledit: this.onRowCancelEdit,
                scope: this
            },
            autoCancel: false
        });

        this.columns = optionColumns.concat(staticColumns);

        console.log(this.columns)

        this.store = this.product.getVariations();

        this.plugins = [this.rowEditor];

        this.callParent(arguments);

        this.getView().getRowClass = function (record) {
            return record.get('isActive') ? '' : 'invalid-record';
        };
    },

    onRowEdit: function (e) {
        
    },

    onRowCancelEdit: function (e) {
        
    },

    findAttributeName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));

        if (!option) return;

        return option.get('attributeName');
    }
});