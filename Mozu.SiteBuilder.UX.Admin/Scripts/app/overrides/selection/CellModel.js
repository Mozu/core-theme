/*
* Override of the CellModel to address two bugs in ExtJS 4.2.2 and 4.2.3 nightly
* Bug 1 is the key related events do not pass the correct rowIndex argument. This is addressed in the 4.2.3 nightly;
* Bug 2 is the before key related events fire after the ui navigates to the new field so you get incorrect index and an inability to cancel the events which are supposed to prevent the key navigation from proceeding;
* This is currently utilized in OrderItemGrid.js
*/

Ext.define('Taco.overrides.selection.CellModel', {
    override: 'Ext.selection.CellModel',

    // move method copied from Ext.Selection.CellModel
    move: function (dir, e) {
        var me = this,
            pos = me.getCurrentPosition(),
            newPos;

        if (pos) {
            // Calculate the new row and column position
            newPos = pos.view.walkCells(pos, dir, e, me.preventWrap);

            //*** BEGIN OVERRIDE ***
            // Need to fire a before key events associated to the grid view to allow for the event to be canceled which will prevent the change of selection on the grid;            
            if (me.view) {
                //if event returns false then cancel the event and prevent further key processing
                if (!me.view.fireEvent('beforecellkeymove', me.view, pos, newPos, dir, e)) {
                    e.stopEvent();
                    return;
                }
            }
            //*** END OVERRIDE ***

            // If walk was successful, select new Position
            if (newPos) {                
                return me.setCurrentPosition(newPos);
            }
        }
        // Enforce code correctness in unbuilt source.
        return null;
    }
});