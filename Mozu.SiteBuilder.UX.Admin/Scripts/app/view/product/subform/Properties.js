/**
 * @class Taco.view.product.subform.Properties
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.subform.Properties', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.productpropertiesform',

    title: 'Properties',
    
    initComponent: function () {
        this.productTypeStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');

        this.items = [this.getEmptyComponent()];

        this.callParent(arguments);
    },

    loadByProductTypeId: function (id) {
        var type = this.productTypeStore.getById(id),
            properties,
            items = [];

        if (!type) {
            return;
        }

        properties = type.getProperties();

        properties.each(function (property) {
            items.push(Ext.widget({
                xtype: 'component',
                html: property.get('attributeName')
            }));
        });

        if (!items.length) {
            items.push(this.getEmptyComponent());
        }

        this.removeAll();
        this.add(items);
    },

    getEmptyComponent: function () {
        return {
            xtype: 'component',
            html: 'Super sorry, but this product type does not have any properties associated to it....<small style="color: #eee;">    <i>idiot</i></small>'
        };
    }
});