define(['modules/jquery-mozu', "modules/views-collections"], function($, CollectionViewFactory) {
    $(document).ready(function() {
        window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-search]'),
            template: "search-interior"
        });
    });
});