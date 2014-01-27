/**
 * @class Taco.view.product.AdvancedSearchForm
 */
Ext.define('Taco.view.customers.AdvancedSearchForm', {
        extend: 'Taco.core.ux.form.Form',
        requires: [
            'Taco.store.CustomerGroupNames',
            'Ext.ux.form.field.BoxSelect',
        ],

        defaults: {
            width: 450,
            xtype: 'textfield'
        },

        initComponent: function () {
            var groups,
                groupStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerGroupNames');
            this.items =
            [
                {
                    name: 'keyword',
                    fieldLabel: 'Keyword Search',
                    width: 450,
                },
                {
                    xtype: 'checkbox',
                    name: 'showAnonymous',
                    fieldLabel: 'Include Anonymouse Checkouts',
                    width: 450,             
                },
                {
                    xtype: 'combobox',
                    store: groupStore,
                    name: 'groups',
                    fieldLabel: 'Groups',
                    width: 400,
                    valueField: 'Value',
                    displayField: 'Value',
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: true,
                    forceSelection: true
                }];

            this.callParent(arguments);
            groups = this.getForm().findField('groups');
            //
        
       
        
        }
    }
);