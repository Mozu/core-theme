/**
 * @class Taco.store.SubnavLinks
 */

Ext.define('Taco.store.SubnavLinks', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.SubnavLink',
    requires: [
        'Taco.model.SubnavLink'
    ],
    remoteFilter: true,
    pageSize: 25,
    autoLoad: true,
    proxy: {
        type: 'memory',
        data: Taco.extensiblity.subNavLinks
    },
    filterOnLoad: true,

    filters: [
        function(item) {
            var currentState = Taco.app.StateManager.getCurrentState();
            var controller = currentState.complexMetaData.controller;
            var action = currentState.complexMetaData.action;
            var key = controller + action;
            var backwardCompatkey = item.get('parentId');

            if (!item.get('location') && !item.get('parentId')) return false;

            if (item.get('parentId') === controller) {
                return item;
            }

            if (item.get('location').toLowerCase() === key) {
                return item;
            }
        }
    ],
    possibleLocations: [
        'products',
        'categories',
        'inventory',
        'discounts',
        'couponsets',
        'productranking',
        'editor',
        'themes',
        'redirects',
        'files',
        'drafts',
        'publishsets',
        'orders',
        'inventory',
        'locations',
        'customers',
        'customersegments',
        'storecredit',
        'reports',
        'siteconfiguration',
        'environment',
        'types&attributes',
        'access'
    ]
});
