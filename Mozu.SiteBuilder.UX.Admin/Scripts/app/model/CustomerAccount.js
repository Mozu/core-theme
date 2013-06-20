/**
 * @class Taco.model.CustomerAccount
 */
Ext.define('Taco.model.CustomerAccount', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Contact'],
    fields: [{
            name: 'id',
            type: 'int'
        }, {
            name: 'userId',
            type: 'string'
        }, {
            name: 'siteId',
            type: 'int'
        }, {
            name: 'companyName',
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
            name: 'totalSpent',
            type: 'float',
            defaultValue: 0
        }, {
            name: 'orderCount',
            type: 'int',
            defaultValue: 0
        }, {
            name: 'lastOrderDate',
            type: 'date'
        }
    ],
    
   
    getContacts: function () {
        return this.getOrCreateHasManyStore({
            model: 'Taco.model.Contact',
            associationKey: 'contacts',
            foreignProperty: 'account'
        });
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
            read: function (response) {
                var data;
                this.initContactFields();
                if (response) {
                    data = response.responseText ? this.getResponseData(response) : this.readRecords(response);
                }

                return data || this.nullResultSet;
            },
            initContactFields:function () {
                var contactFields = Taco.model.Contact.getFields(), newFields = [
                {
                    name: 'id',
                    type: 'int'
                }, {
                    name: 'siteId',
                    type: 'int'
                }, {
                    name: 'companyName',
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
                    name: 'totalSpent',
                    type: 'float',
                    defaultValue: 0
                }, {
                    name: 'orderCount',
                    type: 'int',
                    defaultValue: 0
                }, {
                    name: 'lastOrderDate',
                    type: 'date'
                }];
                if (!Taco.model.CustomerAccount.contactFieldsAdded) {
                    Taco.model.CustomerAccount.contactFieldsAdded = true;

                    Ext.each(contactFields, function (contactField) {
                        newFields.push({
                            name: 'primary' + Ext.String.capitalize(contactField.name),
                            type: contactField.type.type,
                            convert: function location(v, record) {

                                if (record.raw.contacts && record.raw.contacts.length) {
                                    return contactField.convert(record.raw.contacts[0][contactField.name]);
                                }
                                return contactField.convert(null);
                            }
                        }
                        );

                    });
                    Taco.model.CustomerAccount.setFields(newFields);
                }
            }
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});