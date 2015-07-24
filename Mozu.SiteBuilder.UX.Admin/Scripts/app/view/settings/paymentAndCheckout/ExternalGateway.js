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
        var credFieldDefs = this.externalPayment.get('credentials');
        var gatewayType = this.externalPayment.get('name').toUpperCase();
        var credOriginalValues = [];
        var isEnabled = false;
        
        this.items = [];
        this.credFields = [];
        this.credValues = [];
        
        Ext.each(externalGateway, function (item) {
            if (gatewayType == item['name'].toUpperCase()) {
                
                credOriginalValues = item['credentials'];
                isEnabled = item['isEnabled'];
            }
        });

        this.typeCheck = Ext.widget({
            xtype: 'checkbox',
            fieldLabel: this.externalPayment.get('name'),
            checked: isEnabled,
            handler: this.onEnableChange,
            scope: this
        });
        
        
        this.credPanel = Ext.widget({
            xtype: 'panel',
            hidden: !isEnabled
        });

        Ext.Array.each(credFieldDefs, function (fieldDef) {
            var value = '';
            Ext.each(credOriginalValues, function (item) {
                if (item.apiName == fieldDef.apiName) {
                    value = item['value'];
                }
            });

            var credField = this.getCredentialFieldConfig(fieldDef, value);
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
    getCredentialFieldConfig: function (fieldDef, value) {
        if (fieldDef.inputType === 'YesNo') {
            return Ext.widget(
            {
                xtype: 'checkbox',
                fieldLabel: fieldDef.displayName,
                name: fieldDef.apiName,
                checked: value,
            });
        }

        return Ext.widget(
            {
                xtype: 'textfield',
                fieldLabel: fieldDef.displayName,
                name: fieldDef.apiName,
                inputType: 'password',
                value: value
            });

    },
    persistFormValues: function () {
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

            val['displayName'] = field.getFieldLabel();
            val['apiName'] = field.getName();
            val['value'] = field.getValue();
            creds.push(val);
        });

        if (this.typeCheck.isDirty()) {
            isDirty = true;
        }

        if (isDirty) {
            var updated = false;
            
            Ext.each(externalGateway, function (item) {
                if (gatewayType == item['name'].toUpperCase()) {
                    item['credentials'] = creds;
                    item['isEnabled'] = gatewayEnabled;
                    updated = true;
                }
            });
            
            if (!updated) {
                val = {};
                val['credentials'] = creds;
                val['isEnabled'] = gatewayEnabled;
                val['name'] = gatewayType;
                externalGateway.push(val);
            }
        }
        
        me.record.set('externalPaymentWorkflows', externalGateway);
    }
});