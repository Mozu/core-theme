using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;
using QRCoder;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using Kibo.Fulfillment.Contracts.Api;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc.ActionConstraints;
using System.Globalization;
using Kibo.Fulfillment.Contracts.Model;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class AnonymousNotificationController : BaseApiController
    {
        private readonly IShipmentControllerApiClient _shipmentControllerApiClient;
        private readonly ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ICustomerSurveyControllerApiClient _customerSurveyControllerApiClient;

        public AnonymousNotificationController(IShipmentControllerApiClient shipmentControllerApiClient,
            ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            ISitesWebApiClient sitesWebApiClient,
            ICustomerSurveyControllerApiClient customerSurveyControllerApiClient)
        {
            _shipmentControllerApiClient = shipmentControllerApiClient;
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient;
            _sitesWebApiClient = sitesWebApiClient;
            _customerSurveyControllerApiClient = customerSurveyControllerApiClient;
        }

        [HttpGet]
        public async Task<IActionResult> RenderShipmentView(int shipmentNumber, string orderId)
        {
            var model = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();

            if (model == null)
            {
                return NotFound();
            }

            if (model.OrderId != orderId)
            {
                return StatusCode(401);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("mobile-notification"));
            if (template == null)
            {
                return NotFound("Could not find MobileNotification template for the current Theme.");
            }
            return View(template.Template, model);
        }

        [HttpGet]
        public async Task<IActionResult> RenderCurbsideArriveView(int shipmentNumber, string orderId)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();
            var site = (await _sitesWebApiClient.CloneWithoutUserClaims().GetSite(SbApiContext.SiteId.Value)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != orderId)
            {
                return StatusCode(401);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("curbside-arrive"));

            var location = await GetLocation(shipment.FulfillmentLocationCode);

            if (template == null)
            {
                return NotFound("Could not find curbside-arrive template for the current Theme.");
            }

            ViewData["location"] = location;
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();

            return View(template.Template, shipment);
        }


        [HttpGet]
        public async Task<IActionResult> GetCurbsideInfo(int shipmentNumber, string orderId)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != orderId)
            {
                return StatusCode(401);
            }

            CurbsideInfo curbsideInfo = new CurbsideInfo
            {

                //Get store info
                Location = await GetLocation(shipment.FulfillmentLocationCode),

                ShipmentNumber = shipmentNumber,
                OrderId = orderId,
                OrderNumber = shipment.OrderNumber
            };

            //Has PickupInfo
            if (shipment.PickupInfo != null)
            {
                curbsideInfo.HasCurbsideData = true;

                //Generate QR code on fly
                var qrCodeinfo = new StringBuilder();
                qrCodeinfo.Append($"Order {shipment.OrderNumber}, ");
                qrCodeinfo.Append($"Shipment {shipment.ShipmentNumber}");
                curbsideInfo.QRCode = GetQRCode(qrCodeinfo.ToString());
            }

            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("customer-at-curbside"));
            if (template == null)
            {
                return NotFound("Could not find customer-at-curbside template for the current Theme.");
            }
            return View(template.Template, curbsideInfo);
        }

        [HttpPost]
        [AcceptHeader("application/json", true)]
        public async Task<ActionResult<CurbsideInfo>> SaveCurbsideInfo([FromBody]CurbsideInfo curbsideInfo)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(curbsideInfo.ShipmentNumber)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != curbsideInfo.OrderId)
            {
                return StatusCode(401);
            }

            //Get store info
            curbsideInfo.Location = await GetLocation(shipment.FulfillmentLocationCode);
            curbsideInfo.OrderNumber = shipment.OrderNumber;

            curbsideInfo.HasCurbsideData = true;

            //Generate QR code on fly
            var qrCodeinfo = new StringBuilder();
            qrCodeinfo.Append($"Order {shipment.OrderNumber}, ");
            qrCodeinfo.Append($"Shipment {shipment.ShipmentNumber}");
            curbsideInfo.QRCode = GetQRCode(qrCodeinfo.ToString());

            //Update curbside info on shipment model and Publish Curbside Event
            var curbsideDict = curbsideInfo.CurbsideFormData.ToDictionary(k => k.Key, v => (object)v.Value);
            (await _shipmentControllerApiClient.CloneWithoutUserClaims().CustomerAtCurbsideUsingPUT(curbsideDict, curbsideInfo.ShipmentNumber)).ReadAsSync();

            return curbsideInfo;
        }

        [HttpGet]
        public async Task<IActionResult> CustomerInTransit(int shipmentNumber, string orderId)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != orderId)
            {
                return StatusCode(401);
            }

            //publish fulfillment customer intrasit and intransit confirmation curside event
            await _shipmentControllerApiClient.CloneWithoutUserClaims().CustomerInTransitUsingPUT(shipmentNumber);

            var location = await GetLocation(shipment.FulfillmentLocationCode);

            var template = new Mvc.Models.CMS.PageTypeDefinition();
            if (shipment.ShipmentType.EqualsIgnoreCase("curbside") || shipment.ShipmentType.EqualsIgnoreCase("bopis_curbside"))
            {
                template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("curbside-seeyousoon"));
            }
            else
            {
                template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("customer-on-way-confirmation"));
            }

            if (template == null)
            {
                return NotFound("Could not find see you soon curside template for the current Theme.");
            }

            ViewData["location"] = location;
            return View(template.Template, shipment);
        }

        [HttpGet]
        public async Task<IActionResult> CurbSideShipmentReadyView(int shipmentNumber, string orderId)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();
            var site = (await _sitesWebApiClient.CloneWithoutUserClaims().GetSite(SbApiContext.SiteId.Value)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != orderId)
            {
                return StatusCode(401);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("curbside-shipment-ready"));

            var location = await GetLocation(shipment.FulfillmentLocationCode);

            if (template == null)
            {
                return NotFound("Could not find curbside-shipment-ready template for the current Theme.");
            }

            ViewData["location"] = location;
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();

            return View(template.Template, shipment);
        }

        [HttpGet]
        public async Task<IActionResult> ShipmentPickupReady(int shipmentNumber, string orderId)
        {
            var model = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();
            var location = await GetLocation(model.FulfillmentLocationCode);
            var site = (await _sitesWebApiClient.CloneWithoutUserClaims().GetSite(SbApiContext.SiteId.Value)).ReadAsSync();

            if (model == null)
            {
                return NotFound();
            }

            if (model.OrderId != orderId)
            {
                return StatusCode(401);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("shipment-pickup-ready"));
            if (template == null)
            {
                return NotFound("Could not find shipment-pickup-ready template for the current Theme.");
            }
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();
            ViewData["location"] = location;
            return View(template.Template, model);
        }

        [HttpGet]
        public async Task<ActionResult> CustomerAtStore(int shipmentNumber, string orderId)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();
            if (shipment == null)
            {
                return NotFound();
            }
            if (shipment.OrderId != orderId)
            {
                return StatusCode(401);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("customer-at-store-confirmation"));
            if (template == null)
            {
                return NotFound("Could not find customer-at-store-confirmation template for the current Theme.");
            }
             
            await  _shipmentControllerApiClient.CloneWithoutUserClaims().CustomerAtStoreUsingPUT(shipmentNumber);
            return View(template.Template, shipment);
        }

        [HttpGet]
        public async Task<IActionResult> PartialCurbsideReadyView(int shipmentNumber, string orderId)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();
            var site = (await _sitesWebApiClient.CloneWithoutUserClaims().GetSite(SbApiContext.SiteId.Value)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != orderId)
            {
                return StatusCode(401);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("curbside-partial-pickup-ready"));

            var location = await GetLocation(shipment.FulfillmentLocationCode);

            if (template == null)
            {
                return NotFound("Could not find curbside-partial-pickup-ready template for the current Theme.");
            }

            ViewData["location"] = location;
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault();

            return View(template.Template, shipment);
        }

            private async Task<Location.Contracts.Location> GetLocation(string locationCode)
        {
            if (!string.IsNullOrEmpty(locationCode))
            {
                var location = (await _locationRuntimeWebApiClient.CloneWithoutUserClaims().GetLocation(locationCode)).ReadAsSync();
                FormatRegularHours(location);
                return location;
            }

            return null;
        }

        private string GetQRCode(string qrCodeinfo)
        {
            QRCodeGenerator qrGenerator = new QRCodeGenerator();
            QRCodeData qrCodeData = qrGenerator.CreateQrCode(qrCodeinfo, QRCodeGenerator.ECCLevel.Q);
            QRCode qrCode = new QRCode(qrCodeData);
            Bitmap qrCodeImage = qrCode.GetGraphic(20);
            return $"data:image/bmp;base64,{qrCodeImage.ToBase64String(ImageFormat.Bmp)}";
        }

        private void FormatRegularHours(Location.Contracts.Location location)
        {
            if (location.RegularHours == null || string.IsNullOrEmpty(location.RegularHours.TimeZone))
                return;

            void FormatHours(Location.Contracts.Hours hours)
            {
                //both openTime and close time always have hours, if isClosed is false.
                if (string.IsNullOrEmpty(hours.OpenTime) && string.IsNullOrEmpty(hours.CloseTime))
                    return;

                DateTime.TryParse(hours.OpenTime, out DateTime openTime);
                DateTime.TryParse(hours.CloseTime, out DateTime closeTime);
                hours.OpenTime = openTime.ToString("h:mm tt", CultureInfo.InvariantCulture);
                hours.CloseTime = closeTime.ToString("h:mm tt", CultureInfo.InvariantCulture);
            }

            FormatHours(location.RegularHours.Sunday);
            FormatHours(location.RegularHours.Monday);
            FormatHours(location.RegularHours.Tuesday);
            FormatHours(location.RegularHours.Wednesday);
            FormatHours(location.RegularHours.Thursday);
            FormatHours(location.RegularHours.Friday);
            FormatHours(location.RegularHours.Saturday);
        }

        [HttpGet]
        public async Task<IActionResult> GetCurbsideSurvey(int shipmentNumber, string orderId)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(shipmentNumber)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != orderId)
            {
                return StatusCode(401);
            }

            CurbsideSurveyInfo surveyInfo = new CurbsideSurveyInfo
            {
                ShipmentNumber = shipmentNumber,
                OrderId = orderId,
                OrderNumber = shipment.OrderNumber
            };

            var hasSurveyData = (await _customerSurveyControllerApiClient.CloneWithoutUserClaims().GetSurveysUsingGET(shipmentNumber)).ReadAsSync();
            if (hasSurveyData.Embedded != null && hasSurveyData.Embedded.Count > 0)
            {
                surveyInfo.hasCurbsideSurveyData = true;
            }

            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("curbside-customer-survey"));
            if (template == null)
            {
                return NotFound("Could not find curbside-customer-survey template for the current Theme.");
            }
            return View(template.Template, surveyInfo);
        }

        [HttpPost]
        [AcceptHeader("application/json", true)]
        public async Task<ActionResult<CurbsideSurveyInfo>> SaveCurbsideSurvey([FromBody]CurbsideSurveyInfo surveyInfo)
        {
            var shipment = (await _shipmentControllerApiClient.CloneWithoutUserClaims().GetShipmentUsingGET(surveyInfo.ShipmentNumber)).ReadAsSync();

            if (shipment == null)
            {
                return NotFound();
            }

            if (shipment.OrderId != surveyInfo.OrderId)
            {
                return StatusCode(401);
            }

            surveyInfo.OrderNumber = shipment.OrderNumber;
            surveyInfo.hasCurbsideSurveyData = true;

            List<CustomerSurveyEntry> entries = surveyInfo.CurbsideSurveyFormData.
            Select(x => new CustomerSurveyEntry()
            {
                Question = x.Key,
                Answer = x.Value
            }).ToList();
            CustomerSurvey customerSurvey = new CustomerSurvey()
            {
                Entries = entries,
                SiteId = SbApiContext.SiteId,
                TenantId = SbApiContext.TenantId,
                ShipmentNumber = surveyInfo.ShipmentNumber
            };

            (await _customerSurveyControllerApiClient.CloneWithoutUserClaims().CreateSurveyUsingPOST(customerSurvey, surveyInfo.ShipmentNumber)).ReadAsSync();

            return surveyInfo;
        }

    }

    public class CurbsideFormData : KeyValuePairBase<string, string>
    {
    }

    public class CurbsideInfo
    {
        public int ShipmentNumber { get; set; }
        public string OrderId { get; set; }
        public int? OrderNumber { get; set; }
        public Mozu.Location.Contracts.Location Location { get; set; }
        public ICollection<CurbsideFormData> CurbsideFormData { get; set; }
        public string QRCode { get; set; }
        public bool HasCurbsideData { get; set; }
    }
    public class CurbsideSurveyFormData : KeyValuePairBase<string, string>
    {
    }

    public class CurbsideSurveyInfo
    {
        public int ShipmentNumber { get; set; }
        public string OrderId { get; set; }
        public int? OrderNumber { get; set; }
        public ICollection<CurbsideFormData> CurbsideSurveyFormData { get; set; }
        public bool hasCurbsideSurveyData { get; set; }
    }

    public static class ImageExtension
    {
        public static string ToBase64String(this Bitmap bmp, ImageFormat imageFormat)
        {
            string base64String = string.Empty;

            MemoryStream memoryStream = new MemoryStream();
            bmp.Save(memoryStream, imageFormat);

            memoryStream.Position = 0;
            byte[] byteBuffer = memoryStream.ToArray();

            memoryStream.Close();

            base64String = Convert.ToBase64String(byteBuffer);
            byteBuffer = null;

            return base64String;
        }
    }
}