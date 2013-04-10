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
    width: 600,
    requires:['Taco.view.site.navigation.Tree','Taco.view.site.navigation.WidgetNav','Taco.view.site.navigation.Themes'],
    initComponent: function () {

        this.tabContainer = Ext.create('Ext.container.Container', {
            cls: Taco.baseCSSPrefix + 'tabs',
            items: [{
                xtype: 'action',
                text: 'Pages',
                cls: 'active',
                click: function (action) {
                    var active = this.tabContainer.getEl().down('.active');
                    this.cardPanel.getLayout().setActiveItem(0);
                    if (active) {
                        active.removeCls('active');
                    }
                    action.addCls('active');
                },
                scope: this
            }, {
                xtype: 'action',
                text: 'Widgets',
                click: function (action) {
                    var active = this.tabContainer.getEl().down('.active');
                    this.cardPanel.getLayout().setActiveItem(1);
                    if (active) {
                        active.removeCls('active');
                    }
                    action.addCls('active');
                },
                scope: this
            }]
        });

        this.tbar = [this.tabContainer];

        this.cardPanel = Ext.create('Ext.panel.Panel', {
            cls: Taco.baseCSSPrefix + 'windowcardpanel',
            layout: 'card',
            itemId: 'cardPanel'
        });

        this.cardStore = Ext.create('Ext.data.Store', {
            fields: ['index', 'title'],
            data: [
                { 'index': 1, 'title': 'Pages' },
                { 'index': 2, 'title': 'Widgets' }
            ]
        });

        this.menu = Ext.create('Ext.panel.Table', {
            store: this.cardStore,
            viewType: 'tableview',
            rowLines: false,
            viewConfig: {
                stripeRows: false,
                disableSelection: true,
                listeners: {
                    itemclick: function(view, record, item, index, e, eOpts) {
                        var cardIndex = record.get('index') || 0;
                        if (cardIndex < this.cardPanel.items.length) {
                            this.cardPanel.getLayout().setActiveItem(cardIndex);
                        }
                    },
                    scope: this
                }
            },
            columns: [{
                dataIndex: 'title',
                text: 'Title',
                flex: 1
            }],
            hideHeaders: true,
            selType: 'rowmodel',
            listeners: {
                hide: this.ToggleCardFlexActive,
                show: this.ToggleCardFlexActive,
                scope: this.menu
            }
        });

        this.navigation = Ext.create('Taco.view.site.navigation.Tree', {
            cls: Taco.baseCSSPrefix + 'card-flex ' + Taco.baseCSSPrefix + 'card-flex-active',
            cardPanel: this.cardPanel,
            listeners: {
                hide: this.ToggleCardFlexActive,
                show: this.ToggleCardFlexActive,
                scope: this.navigation
            }
        });
        this.widgets = Ext.create('Taco.view.site.navigation.WidgetNav', {
            cardPanel: this.cardPanel,
            tbar: [{
                xtype: 'action',
                text: 'Back',
                click: {
                    fn: function () { this.up('#cardPanel').getLayout().setActiveItem(0); }
                }
            }, '->', {
                xtype: 'tbtext',
                text: 'Widgets'
            }],
            listeners: {
                hide: this.ToggleCardFlexActive,
                show: this.ToggleCardFlexActive,
                scope: this.widgets
            }
        });

        this.themes = Ext.create('Taco.view.site.navigation.Themes', {
            cardPanel: this.cardPanel,
            tbar: [{
                xtype: 'action',
                text: 'Back',
                click: {
                    fn: function () { this.up('#cardPanel').getLayout().setActiveItem(0); }
                }
            }, '->', {
                xtype: 'tbtext',
                text: 'Themes'
            }],
            listeners: {
                hide: this.ToggleCardFlexActive,
                show: this.ToggleCardFlexActive,
                scope: this.themes
            }
        });

        this.items = [this.cardPanel];

        this.callParent(arguments);

        this.cardPanel.add([this.navigation, this.widgets, this.themes]);
    },

    NavigateToMenu:function() {
        this.cardPanel.getLayout().setActiveItem(this.menu);
    },

    ToggleCardFlexActive: function() {
        this.getEl().toggleCls(Taco.baseCSSPrefix + 'card-flex-active');
    }
});