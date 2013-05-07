/**
 * @class Taco.view.site.navigation.WidgetNav
 */
Ext.define('Taco.view.site.navigation.WidgetNav', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.store.WidgetDefinitions', 'Taco.view.site.page.WidgetDragZone', 'Taco.core.ux.GroupedView'],

    initComponent: function () {
        var store = Taco.core.data.StoreManager.getOrCreate('Taco.store.WidgetDefinitions');

        store.group('category', 'ASC');

        this.view = Ext.create('Taco.core.ux.GroupedView', {
            cls: Taco.baseCSSPrefix + 'widget-accordion-view',
            itemSelector: 'div.widget-source',
            store: store,
            tpl: [
                '<tpl for="groups">',
                    '<div class="heading">{name}</div>',
                    '<div class="items"><tpl for="children">',
                        '<div class="widget-source" style="',
                            '<tpl if="this.hasIcon(values)">background-image: url({[values.data.icon]});</tpl>',
                        '">{[values.data.displayName]}</div>',
                    '</tpl></div>',
                '</tpl>', {
                hasIcon: function (values) {
                    return !Ext.isEmpty(values.data.icon);
                }
            }],
        });

        this.items= [this.view];

        this.callParent(arguments);

        this.view.on({
            render: {
                fn: this.initializeWidgetDragZone,
                scope: this
            }
        });
    },

    initializeWidgetDragZone: function () {
        var me = this,
            es = Taco.app.viewPort.down('editsurface'),
            config;

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