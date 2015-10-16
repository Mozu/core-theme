
/**
 * @class Taco.view.searchTuningRule.modal.SearchTuningRuleEditor
 */

Ext.define('Taco.view.searchTuningRule.modal.SearchTuningRuleEditor', {
    extend: 'Taco.core.ux.window.Drawer',

    requires: [
        'Taco.view.searchTuningRule.Edit',
        'Taco.core.util.ExceptionWhiner'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '90%',
    title: 'New Rule',
    width: '80%',
    //createType: '',
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
            '{editType} Rule'
        );

        this.title = this.titleTemplate.apply({
            editType: me.isCreateMode ? 'Create' : 'Edit'
        });

        this.initUi();
        this.callParent(arguments);
    },



    onEsc : Ext.emptyFn,

    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function () {

        this.callParent(arguments);

        if (!this.record) {
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

        var
            code = me.record ? me.record.get('code') : null,
            searchTuningRuleModel = Ext.ModelManager.getModel('Taco.model.SearchTuningRule');
        
         me.setLoading({
             msg: "Loading"
         }, me.body);
        
        searchTuningRuleModel.load(code, {
            failure: function () {
                Taco.app.fireEvent('setmessage', "Error loading Search Tuning Rule", 'error');
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
        this.setLoading(false, this.body);
    },

    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this,
            code = me.record ? me.record.get('code') : null;

        me.container = Ext.create('Taco.view.searchTuningRule.Edit', {
            autoScroll:true,
            record: me.record,
            isCreate: me.isCreateMode
        });

        me.items = [
            me.container
        ];

    },

    onCreate: function(data) {
        this.saveSuccess(data);
        this.record = data;
        Taco.app.fireEvent('searchtuningrulecreated', this.record);
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
            this.record = Ext.create('Taco.model.SearchTuningRule', data);
        } else {
            Ext.Object.merge(this.record.data, data);
        }
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
