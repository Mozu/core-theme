/**
 * @class Taco.view.generalsettings.Index
 * @author Bradley Friemel
 * @date 6/11/2013
 *
 */
Ext.define('Taco.view.generalSettings.Index', {
    extend: 'Taco.view.react.Index',

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    initComponent: function () {

        // no longer an EXT view

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

        this.items = [];

       
        this.callParent(arguments);
    }



});
