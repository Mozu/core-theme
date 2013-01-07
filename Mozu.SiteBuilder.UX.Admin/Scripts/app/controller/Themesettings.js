/**
 * @class Taco.controller.Themesettings
 * The controller for the Theme Settings page.
 */
Ext.define('Taco.controller.Themesettings', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.Discount',
    requires: ['Taco.model.Discount', 'Taco.view.themesettings.Index'],
    views: ['themesettings.Index'],

    // TODO: This is temporary. Using this for the settings re-design
    index: function (params) {
        var me = this;

        Ext.Ajax.request({
            url: '/admin/app/themesetting/config/read',
            method: "GET",
            success: function (response) {

                var res = Ext.JSON.decode(response.responseText);
                var cfg = {};
                cfg = res.items;

                Ext.Ajax.request({
                    url: '/admin/app/themesetting/instance/read',
                    method: "GET",
                    success: function (r) {
                        var values = Ext.JSON.decode(r.responseText);

                        me.createContentView('Taco.view.themesettings.Index', {
                            settingsConfig: cfg,
                            settingsValues: values.items
                        });
                    },
                    failure: function (r) {
                        console.log("Error retrieving theme settings configuration.", r);
                    }
                });
            },
            failure: function (response) {
                console.log("Error retrieving theme settings configuration.", response);
            }
        });
    }
});
