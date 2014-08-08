/**
 * @class Taco.view.customers.modal.CreateCustomer
 */

Ext.define('Taco.view.customers.modal.CreateCustomer', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.customers.subform.Information',
        'Taco.view.customers.modal.Contacts'
    ],

    autoShow: true,
    scale: 'large',
    title: 'Create Customer',
    primaryText: 'Save & Create Address',

    // this should really be the default;
    closeAction: 'destroy',

    initComponent: function () {
        this.record = Ext.create('Taco.model.CustomerAccount');

        this.form = Ext.create('Ext.form.Panel', {
            itemId: 'customerCreateForm',
            items: [
                Ext.create('Taco.view.customers.subform.Information', {
                    header: false,
                    ui: undefined,
                    bodyPadding: 0,
                    margin: 0,
                    width: '100%'
                })
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.on({
            savesuccess: function () {
                Ext.create('Taco.view.customers.modal.Contacts', {
                    record: this.record,
                    order: this.order,
                    callback: this.callback,
                    isNewCustomer: true
                });
            },
            scope: this
        })
    },

    getRecord: function () {
        return this.record;
    },

    doSave: function () {
        var me = this,
            data = this.form.getValues(),
            fnComplete = function () {
                me.saveSuccess(me.record);
            };

        // udpate the record with the form data;
        this.record.set(data);

        this.record.set('isAnonymous', !this.down('[name="isAnonymous"]').getValue());


        this.record.save({
            success: function (record, operation) {
                this.record.commit();
                if (!this.order) fnComplete();

                this.order.setCustomer({
                    jsonData: {
                        orderId: this.order.getId(),
                        customerAccountId: this.record.getId()
                    },
                    callback: function (options, success, response) {
                        if (!success) {
                            Taco.app.fireEvent('setmessage', 'Failed to set Assign Customer Account to this Order');
                            console.error(options, response);
                            return;
                        }

                        this.order.set('customerId', this.record.getId());
                        this.order.set(Ext.decode(response.responseText).items[0]);

                        this.order.commit();

                        this.order.loadCustomer({
                            callback: function () {
                                fnComplete()
                            }
                        });
                    },
                    scope: this
                });
            },
            failure: function (record, operation) {
                Taco.app.fireEvent('setmessage', 'Error saving customer', 'error');
            },
            scope: this
        });
    }
});