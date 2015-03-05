/**
 * @class Taco.core.ux.action.Action
 * An action.
 */

Ext.define('Taco.core.ux.action.DeleteMenuItem', {
    extend: 'Ext.menu.Item',
    alias: 'widget.deletemenuitem',
    requires: [
        'Taco.core.util.ExceptionWhiner',
        'Ext.MessageBox'
    ],
    record: null,
    modelName: null,
    storeName: null,
    collectionName: null,

    requiresBehavior: true,
    text: 'Delete',
    promptMessage: "Are you sure you want to delete this?",
    
    initComponent: function() {
        var me = this;

        if (this.requiresBehavior) {
            me.requiredBehaviors = {
                model: this.modelName,
                behavior: 'destroy'
            };
        }
        this.handler = Ext.bind(me.destroyRecord, me),
        this.callParent(arguments);
    },


    destroyRecord: function () {
        var me = this;

        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: me.promptMessage,
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {
                    me.record.destroy({
                        success: function () {
                            var contextUrl = Taco.app.context.getCurrentContext().urlToken,
                                store = Taco.core.data.StoreManager.getOrCreate(me.storeName);

                            if (store) {
                                store.remove(me.record);
                                store.needsRefresh = true;
                            }
                            // need to invalidate the grid store so that the record is removed;
                            Taco.core.StateManager.attemptNavigate(contextUrl + '/' + me.collectionName);
                        },
                        failure: function (model, evt) {
                            var responseJson = JSON.parse(evt.error.responseText);
                            Taco.app.fireEvent('setmessage', responseJson.message, 'error deleting record');
                        },
                        callback: function() {
                            me.setLoading(true, me.body);
                        }
                    });
                }
            }
        });

    }  

});
