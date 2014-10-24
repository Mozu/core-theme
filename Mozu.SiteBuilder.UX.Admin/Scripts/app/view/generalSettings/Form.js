/**
 * @class Taco.view.generalsettings.Form
 * @author Bradley Friemel
 * @date 6/11/2013
 *
 */
Ext.define('Taco.view.generalsettings.Form', {
    extend: 'Taco.core.ux.form.NavForm2',
    alias: 'widget.generalsettingseditor',
    requires: [
        'Taco.view.generalSettings.subform.About',
        'Taco.view.generalSettings.subform.Notifications',
        'Taco.view.generalSettings.subform.Features',
        'Taco.view.generalSettings.subform.Analytics',
        'Taco.view.generalSettings.subform.AddressValidation',
        'Taco.view.generalSettings.subform.Robots',
        'Taco.view.generalSettings.subform.Tools',
        'Taco.view.generalSettings.subform.Maintenance'
    ],

    title: 'General Settings',
    manageHeight: false,
    createTitle: 'General Settings',
    editTitle: 'General Settings',

    initComponent: function () {
        var me = this;
        var subFormConfig = {
            record: me.record
        };

        //me.items = [
        //    Ext.create('Taco.view.generalSettings.subform.About', subFormConfig),
        //    Ext.create('Taco.view.generalSettings.subform.Maintenance', subFormConfig),
        //    Ext.create('Taco.view.generalSettings.subform.Notifications', subFormConfig),
        //    Ext.create('Taco.view.generalSettings.subform.Analytics', subFormConfig),
        //    Ext.create('Taco.view.generalSettings.subform.AddressValidation', subFormConfig),
        //    Ext.create('Taco.view.generalSettings.subform.Robots', subFormConfig),
        //    Ext.create('Taco.view.generalSettings.subform.Tools', subFormConfig)
        //];
         
        me.items = [
            Ext.create('Taco.view.generalSettings.subform.About', subFormConfig),
            Ext.create('Taco.view.generalSettings.subform.Notifications', subFormConfig),
            Ext.create('Taco.view.generalSettings.subform.Features', subFormConfig),
            Ext.create('Taco.view.generalSettings.subform.Analytics', subFormConfig),
            Ext.create('Taco.view.generalSettings.subform.AddressValidation', subFormConfig),
            Ext.create('Taco.view.generalSettings.subform.Robots', subFormConfig),
            Ext.create('Taco.view.generalSettings.subform.Tools', subFormConfig)
        ];

        me.callParent(arguments);
        
        this.loadNavItems();
    },

    loadForm: function (record, noCascade) {
        this.callParent(arguments);
    }
});
