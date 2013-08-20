/**
 * @class Taco.view.dashboard.Index
 */

Ext.define('Taco.view.dashboard.Index', {
    extend: 'Taco.core.ux.content.Container',
    
    initComponent: function () {
        var me = this,
            renderDataObject = {},
            storeObj = { "store": [] },
            catalogObj = { "catalog": [] },
            contextStore = Taco.app.context.getStore(),
            buildStoreData, dashboard;

        // builds store and catalog objects
        buildStoreData = function (el, index, arr) {
            if(el.data.urlToken.indexOf('t-')){
                if(el.data.urlToken.indexOf('c-')){
                  //filters out tenants and site groups bassed on its code
                  var token = el.data.urlToken.toString().substring(2,el.data.urlToken.toString().length);
                  storeObj.store.push({"name":el.data.name, "urlToken":el.data.urlToken, "url": "/_gosite/"+token});   
                }
               if(!el.data.urlToken.indexOf('c-')){
                  //filters out tenants and site groups bassed on its code
                  console.log(el.data);
                  catalogObj.catalog.push({"name":el.data.name, "urlToken":el.data.urlToken, "item":[]});   
                }
                if(!el.data.urlToken.indexOf('s-')){
                  //filters out tenants and site groups bassed on its code
                  catalogObj.catalog[catalogObj.catalog.length-1].item.push({"name":el.data.name, "urlToken":el.data.urlToken});  
                }
            }
        };

        console.log(contextStore.data);

        Ext.Array.forEach(contextStore.data.items, buildStoreData, me);

        renderDataObject = me.mergeOptions(storeObj, catalogObj);

        dashboard = Ext.create('Ext.Container', {
            layout: 'vbox',
            overflowX: 'auto',
            overflowY: 'auto',
            defaults: {
                xtype: 'container',
                width: 1180,
                margin: '20 0 0',
                layout: 'hbox'
            },
            items: [{
                itemId: 'row0',
                margin: 0,
                defaults: {
                    xtype: 'panel',
                    componentCls: 'dashboard-panel',
                    width: 380,
                    height: 380,
                    margin: '0 0 0 20',
                    layout: 'fit'
                },
                items: [{
                    margin: 0,
                    title: 'Sales',
                    cls: 'sales',
                    items: [{
                        xtype: 'component',
                        renderTpl: '<h4>$100,798</h4><h5 class="change positive">3.02%</h5>'
                    }]
                }, {
                    title: 'Customers',
                    cls: 'customers',
                    items: [{
                        xtype: 'component',
                        renderSelectors: {
                            slice0: 'div.legend-item-0'
                        },
                        renderData: {
                            slice0: '80'
                        },
                        renderTpl: [
                            '<div class="pie">',
                                '<div class="piece legend-item-1" data-angle="0"></div>',
                                '<div class="piece legend-item-0" data-angle="{slice0}"></div>',
                            '</div>',
                            '<div class="legend">',
                                '<span class="key">New</span>',
                                '<span class="key legend-item-1">Returning</span>',
                                '<span class="change positive">1.03%</span>',
                            '</div>'
                        ],
                        listeners: {
                            afterrender: function (cmp) {
                                var angle = cmp.slice0.getAttribute('data-angle'),
                                    rotation = 'rotate(' + angle + 'deg)';

                                Ext.defer(function () {
                                    Ext.fly(cmp.slice0).setStyle({
                                        '-webkit-transform': rotation,
                                        '-moz-transform': rotation,
                                        '-ms-transform': rotation,
                                        'transform': rotation
                                    });
                                }, 2000);
                            }
                        }
                    }]
                }, {
                    title: 'Quick Links',
                    cls: 'quick-links',
                    autoScroll: true,
                    items: [{
                        xtype: 'component',
                        renderData: renderDataObject,
                        renderTpl: [
                            "<div class='taco-home-page-item-header'>Manage Sites</div>",
                            "<tpl for='store'><ul class='taco-home-page-tree'>",
                                "<li>{[values.name]} <div class='taco-home-page-site-settings'>",
                                    "<a href='{[values.url]}' target='_blank'>Preview</a> | ",
                                    "<a href='/admin/{[values.urlToken]}/sites/pages'>Edit</a> | ",
                                    "<a href='/admin/{[values.urlToken]}/generalsettings'>Settings</a>",
                                "</div></li>",
                            "</ul></tpl>",
                            "<div class='taco-home-page-item-header'>Catalog Management</div>",
                            "<tpl for='catalog'><ul class='taco-home-page-tree'>",
                                "<li><a href='/admin/{[values.urlToken]}/products'>{[values.name]}</a></li>",
                                "<li><ul><tpl for='values.item'>",
                                    "<li><a href='/admin/{[values.urlToken]}/products'>{[values.name]}</a></li>",
                                "</tpl></ul></li>",
                            "</ul></tpl>"
                        ]
                    }]
                }]
            }, {
                itemId: 'row1',
                defaults: {
                    xtype: 'panel',
                    componentCls: 'dashboard-panel',
                    width: 220,
                    height: 220,
                    margin: '0 0 0 20',
                    layout: 'fit'
                },
                items: [{
                    margin: 0,
                    title: 'Device',
                    cls: 'device',
                    items: [{
                        xtype: 'component',
                        renderTpl: [
                            '<div class="device-type desktop">',
                                '<span class="device-icon device-icon-desktop"></span>',
                                '<span class="device-value">73%</span>',
                                '<span class="device-label">Desktop</span>',
                            '</div>',
                            '<div class="device-type mobile">',
                                '<span class="device-icon device-icon-mobile"></span>',
                                '<span class="device-value">27%</span>',
                                '<span class="device-label">Mobile</span>',
                            '</div>'
                        ]
                    }]
                }, {
                    title: 'Bounce Rate',
                    cls: 'bounce-rate',
                    items: [{
                        xtype: 'component',
                        renderTpl: '<h4>69.72%</h4><h5 class="change positive">1.02%</h5>'
                    }]
                }, {
                    title: 'Time on Sites',
                    cls: 'time-on-sites',
                    items: [{
                        xtype: 'component',
                        renderTpl: '<h4>15m 21s</h4><h5 class="change negative">5.12%</h5>'
                    }]
                }, {
                    title: 'Visitors',
                    cls: 'visitors',
                    items: [{
                        xtype: 'component',
                        renderTpl: '<h4>50,726</h4><h5 class="change positive">1.03%</h5>'
                    }]
                }, {
                    title: 'New / Returning Visitors',
                    cls: 'new-returning-visitors',
                    items: [{
                        xtype: 'component',
                        renderSelectors: {
                            slice0: 'div.legend-item-0'
                        },
                        renderData: {
                            slice0: '135'
                        },
                        renderTpl: [
                            '<div class="pie">',
                                '<div class="piece legend-item-1" data-angle="0"></div>',
                                '<div class="piece legend-item-0" data-angle="{slice0}"></div>',
                            '</div>',
                            '<div class="legend">',
                                '<span class="key">New</span>',
                                '<span class="key legend-item-1">Returning</span>',
                                '<span class="change positive">1.03%</span>',
                            '</div>'
                        ],
                        listeners: {
                            afterrender: function (cmp) {
                                var angle = cmp.slice0.getAttribute('data-angle'),
                                    rotation = 'rotate(' + angle + 'deg)';

                                Ext.defer(function () {
                                    Ext.fly(cmp.slice0).setStyle({
                                        '-webkit-transform': rotation,
                                        '-moz-transform': rotation,
                                        '-ms-transform': rotation,
                                        'transform': rotation
                                    });
                                }, 2000);
                            }
                        }
                    }]
                }]
            }, {
                itemId: 'row2',
                defaults: {
                    xtype: 'panel',
                    componentCls: 'dashboard-panel',
                    width: 220,
                    height: 220,
                    margin: '0 0 0 20',
                    layout: 'fit'
                },
                items: [{
                    margin: 0,
                    title: 'Uptime',
                    cls: 'uptime',
                    items: [{
                        xtype: 'component',
                        renderTpl: [
                            '<h4 class="positive">Up</h4>',
                            '<div class="time last-down-time">',
                                '<span class="uptime-label">Last down time</span>',
                                '<span class="uptime-value">175d 5h 7m</span>',
                            '</div>',
                            '<div class="time response-time">',
                                '<span class="uptime-label">Reponse time</span>',
                                '<span class="uptime-value">300ms</span>',
                            '</div>'
                        ]
                    }]
                }, {
                    title: 'Load Time',
                    cls: 'load-time',
                    items: [{
                        xtype: 'component',
                        renderTpl: '<h4>1.8s</h4><h5 class="change positive">1.12%</h5>'
                    }]
                }, {
                    title: 'Live Visitors',
                    cls: 'live-visitors',
                    items: [{
                        xtype: 'component',
                        renderSelectors: {
                            slice0: 'div.legend-item-0',
                            needle: 'span.needle'
                        },
                        renderData: {
                            slice0: '130',
                            needle: '-90'
                        },
                        renderTpl: [
                            '<div class="meter">',
                                '<div class="pie">',
                                    '<div class="piece legend-item-1" data-angle="0"></div>',
                                    '<div class="piece legend-item-0" data-angle="{slice0}"></div>',
                                '</div>',
                                '<span class="meter-value">72</span>',
                                '<span class="meter-min-label">30 day min</span>',
                                '<span class="meter-min-value">0</span>',
                                '<span class="meter-max-label">30 day max</span>',
                                '<span class="meter-max-value">100</span>',
                                '<span class="needle" data-angle="{needle}"></span>',
                            '</div>'
                        ],
                        listeners: {
                            afterrender: function (cmp) {
                                var angle = parseInt(cmp.slice0.getAttribute('data-angle'), 10),
                                    needleAngle = parseInt(cmp.needle.getAttribute('data-angle'), 10),
                                    rotation = 'rotate(' + angle + 'deg)',
                                    needleRotation = 'rotate(' + (angle + needleAngle) + 'deg)';

                                console.log(angle);
                                Ext.defer(function () {
                                    Ext.fly(cmp.slice0).setStyle({
                                        '-webkit-transform': rotation,
                                        '-moz-transform': rotation,
                                        '-ms-transform': rotation,
                                        'transform': rotation
                                    });
                                    Ext.fly(cmp.needle).setStyle({
                                        '-webkit-transform': needleRotation,
                                        '-moz-transform': needleRotation,
                                        '-ms-transform': needleRotation,
                                        'transform': needleRotation
                                    });
                                }, 2000);
                            }
                        }
                    }]
                }, {
                    title: 'Conversion Rate',
                    cls: 'conversion-rate',
                    items: [{
                        xtype: 'component',
                        renderTpl: '<h4>0.14</h4><h5 class="change negative">1.02%</h5>'
                    }]
                }, {
                    title: 'Opened / Unopened Mail',
                    cls: 'opened-unopened-mail',
                    items: [{
                        xtype: 'component',
                        renderTpl: [
                            '<div class="mail unopened">',
                                '<span class="mail-value">207</span>',
                                '<span class="mail-label">unopened</span>',
                            '</div>',
                            '<div class="mail opened">',
                                '<span class="mail-value">191</span>',
                                '<span class="mail-label">opened</span>',
                            '</div>'
                        ]
                    }]
                }]
            }]
        });

        me.header = {
            title: 'Dashboard: All Collections',
            actions: [
                {
                    xtype: 'primarybutton',
                    text: '+ Add Widget'
                }
            ]
        };

        Ext.apply(me.body, {
            layout: 'fit',
            items: dashboard
        });

        me.callParent(arguments);
    },

    // combines both options objects
    mergeOptions: function (obj1, obj2) {
        var obj3 = {};

        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }

        return(obj3);
    }
});
