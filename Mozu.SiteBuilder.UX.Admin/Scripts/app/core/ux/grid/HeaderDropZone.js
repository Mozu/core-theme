/**
 * @class Taco.core.ux.grid.HeaderDropZone
 * @author Jimmy Sanford
 * Overrides Ext.grid.header.DropZone.
 * 
 */
Ext.define('Taco.core.ux.grid.HeaderDropZone', {
    override: 'Ext.grid.header.DropZone',

    constructor: function () {
        this.callParent(arguments);
    },

    onNodeOver: function(node, dragZone, e, data) {
        var me = this,
            doPosition = true,
            from = data.header,
            to;
            
        if (data.header.el.dom === node) {
            doPosition = false;
        } else {
            to = me.getLocation(e, node).header;
            doPosition = (from.ownerCt === to.ownerCt) || (!from.ownerCt.sealed && !to.ownerCt.sealed);
        }
        
        if (doPosition) {
            me.positionIndicator(data, node, e);
        } else {
            me.valid = false;
        }

        if (Ext.fly(node).hasCls('frozen')) {
            me.valid = false;
        }

        return me.valid ? me.dropAllowed : me.dropNotAllowed;
    }
});