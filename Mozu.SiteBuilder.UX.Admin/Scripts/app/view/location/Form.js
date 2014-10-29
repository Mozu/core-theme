/**
 * @class Taco.view.location.Form
 */
Ext.define('Taco.view.location.Form', {
    extend: 'Taco.core.ux.form.NavForm2',

    topOffset: 38,

    requires: [
        'Taco.view.location.subform.Location',
        'Taco.view.location.subform.StoreHours'
    ],

    model: 'Taco.model.Location',
    createTitle: 'Create New Location',
    editTitle: 'Edit Location',

    config: {
        customer: null
    },

    // XTemplate config that will automatically get applied with {record:this.record};
    editTitle: [
        '{record.data.name}'
    ],

    initComponent: function () {
        var me = this;

        this.buildForm();
        
        this.callParent(arguments);
        
        this.loadNavItems();
    },

    buildForm: function () {
        
        var subformCfg = {
                record: this.record,
                orderForm: this
            },
            items = [];
        
        items.push(Ext.create('Taco.view.location.subform.Location', subformCfg));
        items.push(Ext.create('Taco.view.location.subform.StoreHours', subformCfg));
        this.items = items;
    }
})