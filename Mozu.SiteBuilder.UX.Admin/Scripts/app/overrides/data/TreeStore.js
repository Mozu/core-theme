/**
 * @class  Taco.overrides.data.TreeStore
  * @description Overrides Ext.data.TreeStore
 */
Ext.define('Taco.overrides.data.TreeStore', {

    override: 'Ext.data.TreeStore',


    hasFilter: false,

    /**
    * Filters the current tree by a function fn
    * if the function returns true the node will be in the filtered tree
    * a filtered tree has also a flat structure without folders
    */
    filterBy: function (fn, scope) {
        var me = this,
        nodes = [],
        root = me.getRootNode(),
        tmp;


        // the snapshot holds a copy of the current unfiltered tree
        me.snapshot = me.snapshot || root.copy(null, true);


        tmp = me.snapshot.copy(null, true);
        var childNodes = tmp.childNodes;
        root.removeAll();
        for (var i = 0; i < childNodes.length; i++) {

            //Recursively tranverse through the root and adds the childNodes[i] if fn returns true
            if (this.traverseNode(childNodes[i], root, fn) == true) {
                i--;
            }

        }

        return me;
    },

    /**
    * Recursively tranverse through the root and adds the childNodes[i] if fn returns true
    */
    traverseNode: function (node, parentNode, fn) {

        var me = this;

        if (fn.call(me, node)) {
            parentNode.appendChild(node);
            return true;
        }

        if (node.hasChildNodes()) {

            var childNodes = node.childNodes;
            var found = false;

            for (var i = 0; i < childNodes.length; i++) {
                if (this.traverseNode(childNodes[i], node, fn) == true) {
                    found = true;
                }
            }

            if (found == true) {
                parentNode.appendChild(node);
                return true;
            }
        }

        return false;
    },


    /**
    * Clears all filters a shows the unfiltered tree
    */
    clearFilter: function () {
        var me = this;

        if (me.isFiltered()) {
            me.setRootNode(me.snapshot);
            delete me.snapshot;
        }

        return me;
    },

    /**
    * Returns true if the tree is filtered
    */
    isFiltered: function () {
        return !!this.snapshot;
    }
    
});