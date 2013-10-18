/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.paymentAndCheckout.ExternalGateway', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    cascadeChildTasks: true,
    padding: '0 0 20 0',
    header: null,

    initComponent: function () {
        this.header = null;
        var externalGateway = Ext.clone(this.record.get('externalPaymentWorkflows'));
        var credFieldDefs = this.externalPayment.get('Credentials');
        var gatewayType = this.externalPayment.get('Name').toUpperCase();
        var credOriginalValues = [];
        
        this.items = [];
        this.credFields = [];
        this.credValues = [];
        
        Ext.each(externalGateway, function (item) {
            if (gatewayType == item['Name'].toUpperCase()) {
                credOriginalValues = item['Credentials'];
            }
        });

        this.typeCheck = Ext.widget({
            xtype: 'checkbox',
            fieldLabel: this.externalPayment.get('Name'),
            checked: this.externalPayment.get('IsEnabled'),
            handler: this.onEnableChange,
            scope: this
        });
        
        
        this.credPanel = Ext.widget({
            xtype: 'panel',
            hidden: !this.externalPayment.get('IsEnabled')
        });

        Ext.Array.each(credFieldDefs, function (fieldDef) {
            var value = '';
            Ext.each(credOriginalValues, function (item) {
                if (item.APIName == fieldDef.APIName) {
                    value = item['Value'];
                }
            });
            
                credField = Ext.widget(
                {
                    xtype: 'textfield',
                    fieldLabel: fieldDef.DisplayName,
                    name: fieldDef.APIName,
                    inputType: 'password',
                    value: value
                });
            this.credFields.push(credField);
            this.credPanel.add(credField);
        }, this);
        
        this.items.push(this.typeCheck);
        this.items.push(this.credPanel);
        
        this.callParent(arguments);
    },
    initTitle: Ext.emptyFn,
    onEnableChange: function() {
        if (this.typeCheck.getRawValue()) {
            this.credPanel.show();
        }else {
            this.credPanel.hide();
        }
    },
    beforeSave: function () {
        var me = this;
        var isDirty = false, val = {}, creds = [];
        var gatewayType = this.typeCheck.fieldLabel.toUpperCase();
        var gatewayEnabled = this.typeCheck.getRawValue();
        var externalGateway = Ext.clone(me.record.get('externalPaymentWorkflows'));
        
        Ext.each(me.credFields, function (field) {
            val = {};
            if (field.isDirty()) {
                isDirty = true;
            }

            val['DisplayName'] = field.getFieldLabel();
            val['APIName'] = field.getName();
            val['Value'] = field.getValue();
            creds.push(val);
        });

        if (this.typeCheck.isDirty()) {
            isDirty = true;
        }

        if (isDirty) {
            Ext.each(externalGateway, function (item) {
                if (gatewayType == item['Name'].toUpperCase()) {
                    
                    item['Credentials'] = creds;
                    item['IsEnabled'] = gatewayEnabled;
                }
            });
        }
        
        me.record.set('externalPaymentWorkflows', externalGateway);
    }
});