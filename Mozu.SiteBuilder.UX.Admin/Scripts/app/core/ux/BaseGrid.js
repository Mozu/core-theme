/**
* @class Taco.core.ux.BaseGrid
* @author Jimmy Sanford
* The grid panel base class
*/


Ext.define('Taco.core.ux.BaseGrid', {
    extend: 'Ext.grid.Panel',
    requires: ['Ext.grid.column.Action', 'Taco.core.ux.action.GridAction'],
    alias: 'widget.basegrid',
    cls: 'taco-basegrid',
    enableColumnHide: false,
    rowLines: false,
    paging: null,

    initComponent: function () {
        var me = this;

        if (this.actions) {

            this.actions = this.actions.map(function (actionConf) {
                return Ext.create('Taco.core.ux.action.GridAction', actionConf);
            });
            this.columns = Ext.Array.clone(this.columns);
            this.columns.push({
                xtype: 'actioncolumn',
                cls: 'taco-actions-column taco-frozen',
                items: this.actions,
                width: this.actions.length * 48,
                draggable: false,
                sortable: false,
                resizable: false,
                hideable: false
            });
        }

        if (this.enableColumnHide) {
            this.columns.push({
                xtype: 'gridcolumn',
                cls: 'taco-controls-column taco-frozen',
                draggable: false,
                sortable: false,
                resizable: false,
                hideable: false,
                width: 32
            });
        }
        if (this.hiddenColumns) {
            Ext.Array.each(this.columns, function (col) {
                col.hidden = this.hiddenColumns.indexOf(col.dataIndex) > -1;
            }, this);
        }

        // paging configuration
        // 'infinite' for infinite scrolling; 'discrete' for toolbar with numeric paging
        if (me.paging === 'infinite') {
            me.verticalScrollerType = 'paginggridscroller';
            me.disableSelection = true;
            me.invalidateScrollerOnRefresh = false;
        }
        else if (me.paging === 'discrete') {
            me.dockedItems = me.dockedItems || [];
            //                me.dockedItems.unshift({
            //                    xtype: 'pagingtoolbar',
            //                    dock: 'bottom',
            //                    store: me.store,
            //                    displayInfo: true
            //                });
            me.dockedItems.unshift({
                xtype: 'toolbar',
                dock: 'bottom',
                store: me.store,
                items: {
                    xtype: 'component',
                    html: '<div>Page 1</div>'
                }
            });
        }

        this.callParent(arguments);
    },

    getActionEvents: function () {
        return Ext.Array.pluck(this.actions, 'eventName');
    }

});

    // Override Ext.grid.header.Container (xtype: headercontainer)
    // HeaderContainer drives resizing, moving, and hiding of table columns
    //
    // Normally column checkboxes are at the trigger menu's second level
    // Here we move them to the first level (and ignore/remove all other first-level children)
    // Ext.define('Ext.grid.header.ContainerOverride', {
    //     override: 'Ext.grid.header.Container',
    //     constructor: function () {
    //         var me = this;
    //         me.callParent(arguments);

    //         me.getMenuItems = function () {
    //             var me = this,
    //             menuItems = me.enableColumnHide ? me.getColumnMenu(me) : [];

    //             return menuItems;
    //         }

    //         me.getMenu = function () {
    //             var me = this;

    //             if (!me.menu) {
    //                 me.menu = new Ext.menu.Menu({
    //                     hideOnParentHide: false,
    //                     title: "Customize Columns",
    //                     minWidth: 150,
    //                     shadow: false,
    //                     showSeparator: false,
    //                     items: me.getMenuItems(),
    //                     listeners: {
    //                         deactivate: me.onMenuDeactivate,
    //                         scope: me
    //                     }
    //                 });
    //                 me.updateMenuDisabledState();
    //                 me.fireEvent('menucreate', me, me.menu);
    //             }
    //             return me.menu;
    //         }
    //     }
    // });

    // Ext.define('Ext.grid.header.DropZoneOverride', {
    //     override: 'Ext.grid.header.DropZone',
    //     constructor: function () {
    //         var me = this;
    //         me.callParent(arguments);

    //         me.onNodeOver = function (node, dragZone, e, data) {
    //             var me = this,
    //                     header = me.headerCt,
    //                     doPosition = true,
    //                     from = data.header,
    //                     to;

    //             if (data.header.el.dom === node) {
    //                 doPosition = false;
    //             } else {
    //                 to = me.getLocation(e, node).header;
    //                 doPosition = (from.ownerCt === to.ownerCt) || (!from.ownerCt.sealed && !to.ownerCt.sealed);
    //             }

    //             if (doPosition) {
    //                 me.positionIndicator(data.header, node, e);
    //             } else {
    //                 me.valid = false;
    //             }

    //             if (Ext.fly(node).hasCls('taco-frozen')) {
    //                 me.valid = false;
    //             }
    //             return me.valid ? me.dropAllowed : me.dropNotAllowed;
    //         }
    //     }
    // });
