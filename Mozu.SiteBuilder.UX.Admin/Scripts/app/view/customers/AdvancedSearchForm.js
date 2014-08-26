/**
 * @class Taco.view.product.AdvancedSearchForm
 */
Ext.define('Taco.view.customers.AdvancedSearchForm', {
        extend: 'Taco.core.ux.form.Form',
        requires: [
            'Taco.store.CustomerSegments',
            'Ext.ux.form.field.BoxSelect'
        ],

        defaults: {
            width: 450,
            xtype: 'textfield'
        },

        initComponent: function () {
            var segments,
                segmentStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');
            this.items =
            [
                {
                    name: 'keyword',
                    fieldLabel: 'Keyword Search',
                    width: 450
                },
                {
                    xtype: 'checkbox',
                    name: 'excludeAnonymous',
                    fieldLabel: 'Exclude Guest Checkouts',
                    width: 450            
                },
                {
                    xtype: 'combobox',
                    store: segmentStore,
                    name: 'segments',
                    fieldLabel: 'Segments',
                    width: 400,
                    valueField: 'id',
                    displayField: 'code',
                    queryMode: 'local',
                    valueNotFoundText: 'not found',
                    editable: true,
                    forceSelection: true
                }];

            this.callParent(arguments);
            segments = this.getForm().findField('segments'); 
        }
    }
);