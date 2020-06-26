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
    minHeight:300,
    height: 300,
    width:800,
    title: Localizer.langResources.CATALOG.Products.ProductEdit.change_product_code,
    layout: {
        type: 'fit'
    },

    defaultFocus: "newProductCode",

    sameCodeErrorTxt: Localizer.langResources.CATALOG.Products.ProductEdit.same_code_error,

    initComponent: function () {
        var me = this;
        me.items = [];

        me.variationsStore = this.getVariationsStore(false);
        me.mon(me, 'show', function () {
            var saveButton = me.down('#primaryAction')
            saveButton.disable();
            me.setLoading(true, this.body);
        }, me)
        
        me.variationsStore.load({
            scope:me,
            callback: function (records, operation, success) {                
                this.initUI();
                me.setLoading(false, this.body);
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
                pageSize: 10,
                remoteFilter:true,
                filters: [
                    {
                        property:"variationproductcode",
                        comparison:"ne",
                        value: "null"
                    }
                ],
                proxy: {
                    type: 'ajax',
                    // changed for issue with long URI on GET request
                    api: {
                        read: '/admin/app/productVariation/list'                  
                    },
                    actionMethods: {
                        create: 'POST',
                        read: 'GET',
                        update: 'POST',
                        destroy: 'POST',
                        duplicate: 'POST'
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
            hasVariations = me.variationsStore.count();
        
        

        this.summaryForm = Ext.create('Ext.form.Panel', {
            layout: 'anchor',
            items: [{                
                xtype: "component",
                tpl: "<span class=''>" + Localizer.langResources.SHARED.product_name + ": {productName}</span>",
                data:{
                    productName: this.product.get("productName")
                },
                anchor: '0'
            }, {
                xtype: "fieldcontainer",
                anchor: 0,
                layout:"hbox",
                items: [{
                    xtype: "textfield",
                    readOnly: true,
                    tabIndex:-1,
                    fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.current_product_code,
                    flex: 1,
                    value: this.product.get("productCode")
                },{
                    xtype: "textfield",                    
                    fieldLabel: Localizer.langResources.CATALOG.Products.ProductEdit.new_product_code,
                    name: "newProductCode",
                    itemId: "newProductCode",
                    margin: "0 0 0 20",
                    allowBlank: hasVariations,
                    labelClsExtra: (hasVariations) ? '' : 'x-form-item-required',
                    emptyText: Localizer.langResources.CATALOG.Products.ProductEdit.new_product_code_emptytext,                    
                    invalidValue : this.product.get("productCode"),
                    validator: function (value) {
                        return (value && value == this.invalidValue) ? me.sameCodeErrorTxt : true
                    },
                    listeners: {
                        'dirtychange': function (field, isDirty) {
                            this.updateSaveButton({
                                fieldDirty: isDirty
                            })
                        },
                        scope:me
                    },
                    flex: 1
                }]
            }]
        })

        items.push(me.summaryForm);

        // if we have variations data need to add the grid
        if (hasVariations) {
            me.initOptionsData();
            me.grid = Ext.create('Taco.view.product.widget.productCode.Grid', {
                flex: 1,
                margin: "20 0 0 0",
                enableColumnHide: false,
                product: this.product,
                optionsData: me.optionsData,
                productType: this.productType,
                pricingModeChanged: false,
                pricingMode: 'Delta',
                stateId: 'statefulProductOptionsGrid',
                store: me.variationsStore
            });

            me.mon(me.grid, 'edit', function (grid, context) {
                var gridDirty = false;

                if (context.store.getModifiedRecords().length) {
                    var gridDirty = true;
                }

                me.updateSaveButton({

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

        var newProductCode = me.down("#newProductCode");
        newProductCode.focus();


        if (hasVariations) {            
            me.minHeight = 500;
            me.setHeight(600);
        }
    },

    initOptionsData: function () {
        var me = this,
            optionsStore = me.product.getOptions();

        me.optionsData = new Ext.util.MixedCollection();

        // saturate the options mixed collection;
        optionsStore.each(function (record) {
            me.optionsData.add(record.get("attributeFQN"), Ext.clone(record.data));
        });
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

    isValid: function (jsonData) {
        var me = this,
            error = [];

        if (!jsonData.length) {
            Taco.app.fireEvent('setmessage', Localizer.langResources.CATALOG.Products.ProductEdit.product_code_error_msg, 'error');
            return false
        } else {
            error = Ext.Array.findBy(jsonData, function (record) {                
                if (record.newProductCode== record.existingProductCode){
                    return true
                }
                return false;
            });

            if (error) {
                Taco.app.fireEvent('setmessage', this.sameCodeErrorTxt, 'error');
                return false;
            }
        }

        return true;

    },

    doSave: function () {
        var me = this,
            jsonData = me.getJsonData(),
            newProductCode = me.down("#newProductCode").getValue(),
            productCode = (newProductCode) ? newProductCode : me.product.get("productCode"),
            saveButton = me.down('#primaryAction');

        if (!me.isValid(jsonData)) {
            return;
        };

        var msg = "<div style='padding-left:10px;padding-right:10px;'><div>" + Localizer.langResources.CATALOG.Products.ProductEdit.changing_code_msg1 + "</div> <ul><li style='margin:0px 10px 0px 20px;list-style-type: disc;'>" + Localizer.langResources.CATALOG.Products.ProductEdit.changing_code_msg2 + "</li><li style='margin:0px 10px 0px 20px;list-style-type: disc;'>" + Localizer.langResources.CATALOG.Products.ProductEdit.changing_code_msg3 + "</li><li style='margin:0px 10px 0px 20px;list-style-type: disc;'> " + Localizer.langResources.CATALOG.Products.ProductEdit.changing_code_msg4 + "</li></ul> <div style='padding-top:10px'>" + Localizer.langResources.CATALOG.Products.ProductEdit.changing_code_msg5 + "</div></div>"
        
        Ext.MessageBox.show({
            title: Localizer.langResources.CATALOG.Products.ProductEdit.warning,
            defaultFocus: Ext.MessageBox.msgButtons[2],
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
                    saveButton.disable();
                    me.product.renameProductCode({
                        jsonData: jsonData,
                        success: function (response) {                            
                            me.saveSuccess(productCode);
                        },
                        callback: function () {
                            me.setLoading(false, me.body);
                            saveButton.enable();
                        }
                        // note: default failure handling set in model method
                    })
                }
            }
        });
    }
});
