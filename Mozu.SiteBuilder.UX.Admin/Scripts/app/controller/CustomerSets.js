/**
 * @class Taco.controller.Channels
 * @author Simeon Kessler
 * The Channels controller
 */

Ext.define('Taco.controller.CustomerSets', {
  extend: 'Taco.core.Controller',
  alias: ['Taco.controller.Customersets'],
    requires: [
        'Taco.view.customerSet.Index'
    ],
    models: ['Taco.model.CustomerSet'],
    stores: ['Taco.store.CustomerSet'],
    views: ['customerSet.Index'],
    modelName: 'CustomerSet'
});