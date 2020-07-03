using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.TestData;
using Mozu.SiteBuilder.UX.Areas.StoreFront.Models;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using DCShipment = Kibo.Fulfillment.Contracts.Model.EntityModelOfShipment;
using DCReturns = Mozu.CommerceRuntime.Contracts.Returns;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    /// <summary>
    /// Storefront endpoint for an administrator to view 'order details' and 'packing slip',
    /// which are rendered by the storefront theme.
    /// Since this is an administrator wormholing into storefront, this controller opts out of
    /// the normal pipeline and implements its own security checks.
    /// </summary>
    [DataViewModeEnforcementAttribute]
    public class BackOfficeController : ApiControllerBase
    {
        private ISiteBuilderApiContext _apiContext;
        private IOrderWebApiClient _orderWebApiClient;
        private readonly IFulfillmentProxyWebApiClient _fulfillmentProxyClient;
        private readonly ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        private readonly IReturnSettingsWebApiClient _returnSettingsWebApiClient;
        private readonly ILocationAdminWebApiClient _locationAdminWebApi;
        private readonly ISitesWebApiClient _sitesWebApiClient;

        private readonly IReturnWebApiClient _returnWebApiClient;
        private const string CMS_LIST_NAME = "emailTemplateContent@mozu";
        private const string ORDER_PREVIEW_RESOURCE_NAME = "backoffice.order1";
        private const string ORDERS_PREVIEW_RESOURCE_NAME = "backoffice.orders1";
        private const string PACKAGE_PREVIEW_RESOURCE_NAME = "backoffice.package1";
        private const string PICKWAVE_PREVIEW_RESOURCE_NAME = "backoffice.pickwave1";
        private const string PICKWAVE2_PREVIEW_RESOURCE_NAME = "backoffice.pickwave2";
        private const string SHIPMENT_PREVIEW_RESOURCE_NAME = "backoffice.shipment1";
        private const string SHIPMENT2_PREVIEW_RESOURCE_NAME = "backoffice.shipment2";
        private const string SHIPMENTS_PREVIEW_RESOURCE_NAME = "backoffice.shipments1";
        private const string LOCATION_PREVIEW_RESOURCE_NAME = "backoffice.location1";
        private const string CUSTOMER_AT_CURBSIDE_PREVIEW_RESOURCE_NAME = "backoffice.customeratcurbside";
        private const string CUSTOMER_AT_CURBSIDE_QRCODE_PREVIEW_RESOURCE_NAME = "backoffice.customer-at-curbside-qrcode";
        private const string RETURN_PREVIEW_RESOURCE_NAME = "backoffice.return1";

        /// <summary>
        /// Public constructor.
        /// </summary>
        /// 
        public BackOfficeController(ISiteBuilderApiContext apiContext, IOrderWebApiClient orderWebApiClient, ILogger logger,
            IFulfillmentProxyWebApiClient fulfillmentProxyClient,
            ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            ILocationAdminWebApiClient locationAdminWebApi,
            IReturnSettingsWebApiClient returnSettingsWebApiClient,
            IReturnWebApiClient returnWebApiClient,
            ISitesWebApiClient sitesWebApiClient)
        {
            _apiContext = apiContext;
            _orderWebApiClient = orderWebApiClient.CloneWithoutUserClaims();
            _fulfillmentProxyClient = fulfillmentProxyClient;
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
            _returnSettingsWebApiClient = returnSettingsWebApiClient.CloneWithoutUserClaims();
            _locationAdminWebApi = locationAdminWebApi.CloneWithoutUserClaims();
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();

            _returnWebApiClient = returnWebApiClient;
        }

        /// <summary>
        /// Order summary, a.k.a. "Print Order".
        /// </summary>
        [HttpGet]
        public async Task<HttpResponseMessage> OrderSummary(string orderId, [FromUri(Name = "t")]string token = null)
        {
            var order = await GetOrderWithCustomToken(orderId, token);

            PopulateDataForTemplate(order);

            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("order-details"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find order details template for the current Theme.");
            }

            return await RenderWithContext(template, order);
        }

        private void PopulateDataForTemplate(DC.Order order)
        {
            PopulateOptionNames(order);
            PopulatePackageDetails(order);
            PopulatePickupDetails(order);
        }

        private void PopulatePackageDetails(DC.Order order)
        {
            if (order.Packages == null)
            {
                return;
            }

            foreach (var package in order.Packages)
            {
                PopulatePackageDetails(package, order);
            }
        }

        private void PopulatePackageDetails(Package package, DC.Order order)
        {
            if (package == null)
            {
                return;
            }

            IEnumerable<PackageItem> t = package.Items.Select(i => GetDetailedPackageItem(i, order));
            package.Items = t.ToList();
        }

        private void PopulateShipmentDetails(Shipment shipment, DC.Order order)
        {
            if (shipment == null)
            {
                return;
            }

            IEnumerable<ShipmentItem> t = shipment.Items.Select(i => GetDetailedShipmentItem(i, order));
            shipment.Items = t.ToList();
        }

        private void PopulatePickupDetails(DC.Order order)
        {
            if (order.Pickups == null)
            {
                return;
            }

            foreach (var pickup in order.Pickups)
            {
                IEnumerable<PickupItem> t = pickup.Items.Select(i => GetDetailPickupItem(i, order));
                pickup.Items = t.ToList();
            }
        }

        private DetailedPackageItem GetDetailedPackageItem(PackageItem packageItem, DC.Order order)
        {
            var result = Mapper.Map<DetailedPackageItem>(packageItem);
            var product = FindProduct(packageItem.ProductCode, order);
            result.ProductName = product.Name;
            result.AdjustedWeight = CalculateAdjustedWeight(product.Weight, packageItem.Quantity);
            return result;
        }

        private DetailedShipmentItem GetDetailedShipmentItem(ShipmentItem shipmentItem, DC.Order order)
        {
            var result = Mapper.Map<DetailedShipmentItem>(shipmentItem);
            var product = FindProduct(shipmentItem.ProductCode, order);
            result.ProductName = product.Name;
            result.AdjustedWeight = CalculateAdjustedWeight(product.Weight, shipmentItem.Quantity);
            return result;
        }

        private DetailedPickupItem GetDetailPickupItem(PickupItem pickupItem, DC.Order order)
        {
            var result = Mapper.Map<DetailedPickupItem>(pickupItem);
            var product = FindProduct(pickupItem.ProductCode, order);
            result.ProductName = product.Name;
            result.AdjustedWeight = CalculateAdjustedWeight(product.Weight, pickupItem.Quantity);
            return result;
        }

        private static Measurement CalculateAdjustedWeight(Measurement weight, int quantity)
        {
            if (weight == null || !weight.Value.HasValue)
            {
                return null;
            }

            return new Measurement { Unit = weight.Unit, Value = Decimal.Round(weight.Value.Value * quantity, 1) };
        }

        private async Task<Location.Contracts.Location> GetDefaultReturnLocation()
        {
            var returnSettings = await _returnSettingsWebApiClient.GetReturnSettings();
            var locationCode = returnSettings.ResponseMessage.IsSuccessStatusCode ? (returnSettings.ReadAsSync())?.DefaultShippingLocation : null;
            if (!string.IsNullOrEmpty(locationCode))
            {
                var shippingLocation = await _locationAdminWebApi.GetLocation(locationCode);
                return shippingLocation.ResponseMessage.IsSuccessStatusCode ? shippingLocation.ReadAsSync() : null;
            }

            return null;
        }

        private async Task<Location.Contracts.Location> GetLocation(string locationCode)
        {
            if (!string.IsNullOrEmpty(locationCode))
            {
               return (await _locationAdminWebApi.GetLocation(locationCode)).ReadAsSync();
            }

            return null;
        }

        /// <summary>
        /// Finds the product, product variant, or bundled product from an order's lineitems.
        /// </summary>
        /// <param name="productCode"></param>
        /// <param name="order"></param>
        /// <returns></returns>
        private static SimpleProduct FindProduct(string productCode, DC.Order order)
        {
            var simpleProduct = new SimpleProduct();
            foreach (var item in order.Items)
            {
                if (item.Product.ProductCode == productCode || item.Product.VariationProductCode == productCode)
                {
                    simpleProduct.Weight = item.Product.Measurements?.Weight;
                    simpleProduct.Name = item.Product.Name;
                    break;
                }
                var bundledProduct = item.Product.BundledProducts.FirstOrDefault(bp => bp.ProductCode.Equals(productCode));
                if (bundledProduct != null)
                {
                    simpleProduct.Weight = bundledProduct.Measurements?.Weight;
                    simpleProduct.Name = bundledProduct.Name;
                    break;
                }
            }
            return simpleProduct;
        }

        internal class SimpleProduct
        {
            public Measurement Weight { get; set; }
            public string Name { get; set; }
        }

        /// <summary>
        /// This is a temporary fix to gaurantee the option names are set before rendering the template.  If not already
        /// set the name is set to the text appended after '~' on the fqn with the assumption that this is actually the
        /// name.  This covers 99% of the cases but the true fix is to fix order records in mongo.
        /// </summary>
        /// <param name="order"></param>
        private static void PopulateOptionNames(DC.Order order)
        {
            if (order.Items == null)
            {
                return;
            }

            foreach (var item in order.Items.Where(i => i.Product != null && !i.Product.Options.IsNullOrEmpty()))
            {
                foreach (var optionWithoutName in item.Product.Options.Where(o => o.Name.IsNullOrEmpty()))
                {
                    var parts = optionWithoutName.AttributeFQN.Split('~');
                    optionWithoutName.Name = parts.Length == 2 ? parts[1] : optionWithoutName.AttributeFQN;
                }
            }
        }

        ///// <summary>
        ///// Packing Slip.
        ///// </summary>
        //[HttpGet]
        //public async Task<HttpResponseMessage> PackingSlip(string orderId, string packageId, [FromUri(Name = "t")]string token = null)
        //{
        //    var order = await GetOrderWithCustomToken(orderId, token);
        //    var package = order != null && order.Packages != null ? order.Packages.FirstOrDefault(p => p.Id == packageId) : null;

        //    if (order == null || package == null)
        //        throw new HttpResponseException(HttpStatusCode.NotFound);

        //    var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("packing-slip"));
        //    if (template == null)
        //        return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find packing slip template for the current Theme.");

        //    var ser = new Newtonsoft.Json.JsonSerializer() { ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver() };
        //    var jo = Newtonsoft.Json.Linq.JObject.FromObject(package, ser);

        //    PopulatePackageDetails(package, order);

        //    ViewData["order"] = order;
        //    return await RenderWithContext(template, package);
        //}

        /// <summary>
        /// Packing Slip.
        /// </summary>
        [HttpGet]
        [AddUnifiedCookieFilter]
        public async Task<HttpResponseMessage> PackingSlip(string orderId, int shipmentNumber, [FromUri(Name = "t")]string token = null)
        {
            var order = await GetOrderWithCustomToken(orderId, token);
            var shipment = (await _fulfillmentProxyClient.CloneWithoutUserClaims().GetShipment(shipmentNumber)).ReadAsSync();

            if (order == null || shipment == null || !shipment.OrderId.EqualsIgnoreCase(orderId))
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var dcShipment = Mapper.Map<Shipment>(shipment);
            order.Shipments = order.Shipments ?? new List<Shipment>(new [] { dcShipment });

            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("packing-slip"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find packing slip template for the current Theme.");
            }

            //var ser = new Newtonsoft.Json.JsonSerializer() { ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver() };
            //var jo = Newtonsoft.Json.Linq.JObject.FromObject(shipment, ser);

            PopulateShipmentDetails(dcShipment, order);

            ViewData["order"] = order;
            ViewData["returnLocation"] = await GetDefaultReturnLocation();
            ViewData["fulfillmentLocation"] = await GetLocation(shipment.FulfillmentLocationCode);
            return await RenderWithContext(template, shipment);
        }

        [HttpGet]
        public async Task<HttpResponseMessage> PickWave(int pickWaveNumber, bool printPickWave, bool printPackingLists, bool printSingleOrderSheets)
        {
            var fulfillmentProxyClient = _fulfillmentProxyClient.CloneWithoutUserClaims();
            var pickWave = (await fulfillmentProxyClient.GetPickWave(pickWaveNumber)).ReadAsAsync().Result;

            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("pick-wave-print"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find pick wave template for the current Theme.");
            }

            var shipments = new List<DCShipment>();
            foreach (var shipmentNumber in pickWave.ShipmentNumbers)
            {
                var dcShipment = (await fulfillmentProxyClient.GetShipment(shipmentNumber)).ReadAsSync();
                shipments.Add(dcShipment);
            }
            ViewData["shipments"] = shipments;

            var orderIds = shipments.Select(x => x.OrderId).Distinct().ToList();
            var orders = new List<DC.Order>();
            foreach (var orderId in orderIds)
            {
                var dcOrder = (await _orderWebApiClient.GetOrder(orderId)).ReadAsSync();
                orders.Add(dcOrder);
            }
            ViewData["orders"] = orders;
            
            ViewData["printPickwave"] = printPickWave;
            ViewData["printPackingSlips"] = printPackingLists;
            ViewData["printPickSheets"] = printSingleOrderSheets;

            return await RenderWithContext(template, pickWave);
        }

        [HttpGet]
        public async Task<HttpResponseMessage> OrderPickSheets(int pickWaveNumber)
        {
            var fulfillmentProxyClient = _fulfillmentProxyClient.CloneWithoutUserClaims();
            var pickWave = (await fulfillmentProxyClient.GetPickWave(pickWaveNumber)).ReadAsAsync().Result;
            ViewData["pickwave"] = pickWave;

            var shipments = new List<DCShipment>();
            foreach (var shipmentNumber in pickWave.ShipmentNumbers)
            {
                var shipment = (await fulfillmentProxyClient.GetShipment(shipmentNumber)).ReadAsSync();
                shipments.Add(shipment);
            }

            var orderIds = shipments.Select(x => x.OrderId).Distinct().ToList();
            var orders = new List<DC.Order>();
            foreach (var orderId in orderIds)
            {
                var dcOrder = (await _orderWebApiClient.GetOrder(orderId)).ReadAsSync();
                orders.Add(dcOrder);
            }
            ViewData["orders"] = orders;

            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("order-pick-sheet"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find order pick sheet template for the current Theme.");
            }

            return await RenderWithContext(template, shipments);
        }

        [HttpGet]
        public async Task<HttpResponseMessage> TransferPackingSlip(string orderId, int shipmentNumber, [FromUri(Name = "t")]string token = null)
        {
            var order = await GetOrderWithCustomToken(orderId, token);
            var shipment = (await _fulfillmentProxyClient.CloneWithoutUserClaims().GetShipment(shipmentNumber)).ReadAsSync();

            if (order == null || shipment == null || !shipment.OrderId.EqualsIgnoreCase(orderId))
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            var dcShipment = Mapper.Map<Shipment>(shipment);
            order.Shipments = order.Shipments ?? new List<Shipment>(new[] { dcShipment });

            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("transfer-packing-slip"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find transfer packing slip template for the current Theme.");
            }

            PopulateShipmentDetails(dcShipment, order);

            var locationCode = shipment.FulfillmentLocationCode;
            if (!locationCode.IsNullOrEmpty())
            {
                var location = (await _locationRuntimeWebApiClient.GetLocation(locationCode)).ReadAsSync();
                ViewData["location"] = location;
            }

            ViewData["order"] = order;
            return await RenderWithContext(template, shipment);
        }

        [HttpGet]
        public async Task<HttpResponseMessage> ReturnReceipt(string orderId , string returnId, [FromUri(Name = "t")]string token = null)
        {
            DCReturns.Return returnObject = (await this._returnWebApiClient.CloneWithoutUserClaims().GetReturn(returnId)).ReadAsSync();
            if (returnObject.Status != DCReturns.Return.ReturnStatusConst.CLOSED &&
                ((returnObject.ReceiveStatus != DCReturns.Return.ReceiveStatusConst.FULLY_RECEIVED && returnObject.RefundStatus != DCReturns.Return.RefundStatusConst.FULLY_REFUNDED) ||
                (returnObject.ReceiveStatus != DCReturns.Return.ReceiveStatusConst.PARTIALLY_RECEIVED && returnObject.RefundStatus != DCReturns.Return.RefundStatusConst.PARTIALLY_REFUNDED))
                )
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Return Receipt can not be generated for a return which is not processed");
            }
            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("return-receipt"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find return receipt template for the current Theme.");
            }
            return await RenderWithContext(template, returnObject);
        }

        /// <summary>
        /// Preview of 'order summary' page from sitebuilder.
        /// </summary>
        [HttpGet]
        public async Task<HttpResponseMessage> Preview(string templateid)
        {
            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(templateid));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "could not find order template " + templateid);
            }

            if (templateid == "order-details")
            {
                object model = TestDataBroker.GetFileContents(ORDER_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                return await RenderWithContext(template, model);
            }
            else if (templateid == "packing-slip")
            {
                object order = TestDataBroker.GetFileContents(ORDER_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object model = TestDataBroker.GetFileContents(SHIPMENT_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object location = TestDataBroker.GetFileContents(LOCATION_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["order"] = order;
                ViewData["returnLocation"] = location;
                ViewData["fulfillmentLocation"] = location;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "pick-list")
            {
                object shipments = TestDataBroker.GetFileContents(SHIPMENTS_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object model = TestDataBroker.GetFileContents(PICKWAVE2_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["shipments"] = shipments;

                return await RenderWithContext(template, model);
            }
            else if (templateid == "order-pick-sheet")
            {
                object model = TestDataBroker.GetFileContents(SHIPMENTS_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object orders = TestDataBroker.GetFileContents(ORDERS_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object pickwave = TestDataBroker.GetFileContents(PICKWAVE_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["pickwave"] = pickwave;
                ViewData["orders"] = orders;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "pick-wave-print")
            {
                object shipments = TestDataBroker.GetFileContents(SHIPMENTS_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object orders = TestDataBroker.GetFileContents(ORDERS_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object model = TestDataBroker.GetFileContents(PICKWAVE2_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["shipments"] = shipments;
                ViewData["orders"] = orders;
                ViewData["printPickwave"] = true;
                ViewData["printPackingSlips"] = true;
                ViewData["printPickSheets"] = true;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "transfer-packing-slip")
            {
                object order = TestDataBroker.GetFileContents(ORDER_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object location = TestDataBroker.GetFileContents(LOCATION_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object model = TestDataBroker.GetFileContents(SHIPMENT_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["order"] = order;
                ViewData["location"] = location;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "curbside-arrive" || templateid == "crubside-seeyousoon")
            {
                object order = TestDataBroker.GetFileContents(ORDER_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object model = TestDataBroker.GetFileContents(SHIPMENT_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object location = TestDataBroker.GetFileContents(LOCATION_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();

                ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
                ViewData["order"] = order;
                ViewData["location"] = location;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "customer-at-curbside" )
            {
                object model = TestDataBroker.GetFileContents(CUSTOMER_AT_CURBSIDE_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["isBackofficePreview"] = true;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "customer-at-curbside-qrcode")
            {
                object model = TestDataBroker.GetFileContents(CUSTOMER_AT_CURBSIDE_QRCODE_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["isBackofficePreview"] = true;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "curbside-shipment-ready")
            {
                var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
                object model = TestDataBroker.GetFileContents(SHIPMENT2_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object location = TestDataBroker.GetFileContents(LOCATION_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
                ViewData["location"] = location;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "mobile-notification") 
            {
                object model = TestDataBroker.GetFileContents(SHIPMENT2_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                return await RenderWithContext(template, model);
            }
			else if (templateid == "return-receipt")
            {
                object model = TestDataBroker.GetFileContents(RETURN_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                return await RenderWithContext(template, model);
            }
            else
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
        }

        /// <summary>
        /// Takes a template, smooshes it with any page settings stored in CMS
        /// and returns the renderable result.
        /// </summary>
        private Task<HttpResponseMessage> RenderWithContext(PageTypeDefinition template, object model)
        {
            PageContext.CmsContext = new CmsPageContext()
            {
                Page = new DocumentRequest()
                {
                    ListFQN = CMS_LIST_NAME,
                    DocumentTypeFQN = CMS_LIST_NAME,
                    Path = template.Id
                }
            };
            PageContext.PageType = "order";

            // await the base class ContextInitializationTasks. This will fill out PageContext.CmsContext.Document if one exists.
            //Should this be WhenAll?
            return Task.WhenAll(this.ContextInitializationTasks).ContinueWith(_ => {
                ViewData["customContent"] = PageContext.CmsContext.Page.Document != null ? PageContext.CmsContext.Page.Document.Properties : null;
                return Request.CreateResponse(HttpStatusCode.OK, View(template.Template, model));
            });
        }

        private HttpResponseException TokenExpiredException()
        {
            var resp = new HttpResponseMessage(HttpStatusCode.NotFound)
            {
                Content = new StringContent("Aw, poop! Your access to this page has expired. Please re-request this resource from admin.")
            };
            return new HttpResponseException(resp);
        }

        /// <summary>
        /// Confirms that the user claim has permission to access this tenant and order id.
        /// </summary>
        private bool IsUserAuthorizedForOrder(LightweightUserClaims userClaimFromQuery, string orderId)
        {
            int claimTenantId;
            string claimOrderId, tidString;

            return
                (userClaimFromQuery.ScopeType == UserScopeType.Tenant.ToString())
                &&
                (userClaimFromQuery.Bag.TryGetValue("OrderId", out claimOrderId) && claimOrderId == orderId)
                &&
                (userClaimFromQuery.Bag.TryGetValue("TenantId", out tidString) && Int32.TryParse(tidString, out claimTenantId) && claimTenantId == _apiContext.TenantId);
        }

        /// <summary>
        /// Retrieves an order from CommerceRuntime service using a custom access token rather than the one in api context.
        /// </summary>
        private Task<DC.Order> GetOrderWithCustomToken(string orderId, string authToken)
        {
            LightweightUserClaims userClaimFromCustomToken = null;

            //ensure things are on the up and up
            bool isAuthorized = LightweightUserClaims.TryParse(authToken, out userClaimFromCustomToken) && IsUserAuthorizedForOrder(userClaimFromCustomToken, orderId);
            if (!isAuthorized)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.Forbidden, "You are not permitted to access this resource."));
            }

            var customOrderClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.UserClaims = userClaimFromCustomToken);
       
            bool isExpired = userClaimFromCustomToken.Expiration < DateTime.UtcNow;
            if (isExpired)
            {
                throw TokenExpiredException();
            }

            return _orderWebApiClient.GetOrder(orderId).ContinueWith(t => t.Result.ReadAsAsync()).Unwrap();
        }
    }
}