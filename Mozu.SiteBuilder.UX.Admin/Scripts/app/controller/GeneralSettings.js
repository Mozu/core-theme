/**
 * @class Taco.controller.GeneralSettings
 * The General Settings controller.
 */

Ext.define('Taco.controller.GeneralSettings', {
    extend: 'Taco.core.Controller',
    alias: ['Taco.controller.Generalsettings'],
    requires: ['Taco.view.generalSettings.Index'],
    views: ['generalSettings.Index'],
    models: ['Taco.model.GeneralSettings'],
    stores: ['Taco.store.GeneralSettings'],
    listView: null,
    modelName: 'GeneralSettings',
    index: function () {
        var me = this;
        Taco.app.setLoading();
        if (!this.requiresSiteContext()) {
            Taco.model.GeneralSettings.load('', {
                success: function (record) {
                    Taco.app.setLoading(false);
                    me.createContentView('Taco.view.generalSettings.Index', {
                        record: record      
                    });
                },
                failure: function () {
                    Taco.app.setLoading(false);
                }
            });
        }
    },
    site: function () {
        Taco.core.StateManager.attemptNavigate('generalsettings');
    }
});