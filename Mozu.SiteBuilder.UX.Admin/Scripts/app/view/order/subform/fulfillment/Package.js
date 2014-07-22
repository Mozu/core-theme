Ext.define('Taco.view.order.subform.fulfillment.Package', {
    extend: 'Ext.panel.Panel',
    cls: 'taco-order-package',
    padding: '20 0 0 0',
    config: {
        title: '',
        details: null,
        actions: null,
        grid: null,
        order: null
    },

    packageData: null,

    layout: 'card',

    initComponent: function() {

        var availableActions = [];

        this.header = false;

        if (this.isCollapsible !== false && !this.isCollapsible && this.packageData) {
            this.isCollapsible = this.packageData.status === 'Fulfilled';
        }

        Ext.each(this.actions, function(action) {
            if (action.actionName && !Ext.Array.contains(this.packageData.availableActions, action.actionName)) return;

            availableActions.push(action);
        });

        this.actionsContainer = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                scope: this,
                margin: '0 0 0 8'
            },
            items: Ext.Array.push([{
                xtype: 'button',
                text: '-',
                ui: 'action',
                scale: 'medium',
                hidden: !this.isCollapsible,
                handler: this.handleCollapse,
                scope: this
            }, {
                xtype: 'component',
                html: this.title,
                margin: 0,
                flex: 1
            }], availableActions)
        });

        this.statusContainer = Ext.widget({
            xtype: 'container',
            items: [{
                    xtype: 'component',
                    html: 'Status: ' + this.packageData.status
                },
                this.details
            ]
        });

        this.openContainer = Ext.widget({
            xtype: 'container',
            items: [
                this.actionsContainer,
                this.statusContainer,
                this.grid
            ]
        });

        this.closedContainer = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                scope: this,
                margin: '0 0 0 8'
            },
            items: []
        });

        if (this.isCollapsible) {
            this.closedContainer.add([{
                text: '+',
                handler: this.handleExpand
            }, {
                xtype: 'component',
                html: this.title
            }, {
                xtype: 'component',
                flex: 1,
                tpl: [
                    '{date} | Tracking Number {trackingNumber} | {itemCount} ',
                    'item<tpl if="itemCount !== 1">s</tpl>'
                ],
                data: {
                    date: Ext.Date.format(new Date(this.packageData.shipDate), 'm/d/Y h:i:s a'),
                    trackingNumber: this.packageData.trackingNumber,
                    itemCount: this.packageData.totalQuantity
                }
            }]);

            if (this.collapsedActions) this.closedContainer.add(this.collapsedActions);
        }

        this.items = [
            this.openContainer,
            this.closedContainer
        ];

        this.callParent(arguments);

        if (this.isCollapsible) this.getLayout().setActiveItem(this.closedContainer);
    },

    handleCollapse: function() {
        this.getLayout().setActiveItem(this.closedContainer);
    },

    handleExpand: function() {
        this.getLayout().setActiveItem(this.openContainer);
    },

    updateOrder: function(cfg) {
        Taco.app.viewPort.setLoading(true);

        this.record[cfg.methodName]({
            jsonData: cfg.data,
            success: function(response) {
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', cfg.errorMsg, 'error');
                    if (typeof cfg.failure === 'function') cfg.failure.apply(this);
                    return;
                }
                this.record.reload();
                if (typeof cfg.success === 'function') cfg.success.apply(this);
            },
            failure: function(response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : cfg.errorMsg;
                Taco.app.fireEvent('setmessage', msg, 'error');
                if (typeof cfg.failure === 'function') cfg.failure.apply(this);
            },
            callback: function() {
                Taco.app.viewPort.setLoading(false);
                if (typeof cfg.callback === 'function') cfg.callback.apply(this);
            },
            scope: this
        });
    }
});