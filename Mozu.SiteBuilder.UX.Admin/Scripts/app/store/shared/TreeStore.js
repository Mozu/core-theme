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
            idProperty = model.prototype.idProperty;

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
        this.callParent(arguments);
        this.on('beforeappend', this.onItemInsert, this);
        this.on('beforeinsert', this.onItemInsert, this);
    }

});
