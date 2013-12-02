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
        this.items= 
        [{
                name: 'keyword',
                fieldLabel: 'Keyword Search'
            }, {
                name: 'productCode',
                fieldLabel: 'Product Code'
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
                forceSelection: true,
            },        
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Price Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                        xtype: 'numberfield',
                        name: 'minPrice',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'numberfield',
                        name: 'maxPrice',
                        hideTrigger: true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        width: 200
                    }]
            },
            {
                xtype: 'taco-adminuserfield',
                name: 'modifiedBy',
                fieldLabel: 'Modified By',
            },
            {
                xtype: 'fieldcontainer',
                fieldLabel: 'Modfied Range',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        //                    fieldLabel: 'Modified From',
                        width: 200
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        //fieldLabel: 'Modified To',
                        width: 200
                    }]
            }];
        
        this.callParent(arguments);
        groups = this.getForm().findField('groups');
        //
        
       
        
    }
}


);