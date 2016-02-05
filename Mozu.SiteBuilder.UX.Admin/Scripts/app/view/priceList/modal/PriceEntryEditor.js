
/**
 * @class Taco.view.priceList.modal.PriceEntryEditor
 */

Ext.define('Taco.view.priceList.modal.PriceEntryEditor', {
    extend: 'Taco.core.ux.window.Drawer',

    requires: [
        'Taco.view.priceList.form.PriceEntryGeneral',
        'Taco.view.priceList.form.PriceEntryPrice'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '90%',
    width: '80%',
    //scale: 'large',
    closeOnSave: true,
    actionColumnWidth: 50,

    title: 'Create Price Entry',
    record: null,
    isCreateMode: true,
    priceListCode: null,

    resizable: {
        dynamic: true,
        handles: 'w sw s se e',
        heightIncrement: 1,
        minHeight: 600,
        minWidth: 800,
        preserveRatio: false,
        widthIncrement: 1
    },
    
    initComponent: function (eOpts) {
        var me = this;

        this.layout = {
            type: 'fit'
        };
        
        // Todo: Need to listen for a navigation (via backbutton) and cancel the navigation if editor is dirty or prompt user to cancel and navigate.
        // Todo: Create override/mixin/plugin for Ext.Window to add support for relative height and width with min max values.

        this.titleTemplate = new Ext.XTemplate(
            '{editType} Price Entry'
        );

        this.title = this.titleTemplate.apply({
            editType: me.isCreateMode ? 'Create' : 'Edit'
        });

        //onBeforeClose
        //me.mon(me, 'beforecancel', me.onBeforeCancel);
        //me.mon(me, 'beforesave', me.onBeforeSave);

        this.initUi();
        this.callParent(arguments);
        
        //if (this.isCreateMode) {
        //    this.managePanelsOnCreate(false, 'Save & Continue', false);  //has to be after parent call
        //}
    },

    //managePanelsOnCreate: function (closeAfterSave, saveText, isCouponCodePanelVisible) {
    //    var priceListCode = (this.record) ? this.record.get("priceListCode") : null,
    //        priceListId = (this.record) ? this.record.get("id") : null;
    //
    //
    //    this.closeOnSave = closeAfterSave;
    //    var primaryBtn = this.down('#primaryAction');
    //    if (primaryBtn) {
    //        primaryBtn.setText(saveText);
    //    }
    //
    //    if (this.createType === 'Manual') {
    //        if (this.couponCodePanel) {
    //            if (isCouponCodePanelVisible) {
    //                this.couponCodePanel.setPriceEntryCode(priceListCode);
    //            }
    //            this.couponCodePanel.setVisible(isCouponCodePanelVisible);
    //        }
    //    }
    //
    //    if (this.discountPanel) {
    //        if (isCouponCodePanelVisible) {
    //            this.discountPanel.setPriceEntryCode(priceListCode);
    //            this.discountPanel.setPriceEntryId(priceListId);
    //        }
    //        this.discountPanel.setVisible(isCouponCodePanelVisible);
    //    }
    //},

    onEsc : Ext.emptyFn,

    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function () {


        this.callParent(arguments);


        // need to manually listen for events that might cause the grid to blur;
        /*
        me.mon(me.el, {
            click: me.onGridBlur,
            keypress: me.onGridBlur,
            scope: me
        });
        */



        if (!this.record) {
            this.loadRecord();
        } else {
            this.onLoadRecord();
        }

        //if (!me.isCreateMode) {
        //    this.down('#discardAction').hide();
        //    //this.down('#secondaryAction').hide();
        //}
    },
    
    /**
     * Call the service to reload the data.
     */
    reloadData: function () {        
        this.loadRecord();
    },

    /**
     * Call the service and get an updated record.
     */
    loadRecord: function () {
        var me = this,
            priceListCode = me.record ? me.record.get('priceListCode') : null,
            priceListModel = Ext.ModelManager.getModel('Taco.model.PriceListEntry');

        if (me.isCreateMode) return;

         me.setLoading({
             msg: "Loading"
         }, me.body);
        
        priceListModel.load(priceListCode, {
            failure: function () {
                Taco.app.fireEvent('setmessage', "Error loading priceList", 'error');
                me.setLoading(false, this.body);
            },
            success: function (record) {
                me.record = record;
                me.onLoadRecord();
            },
            callback: function (record, operation) {
                //do something whether the load succeeded or failed
            }
        });
    },
    
    // when the draft record has loaded create and add the total and grid and hide the loading mask;
    onLoadRecord : function() {
        this.updateUi();
        this.setLoading(false, this.body);
    },
    
    // reloads the ui using new data
    updateUi: function () {
        
        // update the record on the totalRow panel
        //me.totalRow.setRecord(me.record);
        //
        //// need to determine the selection so it can be restored after updateing the records in the store;
        //var currentPosition = me.detailGrid.getSelectionModel().getCurrentPosition();
        //me.detailGrid.getStore().loadRecords(me.record.itemsStore.getRange());
        //
        //if (currentPosition) {
        //    me.detailGrid.restoreSelection(currentPosition);
        //} else {
        //    // field is focused; need to scroll to it if needed;
        //    var activeFocusEl = Ext.fly(document.activeElement);
        //    var isHidden = activeFocusEl.isHiddenByScroll(me.body);
        //    if (isHidden) {
        //        activeFocusEl.scrollIntoView(me.body);
        //    }
        //}
    },

    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this,
            priceListCode = me.record ? me.record.get('priceListCode') : null,
            priceListId = me.record ? me.record.get('id') : null;

        me.generalPanel = Ext.create('Taco.view.priceList.form.PriceEntryGeneral', {
            record: me.record,
            isCreateMode: me.isCreateMode
        });

        me.pricePanel = Ext.create('Taco.view.priceList.form.PriceEntryPrice', {
            record: me.record,
            isCreateMode: me.isCreateMode
        });
        
        //me.couponCodePanel = Ext.create('Taco.view.couponCode.Grid', {
        //    autoHeight: true,
        //    autoHidePagingToolbar: true,
        //    priceListCode: priceListCode
        //});
        //
        //me.discountPanel = Ext.create('Taco.view.couponCode.DiscountGrid', {
        //    margin: {
        //        top: 20,
        //        right: 0,
        //        bottom: 0,
        //        left: 0
        //    },
        //    autoHidePagingToolbar: true,
        //    autoHeight: true,
        //    priceListCode: priceListCode,
        //    priceListId: priceListId
        //});


        var container = Ext.create('Taco.core.ux.form.Form', {
            autoScroll:true,
            items :  [
                me.generalPanel,
                me.pricePanel
            ]
        });

        //if (me.createType === 'Generated' || (me.record && me.record.get('couponCodeType') === 'Generated')) {
        //    me.generatedCodePanel = Ext.create('Taco.view.priceList.GeneratedCodeForm', {
        //        record: me.record,
        //        isCreateMode: me.isCreateMode
        //    });
        //    container.add(me.generatedCodePanel);
        //} else {
        //    container.add(me.couponCodePanel);
        //}
        //
        //container.add(me.discountPanel);

        me.items = [
            container
        ];

    },

    onCreate: function(data) {
        this.saveSuccess(data);
        this.record = data;
        Taco.app.fireEvent('pricelistentrycreated', this.record);
        //this.managePanelsOnCreate(true, 'Save', true);
        this.isCreateMode = false;
        Ext.defer(function() {
            this.focusEl.focus();
        }, 1, this);
        

    },

    doSave: function () {
        var me = this,
            form = me.getForm(),
            data = form.getValues(),
            onSuccess = (!me.isCreateMode)
                    ? me.saveSuccess
                    : me.onCreate;

        // see if there is a form to extract the data from ;

        if (this.isCreateMode) {
            this.record = Ext.create('Taco.model.PriceListEntry', data);
            this.record.set('priceListCode', this.priceListCode);
        } else {
            Ext.Object.merge(this.record.data, data);
        }
        this.record.save({
            success: onSuccess,
            failure: function(item, response) {
                var message = 'There was an error saving the Price List entry';
                Taco.app.fireEvent('setmessage', message, 'error');
            },
            scope: me
        });
    },

    constrainResizer: function () {
        var cfg = {},
            region = Ext.getBody().getRegion();

        Ext.apply(cfg, this.resizable, {
            constrainTo: region
        });

        this.resizable = cfg;
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
