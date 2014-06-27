Ext.define('Taco.view.customers.subform.Contacts', {
    extend: 'Taco.view.customers.subform.Subform',
    requires: [
        'Taco.view.customers.Contacts'
    ],

    title: 'Contact Information',

    initComponent: function () {

        this.items = [Ext.create('Taco.view.customers.Contacts', {
            record: this.record
        })];

        this.callParent(arguments);
    }
});