
/**
 * @class  Taco.view.product.variant.Grid
 * @author Travis Johnson
 * @description The grid panelt to edit and enable variants
 */
Ext.define('Taco.view.product.variant.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco-product-variant-grid',
    //requires:['Taco.view.product.variant.Modal'],
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
            text: 'Extra Price',
            dataIndex: 'deltaPrice',
            editor: {
                xtype: 'currencyfield',
                decimalPrecision: 2,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            }
        }, {
            text: 'Extra Cost',
            dataIndex: 'deltaCost',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'currencyfield',
                decimalPrecision: 2,
                hideTrigger: true,
                keyNavEnabled: false,
                mouseWheelEnabled: false
            }
        }, {
            text: 'MSRP',
            dataIndex: 'deltaMsrp',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'currencyfield',
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
        //}, {
        //    text: 'Fulfillment Types',
        //    dataIndex: 'fulfillmentTypesSupported',
        //    hideable: true,
        //    hidden: true,
        //    editor: {
        //        xtype: 'textfield'
        //    }
        }, {
            text: 'Mfg Part #',
            dataIndex: 'mfgPartNumber',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'textfield'
            }
        }, {
            text: 'UPC',
            dataIndex: 'upc',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'textfield'
            }
        }, {
            text: 'Distributor Part #',
            dataIndex: 'distPartNumber',
            hideable: true,
            hidden: true,
            editor: {
                xtype: 'textfield'
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
            var attribute = this.findAttribute(option),
                attributeText = attribute.get('attributeName'),
                attributeValues = attribute.get('selectedValues'),
                attributeId = attribute.getId();
                
            
            optionColumns.push({
                flex: 1,
                text: attributeText,
                dataIndex: 'options',
                sortable: false,
                renderer: function (values) {

                    
                    var value = Ext.Array.findBy(values, function (v) {
                        return v.attributeFQN == attributeId
                    });

                    var attributeValue = Ext.Array.findBy(attributeValues, function (item) {
                        return typeof item.id !== 'undefined' && (item.id.toString() === value.value.toString());
                    });

                    if (!attributeValue) {
                        return value.value;
                    }
                    return attributeValue.value;
                }
            });
        }, this);
        
        this.rowEditor = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            clicksToEdit: 1,
            autoCancel:false,
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

        if (!this.store.hasLoaded()) {
            this.store.load();
        }

        this.callParent(arguments);

        this.getView().getRowClass = function (record) {
            return record.get('isActive') ? '' : 'invalid-record';
        };
    },

    onRowEdit: function (e) {
        
    },

    onRowCancelEdit: function (e) {
        
    },
    
    findAttribute: function (record) {
        return this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));
    },
    
    addSaveTasks: function (tasks, updateRecord, saveRecord) {

        this.callParent(arguments);
        var storeTask = tasks.tasks.findBy(function (innerTask) {
            return innerTask.store == this.store;
        }, this);

        storetask.dependencyFilter(function (innerTask) {
            return innerTask.saveRecord == this.product;
        }, this)
        return tasks;
    },
});