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


        //todo: ug this is annoying. find out why this is happening
        // bug fix: 34630
        this.mon(this, 'boxready', function () {
            // for some reason the for: context combo shift left after the view is resized; this fixes the default size
            this.doLayout()
        }, this, {
            delay:100
        })
        
        items = Ext.isArray(items) ? items : [items];

        if (actionsCt) {            
            items.push(actionsCt);
        }

        // force actions to the right
        items.unshift({
            flex: 1
        })

        if (!Ext.isEmpty(this.contextConfig)) {
            
            items.unshift(Ext.create('Taco.core.ux.content.ContextMenu', this.contextConfig));
            
            if (title) {
                items.unshift({
                    autoEl: 'h3',                    
                    style: {
                        'font-weight': 'normal',
                        'padding-right': "10px",
                        'padding-left': "10px"
                    },
                    xtype: 'component',
                    html: 'for'
                });
            }
        }
        if (title) {
            items.unshift(title);
        } 

        
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
            itemId: 'title'
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