

/**
 * @class  Taco.view.discount.ConditionsForm
 * @author Travis Johnson
 * @description Discount Conditions Editor
 */
Ext.define('Taco.view.discount.ConditionsForm', {
    requires:[
        'Ext.data.UuidGenerator',
        'Ext.ux.form.field.BoxSelect',
        'Taco.view.category.Modal',
        'Taco.view.product.Modal',
        'Taco.view.customers.segments.Modal'
    ],
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-conditions',
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Discount Conditions',

    initComponent: function () {
        this.minimumOrderAmountInput = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'minimumOrderAmount',
            fieldLabel: "Minimum Order Amount",
            forcePrecision: true,
            labelAlign: 'top',
            width: 600,
            unitString: '$',
            emptyText: 'Not Applicable',
            align: 'right',
            unitAtEnd: false
        });        

        this.datesContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            defaults: {
                xtype: 'datetime',
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [
                {
                    name: 'startDate',
                    width: 200,
                    margin: "0px 2px 0px 0px",
                    fieldLabel: "Starts",
                    emptyText: 'Now',
                    value: this.record.get('startDate')
                }, {
                    name: 'expirationDate',
                    width: 200,
                    fieldLabel: "Ends",
                    emptyText: 'Never',
                    value: this.record.get('expirationDate')
                }
            ]
        });

        this.buildProduct();

        this.buildCategory();

        this.buildSegments();

        this.requiresCouponInput = Ext.create('Ext.form.field.Checkbox', {
            name: 'requiresCoupon',
            boxLabel: 'Create coupon',
            labelAlign: 'right',
            listeners: {
                change: function (cb, newValue) {
                    this.couponCodeBox[newValue ? 'show' : 'hide']();
                },
                scope: this
            }
        });
        this.couponCodeInput = Ext.create('Ext.form.field.Text', {
            name: 'couponCode',
            width: 500
        });
        this.couponCodeBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            hidden: !(this.record.get('couponCode') || this.record.get('requiresCoupon')),
            items: [
                this.couponCodeInput,
                {
                    xtype: 'secondarybutton',
                    text: 'Random',
                    click: function () {
                        var randomizer = Ext.data.IdGenerator.get('uuid'),
                            code = randomizer.generate().replace(/[^0-9a-z]/g, "").substr(0, 8).toUpperCase();

                        this.couponCodeInput.setValue(code);
                    },
                    scope: this
                }
            ]
        });

        this.redemptionLimits = Ext.create('Ext.form.field.Number', {
            name: 'maxRedemptionCount',
            hideTrigger: true,
            width: 600,
            fieldLabel: 'Redemption limit' + (this.record.get('currentRedemptionCount') ? '&nbsp;&nbsp;&nbsp;&nbsp;<i>(current redemptions:&nbsp;' + this.record.get('currentRedemptionCount') + '</i>)' : ''),
            emptyText: 'unlimited',
            minValue: 0
        });

        this.minimumLifetimeValueAmount = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'minimumLifetimeValueAmount',
            hidden: this.record.get('scope') !== 'Order',
            unitString: '$',
            forcePrecision:true,
            unitAtEnd: false,
            hideTrigger: true,
            width: 600,
            fieldLabel: 'Minimum Lifetime Value Amount',
            emptyText: 'No Customer Value limit',
            minValue: 0
        });

        this.oneTimeUsePerShopper = Ext.create('Ext.form.field.Checkbox', {
            name: 'oneTimeUsePerShopper',
            hidden: true,
            boxLabel: 'One Time Use per Shopper',
            checked: this.record.get('maximumUsesPerUser') === 1,
            listeners: {
                change: function(cb, newValue) {
                    this.record.set('maximumUsesPerUser', newValue ? 1 : 0);
                },
                scope: this
            }
        });

        this.items = [{
                xtype: 'component',
                html: 'Choose what conditions must be met before a discount will be valid',
                margin: '15 0 0 0'
            },
            this.minimumOrderAmountInput,
            this.minimumLifetimeValueAmount,
            this.segmentsBox,
            this.datesContainer,
            this.productsBox,
            this.categoriesBox,
            this.redemptionLimits,
            this.requiresCouponInput,
            this.couponCodeBox,
            this.oneTimeUsePerShopper
        ];


        this.callParent(arguments);
    },

    buildProduct: function () {
        var productStore = this.record.getProductStore();

        productStore.on({
            load: function () {
                this.productList.resetOriginalValue();
            },
            single: true,
            scope: this
        });

        this.productList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'conditionalProducts',
            flex: 1,
            store: productStore,
            getStore: function () {
                return productStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: false,
            displayField: 'productName',
            fieldLabel: 'Purchase one of the following items',
            valueField: 'productCode'
        });


        this.productsBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: 600,
            items: [
                this.productList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function () { this.launchProductModal(this.productList); },
                    scope: this
                }
            ]
        });
    },


    buildSegments:function (){
        var segStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.CustomerSegments');
        
        this.segmentsList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'customerSegments',
            flex: 1,
            store: segStore,
            getStore: function() {
                return segStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: false,
            displayField: 'code',
            fieldLabel: 'Customer Segments',
            valueField: 'id'
        });

        this.segmentsBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: 600,
            items: [
                this.segmentsList, {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function() { this.launchSegmentModal(this.segmentsList);},
                    scope: this
                }
            ]
        });
    },

    buildCategory: function () {
        var catStore = this.record.getCategoryStore();
        // reset the list's dirty state when its store first loads

        catStore.on({
            load: function () {
                this.categoryList.resetOriginalValue();
            },
            single: true,
            scope: this
        });
        // MultiSelect is the most optimal Field that uses BoundList without a trigger
        this.categoryList = Ext.create('Ext.ux.form.field.BoxSelect', {
            name: 'conditionalCategories',
            flex: 1,
            store: catStore,
            getStore: function () {
                return catStore;
            },
            hideTrigger: true,
            triggerOnClick: false,
            forceSelection: true,
            disableKeyFilter: true,
            typeAhead: true,
            displayField: 'name',
            valueField: 'id',
            fieldLabel: 'Purchase an item from the following categories'
        });

        this.categoriesBox = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: 600,
            items: [
                this.categoryList,
                {
                    xtype: 'secondarybutton',
                    text: 'Add',
                    click: function () {
                        this.launchCategoryModal(this.categoryList);
                    },
                    scope: this
                }
            ]
        });

       
    },
    
    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchCategoryModal: function (list) {
        var listStore = list.getStore(),
            treeStore = Taco.core.data.StoreManager.getCategoryTreeByCatalog();

        this.modal = Ext.create('Taco.view.category.Modal', {
            store: treeStore
        });

        this.modal.on({
            save: function (modal, values) {
                list.addValue(values);
            },
            scope: this
        });
    },

    /**
     * Opens a modal with a list of products.
     * @private
     */
    launchProductModal: function (list) {
        var listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });

        this.modal = Ext.create('Taco.view.product.Modal', {
            store: gridStore
        });

        this.modal.on({
            save: function (modal, values) {
                list.addValue(values);
            },
            scope: this
        });
    },

    launchSegmentModal: function(list) {
        var listStore = list.getStore(),
            gridStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.CustomerSegments',
                clearFilters: true,
                clearSort: true,
                autoLoad: true
            });

        this.modal = Ext.create('Taco.view.customers.segments.Modal', {
            store: gridStore,
            listeners: {
                save: function(modal, values) {
                    list.addValue(values);
                },
                scope: this
            }
        });
    },

    /**
     * Removes a value from the list if the close icon was clicked.
     * @private
     */
    onCategoryListItemClick: function (view, record, item, index, e) {
        var closeBtn = e.getTarget('.x-boundlist-item-close', 10),
            list = view.ownerCt,
            value, store;
        if (closeBtn) {
            store = view.getStore();
            value = Ext.Array.remove(list.getValue(), record.getId());
            store.remove(record);
            list.setValue(value);
            console.log(value, list.getValue());
            return false;
        }
    },

    setFieldVisibility: function (isLineItem, appliesToShipping) {
        this.minimumLifetimeValueAmount.setVisible(!isLineItem);
    }
});