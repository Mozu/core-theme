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
        'Taco.store.StoreCredits',
        'Taco.model.CustomerSegment'
    ],
    fields: [
        {
            name: 'id',            
            type: 'int'
        }, {
            name: 'userId',
            type: 'string'
        }, {
            name: 'firstName',
            type: 'string'        
        }, {
            name: 'firstNameSafe',
            type: 'string',
            convert: function(value, record) {
                return Ext.util.Format.htmlEncode(record.get('firstName'));
            }
        }, {
            name: 'lastName',
            type: 'string'
        }, {
            name: 'lastNameSafe',
            type: 'string',
            convert: function(value, record) {
                return Ext.util.Format.htmlEncode(record.get('lastName'));
            }
        },
        {
            name: 'fullName', convert: function (v, r) {
                return r.raw ? r.raw.firstName + ' ' + r.raw.lastName : null;
            }
        },
        {
            name: 'fullNameEmail', convert: function (v, r) {
                return r.raw ? r.raw.firstName + ' ' + r.raw.lastName + ' ' + r.raw.emailAddress : null;
            }
        },

        {
            name: 'emailAddress',
            type: 'string'
        }, {
            name: 'emailAddressSafe',
            type: 'string',
            convert: function(value, record) {
                return Ext.util.Format.htmlEncode(record.get('emailAddress'));
            }
        }, {
             name: 'segments',
             type: 'auto',
             defaultValue:[]
         }, {
             name: 'segmentIds',
             type: 'auto',
             defaultValue:[]
        }, {
            name: 'userName',
            type: 'string'
        }, {
            name: 'companyOrOrganization',
            type: 'string'
        }, {
            name: 'acceptsMarketing',
            type: 'boolean'
        }, {
            name: 'isAnonymous',
            type: 'boolean',
            defaultValue:true
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
            type: 'date',
            dateFormat: 'c'
        }, {
            name: 'createDate',
            type: 'date',
            dateFormat: 'c'
        }, {
            name: 'taxExempt',
            type: 'boolean',
            defaultValue: false
        }, {
            name: 'taxId',
            type: 'string'
        }, {
            name: 'isDisabled',
            type: 'boolean'
        }, {
            name: 'isLocked',
            type: 'boolean'
        }, {
            name: 'accountStatus',
            convert: function (v, record) {
                if (record.data.isDisabled === true) {
                    return 'Disabled';
                } else if (record.data.isLocked === true) {
                    return 'Locked';
                } else {
                    return 'Active';
                }
            }
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
        this.storeCreditsStore = Taco.store.StoreCredits.createForCustomer(this.getId());
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
            messageProperty: 'message'
           
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});