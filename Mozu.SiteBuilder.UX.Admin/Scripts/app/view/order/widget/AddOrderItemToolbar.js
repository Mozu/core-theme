/**
 * @class Taco.view.order.widget.AddOrderItemToolbar
 * 
 */
Ext.define('Taco.view.order.widget.AddOrderItemToolbar', {
    extend: 'Ext.container.Container',
    requires: [
        'Taco.view.order.modal.ProductConfigurator',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.order.widget.FulfillmentPickerField',
        'Taco.core.ux.form.field.plugins.InputMask'
    ],
    config: {
        grid:null,
        gridColumns:null,
        productsPerPage: 25,
        productConfiguration: null,
        fulfillmentMethod: null,
        locationCode: null
    },
    dock: 'bottom',
    layout: {
        type: 'hbox',
        align: 'middle'
    },
    style: 'border:1px solid #ccc;padding-top:2px;padding-bottom:2px;',

    focusCls: 'taco-order-addproducttoolbar-focus',

    initComponent: function(eOpts) {
        var me = this;
        
        if (!me.grid) {
            throw 'A grid is requred;';
        };

        me.gridColumns = me.grid.columns;

        //this.addEvents('save','saveFailure','saveSuccess');
        
        me.cls = [this.cls, 'order-addproducttoolbar'].join(' ');

        me.lineField = Ext.widget({
            xtype: 'displayfield',
            fieldBodyCls: 'order-addproducttoolbar-cell',
            fieldStyle: 'padding:0px 4px;',
            fieldCls: 'order-addproducttoolbar-field',
            width: this.gridColumns[0].width,
            value: ''
        });

        me.statusField = Ext.widget({
            xtype: 'displayfield',
            fieldBodyCls: 'order-addproducttoolbar-cell',
            fieldStyle: 'padding:0px 4px;',
            fieldCls: 'order-addproducttoolbar-field',
            width: this.gridColumns[3].width,
            value: ''
        });
        

        me.codeField = Ext.widget({
            xtype: 'displayfield',
            fieldBodyCls: 'order-addproducttoolbar-cell',
            fieldStyle: 'padding:0px 4px;',
            fieldCls: 'order-addproducttoolbar-field',
            width: this.gridColumns[1].width,
            value: ''
        });

        me.priceField = Ext.widget({
            xtype: 'displayfield',
            fieldBodyCls: 'order-addproducttoolbar-cell',
            fieldStyle: 'text-align:right;padding:0px 4px;',
            fieldCls: 'order-addproducttoolbar-field',
            width: this.gridColumns[5].width,
            value: ''
        });

        me.quantityField = Ext.widget({
            xtype: 'numberfield',
            disabled: true,
            fieldBodyCls: 'order-addproducttoolbar-cell',
            fieldStyle: 'text-align:right;padding-right:4px;',
            //forcePrecision: true,
            selectOnFocus: true,
            hideTrigger: true,

            //fieldStyle: 'text-align:right;padding-right:4px;',
            mouseWheelEnabled: false,
            allowBlank: false,
            minValue: 1,
            maxValue: 100000,
            width: this.gridColumns[6].width,
            value: '',
            listeners: {
                focus: this.onFocus,
                blur: this.onBlur,
                scope: me
            }
        });

        me.addItemButton = Ext.widget({            
            xtype: 'button',
            ui: 'action',
            scale:'medium',
            fieldBodyCls: 'order-addproducttoolbar-cell',            
            text: 'Add',
            itemId: 'addButton',
            disabled: true,            
            width: this.gridColumns[7].width,
            handler: function () {
                // the handler also gets called, when the enter key is hit. But there is already a handler for enter, so we cancel it
                if (arguments[1].keyCode != 13)
                    this.save();
            },
            scope:this,
            value: ''
        });

        me.productPickerField = Ext.create('Taco.shared.view.field.ProductPickerField', {
            plugins: [
                'inputmask'
            ],            
            width: this.gridColumns[2].width,
            flex: 1,
            style: 'padding:5px',
            fieldBodyCls: 'order-addproducttoolbar-cell',
            pageSize: me.getProductsPerPage(),
            value: '',
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl if="values && values.productName"><span class="product-name">{productName}</span> <span class="product-code">{productCode}</span></tpl>'
            ),
            liveMode: true,
            defaultFilters: [ { property: 'iscurrentlyactive', value: true } ],
            listeners: {
                focus: {
                    fn: this.onFocus,
                    scope:me
                },
                blur: {
                    fn: this.onBlur,
                    scope:me
                },
                cleartriggerfocus: {
                    fn: this.onFocus,
                    scope: me
                },
                cleartriggerblur: {
                    fn: this.onBlur,
                    scope: me
                },
                // custom event added as part of the InputMask plugin; need to cancel the event to prevent the field from reseting itself since will be reseting all fields when this field is reset;
                'beforecleartriggerclick': function (field) {
                    

                    // reset everything in the toolbar but need to be carefull
                    me.reset();

                    // cancel event to prevent the default behavior from completing;
                    return false;
                },
                'specialkey': {
                    fn: function (field, e) {                        
                        // if field doesnt have a flyout menu expanded and hits key up. pass focus to grid's last row;
                        if (!field.isExpanded && (e.getKey() == e.LEFT || e.getKey() == e.UP || (e.getKey() == e.TAB && e.shiftKey))) {

                            // this is a bug fix for Extjs 4.2.2 that isn't needed in the 4.2.3 nightly
                            field.triggerBlur();
                            field.blur(); 

                            // need to defer the execution for this because of a bug in Extjs 4.2.2; problem doesn't exist in Extjs 4.3 nightly
                            Ext.defer(function () {
                                this.fireEvent('gridfocus', field, e);
                            }, 1, this);
                        }
                    },
                    scope: me
                },
                'expand':{
                    fn: function (field, eOpts) {
                            

                    },
                    scope:this
                },
                beforeselect: {
                    fn: this.onBeforeProductSelect,
                    scope: this
                }
            }
        });


        me.fulfillmentPickerField = Ext.create('Taco.view.order.widget.FulfillmentPickerField', {
            plugins: [
                'inputmask'
            ],
            disabled: true,
            //fieldCls: 'toolbar-field',
            //allowBlank:false,
            fieldBodyCls: 'order-addproducttoolbar-cell',
            msgTarget: 'qtip',
            width: this.gridColumns[4].width,
            pageSize: me.productsPerPage,
            value: '',
            /*
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl if='values && values.fulfillmentMethod'><span class='fulfillmentmethod'>{fulfillmentMethod}</span> <span class='locationcode'>{locationCode}</span></tpl>'
            ),
            */
            maskTpl: Ext.create('Ext.XTemplate',
                '<span class="fulfillmentmethod">{fulfillmentMethod}</span> <span class="locationcode"><tpl if="values.fulfillmentMethod == \'Digital\'"> (Download)<tpl else>({locationCode})</tpl></span>'
            ),
            listeners: {                
                focus: {
                    fn: this.onFocus,
                    scope: me
                },
                blur: {
                    fn: this.onBlur,
                    scope: me
                },
                cleartriggerfocus: {
                    fn: this.onFocus,
                    scope: me
                },
                cleartriggerblur: {
                    fn: this.onBlur,
                    scope: me
                },
                // custom event added as part of the InputMask plugin;
                'clearinputmask': function (field) {
                    
                    //field.reset();
                    // clear the cached values on the toolbar;
                    me.setFulfillmentMethod('');
                    me.setLocationCode('');
                    
                    me.quantityField.disable();
                    me.addItemButton.disable();
                    
                },
                'specialkey': {
                    fn: function (field, e) {
                        // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
                        // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
                        if (e.getKey() == e.ESC) {


                            //return false;
                        }
                    },
                    scope: me
                },
                
                beforeselect: {
                    fn: function (combo, record, index, e) {
                        var fulfillmentMethod = record.get('fulfillmentMethod'),
                            locationCode = record.get('locationCode'),
                            maskTxt;
                        
                        combo.collapse();
                        
                        if (fulfillmentMethod && locationCode){                            
                            combo.inputMask.show(combo.maskTpl.apply(record.data));

                            // update the text of the combo so that the required css will be removed;
                            // not sure this is a good idea since it makes searching on the field harder if you return to it.
                            //combo.setRawValue(record.get('locationCode'));
                            
                            // save cached values on the toolbar. These are what will be persisted;
                            me.setFulfillmentMethod(record.get('fulfillmentMethod'));
                            me.setLocationCode(record.get('locationCode'));

                            // need to manually blur this field due to a bug in extjs where combo's with trigger don't blur properly;
                            combo.blur();
                            combo.triggerBlur();
                            me.quantityField.enable();
                            me.quantityField.focus();
                            me.addItemButton.enable();
                        }

                        // cancel the selection so that the same product can be reselected again;
                        return false;
                    },
                    scope: this
                }
            }
        });


        this.items = [
            this.lineField,
            this.codeField,
            this.productPickerField,
            this.statusField,
            this.fulfillmentPickerField,
            this.priceField,
            this.quantityField,
            this.addItemButton,
            {
                xtype: 'component',
                width: this.gridColumns[8].width
            }
        ];

        me.callParent(arguments);

        me.mon(me, 'render', function() {
            this.keyNav = new Ext.util.KeyNav({
                target: me.el,
                // the defaultEventAction needs to be falsy to allow for the event to propogate;it is stopped by default;
                defaultEventAction: false,
                //up: function (e) {},
                //down: function (e) {},
                //left: function (e) {},
                //right: function (e) {},
                enter: function() {
                    this.save();
                },
                //esc: this.reset,
                scope: this
            });
        }, this);
    },

    // after a product is selected and optionaly configured (if product is configurable)
    onProductSelect : function (record,productConfig){
        var me = this,            
            productCode = record.get('productCode'),
            variationProductCode = (productConfig && productConfig.VariationProductCode) ? productConfig.VariationProductCode : '',
            productCodeToAdd = variationProductCode || productCode,
            price;


        // if the product is configurable we need to use that configuration and extract the varient's product code
        if (productConfig) {
            //productCodeToAdd = productConfig.VariationProductCode || record.get('productCode');
            price = productConfig.Price || productConfig.price;
            if (Ext.isObject(price)) {
                price = price.SalePrice || price.Price;
            }
        } else {
            price = record.get('salePrice') || record.get('price');
            // need to create a product config since one wasn't passed in;
            productConfig = {
                productCode: productCode
            };
        }

        me.codeField.setValue(productCodeToAdd);
        me.quantityField.setValue(1);
        me.quantityField.enable();
        me.priceField.setValue(price);
        // cache the config object we will use to persist this new record;
        me.setProductConfiguration(productConfig);
        // need to manually blur this field;
        me.productPickerField.blur();
        me.productPickerField.triggerBlur();

        //init the fulfillment field. Need to pick the fulfillment location and determined product availability;
        this.loadFulfillmentPickerField({
            productCode : productCode,
            variationProductCode : variationProductCode
        });
    },


    // after product is selected in the productPickerfield but before the combo is closed;
    onBeforeProductSelect: function (combo, record, index, e) {
        var me = this,
        productPickerField = combo,
        productCode = record.get('productCode'),
        isConfigurable = record.get('isConfigurable'),
        price,
        win,
        productCodeToAdd;

        
        combo.collapse();

        // determine if we need to show the configurator
        if (isConfigurable) {



            win = Ext.create('Taco.view.order.modal.ProductConfigurator', {
                productCode: productCode,
                listeners: {                    
                    'aftersaveclose': {
                        fn: function (cmp, configurationData) {
                            combo.inputMask.show(record.get('productName'));
                            //combo.showInputMask(record.get('productName'));
                            this.onProductSelect(record, Ext.clone(configurationData));
                        },
                        scope:this
                    },                    
                    'afterclose': {
                        fn: function () {                            
                            //user cancelled the product configurator; Pass focus back to the product picker field
                            
                            me.productPickerField.focus();
                            
                            
                        },
                        scope: this
                    }
                }
            });

        } else {
            combo.inputMask.show(record.get('productName'));
            this.onProductSelect(record);
        }

        // cancel the selection so that the same product can be reselected again;
        return false;
    },

    // code will be productCode
    loadFulfillmentPickerField: function (config) {
        var me = this;
        // need to reset the field since it might have been set earlier;
        me.fulfillmentPickerField.reset();

        me.fulfillmentPickerField.enable();
        me.fulfillmentPickerField.setProductConfig(config);
        me.fulfillmentPickerField.store.load();        
        me.fulfillmentPickerField.expand();
        me.fulfillmentPickerField.focus(null, 10);
    },

    isValid: function () {
        var me = this;        
        return (me.getProductConfiguration() && me.getFulfillmentMethod() && me.getLocationCode() && me.quantityField.getValue());
    },

    save: function () {
        var me = this,
            productConfiguration,
            fulfillmentMethod = me.getFulfillmentMethod(),
            locationCode = me.getLocationCode(),
            quanity = me.quantityField.getValue();
        

        // check to make sure we have all the parts to add a new order item;
        if (!me.isValid()) {
            return;
        } 
        
        

        // build up the productConfiguraiton data object to send to the service;
        
        productConfiguration = me.getProductConfiguration();

        Ext.apply(productConfiguration, {
            quantity: this.quantityField.getValue(),
            fulfillmentMethod: fulfillmentMethod,
            fulfillmentLocationCode: locationCode,
            fulfillmentId: fulfillmentMethod + '(' + locationCode + ')'
        });


        me.fireEvent('save', me, Ext.clone(productConfiguration));
    },

    onSaveSuccess: function () {
        console.log('onSaveSuccess');
        me.reset();
    },

    onSaveFailure: function () {
        console.log('onSaveFailure');
        // notify user of the error;
    },

    onFocus: function (){
        var me = this;
        me.addCls(me.focusCls);
        me.fireEvent('focus');
    },

    onBlur: function () {
        var me = this;
        me.removeCls(me.focusCls);
        me.fireEvent('blur');
    },

    reset: function (config) {
        var me = this;
        
        this.setProductConfiguration(null);
        me.productPickerField.reset();
        
        
        me.fulfillmentPickerField.reset();
        me.fulfillmentPickerField.blur();
        me.fulfillmentPickerField.triggerBlur();     
        me.fulfillmentPickerField.disable();
        
        me.codeField.setValue('');

        me.quantityField.reset();
        me.quantityField.blur();
        // Note: due to extjs bug, blur on numberfield or any field with triggers isn't successful unless you call triggerBlur() as well;
        me.quantityField.triggerBlur(); 
        me.quantityField.disable();

        me.priceField.setValue('');

        me.addItemButton.disable();

        // adding a small delay to let IE/Firefox catch up
        Ext.Function.defer(function () {
            if (this.productPickerField) {
                this.productPickerField.focus();
            }
        }, 100, me);
        
    }
});




