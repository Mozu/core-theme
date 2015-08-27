/**
 * @class Taco.controller.Channels
 * @author Simeon Kessler
 * The Channels controller
 */

Ext.define('Taco.controller.Channels', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.channel.Index'
    ],
    models: ['Taco.model.Channel'],
    stores: ['Taco.store.Channels'],
    views: ['channel.Index'],
    modelName: 'Channel'
});