///**
// * @class Taco.view.settings.localization.modal.Attributes
// */

//Ext.define('Taco.view.settings.localization.modal.Attributes', {
//    extend: 'Taco.core.ux.window.Modal',
//    alias: 'widget.taco-localized-attributes-modal',
//    requires: [
//        'Taco.view.settings.localization.Attributes'
//    ],

//    autoShow: true,
//    scale: 'large',
//    title: 'Edit Attributes',
//    isNewCustomer: false,

//    closeAction: 'destroy',

//    initComponent: function() {

//        this.form = Ext.create('Ext.form.Panel', {
//            itemId: 'localizedAttributesModal',
//            items: [
//                Ext.create('Taco.view.settings.localization.Attributes', {
//                    itemId: 'localizedAttributes',
//                    width: '100%'
//                }), {
//                    xtype: 'button',
//                    ui: 'action-primary',
//                    scale: 'medium',
//                    itemId: 'closeLocalizedAttributeModal',
//                    text: 'Close',
//                    handler: function() {
//                        this.down('#customerContacts').createNewContact();
//                    },
//                    scope: this
//                }
//            ]
//        });

//        this.items = [this.form];

//        this.callParent(arguments);

//        this.on({
//            cancel: this.doCancel,
//            savesuccess: function() {
//                if (typeof this.callback === 'function') this.callback()
//            },
//            activate: function() {
//                if (!this.isNewCustomer || this.notFirstActivate) return;
//                this.notFirstActivate = true;
//                Ext.defer(function() {
//                    this.down('#customerContacts').createNewContact()
//                }, 1, this);
//            },
//            scope: this
//        });
//    },

//    doCancel: function() {
//        this.record.reject();
//        this.order.reject();
//        if (typeof this.callback === 'function') this.callback();
//    },

//});