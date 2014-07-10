/**
 * @class Taco.core.ux.form.ColorField
 */

Ext.define('Taco.core.ux.form.EntityEditorForm', {
    extend: 'Ext.form.Panel',
   



    layout: {
        type: 'vbox',
        align: 'stretch'

    },

    // The fields
    defaultType: 'textfield',
    items: [
        {
            fieldLabel: 'title',
            name: 'title',
            allowBlank: false
        }, {
            fieldLabel: 'meta_title',
            name: 'meta_title',
            allowBlank: false
        }, {
            fieldLabel: 'link_title',
            name: 'link_title',
            allowBlank: true
        }, {
            fieldLabel: 'template',
            name: 'template',
            allowBlank: true
        }
    ],


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