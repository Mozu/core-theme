/**
 * @class Taco.view.attribute.ConfirmDisableMappingAttribute
 */

Ext.define('Taco.view.attribute.ConfirmDisableMappingAttribute', {
    extend: 'Taco.core.ux.window.Modal',
 
    autoShow: true,
    closeAction: 'destroy',
    scale: "",
    maxWidth: 800,
    layout: {
        type: 'fit'
    },

    //customize
    title: 'Confirm',
    confirmMessage: 'Are you sure you want to disable this mapping attribute?',
    primaryText: 'OK',
    onCancelDisable: Ext.emptyFn,
    record: null,
    
    initComponent: function() {
        var me = this;
            
        me.items = [
            {
                xtype: 'container',
                items: [
                    {
                        xtype: 'label',
                        text: me.confirmMessage,
                        margin: '10 0 0 0'
                    }
                ]
            }
        ];

        me.callParent(arguments);
    },

    doSave: function () {
        this.saveSuccess();
    },

     secondaryHandler: function () {
        this.onCancelDisable(this);
        this.close();
    },
});
