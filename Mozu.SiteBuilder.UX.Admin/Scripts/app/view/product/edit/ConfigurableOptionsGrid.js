///**
// * @class Taco.view.product.edit.ConfigurableOptionsGrid
// */
//Ext.define('Taco.view.product.edit.ConfigurableOptionsGrid', {
//    extend: 'Taco.core.ux.BaseGrid',
//    requires: ['Taco.core.ux.form.RemovableColumn'],
//    alias: 'widget.configurableoptionsgrid',
//    cls: Taco.baseCSSPrefix + 'form-module-grid',

//    selType: 'cellmodel',
//    plugins: [
//        { ptype: 'cellediting', clicksToEdit: 1 }
//    ],
//    animCollapse: false,

    

//    initComponent: function () {
//        var me = this,
//            md = me.store.getProxy().getReader().metaData,
//            optionColumns = md ? md.options : null;
//        me.columns= [{
//                dataIndex: 'deltaPrice',
//                text: 'Cost',
//                width: 78,
//                resizable: false,
//                draggable: false,
//                align: 'right',
//                editor: {
//                    xtype: 'numberfield',
//                    cls: [
//                        Taco.baseCSSPrefix + 'grid-editor-textfield',
//                        Taco.baseCSSPrefix + 'grid-editor-numberfield'],
//                    decimalPrecision: 2,
//                    hideTrigger: true,
//                    keyNavEnabled: false,
//                    mouseWheelEnabled: false,
//                    allowBlank: false
//                },
//                renderer: function(value) {
//                    return '$' + (value ? value : 0);
//                }
//            }, {
//                dataIndex: 'productVariationCode',
//                text: 'SKU',
//                width: 150,
//                resizable: false,
//                draggable: false       
//            }, {
//                dataIndex: 'stockOnHand',
//                text: 'Stock',
//                width: 78,
//                resizable: false,
//                draggable: false,
//                align: 'right',
//                editor: {
//                    xtype: 'numberfield',
//                    cls: [
//                        Taco.baseCSSPrefix + 'grid-editor-textfield',
//                        Taco.baseCSSPrefix + 'grid-editor-numberfield'],
//                    hideTrigger: true,
//                    keyNavEnabled: false,
//                    mouseWheelEnabled: false
//                },
//                renderer: function(value) {
//                    return (!value && value !== 0) ? "&infin;" : value;
//                }
//            }, {
//                dataIndex: 'isActive',
//                text: 'Active',
//                width: 78,
//                resizable: false,
//                draggable: false,
//                align: 'center',
//                editor: {
//                    xtype: 'checkbox',
//                    cls: Taco.baseCSSPrefix + 'grid-editor-checkbox'
//                },
//                renderer: function(value) {
//                    if (value) {
//                        return "Yes";
//                    } else {
//                        return "No";
//                    }
//                }
//            }];
//        me.columnCache = [].concat(me.columns);

//        me.callParent(arguments);

//        if (optionColumns) {
//            me.updateColumns(optionColumns);
//        }

//        me.on({
//            removeoption: function () { console.log('remove option', this, arguments); }
//        });
//    },

//    updateColumns: function (options) {
//        var me = this,
//            newColumns = [];

//        for (var i = options.length - 1; i >= 0; i--) {
//            newColumns.push({
//                xtype: 'removablecolumn',
//                dataIndex: options[i].fieldName,
//                text: options[i].caption,
//                optionId:options[i].key,
//                resizable: false,
//                sortable: false,
//                flex: 1,
//                listeners: {
//                    headerclick: function (ct, column, e, t, eOpts) {
//                        var r = Ext.fly(t).hasCls('taco-removablecolumn-delete'),
//                            record = me.record,
//                            key = column.optionId,
//                            mdl,
//                            direction;
                            
//                        if (!r) {
//                            direction = (column.sortState === 'ASC' ? 'DESC' : 'ASC');
//                            me.getStore().sort(column.dataIndex, direction);
//                        }
//                        else {
                            
//                            Ext.Msg.confirm('Warning', 'You really Super Sure', function (button) {
//                                if (button === 'yes') {
//                                    mdl = Ext.create('Taco.model.ProductOption',
//                                    {
//                                        productCode: me.record.getId(),
//                                        id: key,
//                                        intention: 'configuration'
//                                    });
//                                    mdl.destroy({
//                                        callback: function () {
//                                            me.store.load(
//                                                {
//                                                    callback: function () {
//                                                        me.fireEvent('optiondelete' ,me.store);
//                                                    }
//                                            });
//                                        }
//                                    });
//                                } 
//                            });
                            
                            
//                        }
//                    }
//                }
//            });
//        }

//        me.reconfigure(me.store, newColumns.concat(me.columnCache));
//    }
//});