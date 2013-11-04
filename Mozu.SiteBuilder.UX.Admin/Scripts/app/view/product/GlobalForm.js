/**
 * @class Taco.view.product.GlobalForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.GlobalForm', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm2',
    alias: 'widget.productglobalform',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping',
        'Taco.view.product.subform.SEO',
        'Taco.view.product.subform.RelatedProduct'
    ],
    
    persistChangesToModel: true,

    title: 'Global',
    header: false,
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'global-admin-form'],

    initComponent: function () {
        var subformCfg = {
            isGlobal: true,
            product: this.record,
            persistChangesToModel: true
        };

        this.callParent(arguments);

        this.buildForm();
    },

    buildForm: function () {
        var subFormCfg = {
                isGlobal: true,
                product: this.record,
                persistChangesToModel: true
            },
            items;

        items = [
            Ext.create('Taco.view.product.subform.General', subFormCfg)
        ];

        if (!this.isSingleSite) {
            Ext.Array.push(items, [
                Ext.create('Taco.view.product.subform.Inventory', subFormCfg),
                Ext.create('Taco.view.product.subform.Properties', subFormCfg),
                Ext.create('Taco.view.product.subform.Extras', subFormCfg)
            ]);
        }

        Ext.Array.push(items, [
            Ext.create('Taco.view.product.subform.Shipping', subFormCfg),
            Ext.create('Taco.view.product.subform.SEO', subFormCfg),
            Ext.create('Taco.view.product.subform.RelatedProduct', subFormCfg)
        ]);

        this.loadNavItems(items);
    },

    addSaveTasks: function (tasks) {
        if (this.isSingleSite) {
            return tasks;
        }

        tasks.add([{
            key: 'save-product-record',
            saveRecord: this.record
        }]);

        return tasks;
    }
});