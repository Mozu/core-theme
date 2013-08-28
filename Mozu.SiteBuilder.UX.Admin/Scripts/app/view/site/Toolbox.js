/**
 * @class Taco.view.site.Toolbox
 */
Ext.define('Taco.view.site.Toolbox', {
    extend: 'Ext.container.Container',
    alias: 'widget.toolbox',
    requires: ['Taco.view.site.navigation.Tree', 'Taco.view.site.navigation.WidgetNav', 'Taco.view.site.navigation.PageSettings', 'Taco.core.ux.TabBar', 'Ext.tab.Bar'],

    cls: Taco.baseCSSPrefix + 'toolbox',
    header: false,
    shadow: false,
    layout: { type: 'fit' },
    
    disableTabs: function() {
        //disable the settings toolbar button
        this.tabPanel.down('[isTabBar]').items.getAt(2).disable();
    },

    enableTabs: function () {
        //enable the settings toolbar button
        this.tabPanel.down('[isTabBar]').items.getAt(2).enable();
    },

    initComponent: function () {
        var me = this;
        
        


        this.tabPanel = Ext.widget('tabpanel', {
            activeTab: 0,
            manageHeight: false,
            cls: Taco.baseCSSPrefix + 'toolbox-tabpanel',
            tabBar: {
                disabled: false,
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
            steve:3,
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