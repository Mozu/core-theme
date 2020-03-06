/**
 * @class Taco.view.settings.shipping.CarrierAccounts
*/
Ext.define('Taco.view.settings.shipping.CarrierAccounts', {
    requires: ['Taco.store.CarrierAccounts', 'Taco.core.ux.browser.SearchList'],
    extend: 'Taco.view.settings.shipping.CarrierAccountsGrid',
    //alias: 'widget.carrieraccountsgrid',
    cls: 'shipping-links',
    createButtonText: "Create New Carrier Account",
    title: "Carrier Accounts",
    createRoute: 'shipping/CarrierAccountcreate',
    editorRoute: 'shipping/CarrierAccountedit',
    duplicateRoute:'shipping/CarrierAccountCopy',

    store: { type: 'Taco.store.CarrierAccounts' },
    enableSearchBarInHeader: true,
   // enableSearch: false,
    stateful: true,
    stateId: "statefulCarrierAccountGrid",
    showbreadCrumbspacer: false,
    breadCrumbConfig: [
        {
            title: 'Methods',
            tabIndex: 0,
            route: 'shipping'
        },
        {
            title: 'Carriers',
            tabIndex: 1,
            route: 'shipping/carriers'
        },
        {
            title: 'Zones',
            tabIndex: 2,
            route: 'shipping/zones'
            //isActive: true
        },
        {
            title: 'Product Rules',
            tabIndex: 3,
            route: 'shipping/productRules'
        },
        {
            title: 'Carrier Accounts',
            tabIndex: 4,
            route: 'shipping/CarrierAccounts',
            isActive: true
        }
    ],



});





