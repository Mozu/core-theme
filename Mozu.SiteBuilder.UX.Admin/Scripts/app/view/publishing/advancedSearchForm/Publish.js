/**
 * @class Taco.view.publishing.Search.AdvancedSearchForm
 */
 
Ext.define('Taco.view.publishing.advancedSearchForm.Publish', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Ext.form.FieldContainer',
        'Taco.core.ux.form.DateTime'
    ],

    defaults: {
        width:500,
        xtype: 'textfield'
    },
    initComponent: function () {
        this.items = this.buildForm();
        this.callParent(arguments);
    },

    buildForm: function() {
        var fields = {
            publishSet: {
                xtype: 'combobox',
                store: this.getPublishSetStore(),
                name: 'publishSet',
                fieldLabel: 'Publish Set Code',
                valueField: 'code',
                displayField: 'code',
                queryMode: 'local',
                valueNotFoundText: 'not found',
                editable: true,
                forceSelection: true
            },
            //The page is already filtered on Master-Catalog
            //            masterCatalog: {
            //                xtype: 'combobox',
            //                store: this.getMasterCatalogStore(),
            //                name: 'masterCatalog',
            //                fieldLabel: 'Master Catalog',
            //                valueField: 'urlToken',
            //                displayField: 'name',
            //                queryMode: 'local',
            //                valueNotFoundText: 'not found',
            //                editable: true,
            //                forceSelection: true
            //            },

            lastModified: {
                xtype: 'fieldcontainer',
                fieldLabel: 'Last Modified',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'modifiedFrom',
                        altFormats: 'c',
                        width: 232
                    }, 
                    {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, 
                    {
                        xtype: 'datefield',
                        name: 'modifiedTo',
                        altFormats: 'c',
                        width: 232
                    }
                ]
            },
            publishSetDate: {
                xtype: 'fieldcontainer',
                fieldLabel: 'Publish Set Date',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'publishDateFrom',
                        altFormats: 'c',
                        width: 232
                    }, 
                    {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, 
                    {
                        xtype: 'datefield',
                        name: 'publishDateTo',
                        altFormats: 'c',
                        width: 232
                    }
                ]
            },
            //lastPulished: {
            //    xtype: 'fieldcontainer',
            //    fieldLabel: 'Last Published',
            //    layout: {
            //        type: 'hbox',
            //        align: 'middle'
            //    },
            //    items: [{
            //            xtype: 'datefield',
            //            name: 'publishedFrom',
            //            altFormats: 'c',
            //            width: 232
            //        }, {
            //            xtype: 'component',
            //            html: 'to',
            //            margin: '0 10'
            //        }, {
            //            xtype: 'datefield',
            //            name: 'publishedTo',
            //            altFormats: 'c',
            //            width: 232
            //        }]
            //},
            modifiedBy: {
                name: 'modifiedBy',
                fieldLabel: 'Modified By'
            },
            created: {
                xtype: 'fieldcontainer',
                fieldLabel: 'Date Created',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'createdDateFrom',
                        altFormats: 'c',
                        width: 232
                    }, 
                    {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, 
                    {
                        xtype: 'datefield',
                        name: 'createdDateTo',
                        altFormats: 'c',
                        width: 232
                    }
                ]
            },
            lastPublished: {
                xtype: 'fieldcontainer',
                fieldLabel: 'Last Published Date',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                items: [
                    {
                        xtype: 'datefield',
                        name: 'lastPublishDateFrom',
                        altFormats: 'c',
                        width: 232
                    }, 
                    {
                        xtype: 'component',
                        html: 'to',
                        margin: '0 10'
                    }, 
                    {
                        xtype: 'datefield',
                        name: 'lastPublishDateTo',
                        altFormats: 'c',
                        width: 232
                    }
                ]
            },
            //This feature is not supported yet (TBD)
            //            lastPublishBy: {
            //                name: 'lastPublishBy',
            //                fieldLabel: 'Last Published By'
            //            },
            createdBy: {
                name: 'createdBy',
                fieldLabel: 'Created By'
            }
        };

        return [fields.publishSet, fields.publishSetDate, fields.createdBy, fields.modifiedBy, fields.created, fields.lastPublished];
    },


    //The page is already filtered on the master catalog
        //    getMasterCatalogStore: function() {
        //
        //        var contextStore = Taco.app.context.getStore(false);
        //      
        //        contextStore.filter([
        //            {
        //                filterFn: function (item) {
        //                    return Ext.Array.contains(['m'], item.get('contextType'));
        //                },
        //                scope: this
        //            }
        //        ]);
        //
        //        return contextStore;
        //    },

    getPublishSetStore: function() {
        return Ext.create('Taco.store.PublishSets', { includeCounts: false });
    }
});