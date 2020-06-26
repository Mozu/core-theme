
/**
 * @class  Taco.view.product.variants.Modal
 * @author Travis Johnson
 * @description Variants modal containing the variant grid
 */
Ext.define('Taco.view.product.variant.Modal', {
    extend: 'Taco.core.ux.window.Drawer',
    requires: [
        'Taco.view.product.variant.Grid',
        'Taco.view.product.variant.Options'
    ],

    primaryText: Localizer.langResources.SHARED.save,
    closeAction :'destroy',
    closeOnSave: true,

    pricingMode: 'Delta',
    pricingModeChanged: false,

    itemId: 'variantionModal',

    scale: 'large',
    title: Localizer.langResources.CATALOG.Products.ProductEdit.edit_variants,

    resizable: true,
    layout: 'fit',
    height: '95%',
    width: '95%',

    autoShow: true,

    actions: [{
        xtype: 'button',
        text: Localizer.langResources.CATALOG.Products.ProductEdit.update_options,
        ui: 'action',
        scale: 'large',
        handler: function() {
            this.updateOptions.apply(this, arguments);
        }
    }, {
        xtype: 'tbfill'
    }, {
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction',
        formBind: true
    }],

    initComponent: function () {
        var me = this;

        me.initOptionsData();
        
        this.variationGrid = Ext.create('Taco.view.product.variant.Grid', {            
            product: this.product,
            optionsData: me.optionsData,
            productType: this.productType,
            pricingMode: me.pricingMode,
            pricingModeChanged: me.pricingModeChanged,
            stateId: me.pricingMode === 'Fixed' ? 'statefulProductOptionsGridFixed' : 'statefulProductOptionsGrid' 
        });


        this.mon(me.variationGrid, 'savesuccess', function () {
            me.saveSuccess();
        }, me)
        

        this.form = Ext.create('Taco.core.ux.form.Form', {
            items: [ this.variationGrid ]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    initOptionsData : function (){
        var me = this,
            optionsStore = me.product.getOptions();
        
        me.optionsData = new Ext.util.MixedCollection();

        // saturate the options mixed collection;
        optionsStore.each(function (record) {
            me.optionsData.add(record.get("attributeFQN"), Ext.clone(record.data));
        });        
    },

    //getOptions: function () {
    //    var me = this,
    //        optionsStore = me.product.getOptions(),
    //        optionsData = [];

    //    if (me.optionsData) {
    //        me.optionsData = optionsData;
    //        return me.optionsData;
    //    }

    //    optionsStore.each(function (option) {
    //        optionsData.push({
    //            data: Ext.clone(option.data)
    //        });
    //    });

    //    return optionsData;
    //},

    updateOptions: function () {
        
        var me = this;

        Ext.create('Taco.view.product.variant.Options', {
            product: this.product,
            productType: this.productType,
            optionsData: me.optionsData,
            listeners: {
                aftersaveclose: this.onOptionChange,      
                scope: this
            }
        })
    },

    onOptionChange: function (view, optionsData) {
        
        var me = this;


        me.optionsData = Ext.clone(optionsData)
        // cache the updated options and get the grid to update with new options

        // update the options cache and reload the variations store;

        this.variationGrid.onOptionChange(me.optionsData);

      
    },

    onSaveSuccess : function (){
        
        
        //this.close();
    },

    doOptionStoreUpdate: function (){
        var me = this;
        var optionsStore = me.product.getOptions();
      
        // clear out the options store();
        optionsStore.removeAll();
        
        me.optionsData.each(function (item) {            
            // don't add any options that lack values;
            if (item.values.length) {
                var record = optionsStore.add({
                    attributeFQN: item.attributeFQN,
                    isProductImageGroupSelector: item.isProductImageGroupSelector || false  
                })[0];

                // must set the values after create to dirty the record
                record.set("values", item.values)
            }
            
        })
        optionsStore.fireEvent('valuesSetComplete');
    },

    isValid: function () {
        var me = this,
        needsPrompt = me.variationGrid.modifiedRecords.findBy(function (record) {            
            return (!record.exists && !record.isActive)
        });

        if (needsPrompt) {
            var msg = Localizer.langResources.CATALOG.Products.ProductEdit.variation_msg1 + "<br/>" + Localizer.langResources.CATALOG.Products.ProductEdit.variation_msg2 + "<br/>" + Localizer.langResources.CATALOG.Products.ProductEdit.variation_msg3;

            Ext.MessageBox.show({
                title: Localizer.langResources.CATALOG.Products.ProductEdit.enable_variations,
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: msg,
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {
                        // force new variations with data to be enabled;
                        me.enableDirtyRecords();
                        // attempt the save again;
                        me.doSave(true);
                    } else if (val === 'no') {
                        //going to loose any dirty disabled records that were not previously enabled;
                        me.doSave(true);
                    }
                }
            });

            return false;
        } else {
            return true;
        }
    },

    enableDirtyRecords: function () {
        
        var me = this;

        // enable reccords that dont' already exist and are disabled and have data;;
        me.variationGrid.modifiedRecords.each(function (record) {
            if (!record.exists && !record.isActive1) {
                record.isActive = true;
            }
        })
        
    },

    // grid does the work updating the variations and options.
    doSave: function (disableDirtyRecordCheck) {
        var me = this;

        // need to validate that any variant records that are new and have changes are enabled. prompt user to enable these;
        if (!disableDirtyRecordCheck && !me.isValid()) {
            return 
        }

        // need to update the options store on the product with the latest versions;
        me.doOptionStoreUpdate();

        
        // need to wait for the grid to finish its snerst and it will fire the savesuccess event; and call me.saveSuccess();
        me.variationGrid.doSave();
 
    }
});