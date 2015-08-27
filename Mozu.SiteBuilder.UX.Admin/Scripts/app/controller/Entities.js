/**
 * @class Taco.controller.Channels
 * @author Simeon Kessler
 * The Channels controller
 */

Ext.define('Taco.controller.Entities', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.entityManager.Index'
    ],
   
    indexView: 'Taco.view.entityManager.Index'
});