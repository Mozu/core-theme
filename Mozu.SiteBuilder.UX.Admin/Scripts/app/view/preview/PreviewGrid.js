/**
 * @class Taco.view.couponSet.Grid
*/
Ext.define('Taco.view.preview.PreviewGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.store.Products'
    ],

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    //modelName: 'Taco.model.CouponSet',

    //controllerName: 'CouponSets',

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    showActionsColumn: false,

    enableEditAction: false,
    enableDeleteAction: false,

    hideSearchToolbar: false,

    header: false,
    title: 'Something',

    store: { type: 'Taco.store.Products' },

    autoScroll: true,

    enableQuickFilters: false,

    deletePromptMsg : 'If a coupon set is currently active, deleting it could affect pending orders and carts.<br/>Are you sure you want to delete this?',

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.couponSet.AdvancedSearchForm',

        quickFilterData: [
            [{ orderStatus: 'Open' }, 'Open Orders'],
            [{ paymentstatus: 'Unpaid', orderStatus: 'Open' }, 'Unpaid Orders'],
            [{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            [{ orderStatus: 'Pending', ordertype: 'Offline' }, 'Pending Orders'],
            [{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            [{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            [{ orderStatus: 'Errored' }, 'Errored Orders'],
            [{}, 'All Orders']
        ]
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulPreviewGrid',

    statics: {

    },


    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();

        me.callParent(arguments);
    },

    getColumnConfig: function () {
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'productCode',
                stateId: 'productCode',
                text: 'Code',
                width: 150,
                sortable: true
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'productName',
                stateId: 'productName',
                text: 'Name',
                flex: 1,
                minWidth: 150,
                sortable: true
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'price',
                stateId: 'price',
                text: 'Price',
                flex: 1,
                minWidth: 150,
                sortable: true
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'salePrice',
                stateId: 'salePrice',
                text: 'Sale Price',
                flex: 1,
                minWidth: 150,
                sortable: true
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'productTypeName',
                stateId: 'productTypeName',
                text: 'Product Type',
                flex: 1,
                minWidth: 150,
                sortable: true
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'lastModifiedDate',
                stateId: 'lastModifiedDate',
                text: 'Last Modified',
                flex: 1,
                minWidth: 150,
                sortable: true,
                hidden: true
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'productUsage',
                stateId: 'productUsage',
                text: 'Product Usage',
                flex: 1,
                minWidth: 150,
                sortable: true,
                hidden: true
            }
        ];
    }

});