/**
 * @class Taco.view.location.Form
 */
Ext.define('Taco.view.location.Form', {
    extend: 'Taco.view.react.Index',

    // no longer an EXT view

    //topOffset: 38,

    //requires: [
    //    'Taco.view.location.subform.Location',
    //    'Taco.view.location.subform.StoreHours'
    //],

    //model: 'Taco.model.Location',
    //createTitle: 'Create New Location',
    //editTitle: 'Edit Location',

    //config: {
    //    customer: null
    //},

    // XTemplate config that will automatically get applied with {record:this.record};
    //editTitle: [
    //    '{record.data.name}'
    //],

    initComponent: function () {
        var me = this;
        me.items = [];
        me.callParent(arguments);
        //this.buildForm();
        //this.loadNavItems();
    },

    //buildForm: function () {
    //    var subformCfg = {
    //        record: this.record,
    //    };
        
    //    this.items = [
    //        Ext.create('Taco.view.location.subform.Location', subformCfg),
    //        Ext.create('Taco.view.location.subform.StoreHours', subformCfg)
    //    ];

    //}
})