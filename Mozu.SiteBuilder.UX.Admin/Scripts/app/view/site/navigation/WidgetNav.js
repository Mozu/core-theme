/**
 * @class Taco.view.site.navigation.WidgetNav
 */
Ext.define('Taco.view.site.navigation.WidgetNav', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.store.WidgetDefinitions', 'Taco.view.site.page.WidgetDragZone'],

    initComponent: function () {

        this.view = Ext.create('Ext.view.View', {
            flex: 1,
            itemSelector: 'div.widget-source',
            tpl: '<tpl for="."><div class="widget-source">{displayName}-{category}</div></tpl>',
            store: Taco.core.data.StoreManager.getOrCreate('Taco.store.WidgetDefinitions'),
            autoScroll: true,
            listeners: {
                render: {
                    fn: this.initializeWidgetDragZone,
                    scope: this
                }
            }
        });

        this.items=[this.view];
        this.callParent(arguments);

    },

    initializeWidgetDragZone: function () {
        
        var me = this, config, es,  config;
        es = Taco.app.viewPort.down('editsurface');

        this.dragZoneConfig = {
            onBeforeDrag: function () {
                es.shim.show();
            },
            afterValidDrop: function () {
                es.shim.hide();
            },
            afterInvalidDrop: function () {
                es.shim.hide();
            }
        };

        config = Ext.apply(this.dragZoneConfig, {
            view: me.view
        });
        this.dragZone = Ext.create('Taco.view.site.page.WidgetDragZone', this.view.getEl(), config);

        //this.fireEvent('dragzoneready', this.dragZone);
    }
});

