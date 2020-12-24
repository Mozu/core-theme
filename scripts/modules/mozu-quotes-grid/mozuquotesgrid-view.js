define(["modules/jquery-mozu",
    "underscore",
    "modules/backbone-mozu",
    "modules/views-paging"],
    function ($, _, Backbone, PagingViews) {

        var mozuQuotesGridView = Backbone.MozuView.extend({
            templateName: 'modules/mozuquotesgrid/grid',
            initialize: function () {
                var self = this;
                var allowedToGetData = (this.model.hasRequiredBehavior() || !this.model.requireBehaviorsToRender);
                if (allowedToGetData) {
                    if (typeof this.model.apiGridRead === 'function') {
                        this.model.apiModel.get = this.model.apiGridRead.bind(this.model);
                        this.model.apiModel.setIndex = this.model.apiGridRead.bind(this.model);
                    }

                    this.$el.addClass('is-loading');
                    if (this.model.get('autoload')) {
                        self.model.setIndex(0);
                    }
                }
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
            },
            refreshGrid: function () {
                this.model.refreshGrid();
            },
            sort: function (e) {
                e.preventDefault();
                var col = $(e.currentTarget).data('mzColIndex');
                return this.model.sort(col);
            },
            filter: function (e) {
                e.preventDefault();
                var filterString = $(e.currentTarget).data('mzFilter');
                return this.model.filter(filterString);
            },
            render: function () {
                var self = this;
                var views = {};
                self.registerRowActions();
                Backbone.MozuView.prototype.render.apply(this, arguments);

                if (self.model.get('items').length) {
                    views = {
                        mozuGridPagingControls: new PagingViews.PagingControls({
                            el: self.$el.find('[data-mz-pagingcontrols]'),
                            model: self.model
                        }),
                        mozuGridPageNumbers: new PagingViews.PageNumbers({
                            el: self.$el.find('[data-mz-pagenumbers]'),
                            model: self.model
                        })
                    };
                }
                _.invoke(views, 'render');
            },
            toggleDropdown: function (e) {
                var currentId = 'quotesDropdown' + $(e.target).parents('.mz-grid-row').data('mzRowIndex');
                $.each($('.dropdown-content'), function (index, item) {
                    var toggle = (item.id === currentId) ? $('#' + currentId).toggleClass('show') : $('#' + item.id).removeClass('show');
                });
            }
        });
        $(document).ready(function () {
            // Close the dropdown menu if the user clicks outside of it
            window.onclick = function (event) {
                if (!event.target.matches('.dropbtn')) {
                    var dropdowns = document.getElementsByClassName("dropdown-content");
                    var i;
                    for (i = 0; i < dropdowns.length; i++) {
                        var openDropdown = dropdowns[i];
                        if (openDropdown.classList.contains('show')) {
                            openDropdown.classList.remove('show');
                        }
                    }
                }
            };
        });
        return mozuQuotesGridView;
    });
