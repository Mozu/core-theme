/**
 * @class Taco.view.order.subform.ShippingSimple
 */

Ext.define('Taco.view.order.subform.ShippingSimple', {
    extend: 'Taco.view.order.subform.Subform',
    alias: 'widget.taco-ordershippingsimple',
    requires: [
        'Taco.model.Contact',
        'Taco.shared.view.form.Address',
        'Taco.shared.view.modal.Address'
    ],
    title: 'Shipping',

    tools: [{
        type: 'gear',
        menu: {
            plain: true,
            shadow: false,
            items: []
        },
        callback: function (owner, tool, e) {
            var menu = tool.menu;

            if (tool.hasVisibleMenu()) {
                menu.removeAll();
                menu.add(owner.getMenuActions());
            }
        }
    }],

    config: {
        record: null
    },

    initComponent: function () {

        

        this.callParent(arguments);
    },




    getMenuActions: function () {
        var action = new Ext.Action({
            text: 'Add Address',
            handler: this.launchEditor,
            scope: this
        });

        return [action];
    },

    setCustomer: function (customer) {        
        this.customerRecord = customer;
        this.contactsStore = this.customerRecord.getContacts();
        // clear out any old addresses from a previously selected customer;
        if (this.addresses) {
            this.addresses.bindStore(this.contactsStore);
        } else {
            this.initContacts();
        }
        

        var primaryShipping = this.addresses.store.findRecord("isPrimaryShipping", true);        

        if (primaryShipping) {
            this.addresses.getSelectionModel().select(primaryShipping);

            this.contactData = primaryShipping.data;
            this.setShippingInfo();
            this.fireEvent('orderchange');
        }        
    },

    initContacts: function () {
        var me = this;


        this.addresses = Ext.widget({
            title:"Select a shipping address",
            xtype: 'dataview',
            cls: 'taco-addresses',
            itemSelector: '.address',
            store: this.contactsStore,
            tpl: [
                '<tpl for=".">',
                    '<div class="address">',
                        '<tpl if="firstName">',
                            '<div class="shipToLabel">Ship To:</div>',
                            '<div class="name">{firstName} {middleName} {lastName}</div>',
                            '<div class="address-line-1">{address1}</div>',
                            '<div class="address-line-2">{address2}</div>',
                            '<div class="address-line-3">{address3}</div>',
                            '<div class="city-state-zip">{cityOrTown}, {stateOrProvince} {postalOrZipCode}  {countryCode}</div>',
                            '<div class="country">{email}</div>',
                            '<div class="phone">{homePhone}</div>',
                            //'<div class="actions"><a href="#">edit</a> | <a href="#">delete</a></div>',
                        '</tpl>',
                    '</div>',
                '</tpl>',

                //'<tpl if="values.length">',
                    '<a  href="#" style="float:left;padding:10px;clear:both" class="addLink">Add new address</a>'
                //'<tpl else>',
                //    '<div class="no-address addLink"><br>Click to add one.</div>',                    
                //'</tpl>',

            ],
            listeners: {
                
                containerclick: {
                    fn: function (view, evt) {

                        // clicked add new address link;
                        var el = Ext.get(evt.getTarget());

                        if (el.hasCls('addLink')) {
                            this.launchEditor();
                        }

                    },
                    scope: me
                },
                itemclick: {
                    fn: function (view, record, item, index, e) {
                        //shipping address selected;
                        

                        this.contactData = record.data;

                        

                        // show the shipping methods field;
                        //this.initShippingMethodField();
                        //update the order record;

                        this.setShippingInfo();

                        this.fireEvent('orderchange');


                    },
                    scope: me
                }
                
            }
        });
        
        
        this.add(this.addresses);
    },


    launchEditor: function () {
        // todo: add support for edit by passing in the contact;
        var contact = null;

        var record = (contact) ? contact : Ext.create('Taco.model.Contact');

        Ext.create('Taco.shared.view.modal.Address', {
            singlePhoneRequired:true,
            record: record,
            listeners: {
                savesuccess: function (modal, record) {
                    
                    var contactStore = this.customerRecord.getContacts()
                    // if this is the first contact in the store, need to set the isPrimary for the addresses
                    if (!contactStore.count()) {
                        record.set({
                            isBilling: true,
                            isPrimaryBilling: true,
                            isPrimaryShipping: true,
                            isShipping: true
                        })                        
                    }

                    contactStore.add(record);                    
                    // persist the customer with the new contact;
                    
                    this.customerRecord.save({
                        success: function (record, operation) {
                            
                        },
                        failure: function () {
                            
                        },
                        scope: this
                    });

                    // select the address;
                    this.addresses.getSelectionModel().select(record);

                    // store the selection ;
                    this.contactData = record.data;

                    this.setShippingInfo();
                    this.fireEvent('orderchange');
                },
                scope: this
            }
        });
    },

    // persist the contact and shipping method for this order;
    setShippingInfo: function () {
        

        var me =this,
            shippingMethodCode = (this.shippingMethodField) ? this.shippingMethodField.getValue() : null

        Ext.Ajax.request({
            url: '/admin/app/order/setshippinginfo',
            method: 'POST',
            jsonData: {
                orderId: this.record.getId(),
                contact: this.contactData,
                shippingMethodCode: shippingMethodCode
            },
            success: function (record, operation) {
                

                if (this.shippingMethodField) {
                    this.loadShippingMethods();
                } else {
                    this.initShippingMethodField();
                }

                
            },
            failure: function () {
                
            },
            scope: this
        });
    },


    // this will be called after each change, to see if all the requirements are met
    initShippingMethodField: function () {
        var me = this;
        if (!this.shippingMethodField) {

            // need a contact and order items;
            if (!this.contactData || !this.record.data.items.length) {
                return
            }
            
            this.shippingMethodsStore = Ext.create('Ext.data.Store', {
                model: 'Taco.model.ShippingMethod',
                autoLoad: false,
                proxy: {
                    type: 'ajax',
                    url: '/admin/app/order/shipping/runtimemethods?orderId=' + me.record.getId(),
                    reader: {
                        type: 'json',
                        root: 'items',
                        successProperty: 'success'
                    }
                }
            });

            this.shippingMethodField = Ext.widget({
                xtype: 'selectfield',
                style:"clear:both",
                width: 200,
                fieldLabel: 'Shipping Methods',
                valueField: 'shippingMethodCode',
                displayField: 'shippingMethodName',
                store: this.shippingMethodsStore,
                listConfig: {
                    getInnerTpl: function () {
                        return '{shippingMethodName} {price:currency}';
                    }
                },
                listeners: {
                    select: function () {
                        this.setShippingInfo();
                    },
                    scope: this
                }
            });

            this.add(this.shippingMethodField);
        }
    },

    loadShippingMethods: function () {
        
        

        // only load the shipping methods if the field has been initialized; Need to wait until the minimum requirements are met;

        if(this.shippingMethodField){
            this.shippingMethodsStore.load({
                callback: function () {
                    console.log('store', this.shippingMethodsStore.count());
                },
                scope: this
            });
        }
    },

    isValid: function () {
        return this.hasFulfillmentContact();
    },

    hasFulfillmentContact: function () {
        return !!this.contact.get('firstName');
    }
});