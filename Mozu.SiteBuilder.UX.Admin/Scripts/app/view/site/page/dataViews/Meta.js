/**
 * @class Taco.view.site.page.dataViews.Meta
 */
Ext.define('Taco.view.site.page.dataViews.Meta', {
    extend: 'Taco.core.ux.form.Form',
    requires: ['Taco.core.ux.CategoryComboBox', 'Taco.core.ux.form.SlugField', 'Taco.core.ux.form.SelectField', 'Taco.core.ux.action.DirtyButton'],



    defaults: {
        xtype: 'textfield',
        labelAlign: 'top',
        labelSeparator: '',
        width: 544
    },
    items: [
        {
            fieldLabel: 'Meta Title',
            name: 'meta_title'

        },
        {
            fieldLabel: 'Meta Description',
            name: 'meta_description'

        }],
    loadEditor: function () {
        var items = this.record.get('items');
        Ext.each(items, function (item) { item.id = item.key });

        this.getForm().setValues(items);
        this.callParent(arguments);
    },

    update: function () {
        this.callParent(arguments);
        var form = this.getForm(),
            vals = form.getValues(),
            record = this.getRecord(),
            fieldNames = record.fields.keys;
        Ext.Object.each(vals, function (key, val) {
            if (fieldNames.indexOf(key) == -1) {
                record.setItem(key, val);
            } else {
                record.set(key, val);
            }

        });
        

    }
   });