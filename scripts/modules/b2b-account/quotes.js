define([
    "modules/jquery-mozu",
    'modules/api',
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "hyprlivecontext",
    "modules/models-customer",
    "modules/models-cart",
    "modules/models-b2b-account",
    "modules/product-picker/product-modal-view",
    "modules/product-picker/product-picker-view",
    "modules/models-product",
    "modules/b2b-account/wishlists",
    'modules/mozu-quotes-grid/mozuquotesgrid-view',
    'modules/mozu-grid/mozugrid-pagedCollection',
    "modules/views-paging",
    'modules/editable-view',
    "modules/models-quotes"], 
    function ($, api, _, Hypr, Backbone, HyprLiveContext,
    CustomerModels, CartModels, B2BAccountModels, ProductModalViews,
    ProductPicker, ProductModels, WishlistModels, MozuGrid, MozuGridCollection,
    PagingViews, EditableView, QuoteModels) {
        var nameFilter = "name cont ";
        var expirationDateFilter  = "expirationdate ge ";
        var timeComponent = "T00:00:00z";
        var filterstring = "";
        var timeout = null;

        var isSalesRep = require.mozuData('user').isSalesRep;
        var accountDict = {};
        var uniqueAccountId = [];
    var QuotesMozuGrid = MozuGrid.extend({
        render: function () {
            var self = this;
            if (isSalesRep)
            {
                this.populateWithB2BAccounts();
            }
            else
            {
                MozuGrid.prototype.render.apply(self, arguments);
            }
        },
        populateWithB2BAccounts: function () {
            var self = this;
            var callLength = self.model.get('items').length;
            var setterCount = 0;
            var count = 0;
            var accIdsArray = [];

            //Get all Account Ids
            self.model.get('items').models.forEach(function (quote) {
                var accId = quote.get('customerAccountId');
                accIdsArray.push(accId);
            });

            //Filter unique Account Id and push to uniqueAccountId array
            this.unique(accIdsArray);

            //Fetch Data for Unique Account Ids and set account name
            uniqueAccountId.forEach(function (ele) {
                var acctName = accountDict[ele];
                if (acctName) {
                    count++;
                    if (uniqueAccountId.length === count) {
                        self.model.get('items').models.forEach(function (quote) {
                            var accountName = accountDict[quote.get('customerAccountId')];
                            if (accountName) {
                                quote.set('accountName', accountName);
                            }
                            setterCount++;
                            if (callLength === setterCount) {
                                MozuGrid.prototype.render.apply(self, arguments);
                            }
                        });
                    }
                }
                else {
                    var b2bAccount = new B2BAccountModels.b2bAccount({ id: ele });
                    b2bAccount.apiGet().then(function (account) {
                        count++;
                        accountDict[ele] = account.data.companyOrOrganization;
                        if (uniqueAccountId.length === count) {
                            self.model.get('items').models.forEach(function (quote) {
                                var accountName = accountDict[quote.get('customerAccountId')];
                                if (accountName) {
                                    quote.set('accountName', accountName);
                                }
                                setterCount++;
                                if (callLength === setterCount) {
                                    MozuGrid.prototype.render.apply(self, arguments);
                                }
                            });
                        }
                    });
                }
            });

            if (accIdsArray.length === 0) {
                MozuGrid.prototype.render.apply(self, arguments);
            }
            return self.model;
        },
        unique: function (array) {
            array.forEach(function (i) {
                if (uniqueAccountId.indexOf(i) === -1)
                    uniqueAccountId.push(i);
            });
        }
    });

    var QuotesView = Backbone.MozuView.extend({
        templateName: "modules/b2b-account/quotes/quotes",
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var viewB2BAccount = self.model.attributes.viewB2BAccount;
            var collection;
            if (viewB2BAccount) {
                collection = new B2BViewAccountQuotesGridCollectionModel({ autoload: true });
            }
            else {
                collection = new QuotesGridCollectionModel({ autoload: true });
            }
            if (isSalesRep) {
                if (!self.model.get("b2bAccounts")) {
                    var b2bAccount = new B2BAccountModels.b2bAccounts({ pageSize: 200 });
                    b2bAccount.apiGet().then(function (accounts) {
                        self.model.set("b2bAccounts", accounts);
                        self.render();
                    });
                }
            }

            $('[data-mz-action="applyfilter"]').on('keyup input', function(e) {
                e.preventDefault();
                clearTimeout(timeout);
                var dateValue = "";
                var nameValue = $(this).val();
                if ($("#expirationdate").val() !== "")
                {
                    dateValue  = $("#expirationdate").val();
                }
                timeout = setTimeout(function () {
                    self.filterGrid(nameValue, dateValue, collection);
                }, 400);
            });
            $('[data-mz-action="applyDatefilter"]').on('change', function(e) {
                e.preventDefault();
                var nameValue ="";
                if ($("#searchName").val()!=="")
                {
                    nameValue  = $("#searchName").val();
                }
                var dateValue =  $(this).val();
                self.filterGrid(nameValue, dateValue, collection);
            });
            
            this.initializeGrid(collection);
        },
        filterGrid: function (nameValue, dateValue, collection) {
            filterstring = "";
            if (nameValue !== "") {
                nameValue = nameFilter + nameValue;
                filterstring = nameValue;
                if (dateValue !== "") {
                    dateValue = expirationDateFilter + dateValue + timeComponent;
                    filterstring = filterstring + " and " + dateValue;
                }
                collection.filterBy(filterstring);
            }
            else if (dateValue !== "") {
                filterstring = expirationDateFilter + dateValue + timeComponent;
                collection.filterBy(filterstring);
            } else if (nameValue === "") {
                collection.filterBy("");
            }
        },
        initializeGrid: function (collection) {
            var self = this;
            self._quotesGridView = new QuotesMozuGrid({
                el: $('.mz-b2b-quotes-grid'),
                model: collection
            });
        },
        registerRowActions: function () {
            var self = this;
            var rowActions = this.model.get('rowActions');
            _.each(rowActions, function (action) {
                self[action.action] = function (e) {
                    var rowNumber = $(e.target).parents('.mz-grid-row').data('mzRowIndex');
                    var row = self.model.get('items').at(rowNumber - 1);
                    self.model[action.action](e, row);
                };
            });
        }
    });

    var QuoteEditView = Backbone.MozuView.extend({
        templateName: 'modules/b2b-account/quotes/edit-quotes',
        initialize: function () {
            Backbone.MozuView.prototype.initialize.apply(this, arguments);
        },
        render: function () {
            var self = this;
            Backbone.MozuView.prototype.render.apply(this, arguments);
            var productModalView = new ProductModalViews.ModalView({
                el: self.$el.find("[mz-modal-product-dialog]"),
                model: new ProductModels.Product({}),
                messagesEl: self.$el.find("[mz-modal-product-dialog]").find('[data-mz-message-bar]')
            });
            window.quickOrderModalView = productModalView;

            var productPickerView = new ProductPicker({
                el: self.$el.find('[mz-wishlist-product-picker]'),
                model: self.model
            });

            productPickerView.render();
        },
        startEditingQuoteName: function () {
            var self = this;

            self.render();
        },
        toggleAdjustmentBlocks: function (e) {
            var self = this;
            var currentTargetId = e.currentTarget.id;
            var currentImage = $('#' + currentTargetId).attr('src');
            var toggleImage = currentImage.includes('arrow-down') ?
                currentImage.replace('arrow-down', 'arrow-right') :
                currentImage.replace('arrow-right', 'arrow-down');

            $('#' + currentTargetId).attr('src', toggleImage);
            self.$('.' + currentTargetId).toggle('slow');
        }
    });

    var QuoteModel = Backbone.MozuModel.extend({
    });

    var QuotesGridCollectionModel = MozuGridCollection.extend({
        mozuType: 'quotes',
        defaultSort: 'submittedDate desc',
        columns: [
            {
                index: 'name',
                displayName: 'Quote Name',
                sortable: false
            },
            {
                index: 'expirationDate',
                displayName: 'Expiration Date',
                sortable: true,
                displayTemplate: function (value) {
                    var date = "";
                    if (value) {
                        date = new Date(value).toLocaleString();
                    }
                    return date;
                }
            },
            {
                index: 'submittedDate',
                displayName: 'Submitted Date',
                sortable: true,
                displayTemplate: function (value) {
                    var date = "";
                    if (value) {
                        date = new Date(value).toLocaleString();
                    }
                    return date;
                }
            },
            {
                index: 'total',
                displayName: 'Total',
                sortable: false,
                displayTemplate: function (amount) {
                    return '$' + amount.toFixed(2);
                }
            },
            {
                index: 'status',
                displayName: 'Status',
                sortable: false
            }
        ],
        rowActions: [
            {
                displayName: 'Edit Quote',
                action: 'editQuote'
            },
            {
                displayName: 'Delete Quote',
                action: 'deleteQuote'
            },
            {
                displayName: 'Copy Quote',
                action: 'copyQuote'
            },
            {
                displayName: 'Email Quote',
                action: 'emailQuote'
            }
        ],
        relations: {
            items: Backbone.Collection.extend({
                model: QuoteModels.Quote
            })
        },
        editQuote: function (e, row) {
            var quoteId = row.get('id');
            window.location = '/myaccount/quote/' + quoteId + '/edit';
        },
        deleteQuote: function () {
            this.trigger('deleteQuoteView');
        },
        copyQuote: function () {
            this.set('copyQuoteView');
        },
        emailQuote: function () {
            this.set('emailQuoteView');
        }
    });

    if (isSalesRep) {
        QuotesGridCollectionModel.prototype.columns.splice(0, 0, {
            index: 'accountName',
            displayName: 'Account Name',
            sortable: false,
            displayTemplate: function (accountName) {
                return accountName || '';
            }
        });
    }
    var B2BViewAccountQuotesGridCollectionModel = MozuGridCollection.extend({
            mozuType: 'quotes',
            defaultSort: 'submittedDate desc',
            columns: [
                {
                    index: 'name',
                    displayName: 'Quote Name',
                    sortable: false
                },
                {
                    index: 'expirationDate',
                    displayName: 'Expiration Date',
                    sortable: true,
                    displayTemplate: function (value) {
                        var date = "";
                        if (value) {
                            date = new Date(value).toLocaleString();
                        }
                        return date;
                    }
                },
                {
                    index: 'submittedDate',
                    displayName: 'Submitted Date',
                    sortable: true,
                    displayTemplate: function (value) {
                        var date = "";
                        if (value) {
                            date = new Date(value).toLocaleString();
                        }
                        return date;
                    }
                },
                {
                    index: 'total',
                    displayName: 'Total',
                    sortable: false,
                    displayTemplate: function (amount) {
                        return '$' + amount.toFixed(2);
                    }
                },
                {
                    index: 'status',
                    displayName: 'Status',
                    sortable: false
                }
            ],
            relations: {
                items: Backbone.Collection.extend({
                    model: QuoteModels.Quote
                })
            }
        });

    return {
        'QuotesView': QuotesView,
        'QuoteEditView': QuoteEditView,
        'QuoteModel': QuoteModel
    };
});
