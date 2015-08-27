///**
// * @class Taco.view.productOption.Edit
// */
// deprecated


//    Ext.define('Taco.view.productOption.Edit', {
//        extend: 'Taco.core.ux.form.Editor',
//        alias: 'widget.productOptionedit',
//        requires: ['Taco.core.ux.CategoryComboBox', 'Taco.core.ux.form.SlugField', 'Taco.core.ux.form.SelectField', 'Ext.form.field.ComboBox', 'Taco.model.Option', 'Taco.store.Options', 'Taco.core.ux.DragHandleColumn'],


//        title: 'New Option',

//        model: 'Taco.model.ProductOption',
//        type: 'ProductOption',


//        initComponent: function () {

//            var me = this;

//            me.actions = [{
//                xtype: 'selectfield',
//                mode: 'local',
//                name: '',
//                listeners: {
//                    'deleteRecord': {
//                        fn: me.deleteRecord,
//                        scope: me
//                    },
//                    'copy': {
//                        fn: me.copyRecord,
//                        scope: me
//                    }
//                },
//                value: "",
//                store: [
//                    ["", "More"],
//                    ["copyRecord", "Copy"],
//                    ["deleteRecord", "Delete"]
//                ]
//            }, {
//                xtype: 'secondarybutton',
//                text: 'Cancel',
//                eventName: 'close'
//            }, {
//                xtype: 'primarybutton',
//                text: 'Save',
//                eventName: 'save'
//            }];
//            me.tabs = [
//            {
//                //title: 'Basic',
//                height: 1200,
//                defaults: {
//                    xtype: 'textfield',
//                    labelAlign: 'top',
//                    labelSeperator: '',
//                    width: 400
//                },
//                items: [
//                {
//                    name: 'internalName',
//                    fieldLabel: 'Option Name'
//                },
//                                            {
//                                                xtype: 'selectfield',
//                                                mode: 'local',
//                                                fieldLabel: 'Option Type in Store',
//                                                name: 'inputType',
//                                                store: [
//                        ["Dropdown", "Dropdown"],
//                        ["Radio", "Radio"],
//                        ["CheckBox", "CheckBox"],
//                        ["Textbox", "Textbox"]

//                        ],

//                                                listeners: {
//                                                    change: {
//                                                        fn: function (item) {
//                                                            var og = me.down('#optionValueGrid');
//                                                            if (!og)
//                                                            {
//                                                                return;
//                                                            }
//                                                            if (item.value == 'CheckBox' || item.value == 'Textbox')
//                                                            {
//                                                                og.hide();
//                                                            }
//                                                            else
//                                                            {
//                                                                og.show();
//                                                            }

//                                                        }

//                                                    }
//                                                }
//                                            },
//                                            {
//                                                xtype: 'checkboxfield',
//                                                labelAlign: 'right',
//                                                labelWidth: 300,
//                                                fieldLabel: 'Selection by Customer is Required',
//                                                name: 'isRequired'
//                                            },
//                                            {
//                                                name: 'name',
//                                                fieldLabel: 'Option Name In Store'
//                                            }


//                ]
//            }

//            ];

//            me.on(
//            {
//                load: {
//                    fn: me.onLoad,
//                    scope: me
//                },
//                save: {
//                    fn: me.onSave,
//                    scope: me
//                }
//            });

//            me.callParent(arguments);
//            // me.down('#optComb').store 
//        },
//        stopViewLaunch: function () {
//            return this.tabForm.getForm().isDirty();
//        },
//        save: function () {
//            var me = this,
//                model,
//                hasValueChanges,
//                opStore;

//            if (!me.fireEvent('beforesave'))
//            {
//                return;
//            }

//            model = me.tabForm.getRecord();
//            opStore = model.optionValues();
//            me.tabForm.getForm().updateRecord(model);
//            model.save();
//            model.optionValues().sync();

//        },

//        onLoad: function (record) {
//            var me = this;
//            if (record.get('id'))
//            {
//                me.setTitle('Opton / ' + record.get('internalName'));
//            }

//            var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
//                clicksToEdit: 1
//            });


//            var grid = Ext.create('Ext.grid.Panel', {
//                hidden: false,
//                itemId: 'optionValueGrid',
//                hideHeaders: true,
//                width: 400,
//                title: 'Add "Additional" Values',
//                columns: [
//                {
//                    xtype: 'draghandlecolumn',
//                    width: 20
//                },
//                                            {
//                                                dataIndex: 'value',
//                                                sortable: false,
//                                                text: 'internalName',
//                                                xtype: 'gridcolumn',
//                                                editor: {
//                                                    allowBlank: false
//                                                },
//                                                flex: 1
//                                            }, {
//                                                xtype: 'actioncolumn',
//                                                width: 50,
//                                                iconCls: 'taco-action-delete',
//                                                tooltip: 'Delete',
//                                                handler: function (grid, rowIndex, colIndex) {
//                                                    var rec = grid.getStore().getAt(rowIndex);
//                                                    grid.getStore().remove(rec);
//                                                }
//                                            }

//                ],
//                viewConfig: {
//                    plugins: {
//                        ptype: 'gridviewdragdrop',
//                        dragText: 'Drag and drop to reorganize'
//                    },
//                    listeners: {
//                        drop: function (node, data, dropRec, dropPosition) {
//                            var g = grid;

//                            var models = g.getView().getRecords(g.getView().getNodes());
//                            Ext.each(models, function (model, i) {
//                                model.set('sequence', i);
//                            });

//                        }
//                    }
//                },
//                store: record.optionValues(),
//                dockedItems: [
//                {
//                    xtype: 'button',
//                    dock: 'bottom',
//                    text: 'add',
//                    handler: function () {
//                        var g = grid;
//                        var store = me.data.optionValues();

//                        var newOpt = new Taco.model.OptionValue();
//                        newOpt.set('sequence', store.count());
//                        store.insert(store.count(), newOpt);
//                        cellEditing.startEdit(newOpt, g.columns[1]);

//                    }
//                }
//                ],

//                plugins: [cellEditing]


//            });

//            var addToForm = function () {
//                me.tabForm.add(grid);
//            };

//            if (me.rendered)
//            {
//                addToForm();
//            }

//            else
//            {
//                me.on('render', {
//                    fn: addToForm,
//                    scope: me
//                });
//            }

//        }
//    });
