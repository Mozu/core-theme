/**
 * @class  Taco.view.productRanking.Edit
 */

Ext.define('Taco.view.productRanking.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.core.ux.action.DeleteMenuItem',
        'Taco.view.productRanking.Form'
    ],
    formCls: 'Taco.view.productRanking.Form',
    statics: {
        factory: function (cfg, callback, scope) {

            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.productRanking.Edit', cfg));
                },
                tasks: [
                    
                ],
                autoExecute: true
            });
        }
    },

    isCreate: false,

    initComponent: function () {
        var me = this;

        if (!me.record) {
            me.record = Ext.create('Taco.model.ProductRanking', {});
        }

        if (me.record.phantom) {
            me.isCreate = true;
        }

        me.formCfg = {
            record: me.record,
            isCatalogLevel: false
        };

        me.enableNavHeader = true;

        var setupMoreButton = function(disabledOnCreate) {
            var menuItems = [],
                delMenuItem = Ext.create('Taco.core.ux.action.DeleteMenuItem', {
                    record: me.record,
                    modelName: 'Taco.model.ProductRanking',
                    storeName: 'Taco.store.ProductRankings',
                    collectionName: 'productRankings'
            });

            menuItems.push(delMenuItem);

            me.additionalActions = [{
                xtype: 'button',
                itemId: 'moreButton',
                ui: 'action',
                scale: 'medium',
                text: 'More',
                menuAlign: 'tr-br?',
                disabled: disabledOnCreate,
                menu: {
                    plain: true,
                    shadow: false,
                    items: menuItems
                }
            }];
        };

        setupMoreButton(me.isCreate);

        this.callParent(arguments);
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

        if (!me.form.beforeSave()) {
            me.saveFailure();
            return;
        }
        this.record.save({
            success: onSuccess,
            failure: function(item, response) {
                Taco.core.util.ExceptionWhiner.handleRemoteFailure(response);
            },
            scope: me
        });
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});