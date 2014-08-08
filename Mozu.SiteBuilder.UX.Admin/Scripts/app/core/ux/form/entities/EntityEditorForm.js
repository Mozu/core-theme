/**
 * @class Taco.core.ux.form.ColorField
 */

Ext.define('Taco.core.ux.form.entities.EntityEditorForm', {
    extend: 'Ext.form.Panel',




    layout: {
        type: 'vbox',
        align: 'stretch'

    },

    // The fields
    defaultType: 'textfield',

  


    setData: function (data) {
        if (this.getForm()) {
            this.getForm().setValues(data);
        }
        this.data = data;
    },
    getData: function () {
        var data = this.getValues(false, false, false, true);
        return Ext.applyIf(data, this.data);
    }


});