/**
 * @class Taco.view.product.AdvancedSearchForm
 */
Ext.define('Taco.view.category.AdvancedSearchForm', {
    extend: 'Taco.core.ux.form.Form',
    requires: [],
    defaults: {
        width: 500,
        xtype: 'textfield'
    },
    items: [
        {
            name: 'categorycode',
            flex: 1,
            fieldLabel: 'Code'
        }
        // {
        //     name: 'id',
        //     flex: 1,
        //     fieldLabel: 'Name'
        // }
    ]
});