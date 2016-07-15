/**
 * @class Taco.view.productType.Edit
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.themesettings.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.publishing.component.button.PublishButton',
        'Taco.view.themesettings.Form',
        'Taco.model.Entity'
    ],
    enableSearchBarInHeader: false,
    formCls: 'Taco.view.themesettings.Form',
    showIndexOnCancel: false,
    initComponent: function () {
        var me = this;

        var showPublishButton = this.themeInfo
            && this.themeInfo.settingsValues
            ? this.themeInfo.settingsValues.MozuPublishingEnabled
            : false;

        if (showPublishButton) {

            if (Taco.model.Entity) {
                this.getCMSDoc();   
            }

            this.publishingButton = {
                xtype: 'publishbutton',
                height: 40,
                beforeItemId: 'cancelActionButton',
                itemId: 'publishActionButton',
                handler: function() {
                    me.publishActionButton.setLoading(true);
                    me.publishActionButton.record.publish({
                        success: function() {
                            me.publishActionButton.setLoading(false, function() {
                                me.publishActionButton.record.set('publishState', 'active');
                                me.publishActionButton.updateButton();
                            });
                        },
                        failure: function() {
                            me.publishActionButton.setLoading(false);  
                            me.publishActionButton.updateButton();
                        }
                    });
                },
                onMoveToPublish: function(record, code) {
                    me.publishActionButton.setLoading(true);
                    record.setPublishCode(code, function() {
                        me.publishActionButton.setLoading(false);
                    });
                },

                onRemoveFromPublishSet: function(record) {
                    me.publishActionButton.setLoading(true);
                    record.setPublishCode(null, function() {
                        me.publishActionButton.setLoading(false);
                    });
                },

                onDiscardDraft: function(record) {
                    me.publishActionButton.setLoading(true);
                    record.discardDraft(function() {
                        me.publishActionButton.setLoading(false);
                        Taco.core.StateManager.attemptNavigate('themes', {});
                    });
                }
            };

            this.additionalActions = [
                this.publishingButton
            ];
        }

        this.formCfg = Ext.apply(this.formCfg || {}, { themeInfo: this.themeInfo });

        this.callParent(arguments);

        this.on('cancel', function () {
            if (!Taco.core.StateManager.attemptNavigateBack()) {
                Taco.core.StateManager.attemptNavigate('themes', {});
            }
        }, this, { single: true, scope: this });

        this.on('aftersave', function() {

            if (me.publishActionButton) {
                me.publishActionButton.record.set('publishState', 'draft');
                me.publishActionButton.updateButton();
            }

        })
    },

    getCMSDoc: function () {


        this.themeCMSDoc = Taco.model.Entity.load({
                id: this.themeInfo.settingsValues.MozuDocumentId,
                list: 'siteSettings@mozu',
                entityType: 'cms',
            },
            {
                scope: this,
                success: function(rec) {
                    this.publishActionButton = this.down('#publishActionButton');
                    this.publishActionButton.addRecord(rec);
                },
                failure: function() {
                    // Taco.app.fireEvent('setmessage', )
                }
            });        
    },

    parentTitleCfg: {}
});