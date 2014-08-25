/**
 * Header portion, with title and dirtybutton, of a Taco.core.ux.content.Container.
 * @class Taco.core.ux.content.Header
 */

Ext.define('Taco.core.ux.content.Header', {
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.content.ContextMenu'],
    alias: 'widget.contentheader',
    
    cls: 'taco-content-header',
    title: 'Header Title',
    titleData: null,

    flexFirstItem: true,
    hideActions: false,
    instructionText: null,

    layout: {
        type: 'hbox',
        align: 'middle'
    },

    initComponent: function () {
        var items = this.items || [],
            title = this.initTitle(),
            actionsCt = this.initActionsContainer();

        items = Ext.isArray(items) ? items : [items];

        if (actionsCt) {
            // items.push({ xtype: 'container', flex: 1 });
            items.push(actionsCt);
        }
        if (!Ext.isEmpty(this.contextConfig)) {
            items.unshift(Ext.create('Taco.core.ux.content.ContextMenu', this.contextConfig));
            if (title) {
                items.unshift({
                    autoEl: 'h3',
                    style: {
                        'font-weight' : 'normal'
                    },
                    xtype: 'component',
                    html: '&nbsp;for&nbsp;'
                });
            }
        }
        if (title) items.unshift(title);

        
        //if (this.flexFirstItem && items.length > 0) {
        //    Ext.apply(items[0], {
        //        flex: 1
        //    });
        //}
        
        


        this.items = items;

        this.callParent(arguments);

        this.title = this.down('#title');

        this.actionsContainer = this.down('#actionsContainer');
    },

    getActions: function () {
        return this.actionsContainer;
    },

    initActionsContainer: function () {
        var actions = this.actions || [],
            isHidden = !!(this.hideActions),
            ct;

        ct = {
            xtype: 'container',
            cls: Taco.baseCSSPrefix + 'actions',
            itemId: 'actionsContainer',
            items: actions,
            hidden: isHidden,
            shrinkWrap: true,
            layout: {
                type: 'hbox',
                align: 'middle',
            }
        };

        return ct;
    },

    /**
     * Initializes the title config
     * @private
     */
    initTitle: function () {
        var me = this,
            title = this.title;

        if (title === false) {
            return;
        } else if (typeof title !== 'object' || title === null) {
            title = {
                xtype: 'component',
                html: title || ''
            };
        }

        Ext.apply(title, {
            autoEl: 'h1',
            itemId: 'title',
            flex: 1
        });

        return title;
    },

    setTitle: function (title) {
        if (this.title && this.title.isComponent) {
            this.title.update(title);
            return;
        }

        if (typeof this.title !== 'object' || this.title === null) {
            this.title = {
                xtype: 'component',
                html: title
            };
        } else {
            Ext.apply(this.title, {
                xtype: 'component',
                html: title
            });
        }
    },

    updateTitle: function (data) {
        if (this.title && this.title.isComponent) {
            this.title.update(data);
        }
    },

    monitorSize: Ext.emptyFn
});