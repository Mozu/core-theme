/**
 * @class Taco.core.ux.IconList
 */

Ext.define('Taco.core.ux.IconList', {
    extend: 'Ext.view.View',
    alias: 'widget.iconlist',
    cls: Taco.baseCSSPrefix + 'iconlist',
    field: null,

    itemSelector: 'taco-datalist-item',

    initComponent: function (eOpts) {
        //Ext.require([]);

        var me = this;

        me.tpl = new Ext.XTemplate(
            '<tpl for=".">',
                '<div class="taco-datalist-item">',
                    '<p>{' + me.field + '}</p>',
                '</div>',
            '</tpl>'
        );

        this.callParent(arguments);
    }
});