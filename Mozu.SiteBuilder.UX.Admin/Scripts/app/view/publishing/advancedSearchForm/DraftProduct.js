/**
 * @class Taco.view.publishing.Search.AdvancedSearchForm
 */
 
Ext.define('Taco.view.publishing.advancedSearchForm.DraftProduct', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],
    defaults: {
        width: 500,
        xtype: 'textfield'
    },
    initComponent: function () {
        this.items = this.buildForm();
        this.callParent(arguments);
    },

    buildForm: function(type) {
        var fields = {
            publishSet: {
                xtype: 'combobox',
                store: this.getPublishSetStore(),
                name: 'publishSet',
                fieldLabel: 'Publish Set',
                valueField: 'code',
                displayField: 'code',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true
            },
            lastModified: {
                xtype: 'fieldcontainer',
                fieldLabel: 'Last Modified',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        width: 232
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        width: 232
                    }]
            },
            lastPulished: {
                xtype: 'fieldcontainer',
                fieldLabel: 'Last Published',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [{
                        xtype: 'datefield',
                        name: 'publishedFrom',
                        width: 232
                    }, {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, {
                        xtype: 'datefield',
                        name: 'publishedTo',
                        width: 232
                    }]
            },
            modifiedBy: {
                name: 'modifiedBy',
                fieldLabel: 'Modified By'
            }
        };

        return [fields.publishSet, fields.lastModified, fields.lastPulished, fields.modifiedBy];
    },

    getPublishSetStore: function() {
        return Ext.create('Taco.store.PublishSets', { includeCounts: false });
    }
});