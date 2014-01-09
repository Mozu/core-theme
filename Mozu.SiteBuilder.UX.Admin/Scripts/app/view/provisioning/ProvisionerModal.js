/**
 * @class Taco.view.productType.Index
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.provisioning.ProvisionerModal', {
    extend: 'Taco.core.ux.window.Modal',
    title:'Site Provisioning',
    requires: ['Taco.model.ProductType'],
    autoShow: true,
    closeAction : 'destroy',
    initComponent: function () {
        var me = this,
            masterCatalogs = Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data: Taco.app.context.masterCatalogs
        });
        
        this.form = Ext.create('Taco.core.ux.form.Form',
            {
               // title:'Site Provisioning',
                items: [
                    {
                        xtype: 'combobox',
                        name: 'masterCatalogId',
                        allowBlank: false,
                        store: masterCatalogs,
                        valueField: 'id',
                        displayField: 'name',
                        fieldLabel: 'Master Catalog',
                        width:400
                    },
                    {
                        xtype: 'textfield',
                        name: 'siteName',
                        allowBlank: false,
                        
                        fieldLabel: 'Site Name',
                        width: 400
                    }
                ]
            });
        this.items = [this.form];
        me.callParent(arguments);
    },
    primaryHandler: function () {
        var me = this,
            button = me.down('#primaryAction'),
            data = me.form.getValues();
        if (this.fireEvent('beforesave', this) !== false) {
            
            this.setLoading({
                msg: "Provisioning",
                msgCls: "my-load-css-class"

            });
            Ext.Ajax.request(
                       {
                           url: '/admin/app/provisioning/provision',
                           method: 'POST',
                          
                           jsonData: data,
                           success: function (response) {
                               me.setLoading(false);
                               if (response.responseText == "true") {
                                   window.location.href = "/admin";
                                   me.close();
                                   me.fireEvent('save', this);
                                  
                               } else {
                                   console.log(response.responseText);
                                   Taco.app.fireEvent('setmessage', 'Error Provisioning Site', 'error');
                               }

                           },
                           failure: function (response) {
                               me.setLoading(false);
                               console.log(response);
                               Taco.app.fireEvent('setmessage', 'Error Provisioning Site', 'error');
                           }
                       }
                   );
            
           
        }
    },
    
});