/**
 * @class Taco.view.product.images.imageGroupGrid.Grid
*/
Ext.define('Taco.view.product.images.imageGroupGrid.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.imageGroupGrid',
    requires: [
        'Taco.model.ImageGroup',
        'Taco.store.ImageGroup',
        'Ext.Date',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn'
    ],

    modelName: 'Taco.model.ImageGroup',

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s'] //'c',
    },

    onItemClick: null,
    onItemDelete: null,
    launchEditorOnClick: false,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    enableNavHeader: false,
    enableSearchBarInHeader: false,
    showTitleBorder: false,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: false,
    enablePaging: false,
    enableRowEditing: false,
    enableAutoSelect: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: Localizer.langResources.CATALOG.Products.ProductEdit.create_new_image_group,

    showActionsColumn: true,

    enableEditAction: true,
    enableDuplicateAction: false,
    enableDeleteAction: true,

    hideSearchToolbar: true,

    title: '',

    store: null,

    autoScroll: true,

    enableQuickFilters: false,

    deletePromptMsg: Localizer.langResources.CATALOG.Products.ProductEdit.delete_image_msg,

    isCatalogLevel: false,
    categoryCode: null,
    pageSize: 50,
    isPopUp: false,

    onCreate: Ext.emptyFn,
    isDisabled: false,

    stateful: false,

    statics: {

    },


    initComponent: function() {
        var me = this;

        this.columns = this.getColumnConfig();

        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.ImageGroup',
            
            pageSize: this.pageSize,
            autoLoad: true,
            clearFilters: true,
            remoteFilter: false
        });

        this.mon(this, 'itemclick', this.onItemClick, this);

        me.callParent(arguments);
    },

    getColumnConfig: function() {
        var columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'groupName',
                stateId: 'name',
                text: Localizer.langResources.CATALOG.Products.ProductEdit.group_code,
                hideable: false,
                sortable: true,
                flex: 1
            },
            {
                xtype: 'gridcolumn',
                dataIndex: 'optionValues',
                text: Localizer.langResources.CATALOG.Products.ProductEdit.option_values,
                hideable: false,
                sortable: false,
                flex: 1,
                renderer: function (value, metaData, record) {
                    if (!Array.isArray(value)) {
                        value = [];
                    }

                    return value.join(', ');
                }
            }
        ];

        return columns;
    },

    // list of actions to put in action column and context menu;
    getActionItems: function() {
        var me = this,
            actions = [];

        if (this.enableEditAction) {
            actions.push({
                text: Localizer.langResources.SHARED.edit,
                menuColumnHandler: me.doEdit,
                scope: me,
                disabled: !me.isGlobal
            });
        }

        if (this.enableDeleteAction) {
            actions.push({
                text: Localizer.langResources.SHARED.delete_btn_text,
                itemId: 'deleteMenuItem',
                menuColumnHandler: me.doDelete,
                scope: me,
                disabled: !me.isGlobal
            });
        }

        return actions;
    },

    onActionMenuShow: function(menu, eventData) {},

    getActionColumn: function() {
        var me = this,
            actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                onMenuShow: me.onActionMenuShow,
                menuItems: actions
            };
        }

        return actionColumn;
    },

    onActionMenuShow: function (menu, eventData) {
        var disableMenuItem = menu.down('#deleteMenuItem');

        if (eventData.record.get('groupName') === 'default') {
            disableMenuItem.hide();
        }
    },

    doEdit: function(item, eventData) {
        eventData.grid.onItemClick(item, eventData.record);
    },

    doDelete: function(item, eventData)  {
        eventData.grid.onItemDelete(item, eventData.record);
    }
});
