/**
 * @class Taco.view.product.widget.productCode.Modal
 */

Ext.define('Taco.view.product.widget.productCode.Modal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.selection.CellModel',
        'Ext.grid.plugin.CellEditing',
        'Ext.grid.Panel'
    ],

    autoShow: true,
    closeAction: 'destroy',    
    //scale: 'large',    
    scale: "",
    height: 300,
    width:800,
    title: 'Change Product Code',

    layout: {
        type: 'fit'
    },

    defaultFocus: "newProductCode",

    initComponent: function () {
        var me = this;
        me.items = [];

        me.variationsStore = this.getVariationsStore();

        me.variationsStore.load({
            scope:me,
            callback: function (records, operation, success) {
                this.initUI();
            }
        });

        me.callParent(arguments);
    },

    getVariationsStore: function (autoLoad){
            var me = this,
                proxy,
                variationsStore;

            autoLoad = (autoLoad !== false);

            if (me.variationStore) {
                return me.variationStore;
            }
        
            variationsStore = Ext.create('Ext.data.Store', {                
                fields: [
                    "productCode",
                    "newProductCode",
                    {
                        name: 'options',
                        type: 'any',
                        defaultValue: []
                    }
                ],
                autoLoad: false,
                pageSize: 900,
                proxy: {
                    type: 'ajax',
                    api: {
                        read: '/admin/app/productVariation/list',                  
                    },
                    reader: {
                        type: 'json',
                        root: 'items',
                        successProperty: 'success'
                    },
                    writer: {
                        allowSingle: false,
                        type: 'json'
                    },
                    extraParams: {
                        productCode: this.product.getId()
                    }
                }
            });

            if (autoLoad) {
                variationsStore.load();
            }

            return variationsStore;
    },

    initUI: function (){
        
        var me = this,
            items= [],
            optionColumns = [],
            staticColumns,
            hasVariations = me.variationsStore.count(),
            saveButton = me.down('#primaryAction');
        
        // save button is disabled by default and is enabled on change of the form or the grid;
        saveButton.disable();

        this.summaryForm = Ext.create('Ext.form.Panel', {
            layout: 'anchor',
            items: [{
                xtype: "textfield",
                fieldLabel: "Product Name",
                readOnly: true,
                tabIndex: -1,
                anchor: '0',
                value:this.product.get("productName")
            }, {
                xtype: "fieldcontainer",
                anchor: 0,
                layout:"hbox",
                items: [{
                    xtype: "textfield",                    
                    fieldLabel: "New Product Code",
                    name: "newProductCode",
                    itemId: "newProductCode",
                    emptyText: "Enter New Product Code",
                    listeners: {
                        'dirtychange': function (field, isDirty) {
                            this.updateSaveButton({
                                fieldDirty:isDirty
                            })
                        },
                        scope:me
                    },
                    flex: 1
                },{
                    xtype: "textfield",
                    readOnly: true,
                    margin: "0 0 0 4",
                    tabIndex:-1,
                    fieldLabel: "Current Product Code",
                    flex: 1,
                    value: this.product.get("productCode")
                }]
            }]
        })

        items.push(me.summaryForm);

        // if we have variations data need to add the grid
        if (hasVariations) {

            this.product.getOptions().each(function (option, index) {
                var attribute = this.findAttribute(option),
                    attributeText = attribute.get('attributeName'),
                    attributeValues = attribute.get('selectedValues'),
                    attributeId = attribute.getId();


                optionColumns.push({
                    //flex: 1,
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


            staticColumns = [
                {
                    text: 'New Product Code', dataIndex: 'newProductCode',
                    width: 250,
                    editor: {

                        //onEditorShow: function (field, editor, contex) {
                        //    if (contex.record.get('exists') === true) {
                        //        field.disable();
                        //    } else {
                        //        field.enable();
                        //    }
                        //},
                        xtype: 'textfield',
                        showBorder: true,
                        msgTarget: "qtip"
                    }

                },
                { text: 'Current Product Code', dataIndex: 'productCode', width: 250 }
            ]

            var columns = staticColumns.concat(optionColumns);

            me.grid = Ext.create('Ext.grid.Panel', {
                store: me.variationsStore,
                flex: 1,
                margin: "20 0 0 0",
                columns: columns,
                viewConfig: {
                    emptyText: '<div class="empty-grid-message">No varients to display</div>',
                    deferEmptyText: false,
                    stripeRows: false
                },
                selModel: Ext.create('Ext.selection.CellModel', {
                    enableFieldTabbing: true
                }),
                plugins: [
                    Ext.create('Ext.grid.plugin.CellEditing', {
                        pluginId: "cellEditing",
                        clicksToEdit: 1
                    })
                ]
            })

            me.mon(me.grid, 'edit', function (grid, context) {
                var gridDirty = false;

                if (context.store.getModifiedRecords().length) {
                    var gridDirty = true;
                }

                this.updateSaveButton({

                    gridDirty: gridDirty
                })

            }, me);

            items.push(me.grid);
        }

        this.add({
            layout:{
                type: 'vbox',
                align: 'stretch'
            },
            items: items
        });

        if (hasVariations) {            
            me.setHeight(600);
        }
    },

    updateSaveButton : function (config){
        var me = this,
            saveButton = me.down('#primaryAction')

        if (config.fieldDirty != undefined) {
            this.fieldIsDirty = config.fieldDirty
        }

        if (config.gridDirty != undefined) {
            this.gridIsDirty = config.gridDirty
        }

        if (this.fieldIsDirty || this.gridIsDirty) {
            //save button enabled;
            
            saveButton.enable();
        } else {
            //save button disabled;
            
            saveButton.disable();
        }

    },

    findAttribute: function (record) {
        return this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'), 0, false, false, true);
    },

    getJsonData : function (){
        
        var me = this,
            jsonData = [],            
            newProductCode = me.down("#newProductCode").getValue();;

        // check to see if user has modified the base productCode;
        if (newProductCode) {
            jsonData.push({
                newProductCode: newProductCode,
                existingProductCode: me.product.get("productCode")
            });
        }

        // check to see if user has modified the variations;
        if (this.variationsStore.count()) {
        
            this.variationsStore.each(function (record) {
                if (record.get("newProductCode")) {                    
                    jsonData.push({
                        newProductCode: record.data.newProductCode,
                        existingProductCode: record.data.productCode
                    });
                }
            });
        }
        

        return jsonData
    },

    doSave: function () {
        var me = this,
            jsonData = me.getJsonData(),
            newProductCode = me.down("#newProductCode").getValue(),
            productCode = (newProductCode) ? newProductCode : me.product.get("productCode");

        // make sure the user has entered some data;
        if (!jsonData.length) {
            Taco.app.fireEvent('setmessage', "No product code changes found", 'error');
            return;
        }

        var msg = "<div style='padding-left:10px;padding-right:10px;'>The product that you are attempting to change the product code on may have existing orders which could be left in an undesirable state. It's linkage to other products and usages, as well as historical reporting could also be effected. <br><br>Are you sure you want to change the product code?</div>"

        Ext.MessageBox.show({
            title: 'Warning',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: msg,
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {
                    // call service to persist the change;
                    me.setLoading(true, me.body);
                    me.product.renameProductCode({
                        jsonData: jsonData,
                        success: function (response) {                            
                            me.saveSuccess(productCode);
                        },
                        callback: function () {
                            me.setLoading(false, me.body);}
                        // note: default failure handling set in model method
                    })
                }
            }
        });
    }
});
