/**
 * @class Taco.core.ux.action.TreeListAction
 * An action for a tree list.
 */

Ext.define('Taco.core.ux.action.TreeListAction', {
        extend: 'Ext.Component',
        alias: 'widget.treelistaction',
        icon: Ext.BLANK_IMAGE_URL,
        handler: Ext.noop,
        initComponent: function () {
            var me = this,
                cls = me.iconCls;
            me.handler = function () {
                var tl = this.findParentByType('treelist');
                tl.fireEvent.apply(tl, [me.eventName].concat(Ext.Array.slice(arguments)));
            }
            me.getClass = function () {
                return cls;
            }

            me.callParent(arguments);
        }
    });