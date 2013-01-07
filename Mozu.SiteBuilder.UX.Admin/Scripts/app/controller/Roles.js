/**
 * @class  Taco.controller.Roles
 * The Roles controller
 */

Ext.define('Taco.controller.Roles', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.Role'],
    views: ['role.Index'],
    stores: ['Taco.store.Roles'],
    modelName: 'Role'
});