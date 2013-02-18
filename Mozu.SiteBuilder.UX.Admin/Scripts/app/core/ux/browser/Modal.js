/**
 * @class Taco.core.ux.browser.Modal
 */
Ext.define('Taco.core.ux.browser.Modal', {
    extend: 'Taco.core.ux.modal.Modal',

    autoShow: true,
    width: 700,

    columns: [],
    store: undefined,

    initComponent: function (eOpts) {
        var me = this;

        console.log(this.columns);

        this.grid = Ext.create('Taco.core.ux.grid.Panel', {
            store: this.store,
            selType: 'cellmodel',
            margin: '20 0 0',
            columns: this.columns,
            plugins: [{
                ptype: 'cellediting',
                clicksToEdit: 1
            }]
        });

        this.content = {
            xtype: 'container',
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'h2',
                    html: 'Edit Products',
                    cls: Taco.baseCSSPrefix + 'modal-title'
                }
            }, this.grid
            ]
        };

        this.dirtybutton = Ext.create('Taco.core.ux.action.DirtyButton', {
            text: 'Save',
            listeners: {
                click: function () {
                    this.store.sync({
                        success: function () {
                            this.hide();
                        },
                        failure: function () {
                            this.hide();
                        },
                        scope: this
                    });
                },
                scope: this
            }
        });

        this.actions = {
            xtype: 'container',
            items: [this.dirtybutton, {
                xtype: 'action',
                text: 'Cancel',
                listeners: {
                    click: function () {
                        this.store.rejectChanges();
                        this.hide();
                    },
                    scope: this
                }
            }]
        };

        this.callParent(arguments);

        this.grid.on({
            edit: function (editor, e) {
                this.dirtybutton.setDirty(!Ext.isEmpty(this.store.getUpdatedRecords()));
            },
            scope: this
        });
    }
});