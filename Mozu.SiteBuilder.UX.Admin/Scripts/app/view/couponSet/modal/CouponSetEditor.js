
/**
 * @class Taco.view.couponSet.modal.CouponSetEditor
 */

Ext.define('Taco.view.couponSet.modal.CouponSetEditor', {
    extend: 'Taco.core.ux.window.Drawer',

    requires: [
        'Taco.view.couponSet.GeneralForm',
        'Taco.view.couponSet.GeneratedCodeForm',
        'Taco.view.couponSet.GeneralForm',
        'Taco.view.couponCode.Grid',
        'Taco.view.couponCode.DiscountGrid'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '90%',
    //scale: 'large',
    title: 'Create Coupon Set',
    width: 900,
    createType: '',
    isCreateMode: true,
    record: null,
    closeOnSave: true,

    actionColumnWidth: 50,

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
            '{editType} {couponSetType} Coupon Set'
        );

        this.title = this.titleTemplate.apply({
            editType: me.isCreateMode ? 'Create' : 'Edit',
            couponSetType: me.record ? me.record.get('couponSetType') : me.createType
        });

        //onBeforeClose
        //me.mon(me, 'beforecancel', me.onBeforeCancel);
        //me.mon(me, 'beforesave', me.onBeforeSave);

        this.initUi();
        this.callParent(arguments);
        
        if (this.isCreateMode) {
            this.managePanelsOnCreate(false, 'Save & Continue', false);  //has to be after parent call
        }
    },

    managePanelsOnCreate: function (closeAfterSave, saveText, isCouponCodePanelVisible) {
        var couponSetCode = (this.record) ? this.record.get("couponSetCode") : null,
            couponSetId = (this.record) ? this.record.get("id") : null;


        this.closeOnSave = closeAfterSave;
        var primaryBtn = this.down('#primaryAction');
        if (primaryBtn) {
            primaryBtn.setText(saveText);
        }

        if (this.createType === 'Manual') {
            if (this.couponCodePanel) {
                if (isCouponCodePanelVisible) {
                    this.couponCodePanel.setCouponSetCode(couponSetCode);
                }
                this.couponCodePanel.setVisible(isCouponCodePanelVisible);
            }
        }

        if (this.discountPanel) {
            if (isCouponCodePanelVisible) {
                this.discountPanel.setCouponSetCode(couponSetCode);
                this.discountPanel.setCouponSetId(couponSetId);
            }
            this.discountPanel.setVisible(isCouponCodePanelVisible);
        }
    },

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
        var me = this;

        if (me.isCreateMode) return;

        var
            couponSetCode = me.record ? me.record.get('couponSetCode') : null,
            couponSetModel = Ext.ModelManager.getModel('Taco.model.CouponSet');
        
         me.setLoading({
             msg: "Loading"
         }, me.body);
        
        couponSetModel.load(couponSetCode, {
            failure: function () {
                Taco.app.fireEvent('setmessage', "Error loading couponSet", 'error');
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
            couponSetCode = me.record ? me.record.get('couponSetCode') : null,
            couponSetId = me.record ? me.record.get('id') : null;

        me.generalPanel = Ext.create('Taco.view.couponSet.GeneralForm', {
            record: me.record,
            isCreateMode: me.isCreateMode
        });
        
        me.couponCodePanel = Ext.create('Taco.view.couponCode.Grid', {
            autoHeight: true,
            autoHidePagingToolbar: true,
            couponSetCode: couponSetCode
        });

        me.discountPanel = Ext.create('Taco.view.couponCode.DiscountGrid', {
            margin: {
                top: 20,
                right: 0,
                bottom: 0,
                left: 0
            },
            autoHidePagingToolbar: true,
            autoHeight: true,
            couponSetCode: couponSetCode,
            couponSetId: couponSetId
        });


        var container = Ext.create('Taco.core.ux.form.Form', {
            autoScroll:true,
            items :  [
                me.generalPanel
            ]
        });

        if (me.createType === 'Generated' || (me.record && me.record.get('couponCodeType') === 'Generated')) {
            me.generatedCodePanel = Ext.create('Taco.view.couponSet.GeneratedCodeForm', {
                record: me.record,
                isCreateMode: me.isCreateMode
            });
            container.add(me.generatedCodePanel);
        } else {
            container.add(me.couponCodePanel);
        }

        container.add(me.discountPanel);

        me.items = [
            container
        ];

    },

    onCreate: function(data) {
        this.saveSuccess(data);
        this.record = data;
        Taco.app.fireEvent('couponsetcreated', this.record);
        this.managePanelsOnCreate(true, 'Save', true);
        this.isCreateMode = false;
    },

    doSave: function () {
        var me = this,
            form = me.getForm(),
            data = (!me.generatedCodePanel)
                    ? form.getValues()
                    : Ext.Object.merge(form.getValues(),
                        me.generatedCodePanel.getForm().getValues()),
            onSuccess = (!me.isCreateMode)
                    ? me.saveSuccess
                    : me.onCreate;

        // see if there is a form to extract the data from ;

        if (this.isCreateMode) {
            this.record = Ext.create('Taco.model.CouponSet', data);
            this.record.set('couponCodeType', this.createType);
        } else {
            Ext.Object.merge(this.record.data, data);
        }
        this.record.save({
            success: onSuccess,
            failure: function() {
                Taco.app.fireEvent('setmessage', 'There was an error saving the Coupon Set', 'error');
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
