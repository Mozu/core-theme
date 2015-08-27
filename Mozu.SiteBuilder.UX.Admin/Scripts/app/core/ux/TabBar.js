/**
 * @class Taco.core.ux.TabBar
 */

Ext.define('Taco.core.ux.TabBar', {
    override: 'Ext.tab.Bar',

    getLayout: function () {
        var me = this;
        me.layout.type = 'auto';
        return me.callSuper(arguments);
    },

    afterComponentLayout: function (width) {
        var me = this;

        me.callSuper(arguments);

        me.strip.setWidth(width);
        delete me.needsScroll;
    }
});