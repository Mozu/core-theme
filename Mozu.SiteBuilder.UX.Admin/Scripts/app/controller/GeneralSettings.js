/**
 * @class Taco.controller.GeneralSettings
 * The General Settings controller.
 */
Ext.define('Taco.controller.GeneralSettings', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.generalsettings.Index'],
    views: ['generalsettings.Index'],

    index: function (params) {
        var me = this;


       

        Ext.Ajax.request({
            url: '/admin/app/generalsetting/read',
            method: "GET",
            success: function (response) {

                var res = Ext.JSON.decode(response.responseText);

                me.createContentView('Taco.view.generalsettings.Index', {
                    settings: res.items[0]
                });
            },
            failure: function (response) {
                console.log("Error retrieving general settings.", response);
            }
        });
    }
});
