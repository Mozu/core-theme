/**
 * @class  Taco.view.customSchema.Edit
 */

Ext.define('Taco.view.customSchema.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.publishing.component.button.PublishButton',
    ],
    enableSearchBarInHeader: false,
    formCls: 'Taco.view.customSchema.DynamicFormContainer',
    initComponent: function () {
    	var me = this;
        var editor = me.editors.findEditor(this.record);

        if (!this.record) {
            console.warn('A record is required for this view');
            return false;
        }

        this.formCfg = {
            editMode: editor ? '' : 'raw',
            editor: editor
        };

        this.parentTitleCfg = {
            title: this.record.get('listFQN'),
            controller: this.getBreadcrumbRoute()
        };

        if (this.record.get('entityType') === 'cms') {

            this.publishActionButton = Ext.create('Taco.view.publishing.component.button.PublishButton', {
                itemId: 'publishActionButton',
                beforeItemId: 'cancelActionButton',
                scope: this,
                disabled: true,
                handler: function(cmp) {
                    cmp.startLoading();
                    var record = this.record;
                    record.publish({
                        success: function() {
                            cmp.stopLoading();
                            record.data.publishState = 'active';
                            cmp.updateButton(record);
                            me.showMessage('Published', 'info', 1000);
                        }
                    });
                },

                onMoveToPublish: function(record, code) {
                    me.publishActionButton.setLoading(true);
                    record.setPublishCode(code, function() {
                        me.showMessage('Moved to Publish Set');
                        me.publishActionButton.setLoading(false);
                    });
                },

                onRemoveFromPublishSet: function(record) {
                    me.publishActionButton.setLoading(true);
                    record.set('publishSetCode', '');
                    record.save({
                        success: function() {
                            me.publishActionButton.setLoading(false);
                        }
                    });
                    me.showMessage('Removed');
                },

                onDiscardDraft: function(record) {
                    me.publishActionButton.setLoading(true);

                    record.discardDraft(function() {
                        me.publishActionButton.setLoading(false);
                        me.publishActionButton.disable();
                        me.showMessage('Discarded');
                        me.cardPanel.getLayout().setActiveItem(0);
                    });
                    
                },

                listeners: {
                    afterrender: function() {
                        me.publishActionButton.addRecord(me.record);
                    }
                }
            });

            this.additionalActions = [this.publishActionButton];
        }

        this.callParent(arguments);

        this.setTitle(this.record.get('name'));
    },

    saveSuccess: function() {
        Taco.app.fireEvent('setmessage', 'Save Success', 'success');
    },

    getBreadcrumbRoute: function() {
        var type = this.record.get('entityType') === 'cms' ? 'documents' : 'entities'
        var list = this.record.get('listFQN');
        return 'customschema/' + type + '/' + list;
    },

    cancel: function() {
        Taco.core.StateManager.attemptNavigate(this.getBreadcrumbRoute());
    },

    showMessage: function(msg) {
        Taco.app.fireEvent('setmessage', msg, 'success');
    }
});

       