/**
 * @class Taco.view.site.Toolbox
 */
Ext.define('Taco.view.site.Toolbox', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.toolbox',
    cls: Taco.baseCSSPrefix + 'toolbox ',
    autoRender: false,
    header: false,
    closeAction: 'hide',
    resizable: { handles: 'w s' },
    shadow: false,
    layout: 'fit',
    //width: 600,
    requires: ['Taco.view.site.navigation.Tree', 'Taco.view.site.navigation.WidgetNav', 'Taco.view.site.navigation.PageSettings', 'Taco.store.shared.ContainerStore'],
    populate: function (adapter) {
        this.pageSettings.populate(adapter);
    },
    initComponent: function () {
        var me = this;

        
        this.cardPanel = Ext.create('Ext.panel.Panel', {
            cls: Taco.baseCSSPrefix + 'windowcardpanel',
            layout: 'card',
            itemId: 'cardPanel',
            showItem: function (record) {
                var cardIndex = typeof record === "number" ? record : me.panelStore.indexOf(record);
                if (cardIndex === -1) cardIndex = me.cardPanel.items.indexOf(record);
                if (cardIndex < me.cardPanel.items.getCount()) {
                    me.cardPanel.getLayout().setActiveItem(cardIndex);
                }
            }
        });

        this.panelStore = Ext.create('Taco.store.shared.ContainerStore', {
            fields: ['index', 'title', 'isPageSettingsPanel'],
            container: this.cardPanel
        });

        this.navigation = Ext.create('Taco.view.site.navigation.Tree', {
            active: true,
            hasBackButton: false,
            index: 0,
            title: 'Pages',
            toolbox: this,
            cardPanel: this.cardPanel
        });

        this.widgets = Ext.create('Taco.view.site.navigation.WidgetNav', {
            toolbox: this,
            cardPanel: this.cardPanel,
            index: 1,
            title: 'Widgets'
        });

        this.pageSettings = Ext.create('Taco.view.site.navigation.PageSettings', {
            toolbox: this,
            cardPanel: this.cardPanel,
            index: 2,
            title: 'Page Settings'
        });

        this.items = [this.cardPanel];
        this.tabContainer = Ext.widget('dataview', {
            store: this.panelStore,
            cls: Taco.baseCSSPrefix + 'toolbox-menu',
            tpl: new Ext.XTemplate(
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="!isPageSettingsPanel">',
                            '<li class="' + Taco.baseCSSPrefix + 'toolbox-menu-item">',
                                '<a href="javascript:;">{title}</a>',
                            '</li>',
                        '</tpl>',
                    '</tpl>',
                '</ul>'
                ),
            itemSelector: 'li.' + Taco.baseCSSPrefix + 'toolbox-menu-item',
            listeners: {
                itemclick: function (view, record, eOpts) {
                    me.cardPanel.showItem(record);
                }
            }
        });

        this.tbar = [this.tabContainer];

        this.tabContainer.getSelectionModel().allowDeselect = false;

        this.callParent(arguments);

        this.cardPanel.add([this.navigation, this.widgets, this.pageSettings]);
    },

    
});