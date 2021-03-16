define(["modules/jquery-mozu", 'modules/api', "underscore", "hyprlive", "modules/backbone-mozu", "hyprlivecontext", 'modules/mozu-grid/mozugrid-view', 'modules/mozu-grid/mozugrid-pagedCollection', "modules/views-paging", 'modules/editable-view', 'modules/models-customer', 'modules/models-b2b-account', 'pages/myaccount'], function ($, api, _, Hypr, Backbone, HyprLiveContext, MozuGrid, MozuGridCollection, PagingViews, EditableView, CustomerModels, B2BAccountModels, MyAccount) {
    var DEFAULT_RETURN_FILTER = '';
    var USER_RETURN_FILTER = 'userId eq ' + require.mozuData('user').userId;

    var ReturnsMozuGrid = MozuGrid.extend({
        render: function () {
            var self = this;
            this.populateWithUsers();
            MozuGrid.prototype.render.apply(self, arguments);
        },
        populateWithUsers: function () {
            var self = this;
            self.model.get('items').models.forEach(function (rtn) {
                var userInQuestion = window.b2bUsers.find(function (user) {
                    return (user.userId === rtn.get('userId'));
                });
                rtn.set('fullName', userInQuestion.firstName + ' ' + userInQuestion.lastName);
            });
            return self.model;
        }
    });
    var ReturnsView = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/returns/returns",
        render: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var collection = new ReturnsGridViewCollectionModel({ autoload: true });
            this.initializeGrid(collection);
        },
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
            this.model.set('viewingAllReturns', false);
        },
        initializeGrid: function (collection) {
            var self = this;
            if (!self.model.get('viewingAllReturns')) {
                collection.filterBy(USER_RETURN_FILTER);
            }
            self._returnsGridView = new ReturnsMozuGrid({
                el: $('.mz-b2b-returns-grid'),
                model: collection
            });
            self._returnsGridView.listenTo(self._returnsGridView.model, 'viewReturn', self.viewReturn.bind(self));
        },
        printReturnLabel: function (e) {
            var self = this,
                $target = $(e.currentTarget);

            //Get Whatever Info we need to our shipping label
            var returnId = $target.data('mzReturnid'),
                returnObj = self.model.get('currentReturn');

            var _totalRequestCompleted = 0;

            window.accountModel.apiGetFulfillmentReturnLabel({
                'returnId': returnId
            }).then(function (data) {
                returnObj.set('labelImageSrc', data.imageURL);
                var returnModel = new Backbone.MozuModel(returnObj);
                var printReturnLabelView = new MyAccount.ReturnPrintLabelView({
                    el: $('#mz-printReturnLabelView'),
                    model: returnModel
                });
                printReturnLabelView.render();
                printReturnLabelView.loadPrintWindow();
            });

        },
        toggleViewAllReturns: function (e) {
            var self = this;
            self._returnsGridView.model.setPage(1);
            if (e.currentTarget.checked) {
                self.model.set('viewingAllReturns', true);
                self._returnsGridView.model.filterBy(DEFAULT_RETURN_FILTER);
            } else {
                self.model.set('viewingAllReturns', false);
                self._returnsGridView.model.filterBy(USER_RETURN_FILTER);
            }
            //self.render();
        },
        viewReturn: function (row) {
            this.model.set('viewReturn', true);
            this.model.set('currentReturn', row.toJSON());
            this.render();
        },
        returnToGrid: function () {
            this.model.set('viewReturn', false);
            this.render();
        }
    });

    var ReturnsGridViewCollectionModel = MozuGridCollection.extend({
        mozuType: 'rmas',
        defaultSort: 'createDate desc',
        columns: [
            {
                index: 'returnNumber',
                displayName: 'Return ID',
                sortable: true
            },
            {
                index: 'originalOrderNumber',
                displayName: 'Order ID',
                sortable: true
            },
            {
                index: 'auditInfo',
                displayName: 'Submitted Date',
                sortable: true,
                displayTemplate: function (auditInfo) {
                    var date = new Date(auditInfo.createDate);
                    return date.toLocaleDateString();
                }
            },
            {
                index: 'fullName',
                displayName: 'Created By',
                sortable: false,
                displayTemplate: function (fullName) {
                    return fullName || '';
                }
            },
            {
                index: 'status',
                displayName: 'Return Status',
                sortable: false
            }
        ],
        rowActions: [
            {
                displayName: 'View',
                action: 'viewReturn'
            }
        ],
        relations: {
            items: Backbone.Collection.extend({})
        },
        viewReturn: function (e, row) {
            this.trigger('viewReturn', row);
        },
        backToGrid: function () {
            this.set('viewReturn', false);
        }
    });

    return {
        'ReturnsView': ReturnsView
    };

});
