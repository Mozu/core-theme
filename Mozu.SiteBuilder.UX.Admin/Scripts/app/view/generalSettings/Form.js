/**
 * @class Taco.view.generalsettings.Form
 * @author Bradley Friemel
 * @date 6/11/2013
 *
 */
Ext.define('Taco.view.generalsettings.Form', {
    extend: 'Taco.view.react.Index',
    initComponent: function () {
        var me = this;
        // var subFormConfig = {
        //     record: me.record
        // };

        // me.items = [
        //     Ext.create('Taco.view.generalSettings.subform.About', subFormConfig),
        //     Ext.create('Taco.view.generalSettings.subform.Authentication', subFormConfig),
        //     Ext.create('Taco.view.generalSettings.subform.Notifications', subFormConfig),
        //     Ext.create('Taco.view.generalSettings.subform.Features', subFormConfig),
        //     Ext.create('Taco.view.generalSettings.subform.Analytics', subFormConfig),
        //     Ext.create('Taco.view.generalSettings.subform.AddressValidation', subFormConfig),
        //     Ext.create('Taco.view.generalSettings.subform.Robots', subFormConfig),
        //     Ext.create('Taco.view.generalSettings.subform.Tools', subFormConfig)
        // ];

        me.items = [];

        me.callParent(arguments);
        
        // this.loadNavItems();
    }
});
