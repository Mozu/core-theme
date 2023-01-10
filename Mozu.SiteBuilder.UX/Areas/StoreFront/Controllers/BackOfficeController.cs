using AutoMapper;
using Kibo.Fulfillment.Contracts.Api;
using Kibo.Inventory.Contracts.Api;
using Kibo.Inventory.Contracts.Model;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.Location.Contracts.Clients;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
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
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core.Behaviors;
using Mozu.Core.Exceptions;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using DCReturns = Mozu.CommerceRuntime.Contracts.Returns;
using Mozu.SiteBuilder.Mvc.SEO;
using Mozu.Customer.Contracts.Clients;
using DCShipment = Kibo.Fulfillment.Contracts.Model.EntityModelOfShipment;
using Mozu.CommerceRuntime.Contracts.Payments;
using Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Hypr.Tags;

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
        private readonly IShipmentControllerApiClient _shipmentControllerApiClient;
        private readonly IPickWaveControllerApiClient _pickWaveControllerApiClient;
        private readonly ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        private readonly IReturnSettingsWebApiClient _returnSettingsWebApiClient;
        private readonly ILocationAdminWebApiClient _locationAdminWebApi;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly Lazy<IInventoryControllerApiClient> _inventoryControllerApiClient;       

        private readonly IReturnWebApiClient _returnWebApiClient;
        private readonly IQuoteWebApiClient _quoteWebApiClient;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;
        private readonly IB2BAccountWebApiClient _b2bAccountWebApiClient;

        private const string CMS_LIST_NAME = "emailTemplateContent@mozu";
        private const string ORDER_PREVIEW_RESOURCE_NAME = "backoffice.order1";
        private const string ORDERS_PREVIEW_RESOURCE_NAME = "backoffice.orders1";
        private const string PACKAGE_PREVIEW_RESOURCE_NAME = "backoffice.package1";
        private const string PICKWAVE_PREVIEW_RESOURCE_NAME = "backoffice.pickwave1";
        private const string PICKWAVE2_PREVIEW_RESOURCE_NAME = "backoffice.pickwave2";
        private const string PICKWAVEDETAILS_PREVIEW_RESOURCE_NAME = "backoffice.pickwavedetails";
        private const string SHIPMENT_PREVIEW_RESOURCE_NAME = "backoffice.shipment1";
        private const string SHIPMENT2_PREVIEW_RESOURCE_NAME = "backoffice.shipment2";
        private const string SHIPMENT3_PREVIEW_RESOURCE_NAME = "backoffice.shipment3";
        private const string SHIPMENTS_PREVIEW_RESOURCE_NAME = "backoffice.shipments1";
        private const string LOCATION_PREVIEW_RESOURCE_NAME = "backoffice.location1";
        private const string CUSTOMER_AT_CURBSIDE_PREVIEW_RESOURCE_NAME = "backoffice.customeratcurbside";
        private const string CUSTOMER_AT_CURBSIDE_QRCODE_PREVIEW_RESOURCE_NAME = "backoffice.customer-at-curbside-qrcode";
        private const string RETURN_PREVIEW_RESOURCE_NAME = "backoffice.return1";
        private const string CURBSIDE_CUSTOMER_SURVEY_RESOURCE_NAME = "backoffice.curbside-customer-survey";
        private const string QUOTE_PREVIEW_RESOURCE_NAME = "backoffice.quote";
        private const string ACCOUNT_PREVIEW_RESOURCE_NAME = "backoffice.account";
        private const string B2BUSER_PREVIEW_RESOURCE_NAME = "backoffice.b2bUsers";

        /// <summary>
        /// Public constructor.
        /// </summary>
        public BackOfficeController(ISiteBuilderApiContext apiContext, IOrderWebApiClient orderWebApiClient, ILogger<BackOfficeController> logger,
            IShipmentControllerApiClient shipmentControllerApiClient,
            ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            IPickWaveControllerApiClient pickWaveControllerApiClient,
            ILocationAdminWebApiClient locationAdminWebApi,
            IReturnSettingsWebApiClient returnSettingsWebApiClient,
            IReturnWebApiClient returnWebApiClient,
            ISitesWebApiClient sitesWebApiClient,
            IQuoteWebApiClient quoteWebApiClient,
            ICustomerAccountWebApiClient customerAccountWebApiClient,
            IB2BAccountWebApiClient b2bAccountWebApiClient,
            Lazy<IInventoryControllerApiClient> inventoryControllerApiClient)
        {
            _apiContext = apiContext;
            _orderWebApiClient = orderWebApiClient
                .CloneWithoutUserClaims()
                .CloneWithSiteId(null);
            _shipmentControllerApiClient = shipmentControllerApiClient;
            _pickWaveControllerApiClient = pickWaveControllerApiClient;
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient.CloneWithoutUserClaims();
            _returnSettingsWebApiClient = returnSettingsWebApiClient.CloneWithoutUserClaims();
            _locationAdminWebApi = locationAdminWebApi.CloneWithoutUserClaims();
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _returnWebApiClient = returnWebApiClient;
            _quoteWebApiClient = quoteWebApiClient;
            _customerAccountWebApiClient = customerAccountWebApiClient;
            _b2bAccountWebApiClient = b2bAccountWebApiClient;
            _inventoryControllerApiClient = inventoryControllerApiClient;
        }

        /// <summary>
        /// Order summary, a.k.a. "Print Order".
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> OrderSummary(string orderId, [FromQuery(Name = "t")]string token = null)
        {
            var order = await GetOrderForContext(orderId, token);

            PopulateDataForTemplate(order);

            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("order-details"));
            if (template == null)
            {
                return NotFound("Could not find order details template for the current Theme.");
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

            IEnumerable<ShipmentItem> t = shipment.Items.Select(i => GetDetailedShipmentItem(i,order));
            shipment.Items = t.ToList();
        }

        private void FilterOrderShipments(DC.Order order, string packageId)
        {
           if (order == null || string.IsNullOrWhiteSpace(packageId)) return;
           var filteredShipments = order.Shipments?.Where(v => v.Packages.Any(x => x.Id == packageId))?
                                      .Select(m => {
                                          m.Packages = m.Packages.Where(b => b.Id == packageId).ToList();
                                          return m;
                                      }).ToList() ?? null;

            order.Shipments = filteredShipments;
        }

        private void FilterShipmentPackages(DCShipment dcShipment, string packageId)
        {
            if (dcShipment == null || string.IsNullOrWhiteSpace(packageId)) return;
            var packages = dcShipment.Packages?.Where(v => v.PackageId == packageId)?.ToList() ?? null;
            dcShipment.Packages = packages;
        }

        private void PopulateInventoryDetails(DCShipment shipment)
        {
            if (shipment == null)
                return;

            var inventories = GetInventories(shipment.Items.Select(shipmentItem => shipmentItem.VariationProductCode ?? shipmentItem.ProductCode).ToList(), shipment.FulfillmentLocationCode);
            IEnumerable<Kibo.Fulfillment.Contracts.Model.Item> items = shipment.Items.Select(i => GetShipmentInventoryItem(i, inventories));
            shipment.Items = items.ToList();
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

        private DetailedShipmentItem GetDetailedShipmentItem(ShipmentItem shipmentItem,  DC.Order order)
        {
            var result = Mapper.Map<DetailedShipmentItem>(shipmentItem);
            var product = FindProduct(shipmentItem.ProductCode, order);
            result.ProductName = product.Name;
            result.AdjustedWeight = CalculateAdjustedWeight(product.Weight, shipmentItem.Quantity);            
            return result;
        }

        private ShipmentInventoryDetails GetShipmentInventoryItem(Kibo.Fulfillment.Contracts.Model.Item shipmentItem, List<InventoryResponse> inventories)
        {
            var result = Mapper.Map<ShipmentInventoryDetails>(shipmentItem);
            if(inventories.Count > 0)
            {
                GetInventoryDetails(result, inventories);
            }
            return result;
        }

        private List<InventoryResponse> GetInventories(List<string> productCodes, string locationCode)
        {
            var inventoryRequest = CreateInventoryGetRequest(productCodes, locationCode);
            return _inventoryControllerApiClient.Value.PostQueryInventory(inventoryRequest, null).Result.ReadAsSync().ToList();
        }
        private void GetInventoryDetails(ShipmentInventoryDetails item, List<InventoryResponse> inventories)
        {
            var inventory = inventories.FirstOrDefault(x => x.Upc == (item.VariationProductCode ?? item.ProductCode));

            item.StockAvailable = inventory?.Available ?? 0;
            item.StockOnHand = inventory?.OnHand ?? 0;
            item.StockAllocated = inventory?.Allocated ?? 0;
            item.StockOnBackOrder = Math.Abs(Math.Min(0, (inventory?.OnHand ?? 0) - inventory?.Allocated ?? 0));
            item.SafetyStock = inventory?.SafetyStock ?? 0;
            item.Ltd = inventory?.Ltd ?? 0;
            item.Floor = inventory?.Floor ?? 0;
            item.PendingStock = inventory?.Pending ?? 0;
        }

        private DetailedPickupItem GetDetailPickupItem(PickupItem pickupItem, DC.Order order)
        {
            var result = Mapper.Map<DetailedPickupItem>(pickupItem);
            var product = FindProduct(pickupItem.ProductCode, order);
            result.ProductName = product.Name;
            result.AdjustedWeight = CalculateAdjustedWeight(product.Weight, pickupItem.Quantity);
            return result;
        }

        private static InventoryRequest CreateInventoryGetRequest(IEnumerable<string> productCodes, string locationCode, int pageNum = 1, int pageSize = 200)
        {
            return new InventoryRequest
            {
                Type = "ALL",
                LocationCode = locationCode,
                PageNum = pageNum,
                PageSize = pageSize,
                Items = productCodes.Select(productCode => new ItemQuantity
                {
                    Upc = productCode,
                    Quantity = 0
                }).ToList()
            };
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
        public async Task<IActionResult> PackingSlip(string orderId, int shipmentNumber, [FromQuery(Name = "packageId")] string packageId = null, [FromQuery(Name = "t")]string token = null)
        {
            var order = await GetOrderForContext(orderId, token);
            var dcShipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();

            if (order == null || dcShipment == null || !dcShipment.OrderId.EqualsIgnoreCase(orderId))
            {
                return NotFound();
            }

            var shipment = Mapper.Map<Shipment>(dcShipment);
            order.Shipments = order.Shipments ?? new List<Shipment>(new[] { shipment });
           
             var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("packing-slip"));
            if (template == null)
            {
                return NotFound("Could not find packing slip template for the current Theme.");
            }

            //var ser = new Newtonsoft.Json.JsonSerializer() { ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver() };
            //var jo = Newtonsoft.Json.Linq.JObject.FromObject(shipment, ser);

            PopulateShipmentDetails(shipment, order);
            PopulateInventoryDetails(dcShipment);

            // If we are getting `packageId` then filter the `orderShipments => packages`,
            // `shipments => packages` by `packageId`.
            // else continue with existing flow
            if (!string.IsNullOrWhiteSpace(packageId))
            {
                //Filter the `Shipments` and `Packages` in shipments by `PackageId`
                FilterOrderShipments(order, packageId);
                //Filter the `Packages` in dcShipments by `PackageId`
                FilterShipmentPackages(dcShipment, packageId);
            }

            ViewData["order"] = order;
            ViewData["returnLocation"] = await GetDefaultReturnLocation();
            ViewData["fulfillmentLocation"] = await GetLocation(dcShipment?.FulfillmentLocationCode);
            return await RenderWithContext(template, dcShipment);
        }

        [HttpGet]
        public async Task<IActionResult> PickWave(int pickWaveNumber, bool printPickWave, bool printPackingLists, bool printSingleOrderSheets)
        {
            var pickWaveControllerApiClient = _pickWaveControllerApiClient.CloneWithoutUserClaims();
            var pickWave = (await pickWaveControllerApiClient.GetPickWaveUsingGET(pickWaveNumber)).ReadAsAsync().Result;

            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("pick-wave-print"));
            if (template == null)
            {
                return NotFound("Could not find pick wave template for the current Theme.");
            }

            var shipments = new List<DCShipment>();
            foreach (var shipmentNumber in pickWave.ShipmentNumbers)
            {
                var dcShipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().CloneWithSiteId(null).GetShipmentUsingGET(shipmentNumber)).ReadAsSync();
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

            var pickWaveDetails = (await pickWaveControllerApiClient.GetPickWaveDetailsUsingGET(pickWaveNumber)).ReadAsAsync().Result;
            ViewData["pickWaveDetails"] = pickWaveDetails;

            ViewData["printPickwave"] = printPickWave;
            ViewData["printPackingSlips"] = printPackingLists;
            ViewData["printPickSheets"] = printSingleOrderSheets;

            return await RenderWithContext(template, pickWave);
        }

        [HttpGet]
        public async Task<IActionResult> OrderPickSheets(int pickWaveNumber)
        {
            var pickWaveControllerApiClient = _pickWaveControllerApiClient.CloneWithoutUserClaims();
            var pickWave = (await pickWaveControllerApiClient.GetPickWaveUsingGET(pickWaveNumber)).ReadAsAsync().Result;
            ViewData["pickwave"] = pickWave;

            var shipments = new List<DCShipment>();
            foreach (var shipmentNumber in pickWave.ShipmentNumbers)
            {
                var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().CloneWithSiteId(null).GetShipmentUsingGET(shipmentNumber)).ReadAsSync();
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
                return NotFound("Could not find order pick sheet template for the current Theme.");
            }

            return await RenderWithContext(template, shipments);
        }

        [HttpGet]
        public async Task<IActionResult> TransferPackingSlip(string orderId, int shipmentNumber, [FromQuery(Name = "t")]string token = null)
        {
            var order = await GetOrderForContext(orderId, token);
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();

            if (order == null || shipment == null || !shipment.OrderId.EqualsIgnoreCase(orderId))
            {
                return NotFound();
            }

            var dcShipment = Mapper.Map<Shipment>(shipment);
            order.Shipments = order.Shipments ?? new List<Shipment>(new[] { dcShipment });

            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("transfer-packing-slip"));
            if (template == null)
            {
                return NotFound("Could not find transfer packing slip template for the current Theme.");
            }

            PopulateShipmentDetails(dcShipment, order);
            PopulateInventoryDetails(shipment);

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
        public async Task<IActionResult> ReturnReceipt(string orderId, string returnId, [FromQuery(Name = "t")]string token = null)
        {            
            var sbReturn = await GetReturn(returnId);

            if (sbReturn.Status != DCReturns.Return.ReturnStatusConst.CLOSED &&
                ((sbReturn.ReceiveStatus != DCReturns.Return.ReceiveStatusConst.FULLY_RECEIVED && sbReturn.RefundStatus != DCReturns.Return.RefundStatusConst.FULLY_REFUNDED) ||
                (sbReturn.ReceiveStatus != DCReturns.Return.ReceiveStatusConst.PARTIALLY_RECEIVED && sbReturn.RefundStatus != DCReturns.Return.RefundStatusConst.PARTIALLY_REFUNDED))
                )
            {
                return NotFound("Return Receipt can not be generated for a return which is not processed");
            }
            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("return-receipt"));
            if (template == null)
            {
                return NotFound("Could not find return receipt template for the current Theme.");
            }

            return await RenderWithContext(template, sbReturn);
        }

        [HttpGet]
        public async Task<IActionResult> PrintQuoteSummary(string quoteId)
        {
            var quoteObject = (await _quoteWebApiClient.CloneWithoutUserClaims().GetQuote(quoteId)).ReadAsSync();
            var b2bAccount = (await _customerAccountWebApiClient.CloneWithoutUserClaims().GetAccount(quoteObject.CustomerAccountId)).ReadAsSync();
            var userAccount = (await _b2bAccountWebApiClient.CloneWithoutUserClaims().GetUsers(quoteObject.CustomerAccountId)).ReadAsSync();
            ViewData["isShippable"] = quoteObject.Items.Any(a => a.FulfillmentMethod == "Ship");
            ViewData["account"] = b2bAccount;
            ViewData["userAccount"] = userAccount;

            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("quote.summary"));

            if (template == null)
            {
                return NotFound("Could not find quote summary template for the current Theme.");
            }

            return await RenderWithContext(template, quoteObject);
        }

        /// <summary>
        /// Preview of 'order summary' page from sitebuilder.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Preview(string templateid)
        {
            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(templateid));
            if (template == null)
            {
                return NotFound("could not find order template " + templateid);
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
                object orders = TestDataBroker.GetFileContents(ORDERS_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object model = TestDataBroker.GetFileContents(PICKWAVE_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object pickWaveDetails = TestDataBroker.GetFileContents(PICKWAVEDETAILS_PREVIEW_RESOURCE_NAME).FirstOrDefault();

                ViewData["shipments"] = shipments;
                ViewData["orders"] = orders;
                ViewData["pickWaveDetails"] = pickWaveDetails;

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
                object model = TestDataBroker.GetFileContents(PICKWAVE_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object pickWaveDetails = TestDataBroker.GetFileContents(PICKWAVEDETAILS_PREVIEW_RESOURCE_NAME).FirstOrDefault();

                ViewData["shipments"] = shipments;
                ViewData["orders"] = orders;
                ViewData["pickWaveDetails"] = pickWaveDetails;
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
            else if (templateid == "curbside-arrive" || templateid == "curbside-seeyousoon")
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
            else if (templateid == "customer-at-curbside")
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
            else if (templateid == "curbside-shipment-ready" || templateid == "shipment-pickup-ready" || templateid == "customer-on-way-confirmation")
            {
                var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
                object model = TestDataBroker.GetFileContents(SHIPMENT2_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object location = TestDataBroker.GetFileContents(LOCATION_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
                ViewData["location"] = location;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "curbside-partial-pickup-ready")
            {
                var site = (await _sitesWebApiClient.GetSite(SbApiContext.SiteId)).ReadAsSync();
                object model = TestDataBroker.GetFileContents(SHIPMENT3_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object location = TestDataBroker.GetFileContents(LOCATION_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
                ViewData["location"] = location;
                return await RenderWithContext(template, model);
            }
            else if (templateid == "mobile-notification" || templateid == "customer-at-store-confirmation")
            {
                object model = TestDataBroker.GetFileContents(SHIPMENT2_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                return await RenderWithContext(template, model);
            }
            else if (templateid == "return-receipt")
            {
                object model = TestDataBroker.GetFileContents(RETURN_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                return await RenderWithContext(template, model);
            }
            else if (templateid == "curbside-customer-survey")
            {
                object model = TestDataBroker.GetFileContents(CURBSIDE_CUSTOMER_SURVEY_RESOURCE_NAME).FirstOrDefault();
                return await RenderWithContext(template, model);
            }
            else if (templateid == "quote.summary")
            {
                object model = TestDataBroker.GetFileContents(QUOTE_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object account = TestDataBroker.GetFileContents(ACCOUNT_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object userAccount = TestDataBroker.GetFileContents(B2BUSER_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["account"] = account;
                ViewData["userAccount"] = userAccount;
                return await RenderWithContext(template, model);
            }
            else
            {
                return NotFound();
            }
        }

        /// <summary>
        /// Takes a template, smooshes it with any page settings stored in CMS
        /// and returns the renderable result.
        /// </summary>
        private Task<IActionResult> RenderWithContext(PageTypeDefinition template, object model)
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
            return Task.WhenAll(this.GetContextInitializationTasks()).ContinueWith(_ =>
            {
                ViewData["customContent"] = PageContext.CmsContext.Page.Document != null ? PageContext.CmsContext.Page.Document.Properties : null;
                return (IActionResult)Ok(View(template.Template, model));
            });
        }

        private HttpResponseException TokenExpiredException()
        {
            return new HttpResponseException(StatusCodes.Status404NotFound)
            {
                Value = new StringContent(
                    "Aw, poop! Your access to this page has expired. Please re-request this resource from admin.")
            };
        }
        
        /// <summary>
        ///  Validates that an app claims was sent and that it has access to get orders
        /// </summary>
        /// <exception cref="VaeInvalidOrMissingTokenException"></exception>
        /// <exception cref="VaeUnAuthorizedException"></exception>
        void  ValidateAppAuthorizationForOrders()
        {
            if (_apiContext.AppClaims == null)
            {
                throw new VaeInvalidOrMissingTokenException("missing app token",VaeInvalidOrMissingTokenException.TokenExceptionType.AppInvalid);
            }
            if (_apiContext.AppClaims.Expiration < DateTime.UtcNow)
            {
                throw TokenExpiredException();
            }
            
            var sbClientApp = LightweightAppClaims.CreateForPublicStorefront().AppKey;
            if (_apiContext.AppClaims.AppKey.AppId  == sbClientApp.AppId &&  _apiContext.AppClaims.AppKey.DevAccountNamespace  == sbClientApp.DevAccountNamespace )
            {
                throw new VaeInvalidOrMissingTokenException("user token required when",VaeInvalidOrMissingTokenException.TokenExceptionType.AppInvalid);
            }

            if (!_apiContext.AppClaims.BehaviorIds.Contains(new OrderReadBehavior().Id))
            {
                throw new VaeUnAuthorizedException("not authorized for order read");
            }
        }
        /// <summary>
        /// Confirms that the user claim has permission to access this tenant and order id.
        /// </summary>
        private void ValidateUserTokenOrder(string orderId, string authToken)
        {
            if (!LightweightUserClaims.TryParse(authToken, out var userClaimFromCustomToken))
            {
                throw new VaeInvalidOrMissingTokenException("invalide token",VaeInvalidOrMissingTokenException.TokenExceptionType.UserInvalid);
            }

            if (userClaimFromCustomToken.Expiration < DateTime.UtcNow)
            {
                throw TokenExpiredException();
            }

            if (userClaimFromCustomToken.ScopeType != UserScopeType.Tenant.ToString()
                ||
                userClaimFromCustomToken.Bag.GetValueOrDefault("OrderId", null) != orderId
                ||
                !(userClaimFromCustomToken.Bag.TryGetValue("TenantId", out var tidString) &&
                 Int32.TryParse(tidString, out var claimTenantId) && claimTenantId == _apiContext.TenantId))
            {
                throw new HttpResponseException(StatusCodes.Status403Forbidden);
            }
        }

        /// <summary>
        /// Retrieves an order from CommerceRuntime service using a custom access token rather than the one in api context.
        /// </summary>
        private async Task<DC.Order> GetOrderForContext(string orderId, string authToken)
        {
            if (string.IsNullOrEmpty(authToken))
            {
                ValidateAppAuthorizationForOrders();
            }
            else
            {
                ValidateUserTokenOrder(orderId, authToken);
            }
            var customOrderClient = _orderWebApiClient.CloneWithoutUserClaims();
            return (await _orderWebApiClient.GetOrder(orderId)).ReadAsSync();
        }

        private async Task<Return> GetReturn(string returnId)
        {
            var returnObject = (await _returnWebApiClient.CloneWithoutUserClaims().GetReturn(returnId)).ReadAsSync();
            var result = returnObject?.ToSiteBuilder();

            if (result != null && result.OriginalOrderId.NotIsNullOrEmpty())
            {
                var shipmentNumbers = result.Items?.Select(x => x.ShipmentNumber);
                if (shipmentNumbers.SafeAny())
                {
                    var shipments = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentsUsingGET(filter: $"orderId=={result?.OriginalOrderId};shipmentStatus!=REASSIGNED")).ReadAsSync();
                    result.Shipments = shipments.ExtractResources()?.Where(x => shipmentNumbers.Contains(x.ShipmentNumber))?.ToList();
                }
            }
            return result;
        }
    }
}