Ext.define('Taco.view.customers.subform.Contacts', {
    extend: 'Taco.view.customers.subform.Subform',
    requires: [
        'Taco.view.customers.Contacts'
    ],

    title: 'Contact Information',

    initComponent: function() {

        this.items = [Ext.create('Taco.view.customers.Contacts', {
            itemId: 'customerContacts',
            record: this.record
        }), {
            xtype: 'button',
            ui: 'action-primary',
            scale: 'medium',
            itemId: 'addNewContact',
            text: 'Add New Address',
            handler: function() {
                this.down('#customerContacts').createNewContact();
            },
            scope: this
        }];

        this.callParent(arguments);
    }
});