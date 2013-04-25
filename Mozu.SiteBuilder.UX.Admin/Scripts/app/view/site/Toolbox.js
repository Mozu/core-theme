/**
 * @class Taco.view.site.Toolbox
 */
Ext.define('Taco.view.site.Toolbox', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.toolbox',
    requires: ['Taco.view.site.navigation.Tree', 'Taco.view.site.navigation.WidgetNav', 'Taco.view.site.navigation.PageSettings', 'Taco.store.shared.ContainerStore'],

    cls: Taco.baseCSSPrefix + 'toolbox ',
    header: false,
   // closeAction: 'hide',
    //resizable: { handles: 'w' },
    shadow: false,
    layout: 'auto',
        
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
               
                if (typeof (record) === "number") {
                    record = me.panelStore.getAt(record);
                } else if (record.isComponent) {
                    record = me.panelStore.getAt(me.panelStore.findBy(function(r) {
                        return r.raw == record;
                    }));
                }
                var cardIndex = me.panelStore.indexOf(record);
                
                if (cardIndex < me.cardPanel.items.getCount()) {
                    if (!record.get('showInNav')) {
                        me.tabContainer.hide();
                    } else {
                        me.tabContainer.show();
                    }
                    me.cardPanel.getLayout().setActiveItem(cardIndex);
                }
            }
        });

        this.panelStore = Ext.create('Taco.store.shared.ContainerStore', {
            fields: ['index', 'title', 'showInNav', 'isPageSettingsPanel'],
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

        this.tabContainer = Ext.widget('dataview', {
            store: this.panelStore,
            cls: Taco.baseCSSPrefix + 'toolbox-menu',
            tpl: new Ext.XTemplate(
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="showInNav">',
                            '<li class="' + Taco.baseCSSPrefix + 'toolbox-menu-item">',
                                '<a href="javascript:;">{title}</a>',
                            '</li>',
                        '<tpl else>',
                            '<li class="' + Taco.baseCSSPrefix + 'toolbox-menu-item" ></li>',
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

        this.items = [this.tabContainer, this.cardPanel];

        // this.tbar = [this.tabContainer];

        this.tabContainer.getSelectionModel().allowDeselect = false;

        this.callParent(arguments);

        this.cardPanel.add(0,[this.navigation, this.widgets, this.pageSettings]);

      
    },

    
});