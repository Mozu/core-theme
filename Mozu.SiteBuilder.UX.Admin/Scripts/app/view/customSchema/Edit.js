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

        if (this.record.get('entityType') === 'cms' && this.record.get('publishState') !== 'active') {

            this.parentTitleCfg = Ext.apply(this.parentTitleCfg, {
                pillType: 'dark',
                pillText: 'Draft',
                pillTooltipTpl: [
                    '<div style="line-height: 15px;">',
                        '<span>Publish Set: {publishSetName}</span>',
                    '</div>',
                    '<div style="line-height: 15px;">',
                        '<span>Publish Date: {publishDate}</span>',
                    '</div>'
                ],
                pillTooltipData: {
                    publishSetName: this.record.get('publishSetName') || 'Unassigned',
                    publishDate: this.record.get('publishSetDate') || 'Unscheduled'
                }
            });

            if (this.record && this.record.get('publishSetCode') !== '') {
                this.updatePublishPill(this.record);
            }
        }

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
                            me.updatePublishPill(record);
                        }
                    });
                },

                onMoveToPublish: function(record, code) {
                    me.publishActionButton.setLoading(true);

                    record.setPublishCode(code, function() {
                        me.showMessage('Moved to Publish Set');
                        me.publishActionButton.setLoading(false);
                        me.updatePublishPill(record);
                    });

                },

                onRemoveFromPublishSet: function(record) {
                    me.publishActionButton.setLoading(true);
                    record.set('publishSetCode', '');
                    record.save({
                        success: function() {
                            me.publishActionButton.setLoading(false);
                            me.showMessage('Removed');
                            me.updatePublishPill(record);
                        }
                    });

                },

                onDiscardDraft: function(record) {
                    me.publishActionButton.setLoading(true);

                    record.discardDraft(function() {
                        me.publishActionButton.setLoading(false);
                        me.publishActionButton.disable();
                        me.showMessage('Discarded');
                        
                        me.parentTitleCfg = {
                            title: record.get('name'),
                            controller: me.getBreadcrumbRoute()
                        };
                        me.fireEvent('titlechange', this, record.get('listFQN'), null);
                    });
                    
                },

                listeners: {
                    afterrender: function() {
                        Ext.defer(function() {
                            me.publishActionButton.addRecord(me.record);
                        }, 300);
                    }
                }
            });

            this.additionalActions = [this.publishActionButton];
        }

        this.on('aftersave', function() {
            me.saveActionButton.stopLoading();
            me.form.saveInProgress = false;
            Taco.app.fireEvent('setmessage', 'Save Success', 'success');
        });

        this.on('savesuccess', function() {
            me.form.saveInProgress = false;
            me.saveActionButton.stopLoading();
            me.updatePublishPill(me.record);
            me.publishActionButton.addRecord(me.record)
        });

        this.callParent(arguments);

        this.setTitle(this.record.get('name'));
    },

    updatePublishPill: function(record) {
        var me = this;
        var listRecord = record;

        var callback = function(pubRecord) {
            var date = pubRecord.get('publishDate') ? Ext.Date.format(pubRecord.get('publishDate'), 'M j, Y g:ia T') : 'Unscheduled';

            me.fireEvent('titlechange', this, listRecord.get('name'), {
                pillText: 'Draft',
                pillTooltipData: {
                    publishSetName: pubRecord.get('name') || 'Unassigned',
                    publishDate: Ext.util.Format.date(pubRecord.get('publishSetDate'), 'M j, Y g:ia T') || 'Unscheduled'
                }
            });
        };

        Ext.Ajax.request({
            url: '/admin/app/publishsets/getBy/' + record.get('publishSetCode'),
            method: 'GET',
            success: function (res, status) {
                var record = Ext.create('Taco.model.PublishSet', JSON.parse(res.responseText).items[0]);
                callback(record);
            },
            failure: function() {

                var config = {
                    pillText: 'Draft',
                    pillType: 'dark',
                    pillTooltipTpl: [
                        '<div style="line-height: 15px;">',
                            '<span>Publish Set: {publishSetName}</span>',
                        '</div>',
                        '<div style="line-height: 15px;">',
                            '<span>Publish Date: {publishDate}</span>',
                        '</div>'
                    ],
                    pillTooltipData: {
                        publishSetName: 'Unassigned',
                        publishDate: 'Unscheduled'
                    }
                };


                if (listRecord.get('publishState') === 'active') {
                    config = {
                        pillText: '',
                        pillType: ''
                    };
                }

                me.fireEvent('titlechange', this, listRecord.get('name'), config);
            }
        }, this);
    },

    getBreadcrumbRoute: function() {
        var type = this.record.get('entityType') === 'cms' ? 'documents' : 'entities'
        var list = this.record.get('listFQN');
        return 'customschema/' + type + '/' + list;
    },

    cancel: function() {
        Taco.core.StateManager.attemptNavigate(this.getBreadcrumbRoute());
    },

    doCreate: function() {
    },

    showMessage: function(msg) {
        Taco.app.fireEvent('setmessage', msg, 'success');
    }
});

       