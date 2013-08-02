/**
 * Header portion, with title and dirtybutton, of a Taco.core.ux.content.Container.
 * @class Taco.core.ux.content.Header
 */

Ext.define('Taco.core.ux.content.Header', {
    extend: 'Ext.container.Container',
    requires: ['Taco.core.ux.action.SecondaryButton', 'Taco.core.ux.action.PrimaryButton'],
    alias: 'widget.contentheader',
    cls: 'taco-content-header',

    title: 'Header Title',
    titleData: null,

    instructionText: null,
    hideActions: false,

    initComponent: function () {

        if (typeof this.title !== 'object') {
            this.title = {
                html: this.title || 'Title'
            };
        }

        Ext.apply(this.title, {
            xtype: 'component',
            autoEl: 'h1',
            itemId: 'title'
        });

        this.items = [{
            xtype: 'container',
            flex: 1,
            itemId:'titleContainer',
            layout: 'auto',
            items: [this.title, {
                xtype: 'component',
                autoEl: 'p',
                html: this.instructionText,
                itemId: 'instruction'
            }]
        }, {
            xtype: 'container',
            cls: Taco.baseCSSPrefix + "actions",
            itemId: 'actionsContainer',
            items: this.actions,
            hidden: this.hideActions,
            layout: 'auto'
        }];

        this.callParent(arguments);

        this.title = this.down('#title');

        this.instruction = this.down('#instruction');

        this.titleContainer = this.down('#titleContainer');

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

    getActions: function () {
        return this.actionsContainer;
    },

    setTitle: function (title) {
        this.title.update(title);
    },

    updateTitle: function (data) {
        this.title.update(data);
    }
});