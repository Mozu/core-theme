/**
 * @class Taco.view.order.modal.Address
 */
Ext.define('Taco.view.customers.AddressModal', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: ['Taco.model.Contact'],

    initComponent: function () {
        this.callParent(arguments);
    }

    // cls: Taco.baseCSSPrefix + 'order-modal',
    // autoShow: true,
    // width: 700,
    // data: {},
    // field: '',

    // initComponent: function (eOpts) {
    //     var me = this,
    //         model, root, formRoot;

    //     switch (this.field) {
    //         case 'billingAddress':
    //             model = 'Taco.model.PaymentReference';
    //             root = this.data.payment;
    //             formRoot = root.card.billingAddress;
    //             break;
    //         case 'shippingAddress':
    //             model = 'Taco.model.Shipment';
    //             root = this.data.shipment;
    //             formRoot = root.shippingAddress;
    //             break;
    //         default:
    //             break;
    //     }

    //     root.id = 12345;
    //     if (!formRoot) {
    //         formRoot = { address: {} };
    //     }
    //     this.record = Ext.create(model, root);

    //     this.formpanel = Ext.create('Ext.form.Panel', {
    //         xtype: 'formpanel',
    //         bodyCls: Taco.baseCSSPrefix + 'flexform',
    //         layout: { type: 'auto' },
    //         defaults: {
    //             xtype: 'textfield',
    //             labelSeparator: '',
    //             labelAlign: 'top',
    //             width: 644
    //         },
    //         items: [{
    //             name: 'firstName',
    //             fieldLabel: 'First Name',
    //             width: 300,
    //             value: formRoot.firstName
    //         }, {
    //             name: 'lastName',
    //             fieldLabel: 'Last Name',
    //             width: 300,
    //             value: formRoot.lastName
    //         }, {
    //             name: 'companyOrOrganization',
    //             fieldLabel: 'Company',
    //             value: formRoot.companyOrOrganization
    //         }, {
    //             name: 'address1',
    //             fieldLabel: 'Address Line 1',
    //             value: formRoot.address.address1
    //         }, {
    //             name: 'address2',
    //             fieldLabel: 'Address Line 2',
    //             value: formRoot.address.address2
    //         }, {
    //             name: 'cityOrTown',
    //             fieldLabel: 'City',
    //             width: 300,
    //             value: formRoot.address.cityOrTown
    //         }, {
    //             name: 'stateOrProvince',
    //             fieldLabel: 'State',
    //             width: 128,
    //             value: formRoot.address.stateOrProvince
    //         }, {
    //             name: 'postalOrZipCode',
    //             fieldLabel: 'ZIP Code',
    //             width: 128,
    //             value: formRoot.address.postalOrZipCode
    //         }, {
    //             name: 'phoneNumbers',
    //             fieldLabel: 'Phone',
    //             width: 300,
    //             value: (formRoot.phoneNumbers ? formRoot.phoneNumbers.home : '')
    //         }, {
    //             name: 'email',
    //             fieldLabel: 'E-mail',
    //             value: formRoot.email
    //         }],
    //         listeners: {
    //             afterrender: function (panel) {
    //                 Ext.destroy(panel.getLayout().clearEl);
    //             }
    //         }
    //     });

    //     this.content = {
    //         xtype: 'container',
    //         items: [{
    //             xtype: 'component',
    //             autoEl: {
    //                 tag: 'h2',
    //                 cls: 'order-modal-title',
    //                 html: 'Edit Address'
    //             }
    //         }, this.formpanel
    //         ]
    //     };

    //     this.dirtyButton = Ext.create('Taco.core.ux.action.DirtyButton', {
    //         xtype: 'dirtybutton',
    //         text: 'Update',
    //         onClick: function () {
    //             var fields = me.formpanel.getForm().getFieldValues(true),
    //                 batch;

    //             Ext.Object.each(fields, function (key, value) {
    //                 switch (key) {
    //                     case 'phoneNumbers':
    //                         formRoot.phoneNumbers = Ext.Object.merge(
    //                             { home: value },
    //                             formRoot.phoneNumbers,
    //                             { home: value }
    //                         );
    //                         break;
    //                     case 'address1':
    //                     case 'address2':
    //                     case 'cityOrTown':
    //                     case 'postalOrZipCode':
    //                     case 'stateOrProvince':
    //                         formRoot.address[key] = value;
    //                         break;
    //                     default:
    //                         formRoot[key] = value;
    //                         break;
    //                 }
    //             }, me);


    //             switch (me.field) {
    //                 case 'billingAddress':
    //                     batch = me.record.get('card');
    //                     batch.billingAddress = formRoot;
    //                     me.record.set('card', batch);
    //                     break;
    //                 case 'shippingAddress':
    //                     me.record.set('shippingAddress', formRoot);
    //                     break;
    //                 default:
    //                     break;
    //             }

    //             me.record.getProxy().setExtraParam('orderId', me.data.id);
    //             me.record.save({
    //                 success: function () {
    //                     console.log('success', arguments);
    //                     me.fireEvent('updatetemplate', me.data);
    //                     me.hide();
    //                 },
    //                 failure: function () {
    //                     me.hide();
    //                 }
    //             });
    //         }
    //     });

    //     this.actions = {
    //         xtype: 'container',
    //         items: [this.dirtyButton, {
    //             xtype: 'action',
    //             text: 'Cancel',
    //             onClick: function () {
    //                 me.hide();
    //             }
    //         }]
    //     };

    //     this.callParent(arguments);

    //     this.formpanel.on({
    //         dirtychange: {
    //             fn: function (form, dirty) {
    //                 this.dirtyButton.setDirty(true);
    //             }
    //         },
    //         scope: this
    //     });
    // }
});