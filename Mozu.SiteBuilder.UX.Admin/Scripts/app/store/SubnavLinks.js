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
            var controller = currentState.complexMetaData.controller.toLowerCase();
            var action = currentState.complexMetaData.action.toLowerCase();
            var key = controller + action;
            var backwardCompatkey = item.get('parentId') ? item.get('parentId').toLowerCase() : null;
            
            var backwardCompatParentKeys = {
                marketing: ['discounts', 'couponsets', 'productrankings'],
                sitebuilder: ['website', 'themes', 'redirects', 'files'],
                settings: ['generalsettings', 'settings', 'shipping'],
                publishing: ['publishing'],
                catalog: ['products', 'categories', 'inventory']
            };

            var possibleLocations = [
                'products',
                'categories',
                'inventory',
                'discounts',
                'couponsets',
                'productrankings',
                'website',
                'themes',
                'redirects',
                'files',
                'drafts',
                'publishsets',
                'order',
                'inventory',
                'locations',
                'customer',
                'customersegments',
                'storecredit',
                'reports',
                'siteconfiguration',
                'environment',
                'types&attributes',
                'access',
                'catalog'
            ];

            if (!item.get('location') && !item.get('parentId')) return false;

            if (backwardCompatkey && backwardCompatParentKeys[backwardCompatkey]) {
                var availableControllers = backwardCompatParentKeys[backwardCompatkey];

                if (availableControllers.indexOf(controller) !== -1) {
                    return item;
                }

            }

            if (backwardCompatkey === controller) {
                return item;
            }

            if (item.get('location').toLowerCase() === key) {
                return item;
            }
        }
    ],
    // for backwards compatability
    parentLocations: {
        marketing: ['discounts', 'couponsets', 'productranking'],
        sitebuilder: ['website', 'themes', 'redirects', 'files'],
        settings: ['generalsettings', 'settings', 'shipping'],
        publishing: ['publishing']
    },

});
