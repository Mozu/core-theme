/**
 * @class Taco.view.order.widget.DiscountRowBody
 */
Ext.define('Taco.view.order.widget.DiscountRowBody', {
    extend: 'Ext.grid.feature.RowBody',   
    alias: "feature.discountrowbody",
    config: {
    

    },
    
    // This is the plugin for displaying product specific discounts (product and shipping)
    // todo: move this to a seperate class.
    // need to add support for discount suppression and activation

    
    //rowBodyTrCls: "x-grid-row-adjustment x-grid-row x-grid-data-row x-grid-rowbody-tr",
    rowBodyTrCls: "x-grid-row-adjustment x-grid-row x-grid-rowbody-tr",
    rowBodyDivCls: "x-grid-cell-inner adjustment-cell-inner",
    rowBodyTdCls: "adjustment-cell x-grid-cell x-grid-td x-unselectable ",

    init: function (grid){
        var me = this,
            view = me.view;

        me.callParent(arguments);

        // need to put this back in since the rowBody feature doesn't call onMouseDown when there is a rowwrap fetaure;
        if (view.findFeature('rowwrap')) {
            grid.mon(view, {
                element: 'el',
                mousedown: me.onMouseDown,
                scope: me
            });
        }
    },

    onMouseDown: function (e) {
        var me = this;       
                        
        var validTrigger = null;
        
        if (Ext.fly(e.target).hasCls("order-action-icon")) {
            // click on div.
            validTrigger = Ext.fly(e.target);
        } else {
            return;
        }

        if (me.grid.editMode && validTrigger) {

            //var tableRow = e.getTarget(me.eventSelector);
            var discountId = validTrigger.getAttribute("discountId"),
                isActive = validTrigger.getAttribute("isActive"),
                orderItemId = validTrigger.getAttribute("orderItemId");
            
            if (!discountId) { return }
            
            if (isActive=="true") {
                me.grid.suppressDiscount({
                    jsonData: {
                        discountId: discountId,
                        orderItemId: orderItemId
                    }
                });
            } else {
                me.grid.activateDiscount({
                    jsonData : {
                        discountId: discountId,
                        orderItemId: orderItemId
                    }
                });
            };

            // If we have mousedowned on a row body TR and its previous sibling is a grid row, pass that onto the view for processing
            /*
            if (tableRow && Ext.fly(tableRow = tableRow.previousSibling).is(me.view.getItemSelector())) {
                e.target = tableRow;
                me.view.handleEvent(e);
            }
            */

        }
    },
    getAdditionalData: function (data, rowIndex, record, orig) {
        
        var discounts = record.get("discounts"),
            orderItemId = record.get("id"),
            shippingDiscounts = record.get("shippingDiscounts"),
            rowBodyCls = ( (discounts && discounts.length) || (shippingDiscounts && shippingDiscounts.length)) ? "hasDiscount" : "noDiscount",
            rowBodyData = {
                orderItemId:orderItemId,
                discounts: record.get("discounts"),
                shippingDiscounts: record.get("shippingDiscounts")
            },
            headerCt = this.view.headerCt,
            colspan = headerCt.getColumnCount();

                        
        var rowBodyTemplate = new Ext.XTemplate(this.getRowBody());
        var rowBoxyTxt = rowBodyTemplate.apply(rowBodyData);

        return {
            rowBody: rowBoxyTxt,
            rowTotalColumnWidth: this.grid.rowTotalColumnWidth,
            actionColumnWidth: this.grid.actionColumnWidth,
            rowBodyCls : (discounts.length || shippingDiscounts.length) ? "hasDiscount" : "noDiscount",
            rowBodyColspan: colspan
        };
    },
                    
    extraRowTpl: [
        '{%',
            'values.view.rowBodyFeature.setupRowData(values.record, values.recordIndex, values);',
            'this.nextTpl.applyOut(values, out, parent);',
        '%}',

        '{rowBody}'
                        
        //,
                    
        // removing the original code of the plugin so that I can control the entire dom structure.
        //'<tr class="' + Ext.baseCSSPrefix + 'grid-rowbody-tr {rowBodyCls}">',
        //    '<td class="' + Ext.baseCSSPrefix + 'grid-cell-rowbody' + '" colspan="{rowBodyColspan}">',
        //        '<div class="' + Ext.baseCSSPrefix + 'grid-rowbody' + ' {rowBodyDivCls}">{rowBody}</div>',
        //    '</td>',
        //'</tr>',
        /*
        {
            priority: 100,

            syncRowHeights: function (firstRow, secondRow) {
                var owner = this.owner,
                    firstRowBody = Ext.fly(firstRow).down(owner.eventSelector, true),
                    secondRowBody,
                    firstHeight, secondHeight;

                // Sync the heights of row body elements in each row if they need it.
                if (firstRowBody && (secondRowBody = Ext.fly(secondRow).down(owner.eventSelector, true))) {
                    if ((firstHeight = firstRowBody.offsetHeight) > (secondHeight = secondRowBody.offsetHeight)) {
                        Ext.fly(secondRowBody).setHeight(firstHeight);
                    }
                    else if (secondHeight > firstHeight) {
                        Ext.fly(firstRowBody).setHeight(secondHeight);
                    }
                }
            },

            syncContent: function (destRow, sourceRow) {
                var owner = this.owner,
                    destRowBody = Ext.fly(destRow).down(owner.eventSelector, true),
                    sourceRowBody;

                // Sync the heights of row body elements in each row if they need it.
                if (destRowBody && (sourceRowBody = Ext.fly(sourceRow).down(owner.eventSelector, true))) {
                    Ext.fly(destRowBody).syncContent(sourceRowBody);
                }
            }
           
        } */
    ],
                    
                    

    getRowBody: function (values) {
        
        return [
            '<tpl for="discounts">',
                '<tr role="row" class="' + this.rowBodyTrCls + ' {rowBodyCls} ',
                    '<tpl if="isActive">',
                        ' isActive ',
                    '<tpl else>',
                        ' isSuppressed ',
                    '</tpl>',
                '" tabindex="-1">',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    '<div class="' + this.rowBodyDivCls + '">Discount: {description}</div>',
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                   
                    '<div style="text-align: right;" class="adjustment-cell-inner-value ' + this.rowBodyDivCls + '"></div>',
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    //'<div style="text-align: right;" class="' + this.rowBodyDivCls + '">{quantity}</div>',
                    '<div style="text-align: right;" class="' + this.rowBodyDivCls + '"></div>',
                '</td>',
                '<td role="gridcell"  class="' + this.rowBodyTdCls + '">',
                    '<div style="text-align: right;" class="adjustment-cell-inner-value ' + this.rowBodyDivCls + '">({[Taco.app.context.getCurrent().formatCurrency(values.total)]})</div>',
                '</td>',
                '<td role="gridcell"  class="x-action-col-cell taco-menu-col-cell x-action-col-cell' + this.rowBodyTdCls + '">',
                    
                    //'<div unselectable="on" class="x-grid-cell-inner x-grid-cell-inner-action-col" style="text-align:left;">',
                    //    '<div roles="button" alt="" class="x-action-col-icon x-action-col-0   taco-grid-row-action-trigger taco-grid-row-action-trigger-remove"></div>',
                    //'</div>',
                        
                    '<div unselectable="on" class="x-grid-cell-inner x-grid-cell-inner-action-col">',
                    '<div unselectable="on" class="order-action-icon discount-',
                        '<tpl if="isActive">',
                            'suppress ',
                        '<tpl else>',
                            'activate ',
                        '</tpl>', 
                        '" isActive="{isActive}" discountId="{discountId}"  orderItemId="{parent.orderItemId}"></div>',
                    '</div>',
                '</td>',
                '</tr>',
            '</tpl>', 
            '<tpl for="shippingDiscounts">',
                '<tr role="row" class="' + this.rowBodyTrCls + ' {rowBodyCls}" tabindex="-1">',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    '<div class="' + this.rowBodyDivCls + '">Shipping Discount: {description}</div>',
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',

                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    '<div style="text-align: right;" class="adjustment-cell-inner-value ' + this.rowBodyDivCls + '">({[Taco.app.context.getCurrent().formatCurrency(values.unitPrice)]})</div>',
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    '<div style="text-align: right;" class="' + this.rowBodyDivCls + '">{quantity}</div>',
                '</td>',
                '<td role="gridcell" class="' + this.rowBodyTdCls + '">',
                    '<div style="text-align: right;" class="adjustment-cell-inner-value ' + this.rowBodyDivCls + '">({[Taco.app.context.getCurrent().formatCurrency(values.total)]})</div>',
                '</td>',
                '<td role="gridcell"  class="x-action-col-cell taco-menu-col-cell x-action-col-cell' + this.rowBodyTdCls + '">',
                    '<div unselectable="on" class="x-grid-cell-inner x-grid-cell-inner-action-col">',
                    '<div unselectable="on" class="order-action-icon discount-',
                        '<tpl if="isActive">',
                            'suppress ',
                        '<tpl else>',
                            'activate ',
                        '</tpl>',
                        '" isActive="{isActive}" discountId="{discountId}"  orderItemId="{parent.orderItemId}"></div>',
                    '</div>',
                '</td>',
                '</tr>',
            '</tpl>'
        ].join('');
    }    
});