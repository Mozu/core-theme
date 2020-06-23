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
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.title,
    primaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.primary_text,

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
                        customerAccountId: this.record.data.id
                    },
                    callback: function (options, success, response) {
                        if (!success) {
                            Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.failed_to_assign_customer_error);
                            console.error(options, response);
                            return;
                        }

                        this.order.set('customerId', this.record.getId());
                        var retOrder = Ext.decode(response.responseText).items;
                        if (Array.isArray(retOrder)) {
                            this.order.set(retOrder[0]);
                        } else {
                            this.order.set(retOrder);
                        }
                        
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
                Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.CreateCustomer.error_saving_customer, 'error');
            },
            scope: this
        });
    }
});