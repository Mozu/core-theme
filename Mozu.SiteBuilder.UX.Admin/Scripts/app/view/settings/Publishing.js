

Ext.define('Taco.view.settings.Publishing', {
    extend: 'Taco.core.ux.content.Container',

    requires: [
        'Taco.core.ux.form.OnOffSliderButton'
    ],

    initComponent: function () {
        
        this.header.title = 'howdy';

        this.body.items = this.buildItems();

        console.log('ITEMS', this.buildItems());

        // this.body.items = [{
        //     html: 'THINGS'
        // }]

        this.callParent(arguments);
    },

    buildItems: function () {
        var items = [];

        Ext.each(Taco.app.context.siteCollections, function (siteCollection) {
            //debugger;
            var subitems = [],
                isLiveProduct = siteCollection.productPublishingMode === 'Live';


            Ext.Array.push(subitems, {}, {
                html: 'Live',
                margin: '15 0 0 0'
            }, {
                html: 'Stage',
                margin: '15 0 0 10'
            }, {
                html: 'Catalog Publishing',
                width: 200,
                cls: 'shit'
            }, {
                xtype: 'radio',
                checked: isLiveProduct,
                name: 'catalog-publishing-' + siteCollection.id,
                margin: '0 0 0 10',
                cls: 'shit',
                listeners: {
                    change: function (field) {
                        siteCollection.updateProductPublishingMode(field.getValue() ? 'Live' : 'Pending');
                    }
                }
            }, {
                xtype: 'radio',
                checked: !isLiveProduct,
                name: 'catalog-publishing-' + siteCollection.id,
                margin: '0 0 0 20',
                cls: 'shit'
            });


            // Get out of there are no sites, bitch!!!
            if (!siteCollection.sites.length) return;

            Ext.Array.push(subitems, {
                html: 'Content Publishing'
            }, {}, {});

            Ext.each(siteCollection.sites, function (site) {
                

                Ext.Array.push(subitems, {
                    html: site.name
                }, {
                    xtype: 'radio',
                    inputValue: 'Live',
                    checked: true,
                    name: 'content-publishing-' + site.id,
                    margin: '0 0 0 10'
                }, {
                    xtype: 'radio',
                    inputValue: 'Pending',
                    checked: false,
                    name: 'content-publishing-' + site.id,
                    margin: '0 0 0 20'
                });
            });

            items.push({
                ui: 'subform',
                title: siteCollection.name,
                layout: {
                    type: 'table',
                    columns: 3
                },
                items: subitems
            });

        }, this);

        return items;
    }
})