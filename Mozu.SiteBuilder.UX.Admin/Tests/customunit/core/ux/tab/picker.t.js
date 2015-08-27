StartTest(function(t) {
    

    var o = {
        initUi: function() {
            t.diag('Initialized the picker');

            o.sites = o.createSites();

            o.cmp = Ext.create('Ext.Component', {
                html: '+',
                listeners: {
                    boxready: function () {
                        o.pickerUi.show();
                    }
                }
            });

            o.pickerUi = Ext.create('Taco.core.ux.tab.Picker', {
                data: o.sites,
                checkedItems: ['100', '101'],
                positionNextTo: o.cmp,
                alignment: 'tl-bl?',
                listeners: {
                    show: o.afterRender,
                    hide: o.afterHide,
                    selectionchange: o.selectionChange,
                    scope: o
                }
            });

            //t.waitForRender(o.pickerUi, o.afterRender);
            
            Taco.app.contentView.removeAll();

            o.asyncRender = t.beginAsync();

            Taco.app.contentView.add({
                xtype: 'container',
                items: [
                    o.cmp,
                    o.pickerUi
                ]
            });
        },

        afterRender: function () {
            t.endAsync(o.asyncRender);
            t.diag('Picker rendered');

            //t.ok(o.pickerUi.isHidden(), 'Picker is hidden by default.');

            //o.pickerUi.show();

            t.ok(!o.pickerUi.isHidden(), 'Show the picker');

            o.originalItems = Ext.Array.pluck(o.pickerUi.getCheckedRecords(), 'id');

            t.ok(Ext.Array.contains(o.originalItems, 100), 'Site 100 checked as passed in');
            t.ok(Ext.Array.contains(o.originalItems, 101), 'Site 101 checked as passed in');
            t.notOk(Ext.Array.contains(o.originalItems, 102), 'Site 102 NOT checked as passed in');

            var checkbox100 = o.pickerUi.down('checkbox');

            t.click(checkbox100.getEl());

            t.diag('Click on first checkbox');

            o.currentItems = Ext.Array.pluck(o.pickerUi.getCheckedRecords(), 'id');

            t.notOk(Ext.Array.contains(o.currentItems, 100), 'Site 100 NOT checked as passed in');
            t.ok(Ext.Array.contains(o.currentItems, 101), 'Site 101 checked as passed in');
            t.notOk(Ext.Array.contains(o.currentItems, 102), 'Site 102 NOT checked as passed in');


            o.pickerUi.on({
                hide: o.afterHide,
                selectionchange: o.selectionChange
            });
            //t.waitForEvent(o.pickerUi, 'hide', o.afterHide);

            o.pickerUi.hide();

            t.waitFor(function () { return o.isChanged}, function () {});
            t.waitFor(function () { return o.isHidden}, function () {});
        },

        afterHide: function () {
            t.diag('Picker Hidden');
            o.isHidden = o.pickerUi.isHidden();
        },

        selectionChange: function (picker, newValues, oldValues) {
            t.diag('Selection Changed Event');
            o.isChanged = true;
            
            t.ok(picker === o.pickerUi, 'Picker object returned as first argument');

            newValues = Ext.Array.pluck(newValues, 'id');
            oldValues = Ext.Array.pluck(oldValues, 'id');

            t.diag('Checking newValues returned from change event');
            t.notOk(Ext.Array.contains(newValues, 100), 'Site 100 NOT checked as passed in');
            t.ok(Ext.Array.contains(newValues, 101), 'Site 101 checked as passed in');
            t.notOk(Ext.Array.contains(newValues, 102), 'Site 102 NOT checked as passed in');

            t.diag('Checking oldValues returned from change event');
            t.ok(Ext.Array.contains(oldValues, 100), 'Site 100 checked as passed in');
            t.ok(Ext.Array.contains(oldValues, 101), 'Site 101 checked as passed in');
            t.notOk(Ext.Array.contains(oldValues, 102), 'Site 102 NOT checked as passed in');
        },

        createSites: function() {
            return [
            Ext.create('Taco.core.context.Site', {
                id: 100,
                name: 'Shoe Store'
            }), Ext.create('Taco.core.context.Site', {
                id: 101,
                name: 'Boot Store'
            }), Ext.create('Taco.core.context.Site', {
                id: 102,
                name: 'Sandal Store'
            })];
        }
    };

    t.requireOk('Taco.core.ux.tab.Picker', 'Taco.core.context.Site', function() {
        o.initUi();
    });
});