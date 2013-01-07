StartTest(function (test) {
    test.requireOk("Taco.core.ux.TreeList", function () {
        Ext.define("MyModel", {
            extend: "Ext.data.Model",
            fields: [
                { name: 'activity',  type: 'string' },
                { name: 'start',  type: 'string' },
                { name: 'leaf', type: 'boolean', defaultValue: true }
            ]
        });


        var treelist = Ext.create("Taco.core.ux.TreeList", {
            renderTo: Ext.getBody(),
            width: 400,

            store: {
                model: "MyModel",
                root: {
                    text: ".",
                    leaf: false,
                    children: [{
                        activity: "Coffee",
                        start: "09:00"
                    }, {
                        activity: "Stand up",
                        start: "10:15"
                    }, {
                        activity: "Berate Travis",
                        start: "Always"
                    }, {
                        activity: "Lunch",
                        start: "13:00"
                    }, {
                        activity: "Hit on Thom",
                        start: "16:30"
                    }]
                }
                /*root: {
                    "text": ".",
                    "children": [{
                        task: 'Project: Shopping',
                        duration: 13.25,
                        user: 'Tommy Maintz',
                        iconCls: 'task-folder',
                        expanded: true,
                        children: [{
                            task: 'Housewares',
                            duration: 1.25,
                            user: 'Tommy Maintz',
                            iconCls: 'task-folder',
                            children: [{
                                task: 'Kitchen supplies',
                                duration: 0.25,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task'
                            }, {
                                task: 'Groceries',
                                duration: .4,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task',
                                done: true
                            }, {
                                task: 'Cleaning supplies',
                                duration: .4,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task'
                            }, {
                                task: 'Office supplies',
                                duration: .2,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task'
                            }]
                        }, {
                            task: 'Remodeling',
                            duration: 12,
                            user: 'Tommy Maintz',
                            iconCls: 'task-folder',
                            expanded: true,
                            children: [{
                                task: 'Retile kitchen',
                                duration: 6.5,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task'
                            }, {
                                task: 'Paint bedroom',
                                duration: 2.75,
                                user: 'Tommy Maintz',
                                iconCls: 'task-folder',
                                children: [{
                                    task: 'Ceiling',
                                    duration: 1.25,
                                    user: 'Tommy Maintz',
                                    iconCls: 'task',
                                    leaf: true
                                }, {
                                    task: 'Walls',
                                    duration: 1.5,
                                    user: 'Tommy Maintz',
                                    iconCls: 'task',
                                    leaf: true
                                }]
                            }, {
                                task: 'Decorate living room',
                                duration: 2.75,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task',
                                done: true
                            }, {
                                task: 'Fix lights',
                                duration: .75,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task',
                                done: true
                            }, {
                                task: 'Reattach screen door',
                                duration: 2,
                                user: 'Tommy Maintz',
                                leaf: true,
                                iconCls: 'task'
                            }]
                        }]
                    }, {
                        task: 'Project: Testing',
                        duration: 2,
                        user: 'Core Team',
                        iconCls: 'task-folder',
                        children: [{
                            task: 'Mac OSX',
                            duration: 0.75,
                            user: 'Tommy Maintz',
                            iconCls: 'task-folder',
                            children: [{
                                task: 'FireFox',
                                duration: 0.25,
                                user: 'Tommy Maintz',
                                iconCls: 'task',
                                leaf: true
                            }, {
                                task: 'Safari',
                                duration: 0.25,
                                user: 'Tommy Maintz',
                                iconCls: 'task',
                                leaf: true
                            }, {
                                task: 'Chrome',
                                duration: 0.25,
                                user: 'Tommy Maintz',
                                iconCls: 'task',
                                leaf: true
                            }]
                        }, {
                            task: 'Windows',
                            duration: 3.75,
                            user: 'Darrell Meyer',
                            iconCls: 'task-folder',
                            children: [{
                                task: 'FireFox',
                                duration: 0.25,
                                user: 'Darrell Meyer',
                                iconCls: 'task',
                                leaf: true
                            }, {
                                task: 'Safari',
                                duration: 0.25,
                                user: 'Darrell Meyer',
                                iconCls: 'task',
                                leaf: true
                            }, {
                                task: 'Chrome',
                                duration: 0.25,
                                user: 'Darrell Meyer',
                                iconCls: 'task',
                                leaf: true
                            }, {
                                task: 'Internet Exploder',
                                duration: 3,
                                user: 'Darrell Meyer',
                                iconCls: 'task',
                                leaf: true
                            }]
                        }, {
                            task: 'Linux',
                            duration: 0.5,
                            user: 'Aaron Conran',
                            iconCls: 'task-folder',
                            children: [{
                                task: 'FireFox',
                                duration: 0.25,
                                user: 'Aaron Conran',
                                iconCls: 'task',
                                leaf: true
                            }, {
                                task: 'Chrome',
                                duration: 0.25,
                                user: 'Aaron Conran',
                                iconCls: 'task',
                                leaf: true
                            }]
                        }]
                    }]
                }*/
            },

            columns: [{
                xtype: 'draghandlecolumn',
                width: 36
            }, {
                xtype: 'treecolumn',
                text: 'Activity',
                flex: 1,
                checkboxText:'',
                dataIndex: 'activity',
                renderer: function (value) {
                    return '<a href="#" class="taco-launch-editor">' + value + '</a>';
                }
            }, {
                text: 'Time',
                flex: 1,
                dataIndex: 'start'
            }]
        });

        // *** Simulate drag and drop operation
        var draghandles = document.querySelectorAll('.taco-draghandle'),
            dragIndex = 2,
            treelistRoot = treelist.store.getRootNode(),
            draggedModel = treelistRoot.getChildAt( dragIndex );

        test.dragTo(draghandles[ dragIndex ], [20, 100], function () {
            // *** Test if models have been appropriately reordered in response to drag-and-drop
            test.is(draggedModel, treelistRoot.getChildAt( dragIndex-1 ), "TreeList rows have been reordered from dragging.");
            test.done();
        });
    });
});