/**
 * @class Taco.store.UspsSharedShippingMethods
 * @author Jason Cochran
 * The USPS Global Shipping Methods Store
 */

Ext.define('Taco.store.UspsSharedShippingMethods', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.UspsSharedShippingMethod',
    remoteFilter: true,
    pageSize: 1000
});
