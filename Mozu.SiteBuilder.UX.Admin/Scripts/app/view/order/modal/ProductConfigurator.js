Ext.define('Taco.view.order.modal.ProductConfigurator', {
    extend: 'Taco.core.ux.window.Modal',

    requires: [
        'Taco.view.order.widget.ProductConfigurator'
    ],

    title: 'Configure Product',

    bodyPadding: '',
    
    

    manageOverflow: false,

    autoShow: true,

    scale: null,

    autoScroll: true,

    constrain: true,
    draggable: true,
    modal: true,
    resizable: true,
    shadow: false,

    closable: true,

    //bodyPadding: '11 19 19',
    closeAction: 'destroy',
    //componentCls: Taco.baseCSSPrefix + 'window',
    //ui: 'modal',

    //By not setting the height the dialog will grow to the max to accomodate the content;
    //height: 400,

    minWidth: 700,
    width: 780,

    minHeight: 300,
    maxHeight: 1000,
    
    //autoSize:true,

    productCode: null,
    record: null,
    /*
    layout: {
        type: 'fit'
    },
    */

    initComponent: function() {
        var me = this;

        me.addEvents(
            'configureproduct'
        );

        me.configurator = Ext.create('Taco.view.order.widget.ProductConfigurator', {
            productCode: me.productCode,
            record: me.record,
            listeners: {
                savablestatechange: me.onSavableStateChange,
                viewReady: me.onViewReady,
                loadFailure: me.onLoadFailure,
                scope: me
            }
        });

        me.items = [me.configurator];

        me.on({
            resize: function() {
                this.configurator.doLayout();
            },
            save: me.onSave,
            scope: me
        });

        me.callParent(arguments);
    },

    show: function() {
        var me = this;

        me.callParent(arguments);

        var mask = me.setLoading({
            msg: "Loading",
            // making the initial loading mask white to avoid the screen flash
            maskCls: "x-mask taco-white-mask"
        }, me.body);
    },

    onSavableStateChange: function(form, state) {
        this.setSavable(state);
    },

    onLoadFailure: function () {
        var me = this;
        me.setLoading(false, me.body);
    },
    
    // called when the windows form contents are fully loaded;
    onViewReady: function (view) {
        var me = this;
        // need to check to see if we are taller then the viewport
        
        if (me.isTallerThanViewport()) {
            // switch to a relative height maximize viewable area
            me.relativeHeight = 1;
            me.animateRelativeSize();
        } else {
            me.center();
        }
        
        me.setLoading(false, me.body);
    },

    onSave: function () {
        this.fireEvent('configureproduct', this.configurator.getData());
        this.hide();
    }
});