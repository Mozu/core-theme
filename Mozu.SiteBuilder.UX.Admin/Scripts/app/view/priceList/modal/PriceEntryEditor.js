
/**
 * @class Taco.view.priceList.modal.PriceEntryEditor
 */

Ext.define('Taco.view.priceList.modal.PriceEntryEditor', {
    extend: 'Taco.core.ux.window.Drawer',

    requires: [
        'Taco.view.priceList.entry.PriceEntryGeneral',
        'Taco.view.priceList.entry.PriceEntryPrice'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '95%',
    width: '80%',
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

        if (me.isCreateMode && !me.record) {
            me.record = Ext.create('Taco.model.PriceListEntry', { priceListCode: this.priceListCode });
        }

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

        this.initUi();
        this.callParent(arguments);
    },

    onEsc : Ext.emptyFn,

    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function () {
        this.callParent(arguments);
        this.loadRecord();
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
            priceListModel = Ext.ModelManager.getModel('Taco.model.PriceListEntry');

        if (me.isCreateMode) return;

        me.setLoading({
            msg: "Loading"
        }, me.body);

        priceListModel.load('single', {
            params: {
                priceListCode: this.priceListCode,
                productCode: me.record.get('productCode'),
                currencyCode: me.record.get('currencyCode'),
                startDate: me.record.get('startDate')
            },
            failure: function () {
                Taco.app.fireEvent('setmessage', "Error loading Price List Entry", 'error');
                this.setLoading(false, this.body);
            },
            success: function (record) {
                this.record = record;
                Taco.app.fireEvent('price-entry-loaded', record);
                this.setLoading(false, this.body);
            },
            scope: this
        });

    },

    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this;

        me.generalPanel = Ext.create('Taco.view.priceList.entry.PriceEntryGeneral', {
            record: me.record
        });

        me.pricePanel = Ext.create('Taco.view.priceList.entry.PriceEntryPrice', {
            record: me.record,
            currencyCode: !me.record.phantom
                            ? me.record.get('currencyCode')
                            : Taco.app.context.getMasterCatalog().currencyCode
        });

        var container = Ext.create('Taco.core.ux.form.Form', {
            autoScroll:true,
            items :  [
                me.generalPanel,
                me.pricePanel
            ]
        });

        me.items = [
            container
        ];

    },

    onCreate: function(data) {
        this.saveSuccess(data);
        this.record = data;
        Taco.app.fireEvent('pricelistentrycreated', this.record);
        this.isCreateMode = false;
        Ext.defer(function() {
            this.focusEl.focus();
        }, 1, this);

    },

    doSave: function () {
        var me = this,
            form = me.getForm(),
            basic = form.down('#basicPanel'),
            entries = basic.items,
            data = form.getValues(),
            priceEntries = [],
            onSuccess = (!me.isCreateMode)
                    ? me.saveSuccess
                    : me.onCreate;

        if (this.isCreateMode) {
            this.record = Ext.create('Taco.model.PriceListEntry', data);
            this.record.set('priceListCode', this.priceListCode);
        } else {
            Ext.Object.merge(this.record.data, data);
        }

        entries.each(function(entry) {
            priceEntries.push(entry.getValues());
        });

        this.record.set('priceEntries', priceEntries);

        this.record.save({
            success: onSuccess,
            failure: function (item, response) {
                var message = (response && response.error && response.error.remoteException) ? response.error.remoteException.data.message : "An error has occured.  Unable to save changes.";
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
