define(["modules/jquery-mozu", "underscore", "modules/backbone-mozu", "modules/views-paging"], function ($, _, Backbone, PagingViews) {

    var mozuGridView = Backbone.MozuView.extend({
        templateName: 'modules/mozugrid/grid',
        initialize: function () {
            var self = this;
            var allowedToGetData = (this.model.hasRequiredBehavior() || !this.model.requireBehaviorsToRender);
            if (allowedToGetData){
              if (typeof this.model.apiGridRead === 'function') {
                  this.model.apiModel.get = this.model.apiGridRead.bind(this.model);
                  this.model.apiModel.setIndex = this.model.apiGridRead.bind(this.model);
              }

              try {
                  this.$el.addClass('is-loading');
                  if (this.model.get('autoload')){
                      self.model.setIndex(0);
                  }
              } catch (error) {

              }
          }
        },
        registerRowActions: function(){
            var self = this;
            var rowActions = this.model.get('rowActions');
            _.each(rowActions, function(action){
                self[action.action] = function(e){
                    var rowNumber = $(e.target).parents('.mz-grid-row').data('mzRowIndex');
                    var row = self.model.get('items').at(rowNumber-1);
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

                _.each(self.model.columns, function (item) {
                    if (item.sortable) {
                        $('#' + item.index).addClass('mz-grid-sortIcon');
                    }
                });
                var currentSort = this.model.currentSort();
                var currentIndex = null;
                var currentDirection = null;

                if (currentSort) {
                    var split = currentSort.split(" ");
                    currentIndex = split[0];
                    currentDirection = split[1];
                }

                if (currentDirection === 'asc') {
                    $('#' + currentIndex + ' > span').addClass('mz-sort-up');
                } else if (currentDirection === 'desc') {
                    $('#' + currentIndex + ' > span').addClass('mz-sort-down');
                } else {
                    $('#' + currentIndex + ' > span').addClass('mz-unsort');
                }
            }


            _.invoke(views, 'render');
        }
    });
    return mozuGridView;
});
