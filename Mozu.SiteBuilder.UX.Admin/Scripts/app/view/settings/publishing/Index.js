

Ext.define('Taco.view.settings.publishing.Index', {
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

            var subitems = [];

            Ext.Array.push(subitems, {
                html: 'Catalog Publishing',
                width: 200
            }, {
                xtype: 'radiogroup',
                margin: '0 0 0 50',
                width: 150,
                value: 'Live',
                items: [{
                    boxLabel: 'Live',
                    inputValue: 'Live',
                    checked: true,
                    name: 'catalog-publishing-' + siteCollection.id
                }, {
                    boxLabel: 'Stage',
                    inputValue: 'Stage',
                    name: 'catalog-publishing-' + siteCollection.id
                }]
            });


            // Get out of there are no sites, bitch!!!
            if (!siteCollection.sites.length) return;

            Ext.Array.push(subitems, {
                html: 'Content Publishing'
            }, {});

            Ext.each(siteCollection.sites, function (site) {
                Ext.Array.push(subitems, {
                    html: site.name
                }, {
                    xtype: 'radiogroup',
                    margin: '0 0 0 50',
                    width: 150,
                    value: 'Live',
                    items: [{
                        boxLabel: 'Live',
                        inputValue: 'Live',
                        checked: true,
                        name: 'content-publishing-' + site.id
                    }, {
                        boxLabel: 'Stage',
                        inputValue: 'Stage',
                        name: 'content-publishing-' + site.id
                    }]
                });
            });

            items.push({
                ui: 'subform',
                title: siteCollection.name,
                layout: {
                    type: 'table',
                    columns: 2
                },
                items: subitems
            });

        }, this);

        return items;
    }
})