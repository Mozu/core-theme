/**
 * @class Taco.view.site.navigation.PageSettings
 */
Ext.define('Taco.view.site.navigation.PageSettings', {
    extend: 'Taco.view.site.ToolboxPanel',
    requires: ['Taco.view.site.page.PageSettingsPanel'],
    populate: function(adapter) {
        var me = this;
        var newPanels = Ext.Array.map(adapter.getPageSettings(), function (panelInfo) {
            return Ext.create(panelInfo.panelCls, {
                record: panelInfo.getRecord(),
                toolbox: me.toolbox,
                settingsChooser: me
            });
        });
        if (this.settingsPanels) Ext.Array.forEach(this.settingsPanels, function (panel) {
            me.cardPanel.remove(panel, true);
        });
        this.settingsPanels = newPanels;
        this.cardPanel.add(newPanels);
    },
    createChooser: function () {
        var me = this;
        return this.chooser = Ext.widget('dataview', {
            store: this.toolbox.panelStore,
            cls: Taco.baseCSSPrefix + 'pagesettings-chooser',
            tpl: new Ext.XTemplate(
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="isPageSettingsPanel">',
                            '<li class="' + Taco.baseCSSPrefix + 'pagesettings-chooser-item">',
                                '<a href="javascript:;">{title}</a>',
                            '</li>',
                        '<tpl else>',
                            '<li class="' + Taco.baseCSSPrefix + 'pagesettings-chooser-item" style="display:none"></li>',
                        '</tpl>',
                    '</tpl>',
                '</ul>'
                ),
            itemSelector: 'li.' + Taco.baseCSSPrefix + 'pagesettings-chooser-item',
            listeners: {
                itemclick: function (view, record, eOpts) {
                    me.cardPanel.showItem(record);
                }
            }
        });
    },
    initComponent: function () {

        this.pageStore = null;

        this.items = [this.createChooser()];

        this.callParent(arguments);

    }

});

