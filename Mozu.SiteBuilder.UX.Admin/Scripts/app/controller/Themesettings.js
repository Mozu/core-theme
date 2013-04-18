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
        return this.edit(params);
    },
    edit: function (id, additionalParams, appState) {
        var me=this, theme = appState ? appState.record : null;
     
        
        Ext.Ajax.request({
            url: '/admin/app/themesetting/config/read/' + id,
            method: "GET",
            success: function (response) {

                var res = Ext.JSON.decode(response.responseText);
                var cfg = {};
                cfg = res.items;

                Ext.Ajax.request({
                    url: '/admin/app/themesetting/instance/read/' + id,
                    method: "GET",
                    success: function (r) {
                        var values = Ext.JSON.decode(r.responseText);

                        me.createContentView('Taco.view.themesettings.Index', {
                            settingsConfig: cfg,
                            themeId: id,
                            theme: theme,
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
