/**
 * @class Taco.view.website.settings.General
 */

Ext.define('Taco.view.website.settings.CmsBaseForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
     //   'Taco.core.ux.form.OnOffSliderButton'
    ],

    ui: 'subform',

    layout: {
        type: 'vbox'
    },
    defaults: {
        width: '95%'
    },
   
    loadRecord: function (record, cascade) {
        var values = {};
        Ext.Array.each(this.record.data.items, function (kvp) {
            
            values[kvp.key] = kvp.value;
        }, this);
        this.getForm().setValues(values);
    },
    persistFormValues: function () {
        var values = this.getValues(false, false, false, true);//this.getValues();


        Ext.Object.each(values, function (key, value) {
            if (!values[key] && !this.record.get(key)) {
                delete values[key];
            }
        }, this);


        this.record.beginEdit();
        this.record.set(values);
        this.record.endEdit();

    }

});
