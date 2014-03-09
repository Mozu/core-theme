/**
 * @class Taco.view.productType.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.provisioning.CatalogProvisionerModal', {
    extend: 'Taco.core.ux.window.Modal',
    title:'Catalog Provisioning',
    requires: [],
    autoShow: true,
    itemType:'mastercatalog',
    closeAction: 'destroy',
    
    initComponent: function () {
        var me = this;
        
        this.form = Ext.create('Taco.core.ux.form.Form',
            {
                defaults: {
                    xtype: 'combobox',
                    allowBlank: false,
                    width: 400,
                    queryMode: 'local'
                },
               // title:'Site Provisioning',
                items: [
                    {
                       
                        name: 'itemType',
                        store: [
                            ["mastercatalog", 'Master Catalog', ],
                            ["catalog", 'Catalog']
                        ],
                        listeners: {
                            change: function (cType, newValue) {
                                me.form.findField('name').setFieldLabel(newValue == 'catalog' ? 'Catalog Name' : 'Master Catalog Name');
                                me.form.findField('masterCatalogId').setVisible(newValue == 'catalog');
                            }
                        },
                        scope:this,
                        value: this.itemType,
                        fieldLabel: 'Catalog Type',
                    },
                     {
                         xtype: 'combobox',
                         name: 'masterCatalogId',
                         store: this.masterCatalogStore,
                         hidden: this.itemType == 'mastercatalog',
                         valueField: 'id',
                         displayField: 'name',
                         fieldLabel: 'Master Catalog',
                         queryMode: 'local'
                     },
                    {
                        xtype: 'textfield',
                        name: 'name',
                        fieldLabel: this.itemType == 'catalog' ? 'Catalog Name' : 'Master Catalog Name'
                        
                    },
              
                    
                    {
                        xtype: 'combobox',
                        name: 'DefaultLocaleCode',
                        store: ['en-US'],
                        value: 'en-US',
                        fieldLabel: 'Locale Code',
                    },
                    //{
                    //    xtype: 'combobox',
                    //    name: 'CountryCode',
                    //    store: ['US'],
                    //    value: 'US',
                    //    fieldLabel: 'Country Code',
                    //},
                    {
                        xtype: 'combobox',
                        name: 'DefaultCurrencyCode',
                        store: ['USD'],
                        value: 'USD',
                        fieldLabel: 'Currency Code',
                    }
                
                ]
            });
        
        
        this.items = [this.form];
        me.callParent(arguments);
        
        

    },
    
    /*  public int TenantId { get; set; }

    public int MasterCatalogId { get; set; }

    public int CatalogId { get; set; }

    public string Name { get; set; }

    public string DefaultLocaleCode { get; set; }

    public string DefaultCurrencyCode { get; set; }*/



    primaryHandler: function () {
        var me = this,
            data = me.form.getValues();
            //catalogIdField = me.form.findField('catalogId'),
            //catRecord = catalogIdField.findRecordByValue(catalogIdField.getValue());
        if (this.fireEvent('beforesave', this) !== false) {
            if (data.itemType == 'mastercatalog') {
                delete data.masterCatalogId;
            }
           // data.masterCatalogId = catRecord.raw.masterCatalogId;
            data.tenantId = Taco.app.context.getTenantId();
            this.fireEvent('save', this, data);
            this.close();
        }
    },
    
});