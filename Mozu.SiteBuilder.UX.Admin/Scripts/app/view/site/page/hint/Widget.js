/**
 * @class Taco.view.site.page.hint.Widget
 * Hint for widgets used for inline editing 
 */
Ext.define('Taco.view.site.page.hint.Widget', {
    extend: 'Taco.view.site.page.hint.Hint',
    requires:['Ext.layout.container.Table'],
    alias: 'widget.tacohintwidget',
    type: 'widget',
    hintCls: 'taco-hint-widget',
    bubbleEvents: [
        'deletewidget',
        'afterdeletewidget',
        'editwidget',
        'aftereditwidget'
    ],
    hintMargin: 0,
    
    defaults: {
        xtype: 'image',
        src: Ext.BLANK_IMAGE_URL
    },
    
    initComponent: function () {
        this.addEvents(
            /**
             * @event
             * Fired when the edit link is clicked on the widget
             * @param {Taco.view.site.page.hint.Widget} this
             */
            'editwidget',
            /**
             * @event
             * Fired when the delete link is clicked on the widget
             * @param {Taco.view.site.page.hint.Widget} this
             */
            'deletewidget'
        );
        
        this.callParent(arguments);
        
        //this.remove(this.hints);
        this.buildActions();
        
        this.add([
            this.actions,
            this.hints
        ]);
        
        this.on({
            mouseenter: {
                fn: this.activate,
                scope: this,
                element: 'el'
            },
            mouseleave: {
                fn: this.deactivate,
                scope: this,
                element: 'el'
            },
            afterrender: {
                fn: function () {
                    var middleCell = this.getEl().down('table tbody tr:nth-child(2) td:nth-child(2)');
                    window.mc = middleCell;
                    
                    if (!middleCell) {
                        return;
                    }
                    
                    middleCell.on({
                        mouseenter: {
                            fn: function () {
                                this.addCls('taco-soft');
                            },
                            scope: this
                        },
                        mouseleave: {
                            fn: function() {
                                this.removeCls('taco-soft');
                            },
                            scope: this
                        }
                    });
                },
                scope: this
            }
        });
    },
    
    /**
     * Turns the widget hint on, making it visible. Also, activates any Editable Element hints within the widget
     */
    activate: function () {
        this.callParent(arguments);
        this.hints.items.each(function (hint) {
            if (hint.type !== 'element1') {
                return;
            }
            hint.ignoreMouseleave();
            hint.activate();
        }, this);
        
        this.widgetParent = this.findParentBy(function (container) {
            return container.type === 'widget'
        });
        
        if (!this.widgetParent) {
            return;
        }
        
        this.widgetParent.deactivate();
    },
    
    /**
     * Turns the widget hint off, making it disappear. Also, deactivates any Editable Element hints within the widget 
     */
    deactivate: function () {
        if (this.widgetParent) {
            this.widgetParent.activate();
        }
        
        this.callParent(arguments);
        
        this.hints.items.each(function (hint) {
            if (hint.type !== 'element1') {
                return;
            }
            
            hint.deactivate(true);
        }, this);
    },
    
    alignToEl: function (offsetX, offsetY) {
        // var offset = this.hintMargin,
        //     extra = 2 * this.hintMargin;
        // this.callParent([
        //     (offsetX || 0) + offset,
        //     (offsetY || 0) + offset + 11,
        //     extra,
        //     extra + 12,
        //     this.hintMargin,
        //     this.hintMargin + 12
        // ]);
        //this.callParent(arguments);
        
        //this.actions.setHeight(30);
        
        this.callParent([offsetX + 1 , offsetY, 0]);
        
        this.actions.setWidth(this.associatedEl.getWidth());
    },
    
    /**
     * @private 
     */
    buildActions: function() {
        this.actions = Ext.create('Ext.container.Container', {
            cls: 'taco-hint-actions',
            layout: 'auto',
            items: [{
                    xtype: 'component',
                    cls: 'taco-widget-drag'
                },
                Ext.create('Taco.core.ux.action.Action', {
                    cls: 'taco-widget-edit',
                    text: '',
                    listeners: {
                        click: {
                            fn: function () {
                                console.log('you clicjked it!');
                                this.fireEvent('editwidget', this);
                            },
                            scope: this
                        }
                    }
                }),
                Ext.create('Taco.core.ux.action.Action', {
                    cls: 'taco-widget-remove',
                    text: '',
                    listeners: {
                        click: {
                            fn: function () {
                                this.fireEvent('deletewidget', this);
                            },
                            scope: this
                        }
                    }
                })
            ]
        });
    }
});
