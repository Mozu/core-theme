StartTest(function (t) {
    var indexUI,
        roleStore;

    var methods = {
        checkRendered: function () {
            return indexUI.rendered;
        },
        checkEditRendered: function () {
            return Ext.ComponentQuery.query('rolefulledit').length === 1;
        },
        afterRender: function () {
            var grid = indexUI.query('gridpanel');

            t.ok(grid && grid[0], 'Grid panel found and rendered');
            grid = grid[0];

            var links = grid.getEl().query('.taco-launch-editor');

            Ext.each(links, function (link, index) {
                var el = new Ext.dom.Element(link),
                    record = roleStore.getAt(index);

                if (record.get('isEditable')) {
                    methods.testEditable(el, record);
                } else {
                    methods.testUneditable(el, record);
                }

            });
        },
        testUneditable: function (linkEl, record) {
            t.diag('testUneditable - ' + record.get('name'));
            return;
            t.click(linkEl);

            var editUI = Ext.ComponentQuery.query('rolefulledit');

            t.ok(editUI && editUI.length === 1, 'Role EditUI is loaded');
        },
        testEditable: function (linkEl, record) {
            t.diag('testEditable - ' + record.get('name'));

            t.click(linkEl);
            
            //t.ok(methods.checkEditRendered, 'check there');

            t.waitFor(methods.checkEditRendered, function () {
                var editUI = Ext.ComponentQuery.query('rolefulledit');

                t.ok(editUI && editUI.length === 1, 'Role EditUI is loaded');
                
                editUI = editUI[0];

                var dirtyButton = editUI.down('dirtybutton');

                //  Test text field
                var textField = editUI.down('textfield');

                t.ok(dirtyButton, 'Dirty button found');
                t.ok(textField, 'textfield is found');
                t.ok(record.get('name') === textField.getValue(), 'Record matches textfield value');

                t.ok(!dirtyButton.isDirty(), 'Dirty button is not dirty');

                textField.setValue(record.get('name') + '-test');

                t.ok(dirtyButton.isDirty(), 'Dirty button is dirty after changing textfield');

                textField.setValue(record.get('name'));

                t.ok(!dirtyButton.isDirty(), 'Dirty button is no logner dirty after reverting name');

        
                // Test behvaior grid
                


            });
        }
    };

    t.requireOk('Taco.view.role.Index', function () {
        t.diag('Initialized the index');

        roleStore = Chalupa.Core.getRoleStore();

        indexUI = Ext.create('Taco.view.role.Index', {
            store: roleStore,
        });

        Ext.override(indexUI, {
            launchEditor: function (record) {
                this.launchLoadedEditor(record, Chalupa.Core.getBehaviorStore());
            }
        });

        Taco.app.contentView.add(indexUI);

        t.waitFor(methods.checkRendered, methods.afterRender);
    });
});