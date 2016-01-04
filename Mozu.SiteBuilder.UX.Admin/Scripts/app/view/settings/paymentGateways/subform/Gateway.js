/**
 * @class Taco.view.settings.paymentGateways.subform.Gateway
 */
Ext.define('Taco.view.settings.paymentGateways.subform.Gateway', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],

    cascadeChildTasks: true,
    padding: '0 0 20 0',

    header: null,

    initComponent: function () {
        var me = this;

        me.header = null;
        var credFieldDefs = me.gatewayDefinition.get('credentialDefinitions'),
            name = me.record.get('name')
        ;

        me.items = [];

        var settingName = Ext.widget(
                {
                    xtype: 'textfield',
                    fieldLabel: 'Nickname',
                    name: 'name',
                    value: name,
                    inputType: 'text'
                });
        me.items.push(settingName);

        me.credFields = [];
        Ext.Array.each(credFieldDefs, function (fieldDef) {
            var credField = Ext.widget(
                {
                    xtype: 'textfield',
                    fieldLabel: fieldDef.displayName,
                    name: fieldDef.name,
                    inputType: 'password',
                    value: me.gatewayDefinition.getId() === me.record.get('gatewayDefinitionId') ? '        ' : ''
                });
            me.credFields.push(credField);

            me.items.push(credField);
        }, this);
        
        me.items.push(me.credFields);

        me.callParent(arguments);
    },
    initTitle: Ext.emptyFn,
    
    persistFormValues:function() {
        var me = this;
        var hasCredentialsChanged = false, val = {};

        Ext.each(me.credFields, function (field) {
            if (field.isDirty()) {
                hasCredentialsChanged = true;
            }
            val[field.name] = field.getValue();
        });
        
        me.record.set('credentialsSet', hasCredentialsChanged);
        me.record.set('credentials', val);
        me.record.set('gatewayDefinitionId', this.gatewayDefinition.get('id'));

    }
    
});