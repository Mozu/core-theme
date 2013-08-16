/**
 * @class Taco.view.generalsettings.Form
 * @author Bradley Friemel
 * @date 6/11/2013
 *
 */
Ext.define('Taco.view.generalsettings.Form', {
    extend: 'Taco.core.ux.form.NavForm',
    alias: 'widget.generalsettingseditor',
    requires: [
        'Taco.view.generalSettings.subform.About',
        'Taco.view.generalSettings.subform.Rules',
        'Taco.view.generalSettings.subform.Notifications',
        'Taco.view.generalSettings.subform.Analytics',
        'Taco.view.generalSettings.subform.Robots',
        'Taco.view.generalSettings.subform.Tools',
        'Taco.view.generalSettings.subform.Maintenance'],
    title: 'General Settings',
    manageHeight: false,
    createTitle: 'General Settings',
    editTitle: 'General Settings',
    initComponent: function () {
        var me = this;

        me.items = [
                Ext.create('Taco.view.generalSettings.subform.About', me),
                Ext.create('Taco.view.generalSettings.subform.Rules', me),
                Ext.create('Taco.view.generalSettings.subform.Maintenance', me),
                Ext.create('Taco.view.generalSettings.subform.Notifications', me), 
                Ext.create('Taco.view.generalSettings.subform.Analytics', me),  
                Ext.create('Taco.view.generalSettings.subform.Robots'), 
                Ext.create('Taco.view.generalSettings.subform.Tools')
        ];

        me.navStore = Ext.create('Ext.data.Store', {
            fields: ['title'],
            data: me.items
        });




        me.callParent(arguments);
    }
});
