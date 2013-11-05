Ext.define('Taco.view.application.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.Capability'
    ],

    title: 'Applications',
    ui: 'subform',

    initComponent: function () {
        this.buildFormComponents();
        this.callParent(arguments);
    },

    buildFormComponents: function () {
        var me = this;
        

        me.items = [{
            xtype: 'container',
            html: '<div>here</div>'
        }];


    }
});
