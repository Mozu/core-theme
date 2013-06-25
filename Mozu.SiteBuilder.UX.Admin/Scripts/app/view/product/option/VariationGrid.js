/**
 * @class  Taco.view.product.option.VariationGrid
 * @author Travis Johnson
 */


Ext.define('Taco.view.product.option.VariationGrid', {
    extend: 'Ext.grid.Panel',

    requires: ['Ext.grid.plugin.CellEditing'],

    disableSelection: true,
    

    initComponent: function () {
        var optionColumns = [],
            staticColumns,
            tplColumnHeader;


        this.addEvents([
            'editoption'
        ]);

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
        }, {
            text: 'Invalid',
            dataIndex: 'isActive',
            renderer: function (value) {
                return '<div class="invalidate"></div>';
            }
        }];

        tplColumnHeader = new Ext.Template('{name} <a href="#" class="edit-option" data-attribute-fqn="{attributeFQN}">EDIT</a>');

        this.product.getOptions().each(function (option, index) {
            optionColumns.push({
                flex: 1,
                text: tplColumnHeader.apply({name: this.findAttributeName(option), attributeFQN: option.get('attributeFQN')}),
                dataIndex: 'options',
                sortable: false,
                renderer: function (value) {
                    return value[index].value;
                },
                listeners: {
                    headerclick: this.onColumnHeaderClick,
                    scope: this
                }
            });
        }, this);

        this.columns = optionColumns.concat(staticColumns);

        this.store = this.product.getVariations();


        this.plugins = [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1,
                isCellEditable: function (record, columnHeader) {
                    debugger;
                }
                
            })
        ];
        
        this.callParent(arguments);

        this.getView().getRowClass = function (record) {
            return record.get('isActive') ? '' : 'invalid-record';
        };

        this.on({
            cellclick: this.onCellClick,
            scope: this
        });
    },

    onColumnHeaderClick: function (ct, column, e) {
        var el = Ext.get(e.target);
        if (!el.hasCls('edit-option')) return;

        e.stopPropagation();
        e.preventDefault();

        this.fireEvent('editoption', this, el.getAttribute('data-attribute-fqn'));
    },

    onCellClick: function (grid, td, cellIndex, record, tr, rowIndex, e, eOtps) {
        var el = Ext.fly(e.target);
        if (el.hasCls('invalidate')) {
            e.stopPropagation();
            e.preventDefault();
            record.set('isActive', !record.get('isActive'));
            return;
        }
    },

    findAttributeName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));

        if (!option) return;

        return  option.get('attributeName');
    }
});