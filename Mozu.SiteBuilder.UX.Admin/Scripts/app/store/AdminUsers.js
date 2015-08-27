/**
 * @class Taco.store.AccountUsers
 */


Ext.define('Taco.store.AdminUsers', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.AdminUser',
        constructor: function (config) {
            config = Ext.applyIf(config, { data: Taco.siteUsersRaw });
            this.callParent([config]);
        },
        storeManagerConfig: {
            createOnly: true
           
        }
    });

