define(['shim!vendor/typeahead.js/typeahead.bundle[modules/jquery-mozu=jQuery]>jQuery', 'hyprlive', 'modules/api',
      'hyprlivecontext'], function($, Hypr, api,
        HyprLiveContext) {
    
    // bundled typeahead saves a lot of space but exports bloodhound to the root object, let's lose it
    var Bloodhound = window.Bloodhound.noConflict();

    // bloodhound wants to make its own AJAX requests, and since it's got such good caching and tokenizing algorithms, i'm happy to help it
    // so instead of using the SDK to place the request, we just use it to get the URL configs and the required API headers

    // create bloodhound instances for each type of suggestion

    var Search = function() {
        return {
            qs : '%QUERY',
            eqs : function() {
                var self = this;
                return window.encodeURIComponent(self.qs);
            },
            suggestPriorSearchTerms: Hypr.getThemeSetting('suggestPriorSearchTerms'),
            getApiUrl : function (groups) {
                var self = this;
                return api.getActionConfig('suggest', 'get', { query: self.qs, groups: groups }).url;
            },
            ajaxConfig : {
                headers: api.getRequestHeaders()
            },
            nonWordRe : /\W+/,
            makeSuggestionGroupFilter : function (name) {
                return function (res) {
                    var suggestionGroups = res.suggestionGroups,
                        thisGroup;
                    for (var i = suggestionGroups.length - 1; i >= 0; i--) {
                        if (suggestionGroups[i].name === name) {
                            thisGroup = suggestionGroups[i];
                            break;
                        }
                    }
                    return thisGroup.suggestions;
                };
            },

            makeTemplateFn : function (name) {
                var tpt = Hypr.getTemplate(name);
                return function (obj) {
                    return tpt.render(obj);
                };
            },

            setDataSetConfigs : function() {
                var self = this;
                self.dataSetConfigs = [
                    {
                        name: 'pages',
                        displayKey: function (datum) {
                            return datum.suggestion.productCode;
                        },
                        templates: {
                            suggestion: self.makeTemplateFn('modules/search/autocomplete-page-result'),
                            empty: self.makeTemplateFn('modules/search/autocomplete-empty')
                        },
                        source: self.AutocompleteManager.datasets.pages.ttAdapter()
                    }
                ];
            },

            datasets: function() {
                var self = this;
                return {
                    pages: new Bloodhound({
                        datumTokenizer: function (datum) {
                            return datum.suggestion.term.split(self.nonWordRe);
                        },
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        remote: {
                            url: self.getApiUrl('pages'),
                            wildcard: self.eqs(),
                            filter: self.makeSuggestionGroupFilter("Pages"),
                            rateLimitWait: 400,
                            ajax: self.ajaxConfig
                        }
                    })
                };
            },

            datasetsTerms: function() {
                var self = this;
                return new Bloodhound({
                    datumTokenizer: function (datum) {
                        return datum.suggestion.term.split(self.nonWordRe);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: self.getApiUrl('terms'),
                        wildcard: self.eqs(),
                        filter: self.makeSuggestionGroupFilter("Terms"),
                        rateLimitWait: 100,
                        ajax: self.ajaxConfig
                    }
                });
            },

            initialize: function(config) {
                var self = this;
                config = config || {};
                
                self.AutocompleteManager = {
                    datasets: self.datasets()
                };

                $.each(self.AutocompleteManager.datasets, function (name, set) {
                    set.initialize();
                });

                self.setDataSetConfigs();

                if (self.suggestPriorSearchTerms) {
                    if(!config.doNotsuggestPriorSearchTerms) {
                        self.AutocompleteManager.datasets.terms = self.datasetsTerms();
                        self.AutocompleteManager.datasets.terms.initialize();
                        self.dataSetConfigs.push({
                            name: 'terms',
                            displayKey: function (datum) {
                                return datum.suggestion.term;
                            },
                            source: self.AutocompleteManager.datasets.terms.ttAdapter()
                        });
                    }
                }

                
            }
        };
    };

    $(document).ready(function () {
        var $fields = $('[data-mz-role="searchquery"]').each(function(field){
            var search = new Search();
            search.initialize();

            var $field = search.AutocompleteManager.$typeaheadField = $(this);

            search.AutocompleteManager.typeaheadInstance = $field.typeahead({
                minLength: 3
            }, search.dataSetConfigs).data('ttTypeahead');
            // user hits enter key while menu item is selected;
            $field.on('typeahead:selected', function (e, data, set) {
                if (data.suggestion.productCode) window.location = (HyprLiveContext.locals.siteContext.siteSubdirectory || '') + "/p/" + data.suggestion.productCode;
            });
        });
    });
    
    return Search;
});