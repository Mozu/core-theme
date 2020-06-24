
/**
 * @class Taco.view.product.images.ImageGroupEditor
 */

Ext.define('Taco.view.product.images.ImageGroupEditor', {
    extend: 'Taco.core.ux.window.Drawer',

    requires: [
        'Taco.view.product.images.ImageGroupForm',
        'Taco.core.util.ExceptionWhiner'
    ],

    closeAction: 'destroy',
    primaryText: Localizer.langResources.SHARED.update,
    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'imagegroup-editor',
    height: '90%',
    title: Localizer.langResources.CATALOG.Products.ProductEdit.add_image_group,
    width: '80%',
    isCreateMode: true,
    record: null,
    categoryCode: null,
    closeOnSave: true,

    actionColumnWidth: 50,
    margin: '20 0 0 0',

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

        this.title = (me.isCreateMode ? Localizer.langResources.CATALOG.Products.ProductEdit.add_image_group : Localizer.langResources.CATALOG.Products.ProductEdit.edit_image_group);

        this.initUi();

        this.callParent(arguments);
    },

    onEsc: Ext.emptyFn,

    /**
     * Show the loading mask while we wait for the service to respond with the draft record.
     */
    show: function() {
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
    reloadData: function() {
        this.loadRecord();
    },

    /**
     * Call the service and get an updated record.
     */
    loadRecord: function() {
        var me = this;

        if (me.isCreateMode) return;

        this.setLoading(true);
        me.onLoadRecord();
    },

    // when the draft record has loaded create and add the total and grid and hide the loading mask;
    onLoadRecord : function() {
        this.setLoading(false);
    },

    // initialize the header and grid when the data load the first time
    initUi: function () {
        var me = this;

        if (me.isCreateMode && !me.record) {
            me.record = Ext.create('Taco.model.ImageGroup', {});
        }

        me.form = Ext.create('Taco.view.product.images.ImageGroupForm', {
            autoScroll:true,
            useFixedPosition: false,
            attributes: me.attributes,
            record: me.record,
            product: me.product,
            isCreate: me.isCreateMode,
            isPopUp: true,
            enableScrollSpy: false,
            layout: 'fit',
            productInCatalogInfo: me.productInCatalogInfo,
            isGlobal: me.isGlobal,
            getWrapper: function() {
                return this;
            }
        });

        me.items = [
            me.form
        ];
    },

    doSave: function() {
        var me = this;
        var okToSave = me.form.beforeSave();

        if (!okToSave) {
            return false;
        }

        this.record = me.form.record;
        this.record.save({
            success: me.saveSuccess,
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
