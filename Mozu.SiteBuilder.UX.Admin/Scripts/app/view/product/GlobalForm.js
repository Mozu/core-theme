/**
 * @class Taco.view.product.GlobalForm
 * @author Michael Speed Elder
 *
 */

Ext.define('Taco.view.product.GlobalForm', {
    //extend: 'Taco.core.ux.form.Form',
    extend: 'Taco.core.ux.form.NavForm',
    alias: 'widget.productglobalform',
    requires: [
        'Taco.view.product.subform.General',
        'Taco.view.product.subform.Inventory',
        'Taco.view.product.subform.Properties',
        'Taco.view.product.subform.Extras',
        'Taco.view.product.subform.Shipping',
        'Taco.view.product.subform.SEO'
    ],
    persistChangesToModel: true,
    mixins: {
        scrollspy: 'Taco.core.ux.ScrollSpy' // TODO: resolve JS error with this and getEl()
    },
    constructor: function () {
        this.callParent(arguments);
        this.mixins.scrollspy.constructor.call(this);
    },
    scrollSpyOffset: 150,
    title: 'Global',
    header: false,
    bodyCls: [Taco.baseCSSPrefix + 'product-admin-form', Taco.baseCSSPrefix + 'global-admin-form'],

    initComponent: function () {
        var subformCfg = {
            isGlobal: true,
            product: this.record,
            persistChangesToModel: true
        };

        this.items = [
            Ext.create('Taco.view.product.subform.General', subformCfg)
        ];

        if (!this.isSingleSite) {
            Ext.Array.push(this.items, [
                Ext.create('Taco.view.product.subform.Inventory', subformCfg),
                Ext.create('Taco.view.product.subform.Properties', subformCfg),
                Ext.create('Taco.view.product.subform.Extras', subformCfg)
            ]);
        }

        Ext.Array.push(this.items, [
            Ext.create('Taco.view.product.subform.Shipping', subformCfg),
            Ext.create('Taco.view.product.subform.SEO', subformCfg)
        ]);

        this.navStore = Ext.create('Ext.data.Store', {
            fields: ['title'],
            data: this.items
        });

        this.callParent(arguments);
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