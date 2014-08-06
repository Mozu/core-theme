/**
 * @class Taco.controller.Themesettings
 * The controller for the Theme Settings page.
 */
Ext.define('Taco.controller.Themesettings', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.Discount',
    requires: ['Taco.view.themesettings.Edit', 'Taco.view.themesettings.Addons'],
    views: ['Taco.view.themesettings.Edit'],

    // TODO: This is temporary. Using this for the settings re-design
    index: function (params) {
        return this.edit(params);
    },
    edit: function (id, additionalParams, appState) {
        var me = this,
            theme = appState ? appState.record : null;


        Ext.Ajax.request({
            url: '/admin/app/themesetting/ui/read/' + id,
            method: 'GET',
            success: function (response) {

                var fieldContainerCfg = Ext.JSON.decode(response.responseText);

                Ext.Ajax.request({
                    url: '/admin/app/themesetting/instance/read/' + id,
                    method: 'GET',
                    success: function (r) {
                        var values = Ext.JSON.decode(r.responseText);

                        me.createContentView('Taco.view.themesettings.Edit', {
                            themeInfo: {
                                formConfig: fieldContainerCfg,
                                themeId: id,
                                theme: theme,
                                settingsValues: values
                            }
                        });
                    },
                    failure: function (r) {
                        console.log('Error retrieving theme settings configuration.', r);
                    }
                });
            },
            failure: function (response) {
                console.log('Error retrieving theme settings configuration.', response);
            }
        });
    },
    addons: function (id, additionalParams, appState) {
        var me = this,
            theme = appState ? appState.record : null;

        Taco.app.setLoading();
        Ext.Ajax.request({
            url: '/admin/app/themes/addons/list/' + id,
            method: 'GET',
            success: function (response) {
                Taco.app.setLoading(false);
                var res = Ext.JSON.decode(response.responseText);

                me.createContentView('Taco.view.themesettings.Addons', {
                    themeId: id,
                    theme: theme,
                    addons: res.items
                });

            },
            failure: function (response) {
                Taco.app.setLoading(false);
                console.log('Error retrieving theme settings configuration.', response);
            }
        });
    }
});