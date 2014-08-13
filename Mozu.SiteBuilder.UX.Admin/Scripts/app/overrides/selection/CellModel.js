/*
* Override of the CellModel to address two bugs in ExtJS 4.2.2 and 4.2.3 nightly
* Bug 1 is the key related events do not pass the correct rowIndex argument. This is addressed in the 4.2.3 nightly;
* Bug 2 is the before key related events fire after the ui navigates to the new field so you get incorrect index and an inability to cancel the events which are supposed to prevent the key navigation from proceeding;
* This is currently utilized in OrderItemGrid.js
*/

Ext.define('Taco.overrides.selection.CellModel', {
    override: 'Ext.selection.CellModel',

    enableFieldTabbing: true,

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
    },

    // oberride of extjs method to add support for inline form tabbing from grid to fields; Makes the grid act like a field with regard to tab and shift tab;
    initKeyNav: function (view) {
        var me = this;

        if (!view.rendered) {
            view.on('render', Ext.Function.bind(me.initKeyNav, me, [view], 0), me, { single: true });
            return;
        }

        if (!this.enableFieldTabbing) {
            view.el.set({
                tabIndex: -1
            });
        } else {
            
            view.el.set({
                tabIndex: 0
            });
            
            var grid = me.view.ownerCt; 

            me.mon(grid, 'boxready', function () {

                /*
                me.mon(this.view.el, 'blur', function (e, t, eOpts) {
                    //console.log("gridBlur")
                })
                */


                // need to listen for focus on the grid el.
                me.mon(this.view.el, 'focus', function (e, t, eOpts) {
                    var lastRow = this.store.getCount() - 1;
                    if (lastRow == -1) {
                        return;
                    }
                    
                    this.getSelectionModel().setCurrentPosition({ row: 0, column: 0 });
                    this.view.focusRow(0);                    
                    
                }, this)
            }, grid)
        }

        var keyNavConfig = {
            target: view.el,
            ignoreInputFields: true,
            up: me.onKeyUp,
            down: me.onKeyDown,
            right: me.onKeyRight,
            left: me.onKeyLeft,
            tab: {
                fn: this.onKeyTab
            },
            scope: me
        }

        // enhancement to add support for tabing to and from the grid when its inline in a form panel;
        if (this.enableFieldTabbing){
            keyNavConfig.tab.defaultEventAction  = false
        }

        // view.el has tabIndex -1 to allow for
        // keyboard events to be passed to it.
        me.keyNav = new Ext.util.KeyNav(keyNavConfig);
    },

    // overriding default behavior to make the tab key exit grids that are inline on a tabable form;
    // Tab key from the View's KeyNav, *not* from an editor.
    onKeyTab: function (e, t) {
        var me = this,
            pos = me.getCurrentPosition(),
            editingPlugin,
            grid = me.view.ownerCt;;        

        if (pos) {

            editingPlugin = pos.view.editingPlugin;
            
            // don't navigate if we are editing a cell.
            if (editingPlugin && editingPlugin.editing) {
                e.stopEvent();
                return
            } 

            if (!me.enableFieldTabbing) {
                me.move(e.shiftKey ? 'left' : 'right', e);
            } else {
                var selModel = me;
                if (selModel.getSelection().length) {
                    // need to manually visually deselect the last cell due to extjs bug that leaves the css class on the sell when deselected;
                    var pos = selModel.getCurrentPosition();
                    grid.view.onCellDeselect(pos);
                    selModel.deselectAll();
                }

                var allFocusable = Ext.getBody().query(":focusable");
                var gridIndex = allFocusable.indexOf(grid.view.el.dom);
                if (!gridIndex) {
                    return;
                }
                var newIndex = gridIndex + 1,
                    nextEl;

                if (e.shiftKey) {
                    newIndex = gridIndex - 1
                }

                nextEl = Ext.get(allFocusable[newIndex]);
                // kill the event so it doesn't skip over the sibling fields.
                e.stopEvent();
                nextEl.focus();                    
            }            
        }
    }
});