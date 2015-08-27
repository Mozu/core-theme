/**
 * @class Taco.core.ux.QuickAdder
 */
Ext.define('Taco.core.ux.QuickAdder', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.quickadder',
    cls: 'taco-quickadder',
    dock: 'top',
    editMode: false,
    padding: '4 4 4 25',
    margin: 0,
    height: 42,
    weight: 101,

    setEditMode: function (bool) {
        if (this.editMode != bool) {
            this.editMode = bool;
            this.removeAll();
            this.add.apply(this, this.editMode ? this.editingItems : this.notEditingItems);
        }
    },

    handleCommitRequest: function () {
        var quickAdd = this.getComponent('textField');
            //args = [quickAdd.getSubmitValue()].concat(Ext.Array.slice(arguments));
        if (quickAdd.isValid()) {
            this.fireEvent('commit', this, quickAdd.getSubmitValue())
            //this.commit.apply(this, args);
            quickAdd.reset();
            this.setEditMode(false);
        }
    },
    helperText: 'Add New',
    helperIcon: '+ ',
    initComponent: function (e) {
        this.notEditingItems = Ext.clone(this.items);
        this.callParent(arguments);
        this.on('click', function (e, elm) {
            if (elm.className.indexOf('text') == -1) return;
            if (!this.editMode) {
                this.setEditMode(true);
                this.getComponent('textField').focus();
            }
        }, this, {
            element: 'el'
        });
    },
    items: [{
        xtype: 'tbtext',
        text: '',
        listeners: {
            render: function () {
                var tb = this.findParentByType('toolbar');
                this.setText(tb.helperIcon + tb.helperText);
            }
        }
    }],
    editingItems: [{
        xtype: 'textfield',
        itemId: 'textField',
        cls: 'taco-quickadder-field',
        minWidth: 250,
        msgTarget: 'side',
        validator: function (value) {
            if (value == 'fail') {
                return 'That word is not allowed.';
            } else {
                return true;
            }
        },
        listeners: {
            specialkey: function (field, e) {
                switch (e.getKey()) {
                case e.ENTER:
                    if (this.isValid()) {
                        var tb = this.findParentByType('toolbar');
                        return tb.handleCommitRequest.apply(tb, arguments);
                    }
                    break;
                case e.ESC:
                    return this.blur();
                default:
                    return;
                }

            },
            blur: function () {
                var tb = this.findParentByType('toolbar');
                Ext.defer(tb.setEditMode, 400, tb, [false]);
            }
        }
    }, '->',
    {
        xtype: 'button',
        itemId: 'addButton',
        text: 'Quick Add',
        handler: function (e) {
            var tb = this.findParentByType('toolbar');
            tb.handleCommitRequest.apply(tb, arguments);
        }
    }]
});
