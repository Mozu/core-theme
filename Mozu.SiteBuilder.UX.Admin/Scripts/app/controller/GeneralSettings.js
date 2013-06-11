/**
 * @class Taco.controller.GeneralSettings
 * The General Settings controller.
 */

Ext.define('Taco.controller.GeneralSettings', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.generalSettings.Index'],
    views: ['generalSettings.Index'],
    models: ['Taco.model.GeneralSettings'],
    stores: ['Taco.store.GeneralSettings'],
    listView: null,
    modelName: 'GeneralSettings',
    index: function (params) {
        var me = this;
        Taco.model.GeneralSettings.load('', {
            success: function (record, o) {
                me.createContentView('Taco.view.generalSettings.Index', { record: record });
            }
        });
    }
});


