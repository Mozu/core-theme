/**
 * @class Taco.view.themesettings.Form
 */

Ext.define('Taco.view.themesettings.Form', {
    extend: 'Taco.core.ux.form.Form',
    mixins: {
        navigable: 'Taco.core.ux.mixins.Navigable'
    },

    requires: [
        'Taco.core.ux.form.field.MultiSelect', 
        'Taco.core.ux.BoxReorderer',
        'Taco.model.ProductTypeAttribute',
        'Taco.model.ProductType',
        'Taco.view.productType.AttributeGroup'
    ],

    defaults: {
        ui: 'subform',
        //flex: 1,
        style: {
            margin:'10px'
        }

    },

    title: 'Theme Settings',
    //themeInfo: {
    //    formConfig: fieldContainerCfg,
    //    themeId: id,
    //    theme: theme,
    //    settingsValues: values
    //},

    constructor: function () {
        this.callParent(arguments);

        this.mixins.navigable.constructor.call(this);
    },

    initComponent: function () {
        this.title = "Theme Settings"; //tbd get theme name

        Ext.apply(this, this.themeInfo.formConfig);

        console.log('items', this.items);

        this.callParent(arguments);

        this.getForm().setValues(this.themeInfo.settingsValues);
    },

    addSaveTasks: function (tasks, updateRecord, saveRecord) {
        var me = this;
        tasks.add({
            fn:function (task) {
               var values = me.getForm().getValues();

                Ext.Object.each(values, function (key, value, object) {
                    if (Ext.isEmpty(value)) {
                        delete values[key];
                    }
                });


                Ext.Ajax.request({
 
                    url: '/admin/app/themesetting/instance/save/' + me.themeInfo.themeId,
                    method: "POST",
                    jsonData: values,
                    success: Ext.emptyFn,
                    callback: function (options, success, response) {
                        task.callback();
                    },
                    failure: function (response) {
                        var r = Ext.JSON.decode(response.responseText);
                        task.hadError = true;
                        Taco.app.fireEvent('setmessage', 'Error saving settings.', 'error', r.message);
                    }
                });
            }

        });
    }
});