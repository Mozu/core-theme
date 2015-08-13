/**
 * @class Taco.core.ux.mixins.GridContextMenu
 * Grid Mixin that adds context menu based on action column
 * add this to the initComponent of your grid to initilize this mixin
  
  // to include this mixin in your class:

        mixins: {
            gridcontextmenu: 'Taco.core.ux.mixins.GridContextMenu'
        },


  
    < ... code fragment ... >

        initComponent: function (){
                    
            this.callParent(arguments)

            //initialize the context menu after the this.callParent(arguments);
            this.mixins.constructor.constructor.apply(this);

        }

    < ... code fragment ... >
 *
 */

Ext.define('Taco.core.ux.mixins.GridContextMenu', {

    constructor: function () {
        this.initGridContextMenu();
    },

    //disableContextMenuClick: false,

    initGridContextMenu: function () {
        var me = this;

        // add right click menu to grid that pulls its data from the actions menuColumn;
        var menuColumns = Ext.Array.filter(me.columns, function (col) { return col.isXType && col.isXType('taco.menucolumn'); });
        if (me.disableContextMenuClick !== true && menuColumns && menuColumns.length == 1) {

            me.mon(me.view, 'itemcontextmenu', function (cmp, record, item, index, e) {
                var eventData = {
                    grid: cmp.ownerCt,
                    rowIndex: index,
                    header: menuColumns[0],
                    e: e,
                    record: record,
                    item: item
                },
                    menu = menuColumns[0].getMenu(eventData);

                menu.on('hide', function() {
                    // need to clear and reselect to get focus set after menu closes;
                    // deselect old record
                    me.getSelectionModel().deselect(record);
                    //reselect old record
                    me.getSelectionModel().select(record, false, false);
                }, me);

                e.stopEvent();
                menu.showAt(e.xy);
            }, me);
        }
    }
});