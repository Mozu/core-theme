/**
 * @class Taco.view.fileManager.Index
 * @author Travis Johnson
 * The File Manager Browser Page
 */

Ext.define('Taco.view.fileManager.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.filemanager',
    requires: [
        'Taco.core.ux.form.FileInputButton',
        'Taco.core.ux.DragDropZone',
        'Taco.store.Files'
    ],

    mixins: {
        savable: 'Taco.view.fileManager.util.Uploadable'
    },

    typeName: 'File',
    modelName: 'Taco.model.File',
    store: {
        type: 'Taco.store.Files'
    },
    useTilePanel: true,


    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form products',
        items: [{
            xtype: 'formflexbox',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [{
                name: 'productCode',
                fieldLabel: 'Product Code',
                width: 160
            }, {
                name: 'productName',
                fieldLabel: 'Name'
            }]
        }]
    },

    filterProperties: [{
        property: 'all',
        text: 'All',
        isDefault: true
    }, {
        property: 'productName',
        text: 'Name'
    }, {
        property: 'productCode',
        text: 'Code'
    }, {
        property: 'producttypeid',
        text: 'Product Type'
    }, {
        property: 'productFullDescription',
        text: 'Description'
    }],

    gridPanelConf: {
        columns: [{
            dataIndex: 'name',
            text: 'Name'
        }]
    },

    tilePanelConf: {
        actions: [{
            iconCls: 'download',
            tooltip: 'View Product',
            eventName: 'viewitem'
        }, {
            iconCls: 'duplicate',
            tooltip: 'Duplicate Product',
            eventName: 'duplicateitem'
        }, {
            iconCls: 'delete',
            tooltip: 'Delete Product',
            eventName: 'deleteitem'
        }],
        imageCollection: 'productImages',
        imageField: 'imagePath',
        isDragable: false,
        nameField: 'productName'
    },
});