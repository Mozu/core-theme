/**
 * @class Taco.view.discount.AdvancedSearchForm
 */
Ext.define('Taco.view.pendingChange.publishSet.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        var me = this;

        this.items = [
            {
                name: 'keyword',
                fieldLabel: 'Keyword Search',
            }, {
                name: 'name',
                fieldLabel: 'Name',
            }
        ];

            
        this.callParent(arguments);
    }
});