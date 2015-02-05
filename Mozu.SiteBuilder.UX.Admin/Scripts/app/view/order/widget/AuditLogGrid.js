/**
 * @class Taco.view.order.widget.AuditGrid
 * This is the readonly audit log grid.
 *
 */

Ext.define('Taco.view.order.widget.AuditLogGrid', {
    extend: 'Taco.core.ux.browser.SearchList',

    requires: [
        'Taco.store.AuditLog',
        'Taco.model.AuditLog',
        'Taco.view.order.modal.AuditLogInfo'
    ],

    modelName: 'Taco.model.AuditLog',

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
    
    store: { type: 'Taco.store.AuditLog' },

    autoScroll: true,

    minHeight: 500,

    // No filtering at this time.
    enableQuickFilters: false,
    advancedSearchConfig: {},

    // Is this needed?
    onCreate: Ext.emptyFn,

    initComponent: function() {
        var me = this;

        // Get the columns for this grid!
        this.columns = me.getColumnConfig();

        me.callParent(arguments);
    },

    // Method override from base class to configure the displayed columns.
    getColumnConfig: function() {
        var me = this;
        var columns = [{
            text: 'Date',
            dataIndex: 'eventDate',
            align: 'left',
            xtype: 'datecolumn',
            format: 'M d Y g:ia',
            draggable: false,
            resizable: true,
            minWidth: 180,
            //flex: 1,
            sortable: true,
            menuDisabled: true
        }, {
            text: 'Event',
            dataIndex: 'eventMsg',
            draggable: false,
            resizable: true,
            minWidth: 100,
            flex: 1,
            sortable: false,
            menuDisabled: true
        }, {
            text: 'User',
            dataIndex: 'user',
            draggable: false,
            resizable: true,
            minWidth: 300,
            //flex: 1,
            sortable: true,
            menuDisabled: true
        }];

        return columns;
    },

    refreshAuditLog: function () {
        var date = new Date();
        console.log('REFRESHING AUDIT LOG!!!' + date.toJSON());
        this.setLoading(true);
        var store = this.getStore();
        store.reload();
        this.setLoading(false);

    }
});