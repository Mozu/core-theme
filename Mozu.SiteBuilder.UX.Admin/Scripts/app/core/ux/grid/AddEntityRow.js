/**
 * @class Taco.core.ux.grid.AddEntityRow
 * @author 
 * Adds a row to the top or bottom of a grid that is used to create a new entity in the associated store;
 */

Ext.define('Taco.core.ux.grid.AddEntityRow', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.taco.addentityrow',

    // if the row is docked it won't sroll with the grid rows;
    rowDocked: false,
    // where to insert the add entity row; top or bottom
    rowPosition: "top", // possible values: "bottom", "top" 

    newCellTpl: [
        '{%',
            //'values.view.rowBodyFeature.setupRowData(values.record, values.recordIndex, values);',            
            ' if (values.record.phantom){',            
            ' }',
            ' if (!values.record.isAddEntityRow) this.nextTpl.applyOut(values, out, parent);',

        '%}',
        
        '<tpl if="values.record.isAddEntityRow">',            
            '<td colspan="3" role="gridcell" class="x-grid-cell x-grid-td x-grid-cell-first x-unselectable">',
                //'<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}"',
                    //'style="text-align:{align};<tpl if="style">{style}</tpl>" {ariaCellInnerAttr}>adsf{value}</div>',
                    '<div unselectable="on" class="x-grid-cell-inner " style="text-align:left;">Add New</div>',
            '</td>',
        '</tpl>',
        
        {
            priority: 100
        }
    ],

    newRowTpl: [
        '{%',
            //'values.view.rowBodyFeature.setupRowData(values.record, values.recordIndex, values);',            
            'if (!values.record.isAddEntityRow) this.nextTpl.applyOut(values, out, parent);',
            //'this.nextTpl.applyOut(values, out, parent);',
            
        '%}',
        
        '<tpl if="values.record.isAddEntityRow">',

            '{%',
                'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
            '%}',
            '<tr {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
                'data-boundView="{view.id}" ',
                'data-recordId="{record.internalId}" ',
                'data-recordIndex="{recordIndex}" ',
                'class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
                '{rowAttr:attributes} tabIndex="-1" {ariaRowAttr}>',
                
                    '<td colspan="{columns.length}" role="gridcell" class="x-grid-cell x-grid-td x-grid-cell-first x-unselectable" style="border:1px solid red;">',
                        //'<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}"',
                            //'style="text-align:{align};<tpl if="style">{style}</tpl>" {ariaCellInnerAttr}>adsf{value}</div>',
                            '<div unselectable="on" class="x-grid-cell-inner " style="text-align:left;">Add New</div>',
                    '</td>',
                /*
                '<tpl for="columns">' +
                    '{%',
                        'parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)',
                     '%}',
                '</tpl>',
                    */

            '</tr>',

        '</tpl>',
        {
            priority: 100
        }
    ],



    init: function (grid) {
        
        var me = this,
            view = me.view,
            index = 0,
            rowPosition = this.rowPosition,
            isRowEditable = false;

        if (me.grid.plugins) {
            isRowEditable = Ext.Array.findBy(me.grid.plugins, function (plugin) {
                return plugin.$className == "Ext.grid.plugin.RowEditing"
            })
        }

        // this feature only works when row editing is enabled;
        if (!isRowEditable) {
            return
        }

        me.view.addEntityRowFeature = me;
        var store = grid.store;


        // need to see if the row editor plugin was added to the grid;
        


        
        
        /*
        me.view.cellTpl = new Ext.XTemplate([
            '<td class="{tdCls}" {tdAttr} {[Ext.aria ? "id=\\"" + Ext.id() + "\\"" : ""]} {ariaCellAttr}>',
            '<div {unselectableAttr} class="' + Ext.baseCSSPrefix + 'grid-cell-inner {innerCls}"',
                'style="text-align:{align};<tpl if="style">{style}</tpl>" {ariaCellInnerAttr}>',
                '{% if (values.record.isAddEntityRow){;} %}',
                '<tpl if="value==\'&nbsp;\'">',
                'aaaa',
                '</tpl>',
                '{value}</div>',
            '</td>', {
                priority: 0
            }
        ]);
        */

        /*
        //http://astrada.github.io/ocaml-extjs/doc/Ext_grid_feature_Feature.html
        // the rowTpl  data looks like this:
        {
            view:        owningTableView,
            record:      recordToRender,
            recordIndex: indexOfRecordInStore,
            columns:     arrayOfColumnDefinitions,
            itemClasses: arrayOfClassNames, // For outermost row in case of wrapping
            rowClasses:  arrayOfClassNames,  // For internal data bearing row in case of wrapping
            rowStyle:    styleString
        }

        */

        view.addRowTpl(Ext.XTemplate.getTpl(this, 'newRowTpl'));
        //view.addCellTpl(Ext.XTemplate.getTpl(this, 'newCellTpl'));

        /*
        me.view.addRowTpl(
            [
                '{%',
                    'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
                '%}',
                '<tr {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
                    'data-boundView="{view.id}" ',
                    'data-recordId="{record.internalId}" ',
                    'data-recordIndex="{recordIndex}" ',
                    'class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
                    '{rowAttr:attributes} tabIndex="-1" {ariaRowAttr}>',
                    
                    '<tpl if="values.record.isAddEntityRow">',
                        '<td colspan="3">add new</td>',
                    '<tpl else>',
                        '<tpl for="columns">' +
                            '{%',
                                'parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)',
                             '%}',
                        '</tpl>',
                    '</tpl>',
                '</tr>',
                {
                    priority: 100
                }
            ]
        ));
        */
        

        /*
        me.view.addRowTpl(
            [
                '{%',
                    'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
                '%}',
                '<tr {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
                    'data-boundView="{view.id}" ',
                    'data-recordId="{record.internalId}" ',
                    'data-recordIndex="{recordIndex}" ',
                    'class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
                    '{rowAttr:attributes} tabIndex="-1" {ariaRowAttr}>',
                    
                    '<tpl if="values.record.isAddEntityRow">',
                        '<td colspan="3">add new</td>',
                    '<tpl else>',
                        '<tpl for="columns">' +
                            '{%',
                                'parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)',
                             '%}',
                        '</tpl>',
                    '</tpl>',
                '</tr>',
                {
                    priority: 100
                }
            ]
        ));
        */


        /*
        me.view.addTpl({
            before: function (values, out) {
                var view = values.view,
                    rowValues = view.rowValues;

                this.rowBody.setup(values.rows, rowValues);
            },
            priority:100
        })
        */

        
        

        store.on({
            load: function () {
                var index = 0;
                
                if (rowPosition == "bottom") {
                    index = store.getCount();
                }
                
                
                var addRow = store.model.create()
                //leave the record in place when the user cancel's the edit
                addRow.leaveOnCancel = true;
                addRow.isAddEntityRow = true;

                store.insert(index, addRow);
                //rowEditing.startEdit(0, 0);


            }
        });

        grid.on({
            beforerender: function () {
                /*
                var tableCls = [me.summaryTableCls];
                if (view.columnLines) {
                    tableCls[tableCls.length] = view.ownerCt.colLinesCls;
                }
                me.summaryBar = grid.addDocked({
                    childEls: ['innerCt'],
                    renderTpl: [
                        '<div id="{id}-innerCt" role="presentation">',
                            '<table cellPadding="0" cellSpacing="0" class="' + tableCls.join(' ') + '">',
                                '<tr class="' + me.summaryRowCls + '"></tr>',
                            '</table>',
                        '</div>'
                    ],
                    style: 'overflow:hidden',
                    itemId: 'summaryBar',
                    cls: [me.dockedSummaryCls, me.dockedSummaryCls + '-' + me.dock],
                    xtype: 'component',
                    dock: me.dock,
                    weight: 10000000
                })[0];
                */
                
            },
            afterrender: function () {
                /*
                grid.body.addCls(me.panelBodyCls + me.dock);
                view.mon(view.el, {
                    scroll: me.onViewScroll,
                    scope: me
                });
                me.onStoreUpdate();
                */
                
            },
            single: true
        });

    }
});