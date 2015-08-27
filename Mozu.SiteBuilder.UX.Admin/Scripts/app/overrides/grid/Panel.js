/**
 *  adds and removes a css class to the grid el when focus is passed in and out of the grid component;
 *
 */

Ext.define('Taco.overrides.grid.Panel', {
    override: 'Ext.grid.Panel',  
    
    focusinCls: "x-grid-focusin",

    initComponent : function (){
        var me = this,
            stateIdWarnings,
            columnName,
            statefulColumns

        // adding warnings for any column that doesnt have a stateId. Each column in a stateful grid should have a unique (to the grid) stateId.       
        if (me.stateful) {
            stateIdWarnings = []
            
            if (me.columns) {
                if (Ext.isArray(me.columns)) {
                    statefulColumns = me.columns;
                } else if (Ext.isObject(me.columns) && me.columns.items && Ext.isArray(me.columns.items)){
                    statefulColumns = me.columns.items;
                }
            }

            Ext.Array.each(statefulColumns, function (column) {                
                if (!column.stateId && column.xtype !== "taco.menucolumn" && column.stateful!==false) {
                    columnName = column.text || column.dataIndex || "unknown";
                    stateIdWarnings.push(columnName)
                }
            })
            if (stateIdWarnings.length) {
                console.log('Stateful grid with stateId:' + me.stateId + " is missing stateId members for columns: " + stateIdWarnings.join(","))
            }
        }
        me.callParent(arguments);
    },

    onBoxReady: function () {
        this.mon(this.body.el, 'focusin', function () {            
            this.onFocusIn();
        }, this)

        this.mon(this.body.el, 'focusout', function () {            
            this.onFocusOut();
        }, this)

        this.callParent(arguments);
    },
    onFocusIn: function () {
        this.el.addCls(this.focusinCls)
    },
    onFocusOut: function () {
        this.el.removeCls(this.focusinCls)
    }
});
