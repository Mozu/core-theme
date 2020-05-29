using AutoMapper;
using Mozu.Core.Api.Client.Exceptions;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.PriceLists;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.Helpers.PriceListHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{

    /// <summary>
    /// Controller for PriceLists.
    /// </summary>
    [WebApi("app/priceList", SuppressDescriptorGeneration = true)]
    public class PriceListController : BaseController
    {
        private readonly IPriceListWebApiClient _priceListWebClient;
        private readonly IProductWebApiClient _productWebApiClient;
        private readonly IProductTypeWebApiClient _productTypeWebApiClient;
        private readonly IPriceListExtraEntryHelper _priceListExtraEntryHelper;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PriceListController(IPriceListWebApiClient priceListWebClient, IProductWebApiClient productWebApiClient, 
            IProductTypeWebApiClient productTypeWebApiClient, IPriceListExtraEntryHelper priceListExtraEntryHelper)
        {
            _priceListWebClient = priceListWebClient;
            _productWebApiClient = productWebApiClient;
            _productTypeWebApiClient = productTypeWebApiClient;
            _priceListExtraEntryHelper = priceListExtraEntryHelper;
        }

        /// <summary>
        /// Get a list of PriceLists.
        /// </summary>
        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<PriceList>>> ListPriceLists(PagingParamaters pagingParams,
            FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                return await GetSinglePriceList(pagingParams);
            }

            if (IsLookupQuery(extFilter.QueryString.Get("isLookup")))
            {
                return await GetPriceListLookup(extFilter.QueryString.Get("excludedCode"));
            }

            string filter = null;
            if (extFilter.Count > 0)
            {
                filter = extFilter.ToFilterString();
            }
            string sortBy = pagingParams.sort.ToSortString();

            //const string responseFields = "items(id,name,PriceListCode,couponCodeType,status,canBeDeleted,maxRedemptionsPerUser,maxRedemptionsPerCouponCode,startDate,endDate,redemptionCount,setSize,assignedDiscountCount)";
            //try
            //{
            var priceLists = (await _priceListWebClient.GetPriceLists(pagingParams.startIndex,
                pageSize: pagingParams.pageSize,
                sortBy: sortBy,
                filter: filter
                )).ReadAsSync();
            
            var result = Mapper.Map<List<PriceList>>(priceLists.Items);
            return List2(result, priceLists.TotalCount);
        }

        private async Task<Response<List<PriceList>>> GetSinglePriceList(PagingParamaters pagingParams)
        {
            var singlePriceList = (await _priceListWebClient.GetPriceList(pagingParams.id)).ReadAsSync();
            return List2(Mapper.Map<PriceList>(singlePriceList));
        }

        private async Task<Response<List<PriceList>>> GetPriceListLookup(string excludedCode)
        {
            var filter = string.Format("enabled eq true{0}",
                !string.IsNullOrEmpty(excludedCode)
                    ? " and pricelistcode ne " + excludedCode
                    : "");
            var priceLists = (await _priceListWebClient.GetPriceLists(startIndex: 0,
                pageSize: 9999,
                sortBy: "name",
                filter: filter,
                responseFields: "items(priceListCode, name)"
                )).ReadAsSync();

            var result = Mapper.Map<List<PriceList>>(priceLists.Items);
            return List2(result, priceLists.TotalCount);
        }

        /// <summary>
        /// Create a new PriceList.
        /// </summary>
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<PriceList>>> CreatePriceList(List<PriceList> priceLists)
        {
            var responseList = new List<PriceList>();

            foreach (var priceList in priceLists)
            {
                var dcPriceList = Mapper.Map<DC.PriceList>(priceList);

                try
                {
                    var response = (await _priceListWebClient.AddPriceList(dcPriceList)).ReadAsSync();
                    responseList.Add(Mapper.Map<PriceList>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return FailureList2<PriceList>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Update an existing PriceList.
        /// </summary>
        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<PriceList>>> EditPriceList(List<PriceList> priceLists, string priceListCode = null)
        {
            var results = new List<PriceList>();

            foreach (var priceList in priceLists)
            {
                var dc = Mapper.Map<DC.PriceList>(priceList);
                var res = (await _priceListWebClient.UpdatePriceList(dc, priceList.Code)).ReadAsSync();
                results.Add(Mapper.Map<PriceList>(res));
            }
            return List2(results);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<PriceList>> DeletePriceList(List<PriceList> priceLists)
        {
            var tasks = priceLists.Select(d => _priceListWebClient.DeletePriceList(d.Code, true)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<PriceList>(priceLists.Count);
        }
  

        [HttpGetRoute(UriTemplate = "entry/list")]
        public async Task<Response<List<PriceListEntry>>> ListPriceListEntries([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, [FromUri] string priceListCode)
        {
            if (pagingParams.id != null)
            {
                return await GetSinglePriceListEntry(priceListCode, extFilter);
            }

            string filter = null;
            if (extFilter != null && extFilter.Any())
            {
                filter = extFilter.ToFilterEntryString();
            }
            var sortBy = pagingParams.sort.ToSortString();

            //const string responseFields = "items(id,name,PriceListCode,couponCodeType,status,canBeDeleted,maxRedemptionsPerUser,maxRedemptionsPerCouponCode,startDate,endDate,redemptionCount,setSize,assignedDiscountCount)";
            var entries = (await _priceListWebClient.GetPriceListEntries(priceListCode: priceListCode, 
                startIndex: pagingParams.startIndex,
                pageSize: pagingParams.pageSize,
                sortBy: sortBy,
                filter: filter
                )).ReadAsSync();

            var result = Mapper.Map<List<PriceListEntry>>(entries.Items);

            return List2(result, entries.TotalCount);
        }

        private async Task<Response<List<PriceListEntry>>> GetSinglePriceListEntry(string priceListCode, FilterCollection extFilter)
        {
            var productCode = extFilter.QueryString.Get("productCode");
            var currencyCode = extFilter.QueryString.Get("currencyCode");
            var startDate = extFilter.QueryString.Get("startDate");
            DateTime? dateTime = null;
            if (!startDate.IsNullOrEmpty())
            {
                DateTime parsedDateTime;
                if (DateTime.TryParse(startDate, out parsedDateTime))
                {
                    dateTime = parsedDateTime;
                }
            }
            var dcPriceListEntry = (await _priceListWebClient.GetPriceListEntry(priceListCode: priceListCode, productCode: productCode, currencyCode: currencyCode, startDate: dateTime)).ReadAsSync();
            var priceListEntry = Mapper.Map<PriceListEntry>(dcPriceListEntry);

            if (priceListEntry.IsVariation)
            {
                await AddVariationPricing(productCode, priceListEntry);
                return List2(priceListEntry);
            }

            var dcProduct = await GetProduct(productCode);
            AddMasterCatalogData(priceListEntry, dcProduct);
            AddReferenceProductCatalogInfo(priceListEntry, dcProduct);

            var lookup = (priceListEntry.Extras.IsNullOrEmpty())
                ? new Dictionary<string, PriceListEntryExtra>()
                : priceListEntry.Extras.ToDictionary(x => $"{x.AttributeFQN}-{x.Value}");

            Func<string, string, decimal?> getOverridePrice = (attrFqn, attrValue) => lookup.ContainsKey($"{attrFqn}-{attrValue}")
                      ? lookup[$"{attrFqn}-{attrValue}"].OverridePrice
                      : null as decimal?;

            var productExtras = await GetProductTypeAttributesAsync(getOverridePrice, dcProduct);

            var orphans = priceListEntry.Extras.Where(x => !productExtras
                .Select(orp => $"{orp.AttributeFQN}-{orp.Value}")
                .Contains($"{x.AttributeFQN}-{x.Value}"));

            productExtras.AddRange(orphans);
            priceListEntry.Extras =
                productExtras.OrderByDescending(x => x.OverridePrice).ThenByDescending(y => y.CatalogPrice).ToList();
            return List2(priceListEntry);
        }

        private async Task AddVariationPricing(string variationProductCode, PriceListEntry priceListEntry)
        {
            DC.Product baseProduct = await GetBaseProduct(variationProductCode);
            if (baseProduct == null) return;
            priceListEntry.BaseProductCode = baseProduct.BaseProductCode;
            AddReferenceProductCatalogInfo(priceListEntry, baseProduct);
            AddMasterCatalogData(priceListEntry, baseProduct);
        }

        private static void AddReferenceProductCatalogInfo(PriceListEntry priceListEntry, DC.Product dcProduct)
        {
            priceListEntry.ProductInCatalogInfo = dcProduct.ProductInCatalogs.Select(x => new ProductInCatalogInfo
            {
                ActiveStartDate = x.ActiveDateRange?.StartDate,
                ActiveEndDate = x.ActiveDateRange?.EndDate,
                IsActive = x.IsActive.GetValueOrDefault(),
                CatalogId = x.CatalogId,
                IsPriceOverridden = x.IsPriceOverridden.GetValueOrDefault(),
                ISOCurrencyCode = x.Price?.ISOCurrencyCode,
                ListPrice = x.Price?.Price,
                SalePrice = x.Price?.SalePrice,
                MAP = x.Price?.MAP,
                MAPStartDate = x.Price?.MAPStartDate,
                MAPEndDate = x.Price?.MAPEndDate,
                MSRP = x.Price?.MSRP
            }).ToList();
        }

        private static void AddMasterCatalogData(PriceListEntry priceListEntry, DC.Product dcProduct)
        {
            priceListEntry.CurrentCostCurrencyCode = (dcProduct.SupplierInfo != null && dcProduct.SupplierInfo.Cost != null)
                ? dcProduct.SupplierInfo.Cost.ISOCurrencyCode
                : null;
            priceListEntry.CurrentCost = (dcProduct.SupplierInfo != null && dcProduct.SupplierInfo.Cost != null)
                ? dcProduct.SupplierInfo.Cost.Cost
                : null;

            priceListEntry.CurrentDiscountsRestricted = dcProduct.PricingBehavior.DiscountsRestricted;
            priceListEntry.CurrentDiscountsRestrictedStartDate = dcProduct.PricingBehavior.DiscountsRestrictedStartDate;
            priceListEntry.CurrentDiscountsRestrictedEndDate = dcProduct.PricingBehavior.DiscountsRestrictedEndDate;
        }

        /// <summary>
        /// Create a new PriceListEntry
        /// </summary>
        [HttpPostRoute(UriTemplate = "entry/create")]
        public async Task<Response<List<PriceListEntry>>> CreatePriceListEntry(List<PriceListEntry> priceLists)
        {
            var responseList = new List<PriceListEntry>();

            foreach (var priceListEntry in priceLists)
            {
                var dcPriceListEntry = Mapper.Map<DC.PriceListEntry>(priceListEntry);

                try
                {
                    var response = (await _priceListWebClient.AddPriceListEntry(priceListEntry.PriceListCode, dcPriceListEntry)).ReadAsSync();
                    responseList.Add(Mapper.Map<PriceListEntry>(response));
                }
                catch (ApiWebClientConnectionException e)
                {
                    return FailureList2<PriceListEntry>(e.Message);
                }
            }

            return List2(responseList);
        }

        /// <summary>
        /// Get ProducExtras for a new PriceListEntry
        /// Does not throw exception when 404 as it's
        /// expected.
        /// </summary>
        [HttpGetRoute(UriTemplate = "entry/create/product/{productCode}")]
        public async Task<Response<PriceListEntry>> GetPriceListTemplateForProduct(string productCode)
        {
            var priceListEntry = new PriceListEntry();
            var dcProduct = await GetProduct(productCode);

            AddMasterCatalogData(priceListEntry, dcProduct);
            AddReferenceProductCatalogInfo(priceListEntry, dcProduct);
            var productExtras = await GetProductTypeAttributesAsync((fqn, val) => null as decimal?, dcProduct);

            priceListEntry.Extras =
                productExtras.OrderByDescending(x => x.CatalogPrice).ToList();
            return Single2(priceListEntry);
        }

        private async Task<DC.Product> GetProduct(string productCode)
        {
            string responseFields = "productCode,productTypeId,extras,"
                                    + "price(isoCurrencyCode,price,salePrice,msrp,map,mapStartDate,mapEndDate),"
                                    + "pricingBehavior(discountsRestricted,discountsRestrictedStartDate,discountsRestrictedEndDate),"
                                    + "supplierInfo(cost(isoCurrencyCode,cost)),"
                                    + "productInCatalogs(catalogId,isActive,isPriceOverriden,activeDateRange(startDate,endDate),"
                                      + "price(isoCurrencyCode,price,salePrice,msrp,map,mapStartDate,mapEndDate))";

            return (await _productWebApiClient.GetProduct(productCode, responseFields: responseFields)).ReadAsSync();
        }

        /// <summary>
        /// Get ProducExtras for a new PriceListEntry
        /// Does not throw exception when 404 as it's
        /// expected.
        /// </summary>
        [HttpGetRoute(UriTemplate = "entry/create/product/{productCode}/variation/{variationCode}")]
        public async Task<Response<PriceListEntry>> GetPriceListTemplateForProductVariation(string productCode, string variationCode)
        {
            var priceListEntry = new PriceListEntry();
            await AddVariationPricing(variationCode, priceListEntry);
            return Single2(priceListEntry);
        }

        private async Task<List<PriceListEntryExtra>> GetProductTypeAttributesAsync(Func<string, string, decimal?> getOverridePrice, DC.Product dcProduct)
        {
            var overrides = new List<PriceListEntryExtra>();
            DC.ProductType prodType =
                (await _productTypeWebApiClient.GetProductType(dcProduct.ProductTypeId ?? -1, responseFields: "extras")).ReadAsSync();
            return _priceListExtraEntryHelper.MergeExtraEntries(getOverridePrice, dcProduct.Extras, prodType, overrides);
        }

        /// <summary>
        /// Update an existing PriceList.
        /// </summary>
        [HttpPostRoute(UriTemplate = "entry/edit")]
        public async Task<Response<List<PriceListEntry>>> EditPriceListEntry(List<PriceListEntry> priceEntries)
        {
            var results = new List<PriceListEntry>();

            foreach (var priceEntry in priceEntries)
            {
                var dcEntry = Mapper.Map<DC.PriceListEntry>(priceEntry);
                var entry = (await _priceListWebClient.UpdatePriceListEntry(dcEntry, 
                    priceListCode:dcEntry.PriceListCode, 
                    productCode:dcEntry.ProductCode, 
                    currencyCode:dcEntry.CurrencyCode, 
                    startDate:dcEntry.StartDate
                    )).ReadAsSync();
                
                results.Add(Mapper.Map<PriceListEntry>(entry));
            }
            return List2(results);
        }

        [HttpPostRoute(UriTemplate = "entry/delete")]
        public async Task<Response<PriceList>> DeletePriceListEntry(List<PriceListEntry> entries)
        {
            var tasks = entries.Select(d => _priceListWebClient.DeletePriceListEntry(d.PriceListCode, d.ProductCode, d.CurrencyCode, d.StartDate)).ToList();
            await Task.WhenAll(tasks);
            tasks.Select(TaskHelper.Result).ThrowExceptionsIfAny();

            return SuccessWithTotal2<PriceList>(entries.Count);
        }

        private async Task<DC.Product> GetBaseProduct(string variantProductCode)
        {
            string responseFields = "items(baseProductCode,"
                + "price(isoCurrencyCode,price,salePrice,msrp,map,mapStartDate,mapEndDate),"
                + "pricingBehavior(discountsRestricted,discountsRestrictedStartDate,discountsRestrictedEndDate),"
                + "supplierInfo(cost(isoCurrencyCode,cost)),"
                + "productInCatalogs(catalogId,isActive,isPriceOverriden,activeDateRange(startDate,endDate),"
                + "price(isoCurrencyCode,price,salePrice,msrp,map,mapStartDate,mapEndDate)"
                + "))";

            var filter = string.Format("isVariation eq true and ProductCode eq {0}", variantProductCode);
            var dcBaseProducts = (await _productWebApiClient.GetProducts(filter: filter, responseFields: responseFields)).ReadAsSync();
            return dcBaseProducts.Items.FirstOrDefault();
        }

        private bool IsLookupQuery(string lookupValue)
        {
            bool isLookup;
            if (!string.IsNullOrEmpty(lookupValue) && bool.TryParse(lookupValue, out isLookup))
            {
                return isLookup;
            }
            return false;
        }
    }
}