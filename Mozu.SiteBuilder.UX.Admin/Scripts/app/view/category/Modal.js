/**
 * @class Taco.view.category.Modal
 */

Ext.define('Taco.view.category.Modal', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Ext.tree.Panel',
        'Ext.selection.CheckboxModel'
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Apply',
    scale: 'medium',
    title: 'Select Categories',

    layout: {
        type: 'fit'
    },

    initComponent: function () {
        this.selModel = Ext.create('Ext.selection.CheckboxModel', {
            selType: 'checkboxmodel',
            checkOnly: true,
            showHeaderCheckbox: true,
            mode: this.multiSelect === false ? "SINGLE" : "MULTI"
        });

        this.tree = Ext.create('Ext.tree.Panel', {
            rootVisible: false,
            displayField: 'nameAndCode',
            store: this.store,
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
                    me.expandPath(keys.join(separator), field, separator, function (success, node) {
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

        this.items = [this.tree];

        this.callParent(arguments);

        this.tree.getView().on({
            viewready: {
                scope: this,
                fn: 'preselect'
            }
        });
    },

    preselect: function (view) {
        var preselection = this.preselection,
            tree = this.tree;

        Ext.Array.each(preselection, function (record) {
            var path = record.get('path');

            path = '/0/' + path + (path ? '/' : '') + record.getId();
            tree.selectPath(path);
        }, this);
    },

    doSave: function () {
        var selection = this.selModel.getSelection();
        this.saveSuccess(selection);
    }
});