/**
 * @class Taco.view.order.modal.Address
 */
Ext.define('Taco.view.customers.AddressModal', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.model.Contact'],

    autoShow: true,
    width: 700,

    record: null,

    initComponent: function () {
        var me = this,
            record = this.record,
            formpanel, dirtybutton;

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'address-editor';

        if (!record.isModel) {
            record = Ext.create('Taco.model.Contact', record);
        }

        formpanel = Ext.create('Taco.core.ux.form.Form', {
            manageHeight: false,
            items: [{
                xtype: 'container',
                cls: Taco.baseCSSPrefix + 'address-editor-fields',
                items: [{
                    xtype: 'textfield',
                    width: 206,
                    name: 'firstName',
                    fieldLabel: 'First Name'
                }, {
                    xtype: 'textfield',
                    width: 206,
                    name: 'middleName',
                    fieldLabel: 'Middle Name'
                }, {
                    xtype: 'textfield',
                    width: 206,
                    name: 'lastName',
                    fieldLabel: 'Last Name'
                },
                 {
                     xtype: 'textfield',
                     name: 'companyName',
                     fieldLabel: 'Company'
                 }, {
                    xtype: 'textfield',
                    width: 315,
                    name: 'address1',
                    fieldLabel: 'Address 1'
                }, {
                    xtype: 'textfield',
                    width: 315,
                    name: 'address2',
                    fieldLabel: 'Address 2'
                }, {
                    xtype: 'textfield',
                    width: 315,
                    name: 'address3',
                    fieldLabel: 'Address 3'
                }, {
                    xtype: 'textfield',
                    width: 315,
                    name: 'address4',
                    fieldLabel: 'Address 4'
                }, {
                    xtype: 'textfield',
                    name: 'cityOrTown',
                    fieldLabel: 'City'
                }, {
                    xtype: 'textfield',
                    name: 'state',
                    fieldLabel: 'State'
                }, {
                    xtype: 'textfield',
                    name: 'zipCode',
                    fieldLabel: 'ZIP'
                }, {
                    xtype: 'textfield',
                    readOnly: true,
                    name: 'countryCode',
                    fieldLabel: 'Country'
                }, {
                    xtype: 'textfield',
                    name: 'email',
                    fieldLabel: 'Email'
                }, {
                    xtype: 'textfield',
                    name: 'homePhone',
                    fieldLabel: 'Home Phone'
                }, {
                    xtype: 'textfield',
                    name: 'workPhone',
                    fieldLabel: 'Work Phone'
                }, {
                    xtype: 'textfield',
                    name: 'mobilePhone',
                    fieldLabel: 'Mobile Phone'
                }]
            }]
        });

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'h2',
                    cls: 'order-modal-title',
                    html: 'Edit Address'
                }
            }, formpanel]
        };

        this.dirtybutton = Ext.create('Taco.core.ux.action.DirtyButton', {
            xtype: 'dirtybutton',
            text: 'Save',
            onClick: function () {
                formpanel.getForm().updateRecord(record);
                console.log(record);

                me.hide();
                me.fireEvent('save', this, record);
            }
        });

        this.actions = {
            xtype: 'container',
            items: [this.dirtybutton, {
                xtype: 'action',
                text: 'Cancel',
                onClick: function () {
                    me.hide();
                }
            }]
        };

        this.callParent(arguments);

        formpanel.loadRecord(record);

        formpanel.on({
            dirtychange: {
                fn: function (form, dirty) {
                    this.dirtybutton.setDirty(true);
                }
            },
            scope: this
        });
    }
});