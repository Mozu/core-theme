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
            tplColumnHeader,
            me = this,
            goodsType = this.productType.get('goodsType'),
            isPhysical = (goodsType === 'Physical'),
            isDigitalCredit = (goodsType === 'DigitalCredit'),
            fulfillmentData = (isPhysical) ? [{
                "id": "DirectShip",
                "name": "Direct Ship"
            }, {
                "id": "InStorePickup",
                "name": "In Store Pickup"
            }] : [{
                "id": "Digital",
                "name": "Email"
            }];


        var fulfillmentTypeData = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data: fulfillmentData
        });


        var fulfillmentEditor = {
            xtype: "combobox",
            triggerAction: 'all',
            queryMode: 'local',
            displayField: 'name',
            valueField: 'id',
            autoSelect: true,
            forceSelection: true,
            store: fulfillmentTypeData,
            multiSelect: true
        };

        staticColumns = [{
                text: 'Product Code',
                dataIndex: 'productCode',
                
                editor: {
                    onEditorShow:function ( field , editor, contex) {
                        if (contex.record.get('exists') === true) {
                            field.disable();
                        } else {
                            field.enable();
                        }
                    },
                    xtype: 'textfield',
                    msgTarget: "qtip",
                }
        }, {
                text: 'Extra Price',
                dataIndex: 'deltaPrice',
                editor: {
                    xtype: 'currencyfield',
                    currencyCode: this.product.getCurrencyCode(),
                    allowBlank: !isDigitalCredit,
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    msgTarget: "qtip",
                }
        }, {
                text: 'Extra Cost',
                dataIndex: 'deltaCost',
                hideable: true,
                hidden: true,
                editor: {
                    xtype: 'currencyfield',
                    currencyCode: this.product.getCurrencyCode(),
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
                    currencyCode: this.product.getCurrencyCode(),
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                }
        }, {
                text: 'Gift Card/Credit Value',
                dataIndex: 'creditValue',
                hideable: isDigitalCredit,
                hidden: !isDigitalCredit,
                required: !isDigitalCredit,
                width: 185,
                editor: {
                    xtype: 'currencyfield',
                    currencyCode: this.product.getCurrencyCode(),
                    allowBlank: !isDigitalCredit,
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false,
                    msgTarget: "qtip"
                }
        }, {
                text: 'Extra Weight',
                dataIndex: 'deltaWeight',
                hidden: isDigitalCredit,
                editor: {
                    xtype: 'numberfield',
                    decimalPrecision: 2,
                    hideTrigger: true,
                    keyNavEnabled: false,
                    mouseWheelEnabled: false
                }
        },

            {
                text: 'Fulfillment Types',
                dataIndex: 'fulfillmentTypesSupported',
                hideable: true,
                hidden: true,
                width: 185,
                editor: fulfillmentEditor

        },

            {
                text: 'Mfg Part #',
                dataIndex: 'mfgPartNumber',
                hideable: true,
                hidden: true,
                editor: {
                    xtype: 'textfield',
                    maxLength: 30,
                    enforceMaxLength: true
                }
        }, {
                text: 'UPC',
                dataIndex: 'upc',
                hideable: true,
                hidden: true,
                editor: {
                    xtype: 'textfield',
                    maxLength: 128,
                    enforceMaxLength: true
                }
        }, {
                text: 'Dist Part #',
                dataIndex: 'distPartNumber',
                hideable: true,
                hidden: true,
                editor: {
                    xtype: 'textfield',
                    maxLength: 30,
                    enforceMaxLength: true
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
            autoCancel: false,
            errorSummary: false,
            listeners: {
                edit: this.onRowEdit,
                canceledit: this.onRowCancelEdit,
                scope: this
            }
        });

        this.columns = optionColumns.concat(staticColumns);

        this.store = this.product.getVariations();

        this.plugins = [this.rowEditor];


        if (isDigitalCredit) {
            this.mon(this.store, 'load', function () {
                me.store.each(function (item) {
                    item.set('fulfillmentTypesSupported', ['Digital']);
                });
            });
        }


        if (!this.store.hasLoaded()) {
            this.store.load();
        }


        this.callParent(arguments);

        this.getView().getRowClass = function (record) {
            return record.get('isActive') ? '' : 'invalid-record';
        };
    },

    onRowEdit: function (editor, e) {

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
    }
});