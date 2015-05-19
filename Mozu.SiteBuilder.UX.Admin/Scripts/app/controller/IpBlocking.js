/**
 * @class  Taco.controller.IpBlocking
 * The IpBlocking controller.
 */

Ext.define('Taco.controller.IpBlocking', {
    extend: 'Taco.core.Controller',
    alias: ['Taco.controller.Ipblocking'],
    requires: [
         // 'Taco.view.ipblocking.Edit',
         'Taco.view.error.Http404'
    ],
    stores: ['Taco.store.IpBlocking'],
    models: ['Taco.model.IpBlocking'],
    // turning off in prod brah
    // indexView: 'Taco.view.ipblocking.Edit',
    indexView: 'Taco.view.error.Http404'
});

