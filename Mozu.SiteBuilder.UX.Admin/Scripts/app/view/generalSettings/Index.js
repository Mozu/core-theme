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
    

    statics: {
        factory: function (cfg, callback, scope) {
            cfg = Ext.apply(cfg,
            {
                timeZonesStores: Taco.core.data.StoreManager.getOrCreate('Taco.store.TimeZones'),
                channelsStores: Taco.core.data.StoreManager.getOrCreate('Taco.store.Channels')
            });
            
            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.generalSettings.Index', cfg));
                },
                tasks: [
                    {
                        storeToLoad: cfg.timeZonesStores
                    },
                     {
                         storeToLoad: cfg.channelsStores
                     }
                ],
                autoExecute: true,
            });
        }
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
