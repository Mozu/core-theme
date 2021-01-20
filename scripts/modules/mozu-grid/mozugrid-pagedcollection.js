define(["underscore", "modules/backbone-mozu"], function ( _, Backbone) {
var sortAction = [];
var MozuGridPagedCollection = Backbone.MozuPagedCollection.extend({
    mozuType: 'search',
    defaults: {
        autoload: true,
        pageSize: 5,
        startIndex: 0
    },
    helpers: ['gridItems', 'columnNames'],
    //These are test columns and should be set when The collection is used
    columns: [
        // {
        //     index: 'productCode',
        //     displayName: 'Product Code',
        //     sortable: true
        // },
        // {
        //     index: 'productName',
        //     displayName: 'Product Name',
        //     sortable: true
        // },
        // {
        //     index: 'price.price',
        //     displayName: 'Price',
        //     displayTemplate: function(price) {
        //         return '$' + price;
        //     },
        //     sortable: false
        // }
    ],
    rowActions: [
        // {
        //     displayName: 'Edit',
        //     action: 'someAction'
        // }
    ],
    apiGridRead: false,
    sort: function(index){
        var col = _.findWhere(this.get('columns'), { index: index });
        if (col && col.sortable) {
            var currentSort = this.currentSort();
            var currentIndex = null;
            var currentDirection = null;
            var sortDirection = "asc"; // Default sort direction
            if (currentSort) {
                var split = currentSort.split(" ");
                currentIndex = split[0];
                currentDirection = split[1];
            }
            // Sort column changed. Handles unsorted case as well.
            if (index !== currentIndex) {
                // Sort ascending by default
                this.sortBy(index + " " + sortDirection);
                return;
            }
            // Sort column did not change. Update sort direction.
            // Order: asc => desc => unsorted
            if (currentDirection === "asc") {
                sortDirection = "desc";
            } else if (currentDirection === "desc") {
                sortDirection = null; // Unsorted
            }
            // Remove sort if unsorted
            if (sortDirection === null) {
                this.sortBy(null);
                return;
            }
            this.sortBy(index + ' ' + sortDirection);
        }
    },
    refreshGrid: function(){
        this.setIndex(this.get('startIndex'));
        this.trigger('render');
    },
    gridItems: function(){
        var self = this;
        var items = [];
        if(self.columns && self.get('items').length) {
            self.get('items').each(function(item){
                var row = [];
                _.each(self.columns, function(col) {
                    var value = item.get(col.index);
                    if(col.displayTemplate){
                        value = col.displayTemplate(value);
                    }
                    row.push(value);
                });
                items.push(row);
            });
        }
        return items;
    },
    columnNames: function(){
        var self = this;
        var columns = [];
        if (self.columns){
            _.each(self.columns, function (col) {
                var hidden = (typeof col.isHidden === "function") ? col.isHidden() : col.isHidden;
                if (!hidden){
                    columns.push(col.displayName);
                }
            });
        }
        return columns;
    },
    toJSON: function(){
        var self = this;
        var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
        _.each(j.rowActions, function (row, idx) {
            var isHidden = self.get('rowActions')[idx].isHidden;
            row.isHidden = (typeof isHidden === "function") ? isHidden.apply(self) : isHidden || false;
        });
        return j;
    },
    initialize: function () {
        var me = this;
        Backbone.MozuPagedCollection.prototype.initialize.apply(this, arguments);
        
        if (this.columns) {
            this.set('columns', this.columns);
            this.set('rowActions', this.rowActions);
        }
        // this.apiModel = this.get('apiModel');



        // this.on('sync', function () {
        //     me.trigger('facetchange', me.getQueryString());
        // });
    }
});

return MozuGridPagedCollection;

});
