/**
 * @class Taco.controller.Channels
 * @author Simeon Kessler
 * The Channels controller
 */

Ext.define('Taco.controller.Channels', {
    extend: 'Taco.core.Controller',
    requires: [
        //'Taco.view.locationType.Edit'
    ],
    //editorView: 'Taco.view.locationType.Edit',
    //listView: null,
    models: ['Taco.model.Channel'],
    stores: ['Taco.store.Channels'],
    views: ['channel.Index'],
    modelName: 'Channel'
});