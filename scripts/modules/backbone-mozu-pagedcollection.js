define([
    "jquery",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu-model",
    "modules/api",
    'mappings/omsOrderToOrder'
], function ($, _, Hypr, Backbone, api, omsOrderToOrder) {

        var defaultPageSize = Hypr.getThemeSetting('defaultPageSize'),
            defaultSort = Hypr.getThemeSetting('defaultSort'),
            sorts = [
            {
                "text": Hypr.getLabel('default'),
                "value": defaultSort
            },
            {
                "text": Hypr.getLabel('sortByPriceAsc'),
                "value": "price asc"
            },
            {
                "text": Hypr.getLabel('sortByPriceDesc'),
                "value": "price desc"
            },
            {
                "text": Hypr.getLabel('sortByNameAsc'),
                "value": "productName asc"
            },
            {
                "text": Hypr.getLabel('sortByNameDesc'),
                "value": "productName desc"
            },
            {
                "text": Hypr.getLabel('sortByDateDesc'),
                "value": "createDate desc"
            },
            {
                "text": Hypr.getLabel('sortByDateAsc'),
                "value": "createDate asc"
            }
        ];

        var PagedCollection = Backbone.MozuPagedCollection = Backbone.MozuModel.extend({
            helpers: ['firstIndex', 'lastIndex', 'middlePageNumbers', 'hasPreviousPage', 'hasNextPage', 'currentPage', 'sorts', 'currentSort'],
            validation: {
                pageSize: { min: 1 },
                pageCount: { min: 1 },
                totalCount: { min: 0 },
                startIndex: { min: 0 }
            },
            dataTypes: {
                pageSize: Backbone.MozuModel.DataTypes.Int,
                pageCount: Backbone.MozuModel.DataTypes.Int,
                startIndex: Backbone.MozuModel.DataTypes.Int,
                totalCount: Backbone.MozuModel.DataTypes.Int
            },
            defaultSort: defaultSort,

            _isPaged: true,

            getQueryParams: function() {
                var self = this, lrClone = _.clone(this.lastRequest);
                _.each(lrClone, function(v, p) {
                    if (self.baseRequestParams && (p in self.baseRequestParams)) delete lrClone[p];
                });
                if (parseInt(lrClone.pageSize, 10) === defaultPageSize) delete lrClone.pageSize;

                var startIndex = this.get('startIndex');
                if (startIndex) lrClone.startIndex = startIndex;
                return lrClone;
            },

            getQueryString: function() {
                var params = this.getQueryParams();
                if (!params || _.isEmpty(params)) return "";
                return "?" + $.param(params)
                              .replace(/\+/g, ' ');
            },

            buildRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                    pageSize = this.get("pageSize"),
                    startIndex = this.get("startIndex"),
                    sortBy = $.deparam().sortBy || this.currentSort() || defaultSort;
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (sortBy) conf.sortBy = sortBy;
                return conf;
            },

            previousPage: function() {
                try {
                    var self = this;
                    var type = self.apiModel.type;
                    var customer = require.mozuData('customer');
                    var newPage;
                    if (type === 'orders' && customer) {
                        var body = {
                            page: self.get('page') - 1,
                            perPage: self.get('pageSize'),
                            sortBy: '-orderDate'
                        };
                        newPage = api.request('POST', 'oms/omsOrders', body);
                    } else {
                    return this.apiModel.prevPage(this.lastRequest);
                    }
                    return newPage.then(function (data) {
                        self._isSyncing = true;
                        if (type === 'orders') {
                            data.items = _.map(data.collection, function (item) {
                                return omsOrderToOrder(item);
                            });
                            data.startIndex = (data.page - 1) * data.perPage;
                            data.pageSize = data.perPage;
                            data.pageCount =  Math.ceil(data.totalCount / data.perPage);
                            delete data.collection;
                        }
                        self.set(data);
                        self._isSyncing = false;
                        self.trigger('sync', data);
                    }), newPage;
                } catch (e) { }
            },

            nextPage: function() {
                try {
                    var self = this;
                    var type = self.apiModel.type;
                    var customer = require.mozuData('customer');
                    var newPage;
                    if (type === 'orders' && customer) {
                        var body = {
                            page: self.get('page') + 1,
                            perPage: self.get('pageSize'),
                            sortBy: '-orderDate'
                        };
                        newPage = api.request('POST', 'oms/omsOrders', body);
                    }  else {
                    return this.apiModel.nextPage(this.lastRequest);
                    }
                    return newPage.then(function (data) {
                        self._isSyncing = true;
                        if (type === 'orders') {
                            data.items = _.map(data.collection, function (item) {
                                return omsOrderToOrder(item);
                            });
                            data.startIndex = (data.page - 1) * data.perPage;
                            data.pageSize = data.perPage;
                            data.pageCount =  Math.ceil(data.totalCount / data.perPage);
                            delete data.collection;
                        }
                        self.set(data);
                        self._isSyncing = false;
                        self.trigger('sync', data);
                    }), newPage;
                } catch (e) { }
            },

            syncIndex: function (currentUriFragment) {
                try {
                    var uriStartIndex = parseInt(($.deparam(currentUriFragment).startIndex || 0), 10);
                    if (!isNaN(uriStartIndex) && uriStartIndex !== this.apiModel.getIndex()) {
                        this.lastRequest.startIndex = uriStartIndex;
                        return this.apiModel.setIndex(uriStartIndex, this.lastRequest);
                    }
                } catch (e) { }
            },

            setPage: function(num) {
                    var self = this;
                    var page = parseInt(num, 10);
                    var type = self.apiModel.type;
                    var customer = require.mozuData('customer');
                    var newPage;
                    if (type === 'orders' && customer) {
                        var body = {
                            page: page,
                            perPage: self.get('pageSize'),
                            sortBy: '-orderDate'
                        };
                        newPage = api.request('POST', 'oms/omsOrders', body);
                    } else {
                        return this.apiModel.setIndex((num - 1) * parseInt(this.get('pageSize'), 10), this.lastRequest);
                    }
                    return newPage.then(function (data) {
                        self._isSyncing = true;
                        if (type === 'orders') {
                            data.items = _.map(data.collection, function(item){
                                return omsOrderToOrder(item);
                            });
                            data.startIndex = (data.page - 1) * data.perPage;
                            data.pageSize = data.perPage;
                            data.pageCount =  Math.ceil(data.totalCount / data.perPage);
                            delete data.collection;
                        }
                        self.set(data);
                        self._isSyncing = false;
                        self.trigger('sync', data);
                    }), newPage;
            },

            changePageSize: function() {
                var newPageSize = this.get('pageSize');
                var self = this;
                var type = self.apiModel.type;
                var newPage;
                var customer = require.mozuData('customer');
                if (type === 'orders' && customer) {
                    var body = {
                        page: 0,
                        perPage: newPageSize,
                        sortBy: '-orderDate'
                    };
                    newPage = api.request('POST', 'oms/omsOrders', body);
                } else {
                return this.apiGet($.extend(this.lastRequest, { pageSize: this.get('pageSize') }));
                }
                return newPage.then(function (data) {
                    self._isSyncing = true;
                    if (type === 'orders') {
                        data.items = _.map(data.collection, function (item) {
                            return omsOrderToOrder(item);
                        });
                        data.startIndex = (data.page - 1) * data.perPage;
                        data.pageSize = data.perPage;
                        data.pageCount =  Math.ceil(data.totalCount / data.perPage);
                        delete data.collection;
                    }
                    self.set(data);
                    self._isSyncing = false;
                    self.trigger('sync', data);
                });
            },

            firstIndex: function() {
                return this.get("startIndex") + 1;
            },

            lastIndex: function() {
                return this.get("startIndex") + this.get("items").length;
            },

            hasPreviousPage: function() {
                return this.get("startIndex") > 0;
            },

            hasNextPage: function() {
                return this.lastIndex() < this.get("totalCount");
            },

            currentPage: function() {
                return Math.ceil(this.firstIndex() / (this.get('pageSize') || 1));
            },

            middlePageNumbers: function() {
                var current = this.currentPage(),
                    ret = [],
                    pageCount = this.get('pageCount'),
                    i = Math.max(Math.min(current - 2, pageCount - 4), 2),
                    last = Math.min(i + 5, pageCount);
                while (i < last) ret.push(i++);
                return ret;
            },

            sorts: function() {
                return sorts;
            },

            currentSort: function() {
                return (this.lastRequest && this.lastRequest.sortBy && decodeURIComponent(this.lastRequest.sortBy).replace(/\+/g, ' ')) || '';
            },

            sortBy: function(sortString) {
                return this.apiGet($.extend(this.lastRequest, { sortBy: sortString }));
            },
            initialize: function() {
                this.lastRequest = this.buildRequest();
            }
        });


        return Backbone;
});
