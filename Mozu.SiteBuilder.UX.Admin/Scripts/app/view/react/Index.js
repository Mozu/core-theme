/**
 * @class Taco.view.error.Http500
 */
Ext.define('Taco.view.react.Index', {
    extend: 'Taco.core.ux.content.Container',
    initComponent: function () {
        var me = this;
        me.header = {
            title: false
        };
        me.body = {
            html: []
        };
        me.callParent(arguments);
    }
});
