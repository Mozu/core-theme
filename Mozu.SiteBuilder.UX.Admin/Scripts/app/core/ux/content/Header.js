/**
 * Header portion, with title and dirtybutton, of a Taco.core.ux.content.Container.
 * @class Taco.core.ux.content.Header
 */

Ext.define('Taco.core.ux.content.Header', {
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.action.SecondaryButton', 'Taco.core.ux.action.PrimaryButton'],
    alias: 'widget.contentheader',
    
    cls: 'taco-content-header',
    layout: {
        type: 'hbox',
        align: 'middle'
    },

    title: 'Header Title',
    titleData: null,

    instructionText: null,
    hideActions: false,

    initComponent: function () {
        this.initTitle();

        this.items = [this.title || undefined, {
            xtype: 'container',
            cls: Taco.baseCSSPrefix + 'actions',
            itemId: 'actionsContainer',
            items: this.actions,
            hidden: this.hideActions,
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            listeners: {
                add: {
                    scope: this,
                    fn: function (ct, cmp, index) {
                        if (index === this.actions.length - 1) {
                            cmp.on({
                                scope: this,
                                boxready: function () {
                                    this.updateLayout();
                                }
                            });
                        }
                    }
                }
            }
        }];

        if (this.title === false) {
            Ext.apply(this.items[1], {
                flex: 1
            });
        }

        this.callParent(arguments);

        this.title = this.down('#title');

        this.actionsContainer = this.down('#actionsContainer');
    },

    monitorSize: Ext.emptyFn,

    // if header sizing is ultimately needed, uncomment this method
    // then attach a listener to the boxready event and give this header a reference to the sidebar
    // 
    // monitorSize: function () {
    //     this.getEl().setStyle('width', this.getWidth() + "px");
    //     if (this.sidebar) {
    //         console.log(this.sidebar);
    //         this.addCls(Taco.baseCSSPrefix + 'content-header-with-sidebar');

    //         if (!this.monitoringSidebar) {
    //             this.monitoringSidebar = true;
    //             this.sidebar.on('expand', this.monitorSize, this);
    //             this.sidebar.on('collapse', this.monitorSize, this);
    //         }
    //     }
    // },

    /**
     * Initializes the title config
     * @private
     */
    initTitle: function () {
        if (this.title === false) {
            return;
        } else if (typeof this.title !== 'object' || this.title === null) {
            this.title = {
                html: this.title || 'Title'
            };
        }

        Ext.apply(this.title, {
            xtype: 'component',
            autoEl: 'h1',
            itemId: 'title',
            flex: 1
        });
    },

    getActions: function () {
        return this.actionsContainer;
    },

    setTitle: function (title) {
        if (this.title && this.title.isComponent) {
            this.title.update(title);
            return;
        }

        if (typeof this.title !== 'object' || this.title === null) {
            this.title = {
                html: title
            };
        } else {
            this.title.html = title;
        }
    },

    updateTitle: function (data) {
        if (this.title && this.title.isComponent) {
            this.title.update(data);
        }
    }
});