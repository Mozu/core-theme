
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

    // can be overwritten when opening this class;
    dynamicCategoryType: "DynamicPreComputed",  // or "DynamicRealTime"

    // this should really be the default;
    closeAction: 'destroy',

    autoShow: true,
    closable: true,
//    cls: Taco.baseCSSPrefix + 'orderform-editor',
    height: '90%',
    //scale: 'large',
    title: 'Preview Expression',
    width: '90%',
    createType: '',
    isCreateMode: true,
    record: null,
    closeOnSave: true,

    actionColumnWidth: 50,

    primaryText: 'Done',
    layout: 'fit',

    initComponent: function (eOpts) {
        var me = this;
        
        me.previewGrid = Ext.create('Taco.view.storefrontProduct.Grid');

        me.expressionEditor = Ext.create('Taco.view.filter.ExpressionTreePanel', {
            showPreviewButton: false,
            showCodeButton: false,
            editable: true,
            // need to let the tree panel know what type of dynamic expression its editing.
            type:this.dynamicCategoryType,
            data: me.expressionData,
            title: 'Editor',
            bubbleEvents: ['itemappend', 'itemremove', 'iteminsert'],
            padding: '0 10 0 0'
        });

        //  when the expression tree data changes we need to update the preview panel
        me.mon(me.expressionEditor, "datachanged", function (view) {
            me.onExpressionChange(view);
        });

        me.previewPanel = Ext.create('Ext.panel.Panel', {
            items: [me.previewGrid],
            padding: '0 0 0 10',
            layout: {
                type: 'fit'
            },
            dockedItems: [{
                xtype: 'container',
                dock: 'bottom',
                html: 'Only products that appear on the storefront are returned in this list',
                padding: '20 10'
            }]
        });

        var container = Ext.create('Taco.core.ux.content.SplitContainer', {
            config: {
                west: [me.expressionEditor],
                east: [me.previewPanel],
                split: true,
                splitter: true
            },
            cls: 'no-background-splitter',
            border: false,
            initializePanels: Ext.emptyFn
        });

        container.getWest().flex = 1;
        container.getEast().flex = 1;

        me.items = [container];

        this.callParent(arguments);


        // initialize the preview panel
        me.onExpressionChange(me.expressionEditor);
    },

    /*
     *    returns false if there is an empty container node, true otherwise
     */
    isValidExpression : function(node) {
        var me = this;
            
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
    },

    onExpressionChange: function (expressionEditor) {
        var me = this,
            root = expressionEditor.getRootNode(),
            tree = expressionEditor.getValue(),
            type = me.dynamicCategoryType;
        
        if (me.isValidExpression(root)) {
            // get the expression tree panel to convert the tree data to a text expression. pass data and callback;
            expressionEditor.getExpressionText({
                tree: tree,
                type: type
            }, function (expressionText) {
                // callback method called when service returns the new expression text.
                me.previewGrid.fireEvent('taco-update-preview', {
                    expression: expressionText
                });
            });
        }
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

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy : function (destroy) {
        this.callParent(arguments);
    }
});
