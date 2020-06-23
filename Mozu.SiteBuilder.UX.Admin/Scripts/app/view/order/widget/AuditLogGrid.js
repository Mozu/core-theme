/**
 * @class Taco.view.order.widget.AuditGrid
 * This is the readonly audit log grid.
 *
 */

Ext.define('Taco.view.order.widget.AuditLogGrid', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: [
        'Taco.model.AuditLog',
        'Taco.view.order.modal.AuditLogInfo'
    ],

    modelName: 'Taco.model.AuditLog',
    // This is used later and identifies the class to use for the modal.
    modalName: 'Taco.view.order.modal.AuditLogInfo',

    enableNavHeader: false,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    // Toggle these to enable search at a later date!
    enableSearch: false,
    hideSearchToolbar: true,
    // This will enable the paging toolbar on the bottom of the grid.
    enablePaging: true,
    // No editing necessary on the audit log.
    enableRowEditing: false,
    launchEditorOnClick: false,
    enableAutoSelect: false,
    // Buttons unecessary for the audit log, it can't do anything but read.
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    // No action column at this time.
    showActionsColumn: false,

    autoScroll: true,

    // No filtering at this time.
    enableQuickFilters: false,
    advancedSearchConfig: {},

    // Is this needed?
    onCreate: Ext.emptyFn,

    // This is the order number and ID associated to this audit log grid.
    orderNumber: -1,
    orderId: -1,

    initComponent: function() {
        var me = this;

        this.store = Ext.create('Ext.data.Store',{
            model: 'Taco.model.AuditLog',
            pageSize: 15,
            remoteSort: true,
            remoteFilter: true,
            orderId: me.orderId,
            // Load the data automatically!
            autoLoad: true,
            proxy: {
                type: 'ajaxproxy',
                api: {
                    //read: '/admin/Scripts/app/mocks/auditlog.json'
                    read: '/admin/app/order/changemessages?orderId=' + this.orderId
                },
                scope: me
            },
            /*listeners: {
                'load': function (store, records, options) {
                    // TODO - right here determine how to handle the extra data. IE the data before "Create Order" event.
                    if (records[0].subject !== 'CreateOrder') {
                        var found = false;
                        var i = 1;
                        while (!found) {
                            if (records[i].subject === 'CreateOrder') {
                                found = true;
                            }
                            ++i;
                        }

                        store.data = records.slice(i);
                    }
                }
            }*/
        });

        // Get the columns for this grid!
        this.columns = me.getColumnConfig();

        me.callParent(arguments);
        
        // Change to itemClick
        me.mon(me, 'cellclick', function(grid, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            Ext.create(me.modalName, {
                orderNumber: me.orderNumber,
                autoShow: true,
                scale: 'medium',
                data: record
            });
        }, me);
    },

    // Method override from base class to configure the displayed columns.
    getColumnConfig: function () {

        var columns = [{
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.AuditLog.date,
            dataIndex: 'createDate',
            align: 'left',
            xtype: 'datecolumn',
            format: 'M d Y g:ia',
            draggable: false,
            resizable: true,
            minWidth: 180,
            sortable: false,
            menuDisabled: true
        }, {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.AuditLog.event,
            dataIndex: 'subject',
            draggable: false,
            resizable: true,
            minWidth: 100,
            flex: 1,
            sortable: false,
            menuDisabled: true
        }, {
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.AuditLog.user,
            dataIndex: 'userDisplayName',
            draggable: false,
            resizable: true,
            minWidth: 300,
            sortable: false,
            menuDisabled: true,
            renderer: function (value, meta) {
                meta.style = 'white-space: normal';
                return Ext.util.Format.htmlEncode(value);
            }
        }];

        return columns;
    },

    refreshAuditLog: function () {
        this.setLoading(true);
        var store = this.getStore();
        store.orderId = this.orderId;
        store.reload();
        this.setLoading(false);

    }
});