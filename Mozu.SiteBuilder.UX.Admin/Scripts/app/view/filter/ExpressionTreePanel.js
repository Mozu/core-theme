/**
 * @class  Taco.view.filter.ExpressionTreePanel
 * category form
 */
Ext.define('Taco.view.filter.ExpressionTreePanel', {
    extend: 'Ext.tree.Panel',
    requires: [
        'Taco.model.ExpressionTree',
        'Ext.data.TreeStore',
        'Taco.view.filter.EditFilterModal',
        'Taco.view.filter.EditCodeModal',
        'Taco.view.filter.Schema',
        'Taco.view.preview.ExpressionPreviewDrawer'
    ],

    mixins: {
        permissions: 'Taco.core.ux.mixins.Permissions'
    },

    editTitle: 'Edit Condition',

    createTitle: 'Add Condition',

    focusinCls: "x-tree-focusin",

    header: true,

    itemId: 'taco-expression-tree',

    ui: "subform-section",

    rootVisible: true,

    useArrows: true,

    multiSelect: true,

    singleExpand: true,

    editable :false,

    showEditButton: true,
    
    // shows a button that allows user to manually enter the data in a code editor;
    showCodeButton: true,

    //shows preview button
    showPreviewButton: true,

    disableContextMenuClick : false,

    // puts the tools into a header toolbar with overflow management and default button configuration; 
    headerToolbar: true,

    showTypeColumn: false,

    config: {
        type: null
    },

    initComponent: function() {
        var me = this;
        me.title = "Expression";
        me.tools = me.tools || [];

        this.mon(me, "needsvalidation", this.validateExpression, me);

        // set tabIndex on the grid so that it can be tabbed too;
        this.columns = [
            {
                text: 'Name',
                xtype: "treecolumn",
                menuDisabled: true,
                renderer: function(value, metaData, record, rowIndex, colIndex, store, view) {
                    if (record.data.type == "container") {
                        return (record.data.logicalOperator == "or") ? "Any of the following" : "All of the following";
                    } else {
                        var operator = Taco.filter.operatorStore.getById(record.get("operator"));
                        var field = Taco.filter.fieldStore.getById(record.get("left"));
                        var filterTpl = new Ext.XTemplate('{left} {operator} {right}');
                        var leftText = (field) ? field.get("text") : record.get("left");
                        var retVal = "";

                        if (record.get("right")) {
                            retVal = filterTpl.apply({
                                left: leftText,
                                operator: operator.get("text"),
                                right: record.get("right")
                            });
                        } else {
                            // null value use case.
                            retVal = (operator.get("id") === "eq") ? leftText + " has no value" : leftText +" has a value";
                        }
                        return retVal;
                    }
                },
                flex: 1,
                dataIndex: 'text',
                sortable: false
            } 
        ];

        if (this.showTypeColumn) {
            this.columns.push({
                text: 'Type',
                width: 100,
                menuDisabled: true,
                dataIndex: 'type',
                sortable: false
            });
        }

        if (this.editable) {

            this.columns.push({
                xtype: 'taco.menucolumn',
                menuDisabled: true,
                text: 'Actions',
                onMenuShow: function (menu, eventData) {
                    var deleteMenuItem = menu.down("#deleteMenuItem"),
                        createFilterMenuItem = menu.down("#createFilterMenuItem"),
                        createContainerMenuItem= menu.down("#createContainerMenuItem"),
                        record = eventData.record;

                    createFilterMenuItem.hidden = (record.get('type') != "container");
                    createContainerMenuItem.hidden = (record.get('type') != "container");
                    deleteMenuItem.hidden = (record.isRoot());
                },
                menuItems: [
                    {
                        text: 'Edit',
                        width: 260,
                        accelerator:"ENTER",
                        //requiredBehaviors: {
                        //    model: 'Taco.model.Discount',
                        //    behavior: 'update'
                        //},
                        menuColumnHandler: function(item, eventData) {
                            var record = eventData.record;
                            me.editNode(record.get("id"), eventData.record, eventData.item, eventData.rowIndex, eventData.e);

                        }
                    },

                    //,
                    //{
                    //    text: 'Duplicate',
                    //    //requiredBehaviors: {
                    //    //    model: 'Taco.model.Discount',
                    //    //    behavior: 'create'
                    //    //},
                    //    menuColumnHandler: function(item, eventData) {
                    //        var record = eventData.record,
                    //            metaData = {
                    //                id: record.getId()
                    //            };

                    //        Taco.app.StateManager.attemptNavigate('discounts/duplicate/' + record.getId(), metaData);
                    //    }
                    //}, 
                    {

                        text: 'Add Condition',
                        width: 260,
                        accelerator: "C",
                        itemId: "createFilterMenuItem",
                        menuColumnHandler: function (item, eventData) {
                            var record = eventData.record;
                            me.createFilter(record.get("id"), eventData.record, eventData.item, eventData.rowIndex, eventData.e);
                        },
                        scope: me
                    },
                    {

                        text: 'Add Group',
                        itemId: "createContainerMenuItem",
                        width:260,
                        accelerator: "G",
                        menuColumnHandler: function(item, eventData) {
                            var record = eventData.record;
                            me.createContainer(record.get("id"), eventData.record, eventData.item, eventData.rowIndex, eventData.e);

                        },
                        scope: me
                    },
                    {

                        text: 'Delete',
                        width: 260,
                        itemId: "deleteMenuItem",
                        accelerator: "DELETE",
                        menuColumnHandler: function(item, eventData) {
                            var record = eventData.record;
                            me.deleteNode(record.get("id"), eventData.record, eventData.item, eventData.rowIndex, eventData.e);

                        },
                        scope: me
                    }
                ]
            });

        }

        this.viewConfig = this.viewConfig || {};

        Ext.apply(this.viewConfig, {
            toggleOnDblClick: false,
            disableSelection: !this.editable
        });



        if (this.editable) {
            Ext.apply(this.viewConfig, {
                plugins: {
                    ptype: 'treeviewdragdrop',
                    containerScroll: true
                }
            });
            this.initEditableEvents();
        }

        



        if (this.showEditButton) {
            this.tools.push(
                {
                    ui: 'action',
                    xtype:"button",
                    scale: 'medium',
                    text: 'Edit',
                    handler: this.openEditor,
                    scope:me
                }
            );
        }

        if (this.showCodeButton) {
            this.tools.push(
                {
                    ui: 'action',
                    xtype: "button",
                    scale: 'medium',
                    text: 'Advanced',
                    handler: this.openCodeEditor,
                    scope:me
                }
            );
        }

        if (this.showPreviewButton) {
            this.tools.push({
                ui: 'action',
                xtype: 'button',
                scale: 'medium',
                text: 'Preview',
                handler: this.openPreview,
                scope: me
            });
        }
        
        this.store = Ext.create('Ext.data.TreeStore', {
            model: "Taco.model.ExpressionTree",
            
            //model: treeModel,
            defaultRootProperty: "nodes"
        });


        if (this.data) {
            this.treeData = this.data.tree;
            this.setValue(this.treeData);
        }

        this.callParent(arguments);
    },

    refreshFocus: function () {
        var me = this;
        me.getSelectionModel().refresh();

        var selMod = me.getSelectionModel();
        var selectedRecords = selMod.getSelection() || me.getRootNode();
        selMod.deselectAll();
        
        
        
        //var rootNode = me.getRootNode();
        //me.getSelectionModel().select(rootNode);
        selMod.select(selectedRecords);
    },
    
    onBoxReady: function () {
        var me = this;

        if (this.editable) {
            // make the tree panel keyboard navigable; this makes the inner body have a tabIndex and selects the first or last selected node in the tree when it gets focus;
            me.view.el.dom.setAttribute('tabIndex', "0");

            // initialize the selection on the tree;
            var selMod = me.getSelectionModel(),
                selectedRecords = me.getRootNode();

            selMod.select(selectedRecords);
        }

        this.mon(this.view.el, 'focusin', function() {
            this.onFocusIn();
        }, this);

        this.mon(this.view.el, 'focusout', function () {
            this.onFocusOut();
        }, this);

        this.callParent(arguments);

        this.initContextMenu();

        me.formLessKeyMap = new Ext.util.KeyMap({
            target: me.el,
            ignoreInputFields: true,

            binding: [
                 {
                     // Backspace on windows and delete key on mac. need to prevent the navigate
                     key: 8,

                     fn: function () {
                         console.log("preventing backspace key from navigating");
                     },
                     // prevents the event from bubbling past the modal;
                     defaultEventAction: 'stopEvent',
                     scope: me
                 }
            ]
        });

    },
    onFocusIn: function () {
        this.el.addCls(this.focusinCls);
    },
    onFocusOut: function () {
        this.el.removeCls(this.focusinCls);
    },

    initContextMenu: function () {
        var me = this;

        var menuColumns = Ext.Array.filter(me.columns, function (col) { return col.isXType && col.isXType('taco.menucolumn'); });

        
        if (me.disableContextMenuClick !== true && menuColumns && menuColumns.length == 1) {
        
        

            me.mon(me, 'itemcontextmenu', function (cmp, record, item, index, e) {
                var eventData = {
                    grid: cmp.ownerCt,
                    rowIndex: index,
                    header: menuColumns[0],
                    e: e,
                    record: record,
                    item: item
                },
                menu = menuColumns[0].getMenu(eventData);
                
                menu.on('beforehide', function () {
                    me.refreshFocus();
                }, me);

                //e.preventDefault();
                e.stopEvent();
                menu.showAt(e.xy);
            }, me);
        }
    },
    initEditableEvents: function () {
        var me = this;

        this.mon(me, "itemdblclick", function (view, record, item, index, e) {
            me.editNode(record.get("id"),record, item, index, e);
        });

        //this.mon(me, "itemcontextmenu", function (view, record, item, index, e) {
            
        //});

        var xOffset = 150,
            yOffset = 10;


        

        this.mon(me, "itemkeydown", function (view, record, item, index, e) {
            
            switch (e.getKey()) {
                // add condition
                case Ext.EventObject.C:
                    me.createFilter();
                    break;
                    // create group
                case Ext.EventObject.G:
                    me.createContainer();
                    break;
                case e.ENTER:
                    // need to correct the event to give it an xy position relative to the row in the tree.
                    e.xy = Ext.get(item).getXY();
                    e.xy[0] = e.xy[0] + xOffset;
                    e.xy[1] = e.xy[1] + yOffset;
                    me.editNode(record.get("id"), record, item, index, e);
                    break;
                case 8:
                case e.DELETE:
                    me.deleteNode(record.get("id"), record, item, index, e);
                    
                    break;
            }
        },me, {
            buffer:100
        });
    },

    editNode: function (nodeId, record, item, index, e) {
        var me = this;
        // if editing a filter container. need to show a menu to change the nodes logicalOperator
        if (record.get("type") == "container") {
            me.editContainer(nodeId, record, item, index, e);
        } else {
            me.editFilter(nodeId, record, item, index, e);
        }
    },

    deleteNode: function (id, record, item, rowIndex, e) {
        // figure out what gets selected after the delete happens. this will maintain focus. and provide keyboard support.
        var nodeToSelect = record.nextSibling || record.previousSibling || record.parentNode;

        if (record && !record.isRoot()) {
            record.removeAll();
            record.remove();
            this.getSelectionModel().select(nodeToSelect);
        }
    },

    editFilter: function (nodeId, record, item, index, e) {
        var me = this;
         var win = Ext.create('Taco.view.filter.EditFilterModal', {
             record: record,
             type: this.getType(),
             listeners: {
                 scope:me,
                 'aftersaveclose' : function() {
                     me.refreshFocus();
                 },
                 'aftercancelclose': function () {
                     me.refreshFocus();
                 }
             }
         });

    },
    
    createFilter: function (id, record, item, rowIndex, e) {
        var me = this;
        if (!record) {
            record = this.getSelectionModel().getSelection()[0];
        }

        if (record.get("type") !== "container") {
            return;
        }
        
        var newRecord = Ext.create('Taco.model.ExpressionTree', {
            leaf:true,
            left: "ProductCode",
            operator: "eq",
            right: "",
            type: "predicate"
        });

        var win = Ext.create('Taco.view.filter.EditFilterModal', {
            record: newRecord,
            type:this.getType(),
            listeners: {
                scope: me,
                'aftersaveclose': function () {
                    var addedRecord = record.insertChild(0, newRecord);
                    me.refreshFocus();
                },
                'aftercancelclose': function () {
                    newRecord.destroy();
                    me.refreshFocus();
                }
            }
        });
    },

    deleteFilter: function() {
        console.log("delete filter")
    },

    containerDataTpl : {
        "expanded": true,
        "type": "container",
        "logicalOperator": "or",
        "nodes": []
    },


    createContainer: function (id, record, item, rowIndex, e) {
        if (!record) {
            record = this.getSelectionModel().getSelection()[0];
        }

        if (record.get("type") === "container") {
            var addedRecord = record.insertChild(0, Ext.Object.merge({}, this.containerDataTpl));
            this.view.select(addedRecord);
        }
    },
    deleteContainer: function () {
        
    },
    editContainer: function (nodeId, record, item, index, e) {
        var me = this,
            position;

        position = (e) ? e.getXY() : [0, 0];

        var menu = Ext.create('Ext.menu.Menu', {
            listeners: {
                click: function (menu, item, e, eOpts) {
                    record.set("logicalOperator", item.logicalOperator);
                },
                beforehide: function () {
                    me.refreshFocus();
                },
                scope: me
            },
            showSeparator: false,
            items: [
                {
                    text: "Any of the following",
                    logicalOperator:"or"
                },
                {
                    text: "All of the following",
                    logicalOperator: "and"
                }
            ],
            cls: 'dc-flydown-menu',
            shadow: false,
            plain: true
        });

        
        menu.showAt(position);
    },

    // extracts the full data from the store
    getValue : function() {
        var root = this.store.getRootNode();
        return this.serializeNode(root);
    },

    /**
    * Cascades down the tree from this node, serializing its data
    * will be the args provided or the current node. If the function returns false at any point,
    * the cascade is stopped on that branch.
    * @param {Objct} Node
    * @param {Object} JSON
    * @param {Array} [args] The args to call the function with. Defaults to passing the current Node.
    */
    serializeNode: function (node, data) {
        var data = data || {},
            model = Ext.ModelManager.getModel(node.modelName),
            fields = model.getFields(),
            childNodes = node.childNodes,
            length = childNodes.length,
            f,
            i,
            name;
        
        // get persistable fields from the model to add to our persistance json
        for (f = 0; f < fields.length; f++) {
            if (model.prototype.isFieldPersistable(fields[f],node)) {
                name = fields[f].name;
                data[name] = node.data[name];
            }
        }

        if (length) {
            // process the child nodes recursively
            data.nodes = [];
            for (i = 0; i < length; i++) {
                data.nodes[i] = {};
                this.serializeNode(childNodes[i], data.nodes[i]);
            }
        }

        return data;
    },
    // need to do some data manipulation to get the tree data in a format that the tree store needs.
    // specifically adding expanded and leaf members;
    preProcessTreeData: function (data) {
        


        return data;

    },

    // loads full data object into the store
    setValue: function (data,focus) {
        var me = this;

        // make sure the root has expanded = true
        data.expanded = true;
        data = this.preProcessTreeData(data);

        //if (focus) {
        //    this.store.on('rootchange', function() {
        
                
        //        me.view.body.focus();
        //    }, me, {
        //        single: true,
        //        delay:100
        //});
        //}

        // remove all old selections before reloading the data; it can leave the selection model in a bad state
        //if (focus) {
        //    var selMod = me.getSelectionModel();
        //    var selectedRecord = selMod.getLastSelected();
        //    var selectedPath = (selectedRecord) ? selectedRecord.getPath() : "/root";
        //    this.getSelectionModel().deselectAll();
        //}

        var root = this.store.setRootNode(data);
        // if reselection is needed then reselect the root node for now.
        // todo try and maintain the path to the new
        
        if (focus) {
          //  this.getSelectionModel().select(root);
            //this.selectPath(selectedPath);
        }

        

    },

    validateExpression : function(categoryType) {
      

    },

    getExpressionText: function(jsonData, callback) {
        var me = this;

        /*function hasConditionNodes(node) {
            var childNodes = node.childNodes;

            if (childNodes.length < 1) { return false; }

            for (i = childNodes.length - 1; i >= 0; i--) {

                var childNode = childNodes[i];

                if (childNode.data.type === 'container') {
                    return hasConditionNodes(childNode);
                } else {
                    return true;
                }

            }

        }

        var hasNodes = hasConditionNodes(me.getRootNode());

        console.log(hasNodes)

        if( !hasNodes ) { return; }*/
        
        var config = {
            url: '/admin/app/category/validateexpression',
            method: 'POST',
            jsonData: jsonData,
            success: function (response) {

                var json = Ext.decode(response.responseText, true);

                if (!json || !json.success) {
                    var msg = (config.errorMsg) ? config.errorMsg : "Error";
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    this.setLoading(false);
                    return;
                }

                if (callback) {
                    callback.apply(me, [json.items.text]);
                }

                this.setLoading(false);
            },
            failure: function (response) {
                //Taco.app.viewPort.setLoading(false);
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : (config.errorMcallsg) ? config.errorMsg : "Error";

                Taco.app.fireEvent('setmessage', msg, 'error');
                this.setLoading(false);
            },
            scope: this
        };

        this.setLoading("Loading...");
        Ext.Ajax.request(config);
    },

    

    applyType: function(value) {
        this.fireEvent("needsvalidation",value);
        return value;

    },

    openCodeEditor: function (focusCmp) {
        var me = this;

        
        Ext.create('Taco.view.filter.EditCodeModal', {
            type:this.getType(),
            data: {
                tree: this.getValue(),
                text: "need to load this",
                type:this.getType()
            },
            listeners: {
                scope: me,
                aftersaveclose: function (win, data) {
                    //me.view.body.focus();
                    //var selMod = me.getSelectionModel();
                    //var selectedRecord = selMod.getLastSelected() || 0;
                    //var selectedPath = "/root";
                    //if (selectedRecord) {
                    //    selectedPath = selectedRecord.getPath();
                    //}

                    // dammit resetting the root node causes the selection model to get screwed up. 
                    // its always something when your trying to get keyboard nav to work. 
                    // grrr. to be continued....
                    // try replacing the roots child nodes instead of calling setRootNode and see if it helps.
                    var selMod = me.getSelectionModel();
                    selMod.deselectAll();
                    me.setValue(data, true);
                    
                    var rootNode = me.getRootNode();
                    selMod.select(rootNode);
                    selMod.refresh();

                },
                aftercancelclose: function (win) {
                    
                    if (focusCmp) {
                        focusCmp.focus();
                    } else {
                        this.refreshFocus();
                    }
                }
            }
        });
    },

    openEditor : function() {
        //Ext.create('Taco.view.filter.EditFilterModal');
    },

    openPreview: function(component, evt) {

        var me = this,
            treeData = this.getValue(),
            treeType = this.up('#taco-category-form').record.get('categoryType');

        Ext.create('Taco.view.preview.ExpressionPreviewDrawer', {
            expressionData: {
                tree: treeData,
                type: treeType
            },
            listeners: {
                scope: me,
                aftersaveclose: function(component, data) {
                    me.setValue(data.tree);
                }
            }
        });

    },

    /**
    * Do any class level cleanup. Destroy and null any scoped refs.     
    */
    onDestroy: function (destroy) {
        
        this.callParent(arguments);
    }
});