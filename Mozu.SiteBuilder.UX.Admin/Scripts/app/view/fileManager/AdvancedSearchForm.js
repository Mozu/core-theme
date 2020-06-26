/**
 * @class Taco.view.fileManager.AdvancedSearchForm
 */
Ext.define('Taco.view.fileManager.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.form.field.AdminUser'
    ],

    defaults: {
        width: 450,
        xtype: 'textfield'
    },
    items: [{
            name: 'keyword',
            fieldLabel: Localizer.langResources.SHARED.FileManager.AdvancedFilter.filename
    },
    {
        name:'tag',
        fieldLabel: Localizer.langResources.SHARED.FileManager.AdvancedFilter.tags
    },
        {
            xtype: 'taco-adminuserfield',
            name: 'createdBy',
            fieldLabel: Localizer.langResources.SHARED.FileManager.AdvancedFilter.created_by
        },
        {
            xtype: 'fieldcontainer',
            fieldLabel: Localizer.langResources.SHARED.FileManager.AdvancedFilter.created_range,
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [{
                    xtype: 'datefield',
                    name: 'createdFrom',
                    //                    fieldLabel: 'Modified From',
                    width: 200
                }, {
                    xtype: 'component',
                    html: Localizer.langResources.SHARED.FileManager.AdvancedFilter.to,
                    margin: '0 10'
                }, {
                    xtype: 'datefield',
                    name: 'createdTo',
                    //fieldLabel: 'Modified To',
                    width: 200
                }]
        }]
});