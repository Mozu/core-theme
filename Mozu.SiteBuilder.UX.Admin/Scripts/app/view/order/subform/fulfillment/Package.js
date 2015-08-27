/**
 * @class Taco.view.order.subform.fulfillment.Package
 */
Ext.define('Taco.view.order.subform.fulfillment.Package', {
    extend: 'Ext.panel.Panel',

    ui: 'subform-section-child',
    cls: 'taco-order-package',
    margin: '10 0 10 0',
    bodyPadding: '10 10 10 10',
    header: false,

    layout: {
        type: 'card'
    },

    config: {
        title: '',
        details: null,
        actions: null,
        grid: null,
        order: null
    },

    packageData: null,

    initComponent: function () {
        var availableActions = [];

        this.header = false;

        if (this.isCollapsible !== false && !this.isCollapsible && this.packageData) {
            this.isCollapsible = this.packageData.status === 'Fulfilled';
        }

        Ext.each(this.actions, function (action) {
            if (action.actionName && !Ext.Array.contains(this.packageData.availableActions, action.actionName)) return;

            availableActions.push(action);
        });

        this.actionsContainer = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            defaults: {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                scope: this,
                margin: '0 0 0 10'
            },
            items: Ext.Array.push([{
                xtype: 'button',
                text: '-',
                width: 50,
                ui: 'action',
                scale: 'medium',
                margin: '0 10 0 0',
                hidden: !this.isCollapsible,
                handler: this.handleCollapse,
                scope: this
            }, {
                xtype: 'component',
                margin: 0,
                html: this.title,
                flex: 1,
                style: {
                    'font-weight': 'bold'
                }
            }], availableActions)
        });

        this.statusContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-package-details',
            margin: '10 0 10 0',
            items: [{
                    xtype: 'component',
                    padding: '0 0 10 0',
                    html: '<span class="label">Status:</span>' + this.packageData.status
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
            cls: 'collapsed',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            defaults: {
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                scope: this,
                margin: '0 0 0 10'
            },
            items: []
        });

        if (this.isCollapsible) {
            this.closedContainer.add([{
                margin: '0 10 0 0',
                text: '+',
                width: 50,
                handler: this.handleExpand
            }, {
                xtype: 'component',
                margin: 0,
                html: this.title,
                cls: 'collapsed-title'
            }]);

            if (this.collapsedInfo) this.closedContainer.add(this.collapsedInfo);

            if (this.collapsedActions) this.closedContainer.add(this.collapsedActions);
        }

        this.items = [
            this.openContainer,
            this.closedContainer
        ];

        this.callParent(arguments);

        if (this.isCollapsible) this.getLayout().setActiveItem(this.closedContainer);
    },

    handleCollapse: function () {
        this.getLayout().setActiveItem(this.closedContainer);
    },

    handleExpand: function () {
        this.getLayout().setActiveItem(this.openContainer);
    },

    updateOrder: function (cfg) {
        Taco.app.viewPort.setLoading(true);

        cfg = Ext.apply({}, cfg, {
            reloadRecord: true
        });

        this.record[cfg.methodName]({
            jsonData: cfg.data,
            success: function (response) {
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', cfg.errorMsg, 'error');
                    if (typeof cfg.failure === 'function') cfg.failure.apply(this);
                    return;
                }
                if (cfg.reloadRecord) this.record.reload();
                if (typeof cfg.success === 'function') cfg.success.apply(this);
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : cfg.errorMsg;
                Taco.app.fireEvent('setmessage', msg, 'error');
                if (typeof cfg.failure === 'function') cfg.failure.apply(this);
            },
            callback: function () {
                Taco.app.viewPort.setLoading(false);
                if (typeof cfg.callback === 'function') cfg.callback.apply(this);
            },
            scope: this
        });
    }
});