/**
 * @class Taco.view.themes.Index
 * @author Michael Speed Elder
 */
Ext.define('Taco.view.theme.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
        'Taco.view.theme.ThemeView',
        'Taco.store.ThemeListing'
    ],

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    
    initComponent: function() {
        this.header = {
            title: 'Manage Themes'
        };

        this.store = Ext.create('Taco.store.ThemeListing', {
            groupField: 'isSelected',
            groupDir: 'DESC',
            sortOnLoad:true,
            remoteGroup:false,
            listeners: {
                beforesync: function() {
                    if (this.store.autoSyncSuspended) {
                        return false;
                    }
                    this.store.suspendAutoSync();
                    return true;

                },
                write: function(store, operation, eOpts) {

                    if (operation.action == "update") {
                        var rs = operation.resultSet;
                        Ext.each(operation.resultSet.records, function(serverRecord, index, array) {
                            var shouldProcess = Ext.Array.filter(operation.records, function(item) {
                                return item.getId() == serverRecord.getId();
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
                    Ext.defer(function() {
                        store.sync();
                    }, 10);
                },
                scope: this
            }
        });
        
        this.themesView = Ext.create('Taco.view.theme.ThemeView', {
            store: this.store
        });

        this.body = {
            items: [this.themesView]
        };

        this.store.load();

        this.callParent(arguments);
    }

});