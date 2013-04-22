/**
 * @class Taco.view.site.navigation.PageSettings
 */
Ext.define('Taco.view.site.navigation.PageSettings', {
    extend: 'Taco.view.site.ToolboxPanel',
    requires: ['Taco.view.site.page.PageSettingsPanel'],
    layout: 'card',
    populate: function(adapter) {
        var newPages = Ext.Array.map(adapter.settingsPanels, function (panelInfo) {
            return Ext.create(panelInfo.panelCls, {
                record: panelInfo.getRecord()
            });
        });
    },
    initComponent: function () {

        this.chooser = Ext.widget('dataview', {
            store: Ext.create('Taco.store.shared.ContainerStore', {
                fields: ['index', 'title', 'isChooser'],
                container: this
            }),
            isChooser: true,
            cls: Taco.baseCSSPrefix + 'pagesettings-chooser',
            tpl: new Ext.XTemplate(
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="!isChooser">',
                            '<li class="' + Taco.baseCSSPrefix + 'pagesettings-chooser-item">',
                                '<a href="javascript:;">{title}</a>',
                            '</li>',
                        '</tpl>',
                    '</tpl>',
                '</ul>'
                ),
            itemSelector: 'li.' + Taco.baseCSSPrefix + 'pagesettings-chooser-item',
            listeners: {
                itemclick: function (view, record, eOpts) {
                    var cardIndex = record.get('index') || 0;
                    if (cardIndex < me.cardPanel.items.length) {
                        me.cardPanel.getLayout().setActiveItem(cardIndex);
                    }
                }
            }
        });

        this.pageStore = null;

        this.items = [this.chooser];

        this.callParent(arguments);

    }

});

