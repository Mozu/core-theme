/**
 * @class Taco.store.shared.TreeStore
 */



Ext.define('Taco.store.shared.TreeStore', {
    extend: 'Ext.data.TreeStore',
    folderSort: false,
   
    onItemInsert: function (thisNode, newChildNode) {
        newChildNode.set('icon', Ext.BLANK_IMAGE_URL);
    },
    statics: {
        root: null

    },
    constructor: function () {
        var root,
            me = this,
            statics = this.statics(),
            model = Ext.ModelManager.getModel(me.model),
            idProperty;

        if (model) {
             idProperty = model.prototype.idProperty;
            
             if (model.prototype.proxy.type == 'readahead') {
                if (statics.root == null) {
                    root = Ext.apply({}, me.root);
                    // create a default rootNode and create internal data struct.
                    Ext.applyIf(root, {
                        id: me.defaultRootId,
                        text: me.defaultRootText,
                        allowDrag: false
                    });
                    if (root[idProperty] === undefined) {
                        root[idProperty] = me.defaultRootId;
                    }
                    Ext.data.NodeInterface.decorate(model);
                    root = Ext.ModelManager.create(root, model);
                    statics.root = root;
                }
                this.root = statics.root;
            }
        }
        this.callParent(arguments);
        this.on('beforeappend', this.onItemInsert, this);
        this.on('beforeinsert', this.onItemInsert, this);
        
    },
    fillNode: function (node, newNodes) {
        var lookup = {}, fillNodes = [];
        console.log('fillNode');

        Ext.each(newNodes, function (newNode) {
            lookup[newNode.getId()] = newNode;
        }, this);
        
        Ext.each(newNodes, function (newNode) {
            var parent = lookup[newNode.get('parentId') || 666];
            if (parent) {
              //  parent.appendChild(newNode, undefined, true);
            } else {
                fillNodes.push(newNode);
            }
        }, this);
        
        //appendChild (node, suppressEvents, commit) 
        this.callParent([node, fillNodes]);
        
        Ext.each(newNodes, function (newNode) {
            var parent = lookup[newNode.get('parentId') || 666];
            if (parent) {
                parent.appendChild(newNode, true, true);
            } else {
               // fillNodes.push(newNode);
            }
        }, this);
        
    }
});
