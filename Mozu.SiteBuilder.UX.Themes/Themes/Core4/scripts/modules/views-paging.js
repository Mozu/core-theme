define(['modules/jquery-mozu','shim!vendor/underscore>_','modules/backbone-mozu'], function($, _, Backbone) {

    var pagingHelpers = ['firstIndex', 'lastIndex', 'pageNumbers', 'hasPreviousPage', 'hasNextPage'];

    var PagingBaseView = Backbone.MozuView.extend({
        initialize: function() {
            if (!this.model._isPaged) {
                throw "Cannot bind a Paging view to a model that does not have the Paging mixin!";
            }
        },
        render: function () {
            var model = this.model.toJSON({ helpers: true }),
                me = this;
            _.each(pagingHelpers, function (helperName) {
                model[helperName] = me.model[helperName]();
            });
            this.$el.html(this.template.render({ Model: model }));
        }
    });

    var PagingControlsView = PagingBaseView.extend({
        templateName: 'Modules/Common/PagingControls',
        autoUpdate: ['PageSize'],
        updatePageSize: function (e) {
            this.model.set('PageSize', $(e.currentTarget).val());
        }
    });

    var PageNumbersView = PagingBaseView.extend({
        templateName: 'Modules/Common/PageNumbers',
        previous: function () {
            this.model.previousPage();
        },
        next: function () {
            this.model.nextPage();
        },
        page: function (e) {
            this.model.setPage(parseInt($(e.currentTarget).data('mz-page-num')) || 1);
        }
    });

    return {
        PagingControls: PagingControlsView,
        PageNumbers: PageNumbersView
    };

});