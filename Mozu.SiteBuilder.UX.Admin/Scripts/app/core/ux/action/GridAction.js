/**
 * @class Taco.core.ux.action.GridAction
 * An icon in the right column of a grid that causes an action on that row.
 */

Ext.define('Taco.core.ux.action.GridAction', {
    extend: 'Ext.Component',
    alias: 'widget.gridaction',
    icon: Ext.BLANK_IMAGE_URL,
    handler: Ext.noop,
    initComponent: function () {
        var me = this,
            cls = me.iconCls;
        me.handler = function () {
            var tl = this.findParentByType('basegrid');
            tl.fireEvent.apply(tl, [me.eventName].concat(Ext.Array.slice(arguments)));
        }
        me.getClass = function () {
            return cls;
        }

        me.callParent(arguments);
    }
});