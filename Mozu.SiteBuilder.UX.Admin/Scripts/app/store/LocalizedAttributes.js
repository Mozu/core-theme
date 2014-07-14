/**
 * @class Taco.store.LocalizedAttributes
 */
Ext.define('Taco.store.LocalizedAttributes', {
    extend: 'Ext.data.Store',
    model: function () {
        return Ext.define('Taco.model.LocalizedAttribute' + Ext.id(), {
            extend: 'Ext.data.Model',
            fields: function () {
                var //mc = Taco.app.context.getMasterCatalog(),
                    excludeDefaultLocale = true,
                    supportedLocales = ['fr-FR', 'ru-RU'],
                    //(!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
                    items = [
                        {
                            name: 'attributeFQN',
                            type: 'string'
                        }, {
                            name: 'adminName',
                            type: 'string'
                        }, {
                            name: 'name',
                            type: 'string'
                        }, {
                            name: 'description',
                            type: 'string',
                            useNull: true
                        }, {
                            name: 'locale',
                            type: 'string',
                            useNull: true
                        }
                    ];
                Ext.Array.each(supportedLocales, function(loc) {
                    console.log(loc);
                    items.push({
                        name: loc + '_name',
                        type: 'string',
                        useNull: true
                    });
                });
                return items;
            }(),
            proxy: {
                type: 'ajaxproxy',
                idParam: 'attributeFQN',
                api: {
                    read: '/admin/app/localizedcontent/attributes/read',
                    update: function () {
                        return '/admin/app/localizedcontent/attributes/edit/' + this.attributeFQN;
                    }()
                },
                reader: {
                    type: 'json',
                    root: 'items',
                    successProperty: 'success'
                },
                writer: {
                    type: 'json',
                    allowSingle: false
                }
            }
        });
    }(),
    remoteFilter: false,
    remoteSort: false,
    pageSize: 50,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: true,
        autoLoad: true
    }
});