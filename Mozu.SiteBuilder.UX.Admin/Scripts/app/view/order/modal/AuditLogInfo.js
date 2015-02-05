/**
 * @class Taco.view.order.modal.AuditInfo
 */

Ext.define('Taco.view.order.modal.AuditLogInfo', {
    extend: 'Taco.core.ux.window.Drawer',
    requires: [],
    closeAction: 'destroy',
    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'auditloginfo',
    height: '95%',
    scale: 'small',
    title: 'CHANGE ME',
    width: '95%',

    actionColumnWidth: 50,
    actions: [],

    config: {
        
    },

    resizable: {
        dynamic: false
    },

    initComponent: function (eOpts) {
        var me = this;
        
        me.callParent(arguments);
    }
});