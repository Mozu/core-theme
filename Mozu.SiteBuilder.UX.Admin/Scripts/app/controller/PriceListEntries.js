/**
 * @class  Taco.controller.PriceListEntries
 * The PriceListEntries controller.
 */
Ext.define('Taco.controller.PriceListEntries', {
    extend: 'Taco.core.Controller',
    models: ['Taco.model.PriceListEntry'],
    stores: ['Taco.store.PriceListEntries'],
    views: ['Taco.view.priceList.widget.EntriesGrid'],
    modelName: 'PriceListEntry'
});

