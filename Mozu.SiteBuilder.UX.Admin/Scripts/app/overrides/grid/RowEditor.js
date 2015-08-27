/**
 * Temporary bug fix in extjs 4.2.1;
 * see: http://www.sencha.com/forum/showthread.php?264529-4.2.1-Ext.grid.RowEditor-onFieldChanged()-No-Longer-Called
 * check for fix in when we upgrade to next version of extjs

 *  To prevent a specific column from editing the row, add this  "rowEditOnClick: false" config to the column configuration:
        
        Example:
            {
                dataIndex: 'name',            
                text: 'Name',
                rowEditOnClick: false
                flex:1            
            }       

 *
 *  Two added features:
 *
 *  "editableOnCreateOnly"
 *  An editor config property that makes the field editable on create but disables the field on edit. Used in channel and locationType where the "Code" is the id of the entity and can only be set when creating the entity and is uneditable there after;
 *  Example Column Configuration:
 
        {
            dataIndex: 'name',
            editor: {
                // defaults to textfield if no xtype is supplied
                emptyText: "Name",
                editableOnCreateOnly:true,
                selectOnFocus: true,
                allowBlank: false
            },
            text: 'Name',
            flex:1
            
        }
 *
 *  onEditorShow: function (){}
 *  Example Column Configuration:

        {
            dataIndex: 'code',
            text: 'Code',
            editor: {
                // defaults to textfield if no xtype is supplied
                emptyText: "Code",
                selectOnFocus: true,
                // optional method on the editor that will be called every time the row editor is shown;
                onEditorShow: function(field, editor, context) {                    
                    var code = context.record.data.code;
                    if (code) {
                        field.disable();
                    } else {
                        field.enable();
                    }
                },
                allowBlank: false
            },
            width: 200
        }
 *
 *
 */

Ext.define('Taco.overrides.grid.RowEditor', {
    override: 'Ext.grid.RowEditor',  
    /*
    addFieldsForColumn: function (column, initial) {
        var me = this,
            i,
            length,
            field;

        if (Ext.isArray(column)) {
            for (i = 0, length = column.length; i < length; i++) {
                me.addFieldsForColumn(column[i], initial);
            }
            return;
        }
        
        if (column.getEditor) {
            field = column.getEditor(null, {
                xtype: 'displayfield',
                getModelData: function() {
                    return null;
                }
            });

            if (column.align === 'right') {
                field.fieldStyle = 'text-align:right';
            }
            
            // prevent the roweditor from displaying the action column and its subclasses;
            if (column.xtype === 'actioncolumn' || column.xtype === 'taco.menucolumn') {
                field.fieldCls += ' ' + Ext.baseCSSPrefix + 'form-action-col-field';
            }

            if (me.isVisible() && me.context) {
                if (field.is('displayfield')) {
                    me.renderColumnData(field, me.context.record, column);
                } else {
                    field.suspendEvents();
                    field.setValue(me.context.record.get(column.dataIndex));
                    field.resumeEvents();
                }
            }

            if (column.hidden) {
                me.onColumnHide(column);
            } else if (column.rendered && !initial) {
                me.onColumnShow(column);
            }

            // start edit
            //simeon: this is  removed in 4.2.2
            //this.mon(field, 'change', this.onFieldChange, this);
            // end edit
        }
    },
    */
    
    
    
    onEnterKey: function () {
        me = this,
        plugin = me.editingPlugin;
        
        if (this.getForm().isValid()) {                        
            plugin.completeEdit();
            
        }

    },

    initKeyNav: function () {
        var me = this,
            plugin = me.editingPlugin;

        me.keyNav = new Ext.util.KeyNav(me.el, {
            enter: {
                fn: me.onEnterKey,
                scope:me
            },
            esc: plugin.onEscKey,
            scope: plugin
        });
    },
    
    // Focus the cell on start edit based upon the current context
    focusContextCell: function () {
        var me = this;        
        var field = me.getEditor(me.context.column);

        // check to see if field is focusable; if not find first field that is focusable;       
        if (!field.isFocusable()) {
            var fieldsCollection =  me.query('[isFormField]');            
            field = Ext.Array.findBy(fieldsCollection,function (item, key) {
                return item.isFocusable();
            })
        }
        if (field && field.focus) {
            field.focus();
        }
    },


    onNavCancel: function () {
        var me = this;

        // Scroll the visible RowEditor that is in error state back into view
        scrollDelta = me.getScrollDelta();
        if (scrollDelta) {
            me.scrollingViewEl.scrollBy(0, scrollDelta, true)
        }
        me.showToolTip();
    },
    // override of the default method. adding support for autoSave
    beforeEdit: function () {
        var me = this,
            scrollDelta,
            plugin = me.editingPlugin;
        
        
        
        if (me.isVisible() && me.isDirty() && me.autoSave) {
            
            // do a save 
            if (this.getForm().isValid()) {
                plugin.completeEdit();
            } else {
                me.onNavCancel();
                return false;
            }

            
            //} else if (me.isVisible() && me.errorSummary && !me.autoCancel && me.isDirty()) {
        } else if (me.isVisible() && !me.autoCancel && me.isDirty()) {
            me.onNavCancel();            
            return false;
        }
    },

    /*
    *  UX Enhancement - before the row editor becomes visible. itereate the fields of the editor calling an optional onEditorShow();
    *  Also looks for editOnCreateOnly property and disables the field in an edit situation;
    */
    onBeforeEdit: function (editor, context, opts) {
        var xtype = context.column.xtype;
        // disable the row editor when the user clicks on an actioncolum or our ux version of the action column. Also allows us to prevent a column from triggering the rowEdit
        if (xtype == "taco.menucolumn" || xtype == "actioncolumn" || context.column.rowEditOnClick == false) {
            return false;
        }
        

        var fields = editor.editor.items.items;
        //iterate each field and call an optional method on that field which can be used to manipulate the field each time its shown.
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            
            // if the field is only editable on create, disable the field when editing;
            if (field.editableOnCreateOnly) {
                var dataVal = context.record.get(field.name);
                if (dataVal) {
                    field.disable();
                } else {
                    field.enable();
                }
            }

            // optionaly call the onEditorShow() in the editor config to do any custom field manipulation;
            if (field.onEditorShow) {
                fields[i].onEditorShow(fields[i], editor, context);
            }
        }
    },
    
    initComponent: function () {
        this.callParent(arguments);

        // if you enable autoSave we need to make autoCancel false;
        if (this.autoSave) {
            this.autoCancel = false;
        }

        // adding ux enhancement to allow the field editors to have some control over their display before showing;
        this.editingPlugin.on('beforeedit', this.onBeforeEdit, this);
    },

    onRender: function () {        
        this.callParent(arguments);
        // this.setMargin('5 0 0 0');
    }
});
