/**
 * @class Taco.view.site.Toolbox
 */
Ext.define('Taco.view.site.Toolbox', {
    extend: 'Ext.container.Container',
    alias: 'widget.toolbox',
    requires: ['Taco.view.site.navigation.Tree', 'Taco.view.site.navigation.WidgetNav', 'Taco.view.site.navigation.PageSettings', 'Taco.core.ux.TabBar'],

    cls: Taco.baseCSSPrefix + 'toolbox',
    header: false,
    shadow: false,
    layout: { type: 'fit' },
    
    initComponent: function () {
        var me = this;
        
        


        this.tabPanel = Ext.widget('tabpanel', {
            activeTab: 0,
            manageHeight: false,
            cls: Taco.baseCSSPrefix + 'toolbox-tabpanel',
            tabBar: {
                plain: true
            }
        });
        this.navigation = Ext.create('Taco.view.site.navigation.Tree', {
            active: true,
            hasBackButton: false,
            index: 0,
            title: 'Pages',
            toolbox: this,
            parentPanel: this.tabPanel,
            manageHeight: false
        });
        this.pageSettings = Ext.create('Taco.view.site.navigation.PageSettings', {
            toolbox: this,
            parentPanel: this.tabPanel,
            index: 2,
            title: 'Settings',
            manageHeight: false
        });

        this.widgets = Ext.create('Taco.view.site.navigation.WidgetNav', {
            itemId: 'widgets',
            title: 'Widgets',
            parentPanel: this.tabPanel,
            manageHeight: false
        });

      
        this.items = [this.tabPanel];

      
        this.callParent(arguments);

        this.tabPanel.add(this.navigation, this.widgets, this.pageSettings);

    },

    populate: function (adapter) {
        //todo refdo page settings
        this.pageSettings.populate(adapter);
    }
});