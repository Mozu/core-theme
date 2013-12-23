/**
 * @class Taco.view.website.settings.Templates
 */

Ext.define('Taco.view.website.settings.EmailTemplate', {
    extend: 'Taco.view.website.settings.CmsBaseForm',
    requires: [
        'Ext.form.field.HtmlEditor'
    ],

    title: 'UI',
 

    initComponent: function () {
        this.items = [{
            name: 'subject',
            xtype: 'textfield',
            fieldLabel: 'Subject Line'
        }, {
            name: 'html_1',
            fieldLabel: 'Html block 1'
        }, {
            name: 'html_2',
            fieldLabel: 'Html block 2'
        }, {
            name: 'html_3',
            fieldLabel: 'Html block 3'
        }, {
            name: 'html_4',
            fieldLabel: 'Html block 4'
        }];

        this.callParent(arguments);
    }

});
