/**
 * @class  Taco.controller.IpBlocking
 * The IpBlocking controller.
 */

Ext.define('Taco.controller.IpBlocking', {
    extend: 'Taco.core.Controller',
    alias: ['Taco.controller.Ipblocking'],
    requires: [
         'Taco.view.ipblocking.Edit'
    ],
    stores: ['Taco.store.IpBlocking'],
    models: ['Taco.model.IpBlocking'],
    indexView: 'Taco.view.ipblocking.Edit'
});

