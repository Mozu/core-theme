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

    title: 'Audit Log',

    bodyPadding: '0 0 0 0',

    config: {
        record: null,
        editMode: false,
        totalColumnWidth: 100,
        rowTotalColumnWidth: 100,
        itemId: 'orderAudit'
    },

    orderNumber: -1,
    orderId: -1,

    // width of the actionColumn. used to align the grid total container
    actionColumnWidth: 30,

    initComponent: function (eOpts) {
        var me = this;

        me.mon(me.record, 'aftercommit', function () {
            me.onRecordChange();
        });

        if (me.record) {
            me.orderNumber = me.record.get('orderNumber');
            me.orderId = me.record.get('id');
        }

        me.auditLogGrid = Ext.create('Taco.view.order.widget.AuditLogGrid', {
            //store: auditLogStore
            orderNumber: me.orderNumber,
            orderId: me.orderId,
            flex: 1
        });
        
        Ext.apply(this, {
            items: [

                this.auditLogGrid

            ]
        });

        this.callParent(arguments);
    },

    // when the record changes we will need to update the order details
    onRecordChange: function () {
        var me = this;
        Ext.suspendLayouts();
        // need to reload the record;
        //me.updateUi();
        Ext.resumeLayouts(true);
        me.setLoading(false, this.body);
    }
});
