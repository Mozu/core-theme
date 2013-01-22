/**
 * @class Taco.view.catalog.Index
 */
Ext.define('Taco.view.catalog.Index', {
    extend: 'Taco.core.ux.content.Container',
    // requires: [],

    header: {
        title: 'TabPanel Testing'
    },

    initComponent: function () {
        var me = this,
            tp;

        tp = Ext.create('Ext.tab.Panel', {
            componentCls: Taco.baseCSSPrefix + 'tabpanel',
            tabBar: {
                plain: true,
                margin: '0 0 0 160',
                items: [{
                    xtype: 'tab',
                    text: 'Add',
                    closable: false,
                    handler: function (tab) { console.log(tab, ' was clicked'); }
                }]
            },
            lbar: {
                xtype: 'component',
                width: 160,
                html: 'sidebar'
            },
            defaults: {
                overflowY: 'auto'
            },
            items: [{
                title: 'One',
                defaults: {
                    margin: '0 0 10 0',
                    style: { backgroundColor: '#cfc' },
                },
                items: [{
                    xtype: 'component',
                    height: 600,
                    html: 'lorem'
                }, {
                    xtype: 'component',
                    height: 600,
                    html: 'ipsum'
                }, {
                    xtype: 'component',
                    height: 600,
                    html: 'dolor'
                }, {
                    xtype: 'component',
                    height: 600,
                    html: 'sit'
                }, {
                    xtype: 'component',
                    height: 600,
                    html: 'amet'
                }]
            }, {
                title: 'Two',
                defaults: {
                    margin: '0 0 10 0',
                    style: { backgroundColor: '#ccf' },
                },
                items: [{
                    xtype: 'component',
                    height: 400,
                    html: 'consectetuer'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'adipiscing'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'elit'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'nullam'
                }, {
                    xtype: 'component',
                    height: 400,
                    html: 'justo'
                }]
            }]
        });

        Ext.apply(me.body, {
            layout: 'fit',
            items: [tp]
        });

        this.callParent(arguments);
    }
});
