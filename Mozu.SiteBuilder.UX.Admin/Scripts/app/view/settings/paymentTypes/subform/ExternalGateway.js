/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.paymentTypes.subform.ExternalGateway', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    margin: "0 0 20 0",
    cascadeChildTasks: true,
    title: 'External',
    margin: "0 0 20 0",
    ui: "subform",
    width: "100%",

    initComponent: function () {
        
        this.title = this.externalPayment.get('name');

        var externalGateway = Ext.clone(this.record.get('externalPaymentWorkflows'));
        var credFieldDefs = this.externalPayment.get('credentials');
        var gatewayType = this.externalPayment.get('name').toUpperCase();
        var credOriginalValues = [];
        var description = null;
        var isEnabled = false;
        var isMultishipEnabled = this.record.get('isMultishipEnabled');
        this.fqn = this.externalPayment.get('fullyQualifiedName');
        
        this.items = [];
        this.credFields = [];
        this.credValues = [];
        
        Ext.each(externalGateway, function (item) {
            if (gatewayType == item['name'].toUpperCase()) {

                description = item['description'];
                credOriginalValues = item['credentials'];
                isEnabled = item['isEnabled'];
            }
        });

        this.typeCheck = Ext.widget({
            xtype: 'checkbox',
            boxLabel: 'Enable',
            checked: isEnabled,
            id: this.externalPayment.get('name'),
            handler: this.onEnableChange,
            scope: this
        });
     
        
        this.descriptionContainer = Ext.widget({
            xtype: 'box',
            autoEl: {
                tag: 'div',
                html: description
            }
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

            var credField = this.getCredentialFieldConfig(fieldDef, value, isMultishipEnabled);
            this.credFields.push(credField);
            this.credPanel.add(credField);
        }, this);
        
        this.items.push(this.typeCheck);
        this.items.push(this.descriptionContainer);
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
    getCredentialFieldConfig: function (fieldDef, value, isMultishipEnabled) {
        if (fieldDef.inputType === 'YesNo') {
            return Ext.widget(
            {
                xtype: 'checkbox',
                fieldLabel: fieldDef.displayName,
                name: fieldDef.apiName,
                checked: value,
            });
        }

        if (fieldDef.inputType === 'RadioButton') {

            var fqn = this.fqn;
            var radioButtonItems = [];
            Ext.each(fieldDef.vocabularyValues, function (val) {
                if (val.contents[0]) {
                    radioButtonItems.push({
                        boxLabel: val.contents[0].value,
                        name: fieldDef.apiName,
                        inputValue: val.key,
                        id: fqn + '-' + val.key,
                        checked: val.key == value,
                        disabled: (val.key == "AuthAndCaptureOnOrderPlacement" && isMultishipEnabled)
                    });
                }
            });

            var field = Ext.widget({
                xtype: 'radiogroup',
                name: fieldDef.apiName,
                fieldLabel: fieldDef.displayName,
                vertical: true,
                items: radioButtonItems
            });

            return field;
        }

        return Ext.widget(
            {
                xtype: 'textfield',
                fieldLabel: fieldDef.displayName,
                name: fieldDef.apiName,
                inputType: 'password',
                value: value,
                margin: '10,0,0,0'
                
            });

    },
    persistFormValues: function () {
        var me = this;
        var isDirty = false, val = {}, creds = [];
        var gatewayType = this.typeCheck.id.toUpperCase();
        var gatewayEnabled = this.typeCheck.getRawValue();
        var externalGateway = Ext.clone(me.record.get('externalPaymentWorkflows'));
        
        Ext.each(me.credFields, function (field) {
            val = {};
            if (field.isDirty()) {
                isDirty = true;
            }

            var fieldValue = field.getValue();

            val['displayName'] = field.getFieldLabel();
            val['apiName'] = field.getName();
            val['value'] = typeof fieldValue === 'object' ? fieldValue[Object.keys(fieldValue)[0]] : fieldValue;
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