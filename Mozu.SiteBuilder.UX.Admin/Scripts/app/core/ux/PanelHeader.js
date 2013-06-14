/**
 * @class Taco.core.ux.PanelHeader
 * @author Jimmy Sanford
 * Overrides Ext.panel.Panel.
 */

Ext.define('Taco.core.ux.PanelHeader', {
    override: 'Ext.panel.Header',

    constructor: function () {
        this.callParent(arguments);
    },

    initComponent: function () {
        var me = this;

        me.addEvents(
            /**
             * @event click
             * Fires when the header is clicked. This event will not be fired 
             * if the click was on a {@link Ext.panel.Tool}
             * @param {Ext.panel.Header} this
             * @param {Ext.EventObject} e
             */
            'click',

            /**
             * @event dblclick
             * Fires when the header is double clicked. This event will not 
             * be fired if the click was on a {@link Ext.panel.Tool}
             * @param {Ext.panel.Header} this
             * @param {Ext.EventObject} e
             */
            'dblclick'
        );

        me.indicateDragCls = me.baseCls + '-draggable';
        me.title = me.title || '&#160;';
        me.tools = me.tools || [];
        me.items = me.items || [];
        me.orientation = me.orientation || 'horizontal';
        me.dock = (me.dock) ? me.dock : (me.orientation == 'horizontal') ? 'top' : 'left';

        //add the dock as a ui
        //this is so we support top/right/left/bottom headers
        me.addClsWithUI([me.orientation, me.dock]);

        if (me.indicateDrag) {
            me.addCls(me.indicateDragCls);
        }

        // Add Icon
        if (!Ext.isEmpty(me.iconCls) || !Ext.isEmpty(me.icon)) {
            me.initIconCmp();
            me.items.push(me.iconCmp);
        }

        // Add Title
        me.titleCmp = new Ext.Component({
            ariaRole: 'heading',
            focusable: false,
            noWrap: true,
            flex: 1,
            id: me.id + '_hd',
            style: 'text-align:' + me.titleAlign,
            cls: me.baseCls + '-text-container',
            renderTpl: me.getTpl('headingTpl'),
            renderData: {
                title: me.title,
                cls: me.baseCls,
                ui: me.ui
            },
            childEls: ['textEl'],
            listeners: {
                render: me.onTitleRender,
                scope: me
            }
        });

        if (Ext.isEmpty(me.layout)) {
            me.layout = (me.orientation == 'vertical') ? {
                type: 'vbox',
                align: 'center'
            } : {
                type: 'hbox',
                align: 'middle'
            };
        }

        me.items.push(me.titleCmp);

        // Add Tools
        me.items = me.items.concat(me.tools);
        // clear the tools so we can have only the instances
        me.tools = [];
        me.callSuper();

        me.on({
            dblclick: me.onDblClick,
            click: me.onClick,
            element: 'el',
            scope: me
        });
    }
});