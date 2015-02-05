/**
 * @class  Taco.view.product.variant.Options
 * @author Travis Johnson
 * @description [description]
 */
Ext.define('Taco.view.product.variant.Options', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,
    closeAction: 'destroy',

    primaryText: 'Save',
    scale: 'large',
    title: 'Child Products',

    layout: 'fit',

    // this option determines whether the updated options are pushed into the product options store when the save button is pressed. The alternative is to pull the options from the savesuccess event. This allow for the ui component that calls this dialog to take ownership of updating the product options store. This allows the action to be cancelled. IE. the vairations modal can cancel the change to the options.
    updateOptionsStore: false,


    initComponent: function () {
        var fields = [];
        
        this.productType.getOptions().each(function (option) {
            var store,
                optionValues;

            store = Ext.create('Ext.data.Store', {
                fields: ['id', 'value'],
                data: option.get('selectedValues')
            });

            optionValues = this.getOptionValues(option.get('attributeFQN'));

            fields.push({
                xtype: 'taco.field.multiselect',
                height: 450,
                fieldLabel: option.get('adminName'),
                option: option,
                store: store,
                displayField: 'value',
                minSelections: 0,
                valueField: 'id',
                value: optionValues
            });

        }, this);

        this.form = Ext.create('Taco.core.ux.form.Form', {
            requireDirty: true,
            layout: {
                type: 'hbox',
                defaultMargins: '0 10 0 0'
            },
            overflowX: 'auto',
      
            items: fields
        });

        this.items = [this.form];

        this.callParent(arguments);



    },



    doSave: function () {
        var me = this;

        // the options store on the product. changes to these records will dirty the product model and will not be cancellable;
        var options = this.product.getOptions();
                
        //options.each(function (record) {
        //    me.optionsData.add(record.data.internalId, record.data)
        //})
        
        this.form.getForm().getFields().each(function (field) {
            var attributeFQN = field.option.get('attributeFQN')

            
            var optionDataItem = me.optionsData.getByKey(attributeFQN);
            //update the non store version;
            // need to see if there is a value change; this will always be the case si
            if (!field.isDirty()) {
                return;
            }

            //if (optionDataItem) {AAAAAAAAAAAAAAAA
            //    optionsData.remove(optionDataItem);
            //}

            // user enabled a new option attribute
            if (!optionDataItem) {
                optionDataItem = me.optionsData.add(attributeFQN, {
                    attributeFQN: attributeFQN                    
                })
            }

            optionDataItem.values = field.getValue();

            // update the store version;
            if (me.updateOptionsStore) {
                var record = options.getByID(attributeFQN);

                if (record) {
                    options.remove(record);
                }

                record = options.add({
                    attributeFQN: attributeFQN
                })[0];

                record.set('values', field.getValue());
            }



        }, this);


        
        
        this.saveSuccess(me.optionsData);

    },

    findAttributeAdminName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'), 0, false, false, true);

        if (!option) return;

        return option.get('adminName');
    },

    getOptionValues: function (attributeFQN) {
        var me = this;

        //        var option = this.product.getOptions().findRecord('attributeFQN', attributeFQN, 0, false, false, true);

        var option = me.optionsData.getByKey(attributeFQN);

        if (!option) return [];

        return option.values;
    }
});