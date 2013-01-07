/**
* @author Travis Johnson
* @class Taco.view.site.page.WidgetWindow
*/


    Ext.define('Taco.view.site.page.WidgetWindow', {
        extend: 'Ext.Window',
        requires: ['Taco.view.site.page.WidgetDragZone'],

        title: 'Available Widgets',
        width: 250,
        height: 300,
        layout: 'fit',
        closeAction: 'hide',

        initComponent: function () {

            this.callParent(arguments);

            this.view = Ext.create('Ext.view.View', {
                itemSelector: 'div.widget-source',
                tpl: '<tpl for="."><div class="widget-source">{displayName}</div></tpl>',
                store: Ext.create('Taco.store.WidgetDefinitions'),
                autoScroll: true,
                listeners: {
                    render: {
                        fn: this.initializeWidgetDragZone,
                        scope: this
                    }
                }
            });

            this.add(this.view);
        },

        initializeWidgetDragZone: function () {
            var me = this,
                config = Ext.apply(this.dragZoneConfig, {
                    view: me.view
                });
            this.dragZone = Ext.create('Taco.view.site.page.WidgetDragZone', this.view.getEl(), config);

            //this.fireEvent('dragzoneready', this.dragZone);
        }
    });
