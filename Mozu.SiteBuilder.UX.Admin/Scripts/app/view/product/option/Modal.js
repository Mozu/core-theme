

Ext.define('Taco.view.product.option.Modal', {
    extend: 'Taco.core.ux.window.Modal',

    autoShow: true,

    primaryText: 'Create',
    scale: 'medium',
    title: 'Create Child Products',

    initComponent: function () {
        var fields = [];

        this.productType.getOptions().each(function (option) {
            var store,
                optionValues;

            if (this.isEdit() && option.get('attributeFQN') !== this.attributeFQN) return;

            store = Ext.create('Ext.data.Store', {
                fields: ['id', 'value'],
                data: option.get('selectedValues')
            });

            if (this.isEdit()) optionValues = this.getOptionValues();

            fields.push({
                xtype: 'taco.field.multiselect',
                fieldLabel: option.get('attributeName'),
                option: option,
                store: store,
                displayField: 'value',
                minSelections: this.isEdit() ? 1 : 0,
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
            items: fields
            // isValid: function (a,b,c,d,e,f) {
            //     var ret = false;

            //     this.getForm().getFields().each(function (field) {
            //         if (!field.getValue().length) return;

            //         ret = true;
            //         return true;
            //     });

            //     return ret;
            // }
        });

        // this.relayEvents(this.form, ['savablestatechange']);

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

            if (record && !field.getValue().length && !this.isEdit()) options.remove(record);
            else if (!field.getValue().length) return;

            if (!record) {
                record = options.add({
                    attributeFQN: field.option.get('attributeFQN')
                })[0];
            }

            record.set('values', field.getValue());
        }, this);
    },

    findAttributeName: function (record) {
        var option = this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'));

        if (!option) return;

        return option.get('attributeName');
    },

    getOptionValues: function () {
        var option = this.product.getOptions().findRecord('attributeFQN', this.attributeFQN);

        if (!option) return [];

        return option.get('values');
    },

    isEdit: function () {
        return typeof this.attributeFQN === 'string';
    }
});
