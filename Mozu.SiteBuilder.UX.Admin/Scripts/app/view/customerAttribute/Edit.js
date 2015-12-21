/**
 * @class  Taco.view.attribute.Edit
 * @author  Travis Johnson
 */

Ext.define('Taco.view.customerAttribute.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.customerAttribute.Form'
    ],
    parentTitleCfg: {
        title: 'Customer Attributes',
        controller: 'customerattributes'
    },
    formCls: 'Taco.view.customerAttribute.Form',
    enableSearchBarInHeader: false
});