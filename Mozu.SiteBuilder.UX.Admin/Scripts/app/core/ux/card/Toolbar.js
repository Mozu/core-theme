
Ext.define('Taco.core.ux.card.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.taco-cardtabtoolbar',

    requires: [
        'Taco.core.ux.card.Tab'
    ],

    defaults: {
        xtype: 'taco-cardtab'
    },

    dock: 'top',

    initComponent: function () {
        this.cls += ' taco-underline-tab-bar';

        this.addEvents([
            'tabchange'
        ]);

        this.enableBubble([
            'tabchange'
        ]);

        this.activeTab = this.activeTab || 0;

        this.callParent(arguments);

        this.tabs = this.query('taco-cardtab');

        Ext.each(this.tabs, function (tab) {
            tab.on({
                click: function (e) {
                    this.handleTabClick(e, tab);
                },
                element: 'el',
                scope: this
            });
        }, this);

        this.on({
            'boxready': function () {
                this.setActiveTab(this.activeTab);
            },
            scope: this
        });
    },

    handleTabClick: function (e, tab) {
        e.preventDefault();
        this.setActiveTab(Ext.Array.indexOf(this.tabs, tab));
        this.fireEvent('tabchange', this, tab);
    },

    setActiveTab: function (index) {
        if (!this.cardPanel) {
            this.cardPanel = this.up();
        }

        if (!this.cardPanel.getLayout().setActiveItem) {
            return;
        }

        this.cardPanel.getLayout().setActiveItem(index);

        Ext.each(this.tabs, function (tab) {
            tab.deactivate();
        });

        this.tabs[index].activate();
    }
});