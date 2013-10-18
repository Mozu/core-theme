/**
 * The discount editor view
 */
Ext.define('Taco.view.settings.paymentAndCheckout.ExternalGateway', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    //layout: {
    //    type: 'vbox'
      
    //},
    cascadeChildTasks: true,
    padding: '0 0 20 0',
    //margin: '10,0,10,10',

    header: null,

    initComponent: function () {
        this.header = null;

        var credFieldDefs = this.externalPayment.get('Credentials');
            //credentialsSet = this.record.get('credentialsSet');
        
        this.items = [];
        this.credFields = [];
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
            var gateway = this.record.get('gateway'),
                credField = Ext.widget(
                {
                    xtype: 'textfield',
                    fieldLabel: fieldDef.DisplayName,
                    name: fieldDef.APIName,
                    inputType: 'password',
                    //value: gateway.credentialsSet && this.gatewayDefinition.getId() === gateway.gatewayDefinitionId ? '        ' : ''
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
        
        var isDirty = false, val = {};
        Ext.each(me.credFields, function (field) {
            if (field.isDirty()) {
                isDirty = true;
            }
            val[field.name] = field.getValue();
        });
        if (isDirty) {
            //debugger
            //me.record.set('credentials', val);
        }
    }
});