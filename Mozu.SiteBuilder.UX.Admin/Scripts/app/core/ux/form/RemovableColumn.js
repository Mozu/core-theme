/**
* @class Taco.core.ux.form.RemovableColumn
* @author James Zetlen
* Provides a column that is removable, using a delightful little X icon.
*/

Ext.define('Taco.core.ux.form.RemovableColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.removablecolumn',
    cls: Taco.baseCSSPrefix + 'removablecolumn',

    tdCls: Taco.baseCSSPrefix + 'removablecolumn-cell',
    renderTpl: new Ext.XTemplate('<div class="' + Taco.baseCSSPrefix + '"draghandle"></div><div id="{id}-titleEl" class="x-column-header-inner"><span id="{id}-textEl" class="x-column-header-text">{text}</span><tpl if="!menuDisabled"><div id="{id}-triggerEl" class="x-column-header-trigger"></div></tpl><a href="javascript:void(0)" id="{id}-closeButtonEl" class="' + Taco.baseCSSPrefix + 'removablecolumn-delete">x</a></div>{%this.renderContainer(out,values)%}'),
    childEls: ['closeButtonEl'],

    removeEvent: 'removeoption',

    initComponent: function () {
        this.callParent(arguments);
        var me = this;
        me.addEvents(me.removeEvent);
        me.enableBubble(me.removeEvent);
        me.on({
            click: {
                element: 'closeButtonEl',
                fn: function (e) {
                    me.fireEvent(me.removeEvent, me);
                    e.preventDefault();
                }
            }
        });
    }
});