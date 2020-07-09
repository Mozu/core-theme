using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Actions;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.OAF;
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
using System.Web;
using System.Web.Http;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    public class AnonymousNotificationController : BaseApiController
    {
        private readonly IFulfillmentProxyWebApiClient _fulfillmentProxyClient;
        private readonly ILocationRuntimeWebApiClient _locationRuntimeWebApiClient;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        public AnonymousNotificationController(IFulfillmentProxyWebApiClient fulfillmentProxyClient,
            ILocationRuntimeWebApiClient locationRuntimeWebApiClient,
            ISitesWebApiClient sitesWebApiClient)
        {
            _fulfillmentProxyClient = fulfillmentProxyClient;
            _locationRuntimeWebApiClient = locationRuntimeWebApiClient;
            _sitesWebApiClient = sitesWebApiClient;
        }

        [HttpGet]
        public async Task<HttpResponseMessage> RenderShipmentView(int shipmentNumber, string orderId)
        {
            var model = (await _fulfillmentProxyClient.CloneWithoutUserClaims().GetShipment(shipmentNumber)).ReadAsSync();

            if (model == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            if (model.OrderId != orderId)
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("mobile-notification"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find MobileNotification template for the current Theme.");
            }
            return Request.CreateResponse(HttpStatusCode.OK, View(template.Template, model));
        }

        [HttpGet]
        public async Task<HttpResponseMessage> RenderCurbsideArriveView(int shipmentNumber, string orderId)
        {
            var shipment = (await _fulfillmentProxyClient.CloneWithoutUserClaims().GetShipment(shipmentNumber)).ReadAsSync();
            var site = (await _sitesWebApiClient.CloneWithoutUserClaims().GetSite(SbApiContext.SiteId)).ReadAsSync();

            if (shipment == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            if (shipment.OrderId != orderId)
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
            }
            var template = SiteContext.Theme.BackOfficeTemplates.SingleOrDefault(x => x.Id.EqualsIgnoreCase("curbside-arrive"));

            var location = await GetLocation(shipment.FulfillmentLocationCode);

            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find curbside-arrive template for the current Theme.");
            }

            ViewData["location"] = location;
            ViewData["domainName"] = site.Domains.Where(x => x.IsPrimary).Select(x => x.DomainName).FirstOrDefault(); 

            return Request.CreateResponse(HttpStatusCode.OK, View(template.Template, shipment));
        }


        [HttpGet]
        public async Task<HttpResponseMessage> GetCurbsideInfo(int shipmentNumber, string orderId)
        {
            var shipment = (await _fulfillmentProxyClient.CloneWithoutUserClaims().GetShipment(shipmentNumber)).ReadAsSync();

            if (shipment == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            if (shipment.OrderId != orderId)
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
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
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find customer-at-curbside template for the current Theme.");
            }
            return Request.CreateResponse(HttpStatusCode.OK, View(template.Template, curbsideInfo));
        }

        [HttpPost]
        public async Task<CurbsideInfo> SaveCurbsideInfo(CurbsideInfo curbsideInfo)
        {
            var shipment = (await _fulfillmentProxyClient.CloneWithoutUserClaims().GetShipment(curbsideInfo.ShipmentNumber)).ReadAsSync();

            if (shipment == null)
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }

            if (shipment.OrderId != curbsideInfo.OrderId)
            {
                throw new HttpResponseException(HttpStatusCode.Forbidden);
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
            var jObject = JObject.FromObject(curbsideInfo.CurbsideFormData.ToDictionary(k => k.Key, v => v.Value));
            (await _fulfillmentProxyClient.CloneWithoutUserClaims().CustomerAtCurbside(curbsideInfo.ShipmentNumber, jObject)).ReadAsSync();

            return curbsideInfo;
        }

        private async Task<Location.Contracts.Location> GetLocation(string locationCode)
        {
            if (!string.IsNullOrEmpty(locationCode))
            {
                return (await _locationRuntimeWebApiClient.CloneWithoutUserClaims().GetLocation(locationCode)).ReadAsSync();
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