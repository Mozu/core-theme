/**
 * @class Taco.view.category.Modal
 */
Ext.define('Taco.view.category.Modal', {
    extend: 'Taco.core.ux.modal.Modal',
    requires: [
        'Ext.tree.Panel',
        'Ext.selection.CheckboxModel',
        'Taco.core.ux.action.SecondaryButton'
    ],

    autoShow: true,
    fullHeight: true,
    width: 700,

    initComponent: function () {
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true
        });

        this.tree = Ext.create('Ext.tree.Panel', {
            width: 644,
            flex: 1,
            margin: '28 0 0 0',
            rootVisible: false,
            store: this.store,
            displayField: 'name',
            selModel: this.selModel,
            selectPath: function (path, field, separator, callback, scope) {
                // override: set keepExisting to true when calling select()
                var me = this,
                    root,
                    keys,
                    last;

                field = field || me.getRootNode().idProperty;
                separator = separator || '/';

                keys = path.split(separator);
                last = keys.pop();
                if (keys.length > 1) {
                    me.expandPath(keys.join(separator), field, separator, function(success, node){
                        var lastNode = node;
                        if (success && node) {
                            node = node.findChild(field, last);
                            if (node) {
                                me.getSelectionModel().select(node, true);
                                Ext.callback(callback, scope || me, [true, node]);
                                return;
                            }
                        }
                        Ext.callback(callback, scope || me, [false, lastNode]);
                    }, me);
                } else {
                    root = me.getRootNode();
                    if (root.getId() === last) {
                        me.getSelectionModel().select(root, true);
                        Ext.callback(callback, scope || me, [true, root]);
                    } else {
                        Ext.callback(callback, scope || me, [false, null]);
                    }
                }
            }
        });

        this.content = {
            xtype: 'container',
            layout: 'vbox',
            items: [{
                xtype: 'component',
                cls: Taco.baseCSSPrefix + 'modal-title',
                html: 'Select Categories'
            }, this.tree]
        };

        this.actions = {
            xtype: 'container',
            items: [{
                xtype: 'primarybutton',
                text: 'Apply',
                click: this.save,
                scope: this
            }, {
                xtype: 'secondarybutton',
                text: 'Cancel',
                click: this.cancel,
                scope: this
            }]
        };

        this.callParent(arguments);

        this.tree.getView().on({
            viewready: this.preselect,
            scope: this
        });

        this.selModel.on({
            selectionchange: function (selModel, selection) { console.log(selection, selModel.getSelectionMode()); },
            scope: this
        });
    },

    cancel: function () {
        this.hide();
    },

    preselect: function (view) {
        var preselection = this.preselection,
            tree = this.tree;

        Ext.Array.each(preselection, function (record) {
            var path = record.get('path');

            path = '/0/' + path + (path ? '/' : '') + record.getId();
            console.log(path);
            tree.selectPath(path);
        }, this);
    },

    save: function (button, e) {
        var selection = this.selModel.getSelection(),
            values;

        // values = Ext.Array.map(selection, function (record) {
        //     return { id: record.getId(), name: record.get('name') };
        // }, this);
        
        console.log(selection);

        this.fireEvent('save', this, selection);

        this.hide();
    }
});