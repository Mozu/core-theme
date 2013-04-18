/**
 * @class Taco.view.themes.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.theme.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.view.theme.ThemeView'
        , 'Taco.store.ThemeListing'
    ],

    initComponent: function () {
        this.header = {
            title: 'Manage Themes'
        };

        this.store = Ext.create('Taco.store.ThemeListing'
            ,
            {
                listeners:
                {
                    beforesync: function () {
                        if (this.store.autoSyncSuspended) {
                            return false;
                        }
                        this.store.suspendAutoSync();
                        return true;
                        
                    },
                    write: function (store, operation, eOpts) {
                        
                        if (operation.action == "update") {
                            var rs = operation.resultSet;
                            Ext.each(operation.resultSet.records, function (serverRecord, index, array) {
                                var shouldProcess = Ext.Array.filter(operation.records, function(item) {
                                    item.getId()== serverRecord.getId()
                                }).length == 0;
                               
                                if (shouldProcess) {
                                    var clientRecord = store.getById(serverRecord.getId());
                                    if (clientRecord) {
                                        clientRecord.copyFrom(serverRecord);
                                        
                                    }
                                }
                            });
                        }
                        store.resumeAutoSync();
                        Ext.defer(function() { store.sync() }, 10);
                    },
                    scope:this
                }
            }
        );

        this.unpublishedThemes = Ext.create('Taco.view.theme.ThemeView', {
            store: this.store
        });
        this.publishedThemes = Ext.create('Taco.view.theme.ThemeView', {
            store: this.store,
            renderSelected: true
        });

        this.items = [
            {
                html: 'Published Themes'
                , xtype: 'component'
                , autoEl: 'h3'
                , cls: Taco.baseCSSPrefix + 'theme-category-header'
            },
            {
                xtype: 'container',
                cls: Taco.baseCSSPrefix + 'published-themes ' + Taco.baseCSSPrefix + 'themes-container',
                items: this.publishedThemes
            },
            {
                html: 'Unpublished Themes'
                , xtype: 'component'
                , autoEl: 'h3'
                , cls: Taco.baseCSSPrefix + 'theme-category-header'
            },
            {
                xtype: 'container',
                cls: Taco.baseCSSPrefix + 'themes-container',
                items: this.unpublishedThemes
            }
        ];


        this.body = {
            items: this.items,
            layout: 'auto'
            // items: [Ext.create('Taco.view.site.navigation.Themes')]
        };

        this.callParent( arguments );

        this.store.load();
    }

});