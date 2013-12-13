/**
 * @class Taco.model.CustomerAccount
 */
Ext.define('Taco.model.CustomerAccount', {
    extend: 'Taco.core.data.Model',
    behaviors: {
        read: 41,
        create: 44,
        update: 42,
        destroy: 43
    },
    requires: [
        'Taco.model.Contact',
        'Taco.model.Order',
        'Taco.store.Orders',
        'Taco.store.StoreCredits'
    ],
    fields: [
        {
            name: 'id',
            type: 'int'
        }, {
            name: 'userId',
            type: 'string'
        },        
        {
            name: 'firstName',
            type: 'string'        
        },
        {
            name: 'lastName',
            type: 'string'
        },
        {
            name: 'emailAddress',
            type: 'string'
        },
        {
            name: 'userName',
            type: 'string'
        },
        {
            name: 'companyOrOrganization',
            type: 'string'
        }, {
            name: 'acceptsMarketing',
            type: 'boolean'
        }, {
            name: 'groups',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'contacts',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'attributes',
            type: 'auto',
            defaultValue: []
        }, {
            name: 'totalSpent',
            type: 'float',
            defaultValue: 0
        }, {
            name: 'visitCount',
            type: 'int',
            defaultValue: 0
        }, {
            name: 'orderCount',
            type: 'int',
            defaultValue: 0
        }, {
            name: 'lastOrderDate',
            type: 'date'
        }, {
            name: 'createDate',
            type: 'date'
        }
    ],    
   
    getOrders: function () {

        if (!this.orders) {
            this.orders = Ext.create('Taco.store.Orders', {
                filters: [
                    {
                        property: 'customerId',
                        value: this.getId()
                    }
                ]
            });
        }
        return this.orders;
    },
    getContacts: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.Contact',
            associationKey: 'contacts',
            foreignProperty: 'account'
        });
    },

    getAttributes: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.ExtensibleAttributeValue',
            associationKey: 'attributes',
            foreignProperty: 'account'
        });
    },
    
    getStoreCredits: function (config ) {
        if (this.storeCreditsStore) {
            return this.storeCreditsStore;
        }
        this.storeCreditsStore = Ext.create('Taco.store.StoreCredits', { autoLoad: false });
        this.storeCreditsStore.getProxy().extraParams = this.storeCreditsStore.getProxy().extraParams || {};
        this.storeCreditsStore.getProxy().extraParams.customerId = this.getId();
        this.storeCreditsStore.load(config);
        return this.storeCreditsStore;

    },
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customer/list',
            create: '/admin/app/customer/create',
            update: '/admin/app/customer/edit',
            destroy: '/admin/app/customer/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message',
           
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});