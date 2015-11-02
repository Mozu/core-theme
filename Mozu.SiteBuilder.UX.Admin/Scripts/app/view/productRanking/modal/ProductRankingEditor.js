
/**
 * @class Taco.view.productRanking.modal.ProductRankingEditor
 */

Ext.define('Taco.view.productRanking.modal.ProductRankingEditor', {
    extend: 'Taco.core.ux.window.Drawer',

    requires: [
        'Taco.view.productRanking.Form',
        'Taco.core.util.ExceptionWhiner'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '90%',
    title: 'New Product Ranking Rule',
    width: '80%',
    isCreateMode: true,
    record: null,
    categoryCode: null,
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

        this.title = (me.isCreateMode ? 'New Product Ranking Rule' : me.record.get('name'));

        this.initUi();
        this.callParent(arguments);
    },

    onEsc : Ext.emptyFn,

    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function () {

        this.callParent(arguments);

        if (!this.isCreateMode) {
            this.loadRecord();
        } else {
            this.onLoadRecord();
        }

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

        me.setLoading({
            msg: "Loading"
        }, me.body);

        var singleStore = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.ProductRankings',
            createOnly: true,
            autoLoad: false,
            clearFilters: true,
            remoteFilter: true
        });
        singleStore.proxy.extraParams = singleStore.proxy.extraParams || {};
        singleStore.proxy.extraParams.id = this.record.get('code');
        singleStore.proxy.extraParams.siteId = this.record.get('siteId');
        singleStore.load({
            scope: this,
            callback: function(records, operation, success) {
                if (success && records.length > 0)
                    me.record = records[0];
                    me.onLoadRecord();
            }
        });
    },

    // when the draft record has loaded create and add the total and grid and hide the loading mask;
    onLoadRecord : function() {
        this.setLoading(false, this.body);
    },

    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this;

        if (me.isCreateMode && !me.record) {
            me.record = Ext.create('Taco.model.ProductRanking', {});
        }

        me.container = Ext.create('Taco.view.productRanking.Form', {
            autoScroll:true,
            record: me.record,
            isCreate: me.isCreateMode,
            isCatalogLevel: true,
            categoryCode: me.categoryCode,
            isPopUp: true,
            getWrapper: function() {
                return this;
            }
        });

        me.items = [
            me.container
        ];

    },

    onCreate: function(data) {
        this.saveSuccess(data);
        this.record = data;
        Taco.app.fireEvent('productrankingrulecreated', this.record);
        this.isCreateMode = false;
        Ext.defer(function() {
            this.focusEl.focus();
        }, 1, this);
    },

    doSave: function () {
        var me = this,
            onSuccess = (!me.isCreateMode)
                    ? me.saveSuccess
                    : me.onCreate;

        var okToSave = me.form.beforeSave();
        if (!okToSave) {
            return false;
        }
        this.record = me.form.record;
        this.record.save({
            success: onSuccess,
            failure: function(item, response) {
                Taco.core.util.ExceptionWhiner.handleRemoteFailure(response);
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
