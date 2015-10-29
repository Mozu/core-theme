
/**
 * @class Taco.view.preview.ExpressionPreviewDrawer
 * Author Brandon Jernigan
 */

Ext.define('Taco.view.preview.ExpressionPreviewDrawer', {
    extend: 'Taco.core.ux.window.Drawer',

    requires: [
        'Taco.core.ux.content.SplitContainer',
        'Taco.view.storefrontProduct.Grid',
        'Taco.core.util.Common'
    ],

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '90%',
    //scale: 'large',
    title: 'Products',
    width: '90%',
    createType: '',
    isCreateMode: true,
    record: null,
    closeOnSave: true,

    actionColumnWidth: 50,

    primaryText: 'Done',
    layout: 'fit',

    resizable: {
        dynamic: true,
        handles: 'w sw s se e',
        heightIncrement: 1,
        minHeight: 600,
        minWidth: 800,
        preserveRatio: false,
        widthIncrement: 1
    },
    
    initComponent: function (eOpts) {
        var me = this;

        me.previewGrid = Ext.create('Taco.view.storefrontProduct.Grid');

        me.updateExpression = function() {
            var root = this.getRootNode();
            if (me.isValidExpression(root)) {
                this.getExpressionText({
                    tree: this.getValue(),
                    type: this.getType() || 'DynamicPreComputed'
                }, function(expressionText) {
                    me.previewGrid.fireEvent('taco-update-preview', {
                        expression: expressionText
                    });
                });
            }
        };

        var debouncedUpdateExpression = Taco.core.util.Common.debounce(me.updateExpression, 100);

        /*
        *    returns false if there is an empty container node, true otherwise
        */
        me.isValidExpression = function(node) {
            
            var childNodes = node.childNodes
            if (node.data.type === 'container' && childNodes.length === 0) {
                return false;
            } else {
                for (var i = 0; i < childNodes.length; i++) {
                    var childNode = childNodes[i];
                    if (childNode.data.type === 'container') {
                        return me.isValidExpression(childNode);
                    } else {
                        return true;
                    }
                }
            }
        };

        me.expressionEditor = Ext.create('Taco.view.filter.ExpressionTreePanel', {
            showPreviewButton: false,
            showEditButton: false,
            showCodeButton: false,
            editable: true,
            data: me.expressionData,
            title: 'Editor',
            bubbleEvents: ['itemappend', 'itemremove', 'iteminsert'],
            padding: '0 10 0 0',
            listeners: {
                scope: me.expressionEditor,
                add: debouncedUpdateExpression,
                itemappend: debouncedUpdateExpression,
                itemremove: debouncedUpdateExpression,
                iteminsert: debouncedUpdateExpression
            }
        });

        me.previewPanel = Ext.create('Ext.container.Container', {
            items: [me.previewGrid],
            title: 'Preview',
            padding: '0 0 0 10',
            layout: {
                type: 'fit'
            }
        });

        var container = Ext.create('Taco.core.ux.content.SplitContainer', {
            config: {
                west: [me.expressionEditor],
                east: [me.previewPanel],
                split: true,
                splitter: true
            },
            border: false,
            initializePanels: Ext.emptyFn/*,
            initializePanels: function() {
                var state = this.getState(),
                    panel;

                if (state) {
                    if (state.split) {
                        panel = this.down('panel[@collapsed]');
                        if (panel) panel.expand();
                    } else {
                        // select west or east based on url
                        panel = this.getWest();
                        panel.collapse();
                    }
                }
            }*/
        });

        container.getWest().flex = 1;
        container.getEast().flex = 1;

        me.items = [container];

        this.callParent(arguments);

    },

    onEsc : Ext.emptyFn,

    doSave: function () {
        var me = this,
            tree = me.expressionEditor,
            treeData = tree.getValue(),
            treeType = tree.getType();

        var expressionData = {
            type: treeType,
            tree: treeData
        };

        this.saveSuccess(expressionData);

    },

    constrainResizer: function () {
        var cfg = {},
            region = Ext.getBody().getRegion();

        Ext.apply(cfg, this.resizable, {
            constrainTo: region
        });

        this.resizable = cfg;
    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
