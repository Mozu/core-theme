/**
 * @class Taco.view.order.subform.ShippingSimple
 */


// deprecated


//Ext.define('Taco.view.order.subform.ShippingSimple', {
//    extend: 'Taco.view.order.subform.Subform',
//    alias: 'widget.taco-ordershippingsimple',
//    requires: [
//        'Taco.store.StatesStatic',
//        'Taco.model.Contact',
//        'Taco.shared.view.form.Address',
//        'Taco.shared.view.modal.Address'
//    ],
//    title: 'Shipping',

//    // puts the tools into a header toolbar with overflow management and default button configuration; 
//    headerToolbar: true,

//    config: {        
//        record: null
//    },

//    initComponent: function () {
//        var me = this;

//        this.tools =[
//            {
//                xtype: "button",
//                ui: "action",
//                scale: "medium",
//                cls: "taco-icon-button",
//                iconCls: "taco-button-gear",
//                menuAlign:"tr-br",
//                listeners: {
//                    menushow: {
//                        fn: function (button, menu, eOpts) {
//                            menu.removeAll();
//                            menu.add(me.getMenuActions());
//                        },
//                        scope: me
//                    }
//                },
//                menu: {
//                    plain: true,
//                    showSeparator: false,
//                    shadow: false,
//                    items: [{
//                        text: "loading..."
//                    }]
//                }
//            }
//        ]




//        me.items = [];
//        me.initShippingMethodField();
//        me.callParent(arguments);
//    },

//    getMenuActions: function () {
        
//        var action = new Ext.Action({
//            text: 'Add Address',
//            handler: this.launchEditor,
//            scope: this
//        });

//        return [action];
//    },

//    onCustomerChange: function (customer) {        

//        var isCustomerChange = (customer.getId() != this.record.get("customerId"));

//        this.customerRecord = customer;
//        this.contactsStore = this.customerRecord.getContacts();
//        // clear out any old addresses from a previously selected customer;
//        if (this.addresses) {
//            this.addresses.bindStore(this.contactsStore);
//        } else {
//            this.initContacts();
//        }        

//        var fulfillmentContact = this.record.get("fulfillmentContact");
//        //select existing contact if this is the inital load and not a change from one customer to another;
//        if (!isCustomerChange && fulfillmentContact && fulfillmentContact.id) {
//            var selectedContact = this.addresses.store.getById(fulfillmentContact.id)
//            if (selectedContact) {
//                this.contactData = selectedContact.data;
//                this.addresses.getSelectionModel().select(selectedContact);
//            }
//        } else {
//            // select primary if one exists;
//            var primaryShipping = this.addresses.store.findRecord("isPrimaryShipping", true);
//            if (primaryShipping) {
//                this.addresses.getSelectionModel().select(primaryShipping);
//                this.contactData = primaryShipping.data;
//                this.setShippingInfo();
//                //this.fireEvent('orderchange');
//            }
//        }

        
//        this.loadShippingMethods();
//    },

//    initContacts: function () {
//        var me = this;


//        this.addresses = Ext.widget({
//            title:"Select a shipping address",
//            xtype: 'dataview',
//            cls: 'taco-addresses',
//            itemSelector: '.address',
//            store: this.contactsStore,
//            tpl: [
//                '<tpl for=".">',
//                    '<div class="address">',
//                        '<tpl if="firstName">',
//                            '<div class="ship-to-label">Ship To:</div>',
//                            '<div class="name">{firstName} {middleName} {lastName}</div>',
//                            '<div class="address-line-1">{address1}</div>',
//                            '<div class="address-line-2">{address2}</div>',
//                            '<div class="address-line-3">{address3}</div>',
//                            '<div class="city-state-zip">{cityOrTown}, {stateOrProvince} {postalOrZipCode}  {countryCode}</div>',
//                            '<div class="country">{email}</div>',
//                            '<div class="phone">{homePhone}</div>',
//                        '</tpl>',
//                    '</div>',
//                '</tpl>',

//                '<div><a href="#" style="float:left;padding:10px;clear:both" class="addLink">Add new address</a></div>'

//            ],
//            listeners: {

//                beforeitemclick: {
//                    fn: function (view, record, item, index, e) {
                        
//                        var selectItem = function (){
//                            view.getSelectionModel().select(record);
//                        }

//                        this.validateContact(
//                            Ext.clone(record.data),
//                            Ext.Function.bind(function (contact, email) {

//                                if (!contact.email) {
//                                    // if the selected contact doesn't have an email and the user didn't enter one when prompted. throw and error
//                                    if (!email) {
//                                        Taco.app.fireEvent('setmessage', "The ship to contact must have an email address to proceed", 'error');
//                                        return
//                                    }
//                                    // use the promped email for this contact;
//                                    contact.email = email;
//                                }
                                
//                                this.addresses.getSelectionModel().select(record)
//                                this.contactData = contact;
//                                this.setShippingInfo();
//                                //this.fireEvent('orderchange');
//                            }, this)
//                        );

//                        // cancel the event. will do selection after validation;
//                        return false
//                    },
//                    scope: me
//                },
//                containerclick: {
//                    fn: function (view, evt) {

//                        // clicked add new address link;
//                        var el = Ext.get(evt.getTarget());

//                        if (el.hasCls('addLink')) {
//                            this.launchEditor();
//                        }

//                    },
//                    scope: me
//                }
                
//                /*
//                ,
//                itemclick: {
//                    fn: function (view, record, item, index, e) {
      
//                        // validate the shipping address that was selected to make sure it meets the minimum requirements for shipping;
//                        this.validateContact(
//                            Ext.clone(record.data),
//                            Ext.Function.bind(function (contact) {
                                
//                                this.contactData = contact;
//                                this.setShippingInfo();
//                                this.fireEvent('orderchange');
//                            }, this)
//                        );
                        
//                    },
//                    scope: me
//                }
//                */
                
//            }
//        });
        
        
//        this.insert(0,this.addresses);
//    },

//    validateContact: function (contact, callback) {
//        // convert state to 2 digit value if the countryCode is US
//        var me = this,
//            countryCode = contact.countryCode,
//            stateCode = contact.stateOrProvince;
	    
//        // only do the conversion if the country is the US
//        if (countryCode == "US") {
//            // only convert if the value isn't a 2 character code;
//            if (stateCode.length != 2){
//                var stateStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.StatesStatic'),
//                    stateRecord = stateStore.findRecord("value", stateCode, 0, true, false, false);

//                if (stateRecord) {
//                    stateCode = stateRecord.get("code");
//                    // overwrite the user entered value with a usps code version;
//                    contact.stateOrProvince = stateCode;
//                }
//            }	        
//        }

//        // prompt for email if there isn't one;
//        if (!contact.email) {
//            Ext.MessageBox.prompt({
//                title: 'Email Address is Required',
//                // pushes the buttons to the right to be consistant with our dialog ux.
//                rightJustifyButtons: true,
//                // reverses the order of the buttons
//                reverseOrder: true,
//                msg: "Please enter an email address for this shipping address",
//                closable: false,
//                prompt: true,
//                width: 400,
//                buttons: Ext.Msg.OKCANCEL,
//                fn: function (val, email) {
//                    if (val === 'ok') {                        
//                        callback(contact,email);
//                    }
//                }
//            });

//        } else {
//            callback(contact);
//        }
//    },
    
//    launchEditor: function () {
//        // todo: add support for edit by passing in the contact;
//        var contact = null,
//            contactStore = this.customerRecord.getContacts(),
//            storeCount = contactStore.count();

//        var contactRecord = (contact) ? contact : Ext.create('Taco.model.Contact', {
//            "accountId": this.customerRecord.get('id')
//            /*
//            ,
//            // temporary fix to speed up this work
//            firstName: "test" + storeCount,
//            lastName: "test" + storeCount,
//            email: "test" + storeCount + "@gmail.com",
//            address1: "5844 westslope drive",
//            address1: "5844 westslope drive",
//            "cityOrTown": "austin",
//            //"countryCode": "US",
//            "postalOrZipCode": "78731",
//            //"stateOrProvince":"TX",
//            "homePhone": "5125556666"
//            */
//        });



//        Ext.create('Taco.shared.view.modal.Address', {
//            singlePhoneRequired: true,
//            emailRequired:true,
//            record: contactRecord,
//            listeners: {
//                savesuccess: function (modal, contactRecord) {
                    
//                    var contactStore = this.customerRecord.getContacts()
//                    // if this is the first contact in the store, need to set the isPrimary for the addresses
//                    if (!contactStore.count()) {
//                        contactRecord.set({                            
//                            isBilling: true,
//                            isPrimaryBilling: true,
//                            isPrimaryShipping: true,
//                            isShipping: true
//                        })                        
//                    }


                    
//                    contactStore.add(contactRecord);                    
//                    // persist the customer with the new contact;
                    
                    
//                    this.customerRecord.save({
//                        success: function (record, operation) {                                                        
//                            // rebind to store. for some reason two copies of the record are appearing.
//                            // this apparently clears that duplication;
//                            //this.addresses.bindStore(this.customerRecord.getContacts())
//                        },
//                        failure: function () {
                            
//                        },
//                        scope: this
//                    });


                    
//                    this.addresses.getSelectionModel().select(contactRecord);

//                    // store the selection ;
//                    this.contactData = contactRecord.data;

//                    this.setShippingInfo();
//                    //this.fireEvent('orderchange');

                    
//                },
//                scope: this
//            }
//        });
//    },

//    // persist the contact and shipping method for this order;
//    setShippingInfo: function () {
        

//        var me =this,
//            shippingMethodCode = (this.shippingMethodField) ? this.shippingMethodField.getValue() : null,
//            shippingMethodName = (this.shippingMethodField) ? this.shippingMethodField.getDisplayValue() : null;
        

//        Ext.Ajax.request({
//            url: '/admin/app/order/setshippinginfo',
//            method: 'POST',
//            jsonData: {
//                orderId: this.record.getId(),
//                contact: this.contactData,
//                shippingMethodCode: shippingMethodCode,
//                shippingMethodName: shippingMethodName
//            },
//            success: function (record, operation) {                
                
//                // when the shipping method changes we need to reload the order record to pickup the changes;
//                this.record.reload();            
                
//                this.loadShippingMethods();
                
//            },
//            failure: function () {
                
//            },
//            scope: this
//        });
//    },

    
//    // this will be called after each change, to see if all the requirements are met
//    initShippingMethodField: function () {
//        var me = this,
//            isDisabled = false;

//        // need a contact and order items otherwise the shipping methods option is disabled;
//        if (!this.contactData || !this.record.itemsStore.count()) {
//            isDisabled = true
//        }

//        this.shippingMethodsStore = Ext.create('Ext.data.Store', {
//            model: 'Taco.model.ShippingMethod',
//            autoLoad: false,
//            proxy: {
//                type: 'ajax',
//                url: '/admin/app/order/shipping/runtimemethods?orderId=' + me.record.getId(),
//                reader: {
//                    type: 'json',
//                    root: 'items',
//                    successProperty: 'success'
//                }
//            }
//        });

//        this.shippingMethodField = Ext.widget({
//            //xtype: 'selectfield',
//            xtype:"combo",
//            style:"clear:both",
//            width: 200,
//            disabled: isDisabled,
//            fieldLabel: 'Shipping Methods',
//            valueField: 'shippingMethodCode',
//            allowBlank:false,
//            displayField: 'shippingMethodName',
//            value:this.record.get("shippingMethodCode"),
//            store: this.shippingMethodsStore,
//            listConfig: {
//                getInnerTpl: function () {
//                    return '{shippingMethodName} {price:currency}';
//                }
//            },
//            listeners: {
//                select: function () {                        
//                    this.setShippingInfo();                        
//                },
//                scope: this
//            }
//        });

//        this.items.push(this.shippingMethodField);
//    },
//    // called every time there is a change to the order record, customer, or contact selection; will automatically enable the combo when the necessary pre requirements are met;
//    loadShippingMethods: function () {
//        var me = this;
        
        
//        // need a contact and order items in order to set the shipping method; wait to enable and load the data until these two data points are set;
//        if (!this.contactData || !this.record.itemsStore.count()) {
//            return
//        } else if (this.shippingMethodField.isDisabled()) {            
//            this.shippingMethodField.enable();
//        }

//        this.shippingMethodsStore.load({
//            callback: function () {                
//                console.log('shipping method store loaded count =', this.shippingMethodsStore.count());
//            },
//            scope: this
//        });        
//    },

//    isValid: function () {
//        return this.hasFulfillmentContact();
//    },

//    hasFulfillmentContact: function () {
//        return !!this.contact.get('firstName');
//    }
//});