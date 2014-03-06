/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.provisioning.Index', {
    extend: 'Taco.core.ux.content.Container',

    requires: [
        'Taco.core.context.StoreItem',
        'Taco.model.Provisionable'
    ],

    title: 'Settings Structure',
    initComponent: function () {

        var siteData = [];


        var catalogTreeStore = Ext.create('Ext.data.TreeStore', {
            model: 'Taco.model.Provisionable',
            root: { path: "/" },
            proxy: {
                type: 'ajax',
                url: '/admin/app/provisioning/catalogs',
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                },
            },            
        });
        catalogTreeStore.on('load', function () {
            console.log(arguments);
           // debugger;
        });
        window.catalogTreeStore = catalogTreeStore;
        var rootNode = catalogTreeStore.getRootNode();

        Ext.Array.each(Taco.app.context.masterCatalogs, function (mc) {
            // var mcNode = rootNode.appendChild(Ext.apply(mc, { expanded: true }));
            //  mcNode.expanded = true;
            Ext.Array.each(mc.catalogs, function (cat) {
                //  var catNode = mcNode.appendChild(Ext.apply(cat, { leaf: true }));
                siteData = siteData.concat(cat.sites);

            });
        });

        var siteStore = Ext.create('Ext.data.Store', {
            model: 'Taco.core.context.StoreItem',
            data: siteData
        });
        // rootNode.expand(true);

        var me = this;
        this.body = {
            layout: {
                type: 'column',
                // The total column count must be specified here
                //  columns: 2
            },

            items:
            [
                {
                    xtype: 'container',
                    columnWidth: .5,
                    items: [
                        {
                            xtype: 'treepanel',

                            store: catalogTreeStore,
                            rootVisible: false,
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [{
                                            text: 'Docked to the top'
                                        }, '->',
                                        {
                                            xtype: 'button',
                                            text: 'xxx'
                                        }]
                                }
                            ],
                            columns: [
                                { xtype: 'treecolumn', text: 'Name', dataIndex: 'name', flex: 1 },
                                { text: 'Currency', dataIndex: 'currency' },
                                { text: 'Locale', dataIndex: 'localeCode' },
                                { text: 'name', dataIndex: 'name' }
                            ],
                        }
                    ]
                }, {
                    xtype: 'container',
                    columnWidth: .5,
                    items: [                        
                        {
                            xtype: 'grid',
                            dockedItems: [
                                {
                                    xtype: 'toolbar',
                                    dock: 'top',
                                    items: [{
                                            text: 'Docked to the top'
                                        }, '->',
                                        {
                                            xtype: 'button',
                                            text: 'xxx'
                                        }]
                                }
                            ],
                            store: siteStore,
                            columns: [
                                { text: 'Name', dataIndex: 'name', flex: 1 },
                                { text: 'Currency', dataIndex: 'currency' },
                                { text: 'Locale', dataIndex: 'localeCode' }
                            ],
                        }
                    ]
                }]
        };
        me.callParent(arguments);

    }
});