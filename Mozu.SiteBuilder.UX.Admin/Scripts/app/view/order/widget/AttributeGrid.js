/**
 * @class Taco.view.order.widget.AttributeGrid
 * This is the readonly grid of attributes.
 *
 */

Ext.define('Taco.view.order.widget.AttributeGrid', {
    extend: 'Taco.core.ux.browser.SearchList',

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
        
    // No filtering at this time.
    enableQuickFilters: false,
    advancedSearchConfig: {},

    autoHidePagingToolbar:true,

    deferEmptyText: false,
    emptyText:"None available",

    initComponent: function() {
        var me = this;
        if (!me.store) {
            throw "store is required"
        }        
        me.callParent(arguments);
    },

    // Method override from base class to configure the displayed columns.
    getColumnConfig: function () {
        var me = this;

        var columns = [{
            dataIndex: 'adminName',
            text: 'Name',
            flex: 2
        }, {
            dataIndex: 'values',
            text: 'Value',
            flex: 3,
            renderer: function (value, meta, record, index) {
                var att = Ext.Array.findBy(me.record.get('attributes'), function (attribute) {
                    return (attribute.fullyQualifiedName || '').toLowerCase() === (record.get('id') || '').toLowerCase();
                });

                return (att && !Ext.isEmpty(att.values) ? att.values.join(', ').replace(/\n/g, '<br>') : '--');
            }
        }]    

        return columns;
    }
});