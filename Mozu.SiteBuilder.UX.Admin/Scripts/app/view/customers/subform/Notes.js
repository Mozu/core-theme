Ext.define('Taco.view.customers.subform.Notes', {
    extend: 'Taco.view.customers.subform.Subform',
    title: 'Notes',
    cls: Taco.baseCSSPrefix + 'customer-notes',
    initComponent: function () {
        this.items = [{
            xtype: 'textfield',
            minLength: 3,
            name: 'productName',
            emptyText: 'Add a note',
            width: '100%'
        }/*, {
                xtype: 'container',
                cls: 'notes',
                html: '<div class="date">March 19, 2012</div>'+
                    '<div><div class="time">08:50 am</div><div class="description">"Oh also... Make sure they get super customer service!"</div><div class="name">Palev Water</div></div>' +
                    '<div class="date"></div>'+
                    '<div><div class="time">08:45 pm</div><div class="description">"They actually hate birds."</div><div class="name">Palev Water</div></div>'
            }*/];

        this.callParent(arguments);
    }
});