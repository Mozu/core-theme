/**
 * @class Taco.view.pendingChange.Catalog
 */
Ext.define('Taco.view.pendingChange.Publish', {
    extend: 'Ext.panel.Panel',

    requires: [
        'Taco.view.pendingChange.publishSet.Grid',
        'Taco.view.pendingChange.draft.Cms',
        'Taco.view.pendingChange.draft.Product'
    ],

    stateId: 'taco-publish',
    title: 'Drafts',

    mixins: {
        navHeader: 'Taco.core.ux.mixins.NavHeader'
    },

    createButtonEnabled: false,
    saveButtonVisible: false,
    cancelButtonVisible: false,

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['s']
    },

    layout: "fit",
    padding: "0px",
    

    initComponent: function () {
        var me = this;
        this.mixins.navHeader.init.apply(this, arguments);

        this.publishSetToolbar = Ext.create('Ext.toolbar.Toolbar', {
            ui: 'plain',
            flex: 1,
            dock: "top",
            margin: "0 0 10 0",
            items: [
                {
                    xtype: "button",
                    ui: "action",
                    flex: 1,
                    scale: "medium",
                    pressed: true,
                    itemId:"allDraftsButton",
                    toggleGroup: "publishSetGrid",
                    listeners: {
                       'toggle': {
                          fn: this.publishSetToggleChange,
                          scope:me
                        }  
                    },
                    text: "All Drafts"
                },
                {
                    xtype: "button",
                    ui: "action",
                    //width: 120,
                    flex: 1,
                    scale: "medium",
                    itemId: "unassignedDraftsButton",
                    toggleGroup: "publishSetGrid",
                    listeners: {
                        'toggle': {
                            fn: this.publishSetToggleChange,
                            scope: me
                        }
                    },
                    text: "Unassigned"
                }, {
                    xtype: "button",
                    ui: "action",
                    flex: 1,
                    scale: "medium",
                    itemId: "publishSetsButton",
                    toggleGroup: "publishSetGrid",
                    listeners: {
                        'toggle': {
                            fn: this.publishSetToggleChange,
                            scope: me
                        }
                    },
                    text: "Publish sets"
                }
            ]
        });

        this.publishSetGrid = Ext.create('Taco.view.pendingChange.publishSet.Grid', {
            header:false    
        });


        this.contentDraftGrid = Ext.create('Taco.view.pendingChange.draft.Cms', {
            //style: "border-left:1px solid #dddfdf;border-right:1px solid #dddfdf;border-bottom:1px solid #dddfdf",
            margin: "10 0 0 0 ",
            header: false
        });

        this.productDraftGrid = Ext.create('Taco.view.pendingChange.draft.Product', {
            //style: "border-left:1px solid #dddfdf;border-right:1px solid #dddfdf;border-bottom:1px solid #dddfdf",
            margin: "10 0 0 0 ",
            header: false
        });

        


        this.items = [
            {
                layout: "border",
                items: [
                    {
                        title: "Publish Sets",
                        xtype: "panel",
                        ui: "subform",
                        style:"border-top-width:0px;",
                        headerToolbar: true,
                        tools:[
                            {
                                xtype: 'button',
                                ui: 'action-primary',
                                scale: 'medium',
                                text: 'Create Publish Set',
                                itemId: 'createPublishSetButton',
                                handler: function () {
                                    me.publishSetGrid.create();
                                },
                                scope: me
                            }
                        ],
                        region: 'center',
                        minWidth: 400,
                        layout: 'fit',
                        dockedItems: [this.publishSetToolbar],
                        items: [
                            this.publishSetGrid
                        ]
                    },
                    {
                        title: "Drafts",
                        xtype: "tabpanel",
                        region: 'east',
                        ui: "subform",
                        layout: "fit",
                        style: "border-top-width:0px;",
                        split: true,
                        width: "50%",
                        minWidth: 300,
                        items: [
                            this.productDraftGrid,
                            this.contentDraftGrid
                        ]
                    }

                ]
            }
        ];

       
        this.callParent(arguments);
    },

    publishSetToggleChange: function (button, pressed) {
        if (pressed) {
            switch (button.itemId)
            {
                case "allDraftsButton":
                    break;
                case "unassignedDraftsButton":
                    break;
                case "publishSetsButton":
                    break;
            }
        }
    }
});
