/**
 * @class Taco.controller.Synonyms
 * The Synonyms controller.
 */

Ext.define('Taco.controller.Synonyms', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.synonyms.Index'],
    indexView: 'Taco.view.synonyms.Index',
    //models: ['Taco.model.Synonyms'],
    //stores: ['Taco.store.Synonyms'],
    //modelName: 'Synonyms',
/*    index: function () {
        var me = this;

        if (!this.requiresSiteContext()) {
            Taco.model.GeneralSettings.load('', {
                success: function (record) {
                    me.createContentView('Taco.view.synonyms.Index', {
                        record: record      
                    });
                },
                failure: function () {
                }
            });
        }
    },*/
    site: function () {
        Taco.core.StateManager.attemptNavigate('synonyms');
    }
});