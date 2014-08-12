/**
 * @class  Taco.view.product.variant.Options
 * @author Travis Johnson
 * @description [description]
 */
Ext.define('Taco.view.product.variant.Options', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,

    primaryText: 'Save',
    scale: 'large',
    title: 'Child Products',

    layout: 'fit',

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
                fieldLabel: option.get('attributeName'),
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

        this.on({
            beforesave: this.onBeforeSave,
            scope: this
        });

    },

    onBeforeSave: function () {
        var options = this.product.getOptions();

        this.form.getForm().getFields().each(function (field) {
            var record = options.getById(field.option.getId());

            if (record && !field.getValue().length) {
                options.remove(record);
            } else if (!field.getValue().length) {
                return;
            }

            if (!record) {
                record = options.add({
                    attributeFQN: field.option.get('attributeFQN')
                })[0];
            }

            record.set('values', field.getValue());
        }, this);

        this.fireEvent('redooptions');
    },

    findAttributeName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));

        if (!option) return;

        return option.get('attributeName');
    },

    getOptionValues: function (attributeFQN) {
        var option = this.product.getOptions().findRecord('attributeFQN', attributeFQN);

        if (!option) return [];

        return option.get('values');
    }
});