/**
 * @class Taco.view.order.subform.Audit
 * Shows the audit log of the order.
 * 
 */

Ext.define('Taco.view.order.subform.AuditLog', {
    extend: 'Taco.view.order.subform.Subform',

    requires: [
        'Taco.view.order.widget.AuditLogGrid'
    ],

    alias: 'widget.taco-orderaudit',

    itemId: 'orderAuditPanel',

    title: Localizer.langResources.ORDERS.Orders.OrderEdit.AuditLog.title,

    bodyPadding: '0 0 0 0',

    config: {
        record: null,
        editMode: false,
        itemId: 'orderAudit'
    },

    orderNumber: -1,
    orderId: -1,

    layout: { type: 'fit' },
    height: 500,

    // this should really be the default;
    closeAction: 'destroy',

    initComponent: function (eOpts) {
        //activate is not called when using the new scroll spy. see 75652
        //this.mon(this, {
        //    'activate': this.initUI,
        //    'deactivate': this.destroyUI
        //}, this);

        this.initUI();
        this.callParent(arguments);
    },

    // create the UI.
    initUI: function () {
        var me = this;
        me.mon(me.record, 'aftercommit', function () {
            me.onRecordChange();
        });

        if (me.record) {
            me.orderNumber = me.record.get('orderNumber');
            me.orderId = me.record.get('id');
        }

        me.auditLogGrid = Ext.create('Taco.view.order.widget.AuditLogGrid', {
            orderNumber: me.orderNumber,
            orderId: me.orderId
        });

        this.items = [me.auditLogGrid];
    },

    // Destroy the UI
    destroyUI: function () {
        this.removeAll();
        this.auditLogGrid = null;
    },

    // when the record changes we will need to update the order details
    onRecordChange: function () {
        var me = this;
        Ext.suspendLayouts();
        // need to reload the record;
        //me.updateUi();
        Ext.resumeLayouts(true);
        me.setLoading(false, this.body);
    },

    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
