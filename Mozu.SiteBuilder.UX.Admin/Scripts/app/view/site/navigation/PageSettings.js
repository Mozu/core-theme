/**
 * @class Taco.view.site.navigation.PageSettings
 */
Ext.define('Taco.view.site.navigation.PageSettings', {
    extend: 'Taco.view.site.ToolboxPanel',
    requires: ['Taco.view.site.page.PageSettingsPanel','Taco.store.shared.ContainerStore'],
    populate: function(adapter) {
        var me = this;
        var newPanels = Ext.Array.map(adapter.getPageSettings(), function (panelInfo) {
            return Ext.create(panelInfo.panelCls, {
                record: panelInfo.getRecord()
            });
        });
        if (this.settingsPanels) Ext.Array.forEach(this.settingsPanels, function (panel) {
            me.remove(panel, true);
        });
        this.settingsPanels = newPanels;
        this.add(newPanels);
    },
    createChooser: function () {
        var me = this;
        return this.chooser = Ext.widget('dataview', {
            store: this.panelStore,
            cls: Taco.baseCSSPrefix + 'pagesettings-chooser',
            tpl: new Ext.XTemplate(
                '<ul>',
                    '<tpl for=".">',
                        '<tpl if="isPageSettingsPanel">',
                            '<li class="' + Taco.baseCSSPrefix + 'pagesettings-chooser-item">',
                                '<a href="javascript:;">{title}</a>',
                                '<div>&#9654;</div>',
                            '</li>',
                        '<tpl else>',
                            '<li class="' + Taco.baseCSSPrefix + 'pagesettings-chooser-item" style="display:none"></li>',
                        '</tpl>',
                    '</tpl>',
                '</ul>'
                ),
            itemSelector: 'li.' + Taco.baseCSSPrefix + 'pagesettings-chooser-item',
            listeners: {
                itemclick: function (view, record, item, index) {
                    me.settingsPanels[index].show();
                }
            }
        });
    },
    initComponent: function () {

        this.panelStore = Ext.create('Taco.store.shared.ContainerStore', {
            fields: ['index', 'title', 'isPageSettingsPanel'],
            container: this,
            useFloatingItems: true
        });

        this.items = [this.createChooser()];

        this.callParent(arguments);

    }

});

