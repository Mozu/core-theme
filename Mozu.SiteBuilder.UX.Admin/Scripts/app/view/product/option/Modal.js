

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
                store: store,
                displayField: 'value',
                valueField: 'id',
                minSelections: 1
            });
        });

        this.form = Ext.create('Taco.core.ux.form.Form', {
            items: [{
                xtype: 'formflexbox',
                justify: false,
                items: fields
            }]
        });

        this.relayEvents(this.form, ['savablestatechange']);

        this.items = [this.form];

        this.callParent(arguments);
    }
});