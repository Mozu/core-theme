/**
 * @class Taco.view.themesettings.Form
 */

Ext.define('Taco.view.themesettings.Form', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.core.ux.form.field.MultiSelect', 
        'Taco.core.ux.BoxReorderer',
        'Taco.model.ProductTypeAttribute',
        'Taco.model.ProductType',
        'Taco.view.productType.AttributeGroup',
        'Taco.core.ux.form.ColorField',
        'Taco.platter.fields.SimpleFields'
    ],
    
    title: 'Theme Settings',
    //themeInfo: {
    //    formConfig: fieldContainerCfg,
    //    themeId: id,
    //    theme: theme,
    //    settingsValues: values
    //},


    initComponent: function () {
        this.title = "Theme Settings"; //tbd get theme name
        
        Ext.apply(this, this.themeInfo.formConfig);

        Ext.Array.each(this.items, function (item) {
            Ext.apply(item, {
                ui: 'subform',                
                style: {
                    margin: '0px 0px 10px 0px'
                }
            })
        })

        this.callParent(arguments);

        this.getForm().setValues(this.themeInfo.settingsValues);

        this.loadNavItems();

    },

    addSaveTasks: function (tasks, updateRecord, saveRecord) {
        var me = this;
        tasks.add({
            fn:function (task) {
                var values = me.getForm().getValues(false, true, false, true);

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