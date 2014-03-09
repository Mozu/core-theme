/**
 * @class Taco.view.generalsettings.Index
 * @author Bradley Friemel
 * @date 6/11/2013
 *
 */
Ext.define('Taco.view.generalSettings.Index', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: ['Taco.view.generalsettings.Form'],
    formCls: 'Taco.view.generalsettings.Form',
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },
    
    initComponent: function () {

        //if (Ext.Array.contains(Taco.user.behaviors, 137)) {
        //    this.additionalActions = [{
        //        xtype: 'button',
        //        itemId: 'provision',
        //        ui: 'action',
        //        scale: 'medium',
        //        text: 'Provision',
        //        handler: function () {
        //            Ext.create('Taco.view.provisioning.ProvisionerModal');
        //        }
        //    }];
        //}

       
        this.callParent(arguments);
    }



});
