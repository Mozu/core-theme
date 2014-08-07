/**
 * @class Taco.view.customers.modal.Contacts
 */

Ext.define('Taco.view.customers.modal.Contacts', {
    extend: 'Taco.core.ux.window.Modal',
    alias: 'widget.taco-contacts-modal',
    requires: [
        'Taco.view.customers.Contacts'
    ],

    autoShow: true,
    scale: 'large',
    title: 'Edit Contacts',
    isNewCustomer: false,

    closeAction: 'destroy',

    actions: [{
        xtype: 'button',
        ui: 'action-primary',
        scale: 'medium',
        itemId: 'addNewContact',
        text: 'Add New Address',
        handler: function () {
            this.down('#customerContacts').createNewContact();
        }
    }, {
        xtype: 'tbfill'
    }, {
        xtype: 'button',
        itemId: 'secondaryAction'
    }, {
        xtype: 'button',
        itemId: 'primaryAction'
    }],

    initComponent: function () {

        this.form = Ext.create('Ext.form.Panel', {
            itemId: 'contactForm',
            items: [
                Ext.create('Taco.view.customers.Contacts', {
                    record: this.record,
                    itemId: 'customerContacts',
                    order: this.order,
                    width: '100%'
                }), {

                    scope: this
                }
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.on({
            cancel: this.doCancel,
            savesuccess: function () {
                if (typeof this.callback === 'function') this.callback()
            },
            activate: function () {
                if (!this.isNewCustomer || this.notFirstActivate) return;
                this.notFirstActivate = true;
                Ext.defer(function () {
                    this.down('#customerContacts').createNewContact()
                }, 1, this);
            },
            scope: this
        });
    },

    doCancel: function () {
        this.record.reject();
        this.order.reject();
        if (typeof this.callback === 'function') this.callback();
    },

    doSave: function () {
        var me = this,
            count = 0,
            shipping = this.down('[name="customerShipToAddress"]{getValue()}'),
            billing = this.down('[name="customerBillToAddress"]{getValue()}'),
            fnComplete = function () {
                if (++count < 2) return;
                me.saveSuccess(me.record);
            };

        if (shipping) this.order.set('fulfillmentContact', shipping.inputValue);
        if (billing) this.order.set('billingContact', billing.inputValue);

        if (this.record.dirty) {
            this.record.save({
                success: function () {
                    me.record.commit();
                    fnComplete();
                },
                failure: function () {
                    Taco.app.fireEvent('setmessage', 'Error saving customer', 'error');
                }
            });
        } else {
            fnComplete();
        }

        if (this.order && this.order.dirty) {
            this.order.updateContactInfo({
                success: function (response) {
                    var json = Ext.decode(response.responseText).items[0];
                    me.order.set(json);
                    me.order.commit();
                    fnComplete();
                },
                failure: function () {
                    Taco.app.fireEvent('setmessage', 'Error saving order', 'error');
                }
            });
        } else {
            fnComplete();
        }
    },
});