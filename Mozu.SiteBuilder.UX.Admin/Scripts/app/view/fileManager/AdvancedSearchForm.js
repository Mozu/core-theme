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
            fieldLabel: 'filename'
    },
    {
        name:'tag',
        fieldLabel:'tags'
    },
        {
            xtype: 'taco-adminuserfield',
            name: 'createdBy',
            fieldLabel: 'Created By'
        },
        {
            xtype: 'fieldcontainer',
            fieldLabel: 'Created Range',
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
                    html: 'to',
                    margin: '0 10'
                }, {
                    xtype: 'datefield',
                    name: 'createdTo',
                    //fieldLabel: 'Modified To',
                    width: 200
                }]
        }]
});