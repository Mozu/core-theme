/**
 * @class Taco.view.couponCode.Grid
*/

Ext.define('Taco.view.couponCode.DiscountGrid', {
    extend: 'Taco.view.discount.Grid',
    alias: 'widget.couponcodediscountgrid',
    requires: [
        'Taco.store.Discounts',
        'Taco.shared.view.field.DiscountPickerField'
    ],
    stateful: false,
    enableNavHeader: false,
    //minHeight: 240,
    autoHeight: true,
    //height:300,
    pageSize: 5,
    //store: {
    //    type: 'Taco.store.DiscountGrid',
    //    createOnly:true,
    //    pageSize:10
    //},
    launchEditorOnClick: false,
    deferEmptyText:false,
    emptyText: 'None Available',

    autoScroll: false,

    config: {
        couponSetCode: null,
        couponSetId: null
    },


    deferEmtpyText: false,

    showActionsColumn : true,

    autoHidePagingToolbar:false,

    minHeight: 240,
    enableEditAction: false,
    enableDuplicateAction: false,
    enableDeleteAction: false,

    enableAutoSelect:false,

    updateCouponSetCode : function() {
        var me = this,
            couponSetCode = this.getCouponSetCode();

    },

    updateCouponSetId: function () {
        var me = this,
            couponSetId = this.getCouponSetId();

        //this.store.extraParams.params.couponsetid = couponSetId;
        this.store.proxy.extraParams.couponsetid = couponSetId;
    },

    initComponent: function() {
        var me = this,
            couponSetId = this.getCouponSetId();

        me.dockedItems = me.dockedItems || [];
        me.mixins = me.mixins || [];
        
        this.viewConfig = this.viewConfig || {}
        this.viewConfig.deferEmptyText = this.deferEmptyText;
        

        this.store = Ext.create('Taco.store.Discounts', {
            pageSize: this.pageSize,
            autoLoad: false
        });
        
        


        //me.store = Taco.core.data.StoreManager.getOrCreate({
        //    type: 'Taco.store.Discounts',
        //    createOnly: true,
        //    pageSize: this.pageSize,
        //    autoLoad: (couponSetId) ? true : false,
        //    extraParams: {
        //        params: {
        //            couponsetid: this.getCouponSetId()
        //        }
        //    }
        //});

        me.initQuickAddBar();

        this.callParent(arguments);

        me.addDocked(me.quickAddBar, 0);


        if (couponSetId) {
            this.store.proxy.extraParams = this.store.proxy.extraParams || {};
            this.store.proxy.extraParams.couponsetid = couponSetId;
            this.store.load();
        }

    },


    removeDiscount: function (record) {
        this.doAssign(record, "remove");
    },

    addDiscount : function(record) {
        this.doAssign(record);
    },

    doAssign: function (record, target) {
        var me = this,
        value = record.getId(),
        url = '/admin/app/couponset/assigndiscount',
        growlMessage = "Added";

        if (target && target == "remove") {
            url = '/admin/app/couponset/unassigndiscount';
            growlMessage = "Removed";
        }

        
        var jsonData = {
            couponSetCode: this.getCouponSetCode(),
            assignedDiscount: {
                id: value
            }
        };


        var config = {
            url: url,
            method: 'POST',
            jsonData: jsonData,
            success: function (response) {

                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    var msg = (config.errorMsg) ? config.errorMsg : "Error";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    this.setLoading(false);
                    return;
                }

                if (json.success) {
                    //field.setValue();
                    //me.getSelectionModel().deselectAll();
                    me.mon(me.store, 'load', function () {
                        Taco.app.fireEvent('setgrowl', growlMessage, null, 2000);
                    }, me, {
                        single: true
                    });
                    me.store.reload();
                }

                this.setLoading(false);
            },
            failure: function (response) {
                //Taco.app.viewPort.setLoading(false);
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : (config.errorMcallsg) ? config.errorMsg : "Error";
                Taco.app.fireEvent('setmessage', msg, 'error');

                this.setLoading(false);
            },
            scope: this
        };

        this.setLoading("Loading...");
        Ext.Ajax.request(config);


    },

    getQuickAddField: function () {
        var me = this;
        if (!me.quickAddField) {
            me.quickAddField = Ext.create('Taco.shared.view.field.DiscountPickerField',{
                //xtype: "textfield",
                flex: 1,
                emptyText: "Search for discount and hit ENTER key to Add",
                listeners: {
                    scope: me,
                    select: function (field, records, e) {
                        if (records[0]) {
                            me.addDiscount(records[0]);
                            me.quickAddField.setValue("");
                        }
                    }
                }
            });
        }
        return me.quickAddField;
    },

    initQuickAddBar: function () {
        var me = this;
        
        me.quickAddBar = Ext.create("Ext.toolbar.Toolbar", {
            dock: "top",
            padding: {
                top: 2,
                left: 0,
                right: 0,
                bottom: 10
            },
            items: [
                me.getQuickAddField()
            ]
        });



    },

    getActionItems: function() {
        var me = this,
            actions = [],
            originalActions;
        
        originalActions = this.callParent(arguments);
        
        actions.push({
            text: 'Remove Coupon Set From Discount',
            menuColumnHandler: function(item, eventData) {
                var record = eventData.record;
                me.removeDiscount(record);
            }
        });

        actions = Ext.Array.merge(actions, originalActions);

        return actions;
    }

    //,
    //getColumnConfig: function () {
    //    var me = this,
    //        columns = [
    //            {
    //                //xtype: 'gridcolumn',
    //                dataIndex: 'name',
    //                stateId: 'name',
    //                text: 'Name',
    //                hideable: false,
    //                flex: 1,
    //                minWidth: 150
    //                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
    //                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
    //                //}
    //            }
    //        ];

    //    return columns;
    //}

});