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

        values = Ext.apply(values, this.record.data, this.record.data.properties);
        this.getForm().setValues(values);
    },
    persistFormValues: function () {
        var values = this.getValues(false, false, false, true);//this.getValues();


      

        this.record.beginEdit();
        this.record.set(values);
        this.record.endEdit();

    }

});
