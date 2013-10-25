

Ext.define('Taco.view.settings.Publishing', {
    extend: 'Taco.core.ux.content.Container',

    requires: [
        'Taco.core.ux.form.OnOffSliderButton'
    ],

    cls: 'taco-publishing-settings',

    initComponent: function () {
        
        this.header.title = 'Publish Settings';

        this.body.items = this.buildItems();

        console.log('ITEMS', this.buildItems());

        // this.body.items = [{
        //     html: 'THINGS'
        // }]

        this.callParent(arguments);
    },

    buildItems: function () {
        var items = [];

        this.suspendSetValue = false;

        Ext.each(Taco.app.context.masterCatalogs, function (masterCatalog) {

            var subitems = [],
                isLiveProduct = masterCatalog.productPublishingMode === 'Live',
                liveProductRadio,
                stagedProductRadio;

            liveProductRadio = Ext.widget({
                xtype: 'radio',
                checked: isLiveProduct,
                name: 'product-publishing-' + masterCatalog.id,
                cellCls: 'product radio',
                listeners: {
                    change: function (field) {
                        masterCatalog.updateProductPublishingMode(field.getValue() ? 'Live' : 'Pending');
                    },
                    click: {
                        fn: function (e) {
                            this.confirmLive(liveProductRadio);
                        },
                        element: 'inputEl'
                    },
                    scope: this
                }
            });

            liveProductRadio.setValue = Ext.bind(function () {
                if (!this.suspendSetValue) {
                    liveProductRadio.__proto__.setValue.apply(liveProductRadio, arguments);
                }
            }, this);

            stagedProductRadio = Ext.widget({
                xtype: 'radio',
                checked: !isLiveProduct,
                name: 'product-publishing-' + masterCatalog.id,
                cellCls: 'product radio'
            });

            stagedProductRadio.setValue = Ext.bind(function () {
                if (!this.suspendSetValue) {
                    stagedProductRadio.__proto__.setValue.apply(stagedProductRadio, arguments);
                }
            }, this);

            Ext.Array.push(subitems, {}, {
                xtype: 'component',
                html: 'Live',
                cellCls: 'header radio'
            }, {
                html: 'Staged',
                cellCls: 'header radio'
            }, {
                html: 'Product Publishing',
                width: 200,
                cellCls: 'product'
            },
                liveProductRadio,
                stagedProductRadio
            );


            // Get out of there are no sites, bitch!!!
            if (!masterCatalog.sites.length) return;

            Ext.Array.push(subitems, {
                html: 'Content Publishing',
                cellCls: 'content'
            }, {}, {});

            Ext.each(masterCatalog.sites, function (site) {
                var liveContentRadio,
                    stagedContentRadio;

                liveContentRadio = Ext.widget({
                    xtype: 'radio',
                    inputValue: 'Live',
                    checked: true,
                    name: 'content-publishing-' + site.id,
                    cellCls: 'site radio',
                    listeners: {
                        change: function (field) {
                            site.updateContentPublishingMode(field.getValue() ? 'Live' : 'Pending');
                        },
                        click: {
                            fn: function (e) {
                                this.confirmLive(liveContentRadio);
                            },
                            element: 'inputEl'
                        },
                        scope: this
                    }
                });

                liveContentRadio.setValue = Ext.bind(function () {
                    if (!this.suspendSetValue) {
                        liveContentRadio.__proto__.setValue.apply(liveContentRadio, arguments);
                    }
                }, this);

                stagedContentRadio = Ext.widget({
                    xtype: 'radio',
                    inputValue: 'Pending',
                    checked: false,
                    name: 'content-publishing-' + site.id,
                    cellCls: 'site radio'
                });

                stagedContentRadio.setValue = Ext.bind(function () {
                    if (!this.suspendSetValue) {
                        stagedContentRadio.__proto__.setValue.apply(stagedContentRadio, arguments);
                    }
                }, this);

                Ext.Array.push(subitems, {
                    html: site.name,
                    cellCls: 'site site-name'
                },
                    liveContentRadio,
                    stagedContentRadio
                );
            }, this);

            items.push({
                ui: 'subform',
                title: masterCatalog.name,
                layout: {
                    type: 'table',
                    columns: 3
                },
                margin: '0 0 30',
                defaults: {
                    xtype: 'component'
                },
                items: subitems
            });

        }, this);

        return items;
    },

    confirmLive: function (field) {

        // If switching from Live to Stage, do nothing
        if (field.getValue()) return;

        // If switching from Stage to Live, confirm the change 
        this.suspendSetValue = true;
        
        Taco.MessageBox.confirm({
            title: 'Are you sure?',
            msg: 'Switching to Live Edits will automatically publish any staged edits.',
            modal: true,
            fn: function (btn, text) {
                
                this.suspendSetValue = false;

                if (btn === 'ok') {
                    field.setValue(true);
                }
            },
            scope: this
        });
    }
})