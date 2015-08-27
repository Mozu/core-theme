/**
 * @class Taco.view.order.Edit
 */


Ext.define('Taco.view.location.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.location.Form'
    ],

    formCls: 'Taco.view.location.Form',
    
    initComponent: function () {
        var me = this;

        this.additionalActions = [{
            xtype: 'button',
            itemId: 'moreButton',
            ui: 'action',
            scale: 'medium',
            text: 'More',
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                shadow: false,
                items: [{
                    text: 'Duplicate',
                    disabled: me.record.phantom,
                    requiredBehaviors: {
                        model: 'Taco.model.Location',
                        behavior: 'create'
                    },
                    handler: function (item) {
                        var record = me.record,
                            metaData = {
                                id: record.getId()
                            };

                        Taco.app.StateManager.attemptNavigate('locations/duplicate/' + record.getId(), metaData);
                    }
                }]
            }
        }];


        this.callParent(arguments);

        this.form.on('dirtychange', function () {
            var isValid = false;
            me.requiresSave = me.form.isDirty();

            isValid = me.requiresSave && !me.form.hasInvalidField();
            if (isValid) {
                me.saveActionButton.setDisabled(false);
            } else {
                me.saveActionButton.setDisabled(true);
            }
        }, me);

        this.form.on('savesuccess', function() {
            
        });
    },

    afterDuplicate: function () {
        Taco.app.fireEvent('setmessage', "Please enter a code.", 'info');
        
        this.mon(this, 'afterrender', function () {

            var codeField = this.form.findField("code");
            if (codeField) {
                codeField.validate();
            }

        }, this);

    }
});