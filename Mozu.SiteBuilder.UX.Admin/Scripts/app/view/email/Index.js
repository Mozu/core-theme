/**
 * @class Taco.view.email.Index
 */
Ext.define('Taco.view.email.Index', {
    extend: 'Taco.core.ux.content.Container',

    requiresContextOfType: 's',
    requires: ['Ext.form.Panel', 'Taco.core.ux.BaseGrid', 'Ext.tip.QuickTipManager', 'Taco.core.ux.TextFilter', 'Taco.core.ux.FilterableDataView', 'Taco.core.ux.modal.Confirmation', 'Taco.core.ux.browser.ItemBrowser'],
    mixins: {
        protectable: 'Taco.core.util.Protectable'
    },
    header : {
        title: 'Email Settings'
    },
    body: {
        layout: {
            type:'vbox',
            align:'stretch'
        },
        items: [{
            xtype: 'form',
            
            defaults: {
                width: 600,
                xtype: 'textfield',
                allowBlank: false
            },
            items: [{
                name: 'senderEmailName',  
                fieldLabel: 'Name'
             }, {
                name: 'senderEmail',
                fieldLabel: 'Email Address',
                vtype: 'email'  // requires value to be a valid email address format
            }]
           },
            {
                xtype: 'basegrid',
                itemId: 'emailTemplateGrid',
                columns: [
                    { text: 'name', dataIndex: 'name', width:300},
                    { text: '', dataIndex: 'description', flex: 1 }
                ],
                listeners: {
                    itemclick: function (view, record) {
                        Taco.core.StateManager.attemptNavigate('/email/edit/' + record.get('emailId'));
                    }
                }
                    
            }
        ]
    },
    initComponent: function () {

        var me = this;
        this.callParent(arguments);
        this.store = Ext.create('Ext.data.ArrayStore', {
            
            fields: ['name','description','emailId'],
            data: [
                ['Order Status', 'Sent to the customer when the order is statused','orderstatus'],
                ['Reset Password', 'Sent to the customer when a password reset is made', 'resetpassword'],
                ['Order Conﬁrmation', 'Sent to the customer when a payment type change has been made', 'orderstatus'],
                ['Shipping Conﬁrmation', 'Sent to the customer when the shipping address for their order has been updated', 'orderstatus'],
                ['Tracking Information Added', 'Sent to the customer when tracking information for an order shipment has been added', 'orderstatus']
            ]
        });

        this.emailTemplateGrid = this.down('#emailTemplateGrid');
        this.emailTemplateGrid.getView().bindStore(this.store);
        this.form = this.down('form');
        this.form.loadRecord(this.record);

        this.form.getForm().getFields().each(function (field) { field.on('blur', me.onFieldChange, me); });
        
        
    },
    onFieldChange:function(field){
        if ( field.isValid() && this.record.get(field.name) != field.getValue()) {
            this.record.set(field.name, field.getValue());
            this.record.save();
        }
    }
});
