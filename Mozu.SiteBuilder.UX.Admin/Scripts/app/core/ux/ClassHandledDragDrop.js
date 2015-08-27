/**
* This plugin provides drag and/or drop functionality for a TreeView.
*
* It creates a specialized instance of {@link Ext.dd.DragZone DragZone} which knows how to drag out of a
* {@link Ext.tree.View TreeView} and loads the data object which is passed to a cooperating
* {@link Ext.dd.DragZone DragZone}'s methods with the following properties:
*
*   - copy : Boolean
*
*     The value of the TreeView's `copy` property, or `true` if the TreeView was configured with `allowCopy: true` *and*
*     the control key was pressed when the drag operation was begun.
*
*   - view : TreeView
*
*     The source TreeView from which the drag originated.
*
*   - ddel : HtmlElement
*
*     The drag proxy element which moves with the mouse
*
*   - item : HtmlElement
*
*     The TreeView node upon which the mousedown event was registered.
*
*   - records : Array
*
*     An Array of {@link Ext.data.Model Models} representing the selected data being dragged from the source TreeView.
*
* It also creates a specialized instance of {@link Ext.dd.DropZone} which cooperates with other DropZones which are
* members of the same ddGroup which processes such data objects.
*
* Adding this plugin to a view means that two new events may be fired from the client TreeView, {@link #beforedrop} and
* {@link #drop}.
*
* Note that the plugin must be added to the tree view, not to the tree panel. For example using viewConfig:
*
*     viewConfig: {
*         plugins: { ptype: 'treeviewdragdrop' }
*     }
*/
Ext.define('Taco.core.ux.ClassHandledDragDrop', {
    extend: 'Ext.tree.plugin.TreeViewDragDrop',
    alias: 'plugin.classhandleddragdrop',

    handleClass: 'taco-tree-knurling',

    onViewRender: function () {
        var me = this;
        this.callParent(arguments);
        this.dragZone.onBeforeDrag = function (data, e) {
            return e.target.className === me.handleClass;
        }
    }
});