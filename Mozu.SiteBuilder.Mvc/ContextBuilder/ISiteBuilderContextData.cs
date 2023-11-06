using System;
using System.Collections.Generic;
using Mozu.Content.Contracts;
using Mozu.Location.Contracts;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models.Navigation;

using Mozu.SiteBuilder.UX.Models.StoreFront.Catalog;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.Tenant.Contracts;

namespace Mozu.SiteBuilder.Mvc.Context
{
    public interface ISiteBuilderContextData
    {
        DateTime BuildDate { get; set; }
        CheckoutSettings CheckoutSettings { get; set; }
        GeneralSettings GeneralSettings { get; set; }
        string Hash { get; set; }
        string ThemeHash { get; set; }
        LocationUsageCollection LocationUsages { get; set; }
        NavigationSet NavigationSet { get; set; }
        DocumentCollection NavWebPages { get; set; }
        List<RedirectEntry> Redirects { get; set; }
        DateTime? RedirectUpdateDate { get; set; }
        List<Category> RootCategoryTree { get; set; }
        CustomRouteRepository.HttpRouteCollectionContainer RouteCollection { get; set; }
        Dictionary<string, Dictionary<string, object>> RouteMapperData { get; set; }
        Dictionary<string, Dictionary<string, object>> RouteValidatorData { get; set; }
        RuntimeRedirects RuntimeRedirects { get; set; }
        int? SiteId { get; set; }
        Tenant.Contracts.Tenant TenantInfo { get; set; }
        Dictionary<string, Tuple<Theme, ThemeRuntimeSettingsCollection>> Themes { get; set; }

        List<Category> GetFlatCategoryList();
        Dictionary<int,Category> GetCategoryDictionary();
        UX.Models.Settings.CheckoutSettings GetMappedCheckoutSettings();
        UX.Models.Settings.GeneralSettings GetMappedGeneralSettings();
        List<UX.Models.Settings.SiteDomain> GetMappedSiteDomains();
        string GetSiteSubDirectory();
        void ProcessCategoryTree();
        List<ProductRuntime.Contracts.CurrencyExchangeRate> CurrencyExchangeRates { get; set; }
    }
}