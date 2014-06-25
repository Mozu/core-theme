/**
 * @class Taco.view.productType.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.provisioning.SiteProvisionerModal', {
    extend: 'Taco.core.ux.window.Modal',
    title:'Site Provisioning',
    requires: [],
    autoShow: true,
    scale: "large",    
    initComponent: function () {
        var me = this;
        
        this.form = Ext.create('Taco.core.ux.form.Form',
            {
                defaults: {
                    xtype: 'combobox',
                    allowBlank: false,
                    width: 400
                },
               // title:'Site Provisioning',
                items: [
                    {
                        xtype: 'textfield',
                        name: 'name',
                       fieldLabel: 'Site Name'
                    },
                {
                    xtype: 'radiogroup',
                    fieldLabel: 'Storefront Site?',
                    // Arrange radio buttons into two columns, distributed vertically
                    columns: 1,
                    vertical: true,
                    items: [
                        { boxLabel: 'Storefront', name: 'isMozuStorefront', inputValue: true, checked: true },
                        { boxLabel: 'Non-Storefront', name: 'isMozuStorefront', inputValue: false }
                    ]
                },
                    {
                        xtype: 'combobox',
                        name: 'catalogId',
                        store: this.catalogStore,
                        valueField: 'id',
                        displayField: 'name',
                        fieldLabel: 'Catalog',
                        queryMode:'local'
                    },
                    
                    {
                        xtype: 'combobox',
                        name: 'localeCode',
                        store: ['en-US'],
                        value: 'en-US',
                        fieldLabel: 'Locale Code'
                    },
                    {
                        xtype: 'combobox',
                        name: 'CountryCode',
                        store: ['US'],
                        value: 'US',
                        fieldLabel: 'Country Code'
                    },
                    {
                        xtype: 'combobox',
                        name: 'CurrencyCode',
                        store: ['USD'],
                        value: 'USD',
                        fieldLabel: 'Currency Code'
                    }
                
                ]
            });
        this.items = [this.form];
        me.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            data = me.form.getValues(),
            catalogIdField = me.form.findField('catalogId'),
            catRecord = catalogIdField.findRecordByValue(catalogIdField.getValue());
        


        data.masterCatalogId = catRecord.raw.masterCatalogId;
        data.tenantId = Taco.app.context.getTenantId();
        this.saveSuccess(data);        
    }
});