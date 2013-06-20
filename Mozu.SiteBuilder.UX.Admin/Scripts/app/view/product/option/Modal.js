

Ext.define('Taco.view.product.option.Modal', {
    extend: 'Taco.core.ux.modal.ContentWithActions',

    autoShow: true,
    autoSize: true,
    primaryText: 'Create Child Products',
    title: 'Select Values to Create Child Products',


    initComponent: function () {
        var fields = [];

        this.productType.getOptions().each(function (option) {
            var store = Ext.create('Ext.data.Store', {
                fields: ['id', 'value'],
                data: option.get('selectedValues')
            });

            fields.push({
                xtype: 'taco.field.multiselect',
                fieldLabel: option.get('attributeName'),
                option: option,
                store: store,
                displayField: 'value',
                valueField: 'id'
            });
        }, this);

        this.form = Ext.create('Taco.core.ux.form.Form', {
            items: [{
                xtype: 'formflexbox',
                justify: false,
                items: fields
            }],
            isValid: function (a,b,c,d,e,f) {
                var ret = false;
                
                this.getForm().getFields().each(function (field) {
                    if (!field.getValue().length) return;

                    ret = true;
                    return true;
                });

                return ret;
            }
        });

        this.relayEvents(this.form, ['savablestatechange']);

        this.items = [this.form];

        this.callParent(arguments);

        this.on({
            beforesave: this.onBeforeSave,
            scope: this
        });
    },

    onBeforeSave: function () {
        var options = this.product.getOptions();

        //options.removeAll();

        this.form.getForm().getFields().each (function (field) {
            var record = options.getById(field.option.getId());

            //if (!field || !field.getValue().length) return;
            //
            
            if (record && !field.getValue().length) options.remove(record);
            else if (!field.getValue().length) return;

            if (!record) {
                record = options.add({
                    attributeFQN: field.option.get('attributeFQN')
                })[0];
            }
            //move into model... need to remove the store so that it gets rebuilt
           
            record.set('values', field.getValue());
            
            


        }, this);
    }
});