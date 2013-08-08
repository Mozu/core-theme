/**
 * @class Taco.view.order.address.ModalEditor
 */
Ext.define('Taco.view.address.ModalEditor', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.model.Contact'],

    autoShow: true,
    width: 700,

    addressHasNames: true,
    record: null,

    initComponent: function () {
        var me = this,
            record = this.record,
            addressHasNames = this.addressHasNames,
            fields, formpanel, dirtybutton;

        this.cls = this.cls + ' ' + Taco.baseCSSPrefix + 'address-editor';

        if (!record.isModel) {
            record = Ext.create('Taco.model.Contact', record);
        }

        fields = [{
            xtype: 'textfield',
            width: 315,
            name: 'companyName',
            fieldLabel: 'Company Name',
            margin: '0 14 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'email',
            fieldLabel: 'Email',
            margin: '0 0 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'address1',
            fieldLabel: 'Address 1',
            margin: '0 14 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'address2',
            fieldLabel: 'Address 2',
            margin: '0 0 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'address3',
            fieldLabel: 'Address 3',
            margin: '0 14 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            width: 315,
            name: 'address4',
            fieldLabel: 'Address 4',
            margin: '0 0 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            name: 'cityOrTown',
            fieldLabel: 'City',
            margin: '0 15 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            name: 'state',
            fieldLabel: 'State',
            margin: '0 14 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'textfield',
            name: 'zipCode',
            fieldLabel: 'ZIP',
            margin: '0 15 5 0',
            style: { 'display': 'inline-table' }
        }, {
            xtype: 'combo',
            name: 'countryCode',
            margin: '0 0 5 0',
            style: { 'display': 'inline-table' },
            fieldLabel: 'Country',
            queryMode: 'local',
            displayField: 'label',
            valueField: 'val',
            store: Ext.create('Ext.data.Store', {
                fields: ['val', 'label'],
                data: [
                    { "val": "US", "label": "US" }
                ]
            })
                }, /*{
                    xtype: 'textfield',
                    name: 'countryCode',
                    fieldLabel: 'Country'
                },*/ {
                    xtype: 'textfield',
                    width: 206,
                    name: 'homePhone',
                    fieldLabel: 'Home Phone',
                    margin: '0 13 5 0',
                    style: { 'display': 'inline-table' }
                }, {
                    xtype: 'textfield',
                    width: 206,
                    name: 'workPhone',
                    fieldLabel: 'Work Phone',
                    margin: '0 13 5 0',
                    style: { 'display': 'inline-table' }
                }, {
                    xtype: 'textfield',
                    width: 206,
                    name: 'mobilePhone',
                    fieldLabel: 'Mobile Phone',
                    margin: '0 0 5 0',
                    style: { 'display': 'inline-table' }
        }];

        if (addressHasNames) {
            fields.unshift({
                xtype: 'textfield',
                width: 206,
                name: 'firstName',
                fieldLabel: 'First Name',
                margin: '0 13 5 0',
                style: { 'display': 'inline-table' }
            }, {
                xtype: 'textfield',
                width: 206,
                name: 'middleName',
                fieldLabel: 'Middle Name',
                margin: '0 13 5 0',
                style: { 'display': 'inline-table' }
            }, {
                xtype: 'textfield',
                width: 206,
                name: 'lastName',
                fieldLabel: 'Last Name',
                margin: '0 0 5 0',
                style: { 'display': 'inline-table' }
            });
        }

        formpanel = Ext.create('Taco.core.ux.form.Form', {
            manageHeight: false,
            items: [{
                xtype: 'container',
                cls: Taco.baseCSSPrefix + 'address-editor-fields',
                items: fields
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