
using Mozu.Core;
using Mozu.Core.Settings;
using Swagger.Fulfiller.Api;
using Swagger.Fulfiller.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.ApiWrappers
{
    public interface IFulfillerApiWrapper
    {
        ResponseEntity CancelShipment(CancelShipment request, int? shipmentNumber);
        ResponseEntity CancelItems(List<CanceledItem> request, int? shipmentNumber);
        Object DeleteShipment(int? shipmentNumber);
        Object Execute(Dictionary<string, Object> request, int? shipmentNumber, string taskId);
        ResponseEntity FulfillShipment(int? shipmentNumber);
        ResourceShipment GetShipment(int? shipmentNumber, string fields);

        ResourcesResourceShipment GetShipments(string fields, string filter, bool? isLate, string locationCode,
            int? page, string quicksearch, int size, string sort);

        ResourcesTask GetTasks(int? shipmentNumber);
        ResourceShipment NewShipment(Shipment request);
        ResponseEntity RejectShipment(RejectShipment request, int? shipmentNumber);
        ResourceShipment ReplaceShipment(Shipment request, int? shipmentNumber);
        Object SkipTask(int? shipmentNumber, string taskId);
        string GetWorkflowDefinitionImage(int? shipmentNumber);
        string GetWorkflowInstanceImage(int? shipmentNumber);
    }
    public class FulfillerApiWrapper : IFulfillerApiWrapper
    {
        private readonly IApiContext _apiContext;
        private readonly ISettings _settings;
        private readonly ShipmentControllerApi _shipmentController;

        public FulfillerApiWrapper(IApiContext apiContext, ISettings settings)
        {
            _apiContext = apiContext;
            _settings = settings;
            var basePath = settings.Urls("service-url-FullfilmentWebApi");
            _shipmentController = new ShipmentControllerApi(basePath);
            _shipmentController.ApiClient.DefaultHeader["x-vol-tenant"] = apiContext.TenantId.ToString();
            _shipmentController.ApiClient.DefaultHeader["x-vol-Site"] = apiContext.SiteId.ToString();
            _shipmentController.ApiClient.DefaultHeader["x-vol-master-catalog"] = apiContext.MasterCatalogId.ToString();
            _shipmentController.ApiClient.DefaultHeader["x-vol-catalog"] = apiContext.CatalogId.ToString();
        }

        public ResponseEntity CancelShipment(CancelShipment request, int? shipmentNumber)
        {
            return _shipmentController.CancelShipmentUsingPUT(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public ResponseEntity CancelItems(List<CanceledItem> request, int? shipmentNumber)
        {
            return _shipmentController.CanceledItemsUsingPOST(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public object DeleteShipment(int? shipmentNumber)
        {
            return _shipmentController.DeleteShipmentUsingDELETE(shipmentNumber, _apiContext.TenantId,
                _apiContext.SiteId);
        }

        public object Execute(Dictionary<string, object> request, int? shipmentNumber, string taskId)
        {
            return _shipmentController.ExecuteUsingPUT(request, _apiContext.TenantId, shipmentNumber, taskId, _apiContext.SiteId);
        }

        public ResponseEntity FulfillShipment(int? shipmentNumber)
        {
            return _shipmentController.FulfillShipmentUsingPUT(shipmentNumber, _apiContext.TenantId,
                _apiContext.SiteId);
        }

        public ResourceShipment GetShipment(int? shipmentNumber, string fields)
        {
            return _shipmentController.GetShipmentUsingGET(shipmentNumber, _apiContext.TenantId, fields,
                _apiContext.SiteId);
        }

        public ResourcesResourceShipment GetShipments(string fields, string filter, bool? isLate, string locationCode, int? page,
            string quicksearch, int size, string sort)
        {
            return _shipmentController.GetShipmentsUsingGET(_apiContext.TenantId, fields, filter, isLate, locationCode,
                page, quicksearch, size, sort, _apiContext.SiteId);
        }

        public ResourcesTask GetTasks(int? shipmentNumber)
        {
            return _shipmentController.GetTasksUsingGET(shipmentNumber, _apiContext.TenantId, _apiContext.SiteId);
        }

        public ResourceShipment NewShipment(Shipment request)
        {
            return _shipmentController.NewShipmentUsingPOST(request, _apiContext.TenantId, _apiContext.SiteId);
        }

        public ResponseEntity RejectShipment(RejectShipment request, int? shipmentNumber)
        {
            return _shipmentController.RejectShipmentUsingPUT(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public ResourceShipment ReplaceShipment(Shipment request, int? shipmentNumber)
        {
            return _shipmentController.ReplaceShipmentUsingPUT(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public object SkipTask(int? shipmentNumber, string taskId)
        {
            return _shipmentController.SkipTaskUsingPUT(shipmentNumber, taskId, _apiContext.TenantId,
                _apiContext.SiteId);
        }

        public string GetWorkflowDefinitionImage(int? shipmentNumber)
        {
            return _shipmentController.WorkflowDefinitionImageUsingGET(shipmentNumber, _apiContext.TenantId,
                _apiContext.SiteId);
        }

        public string GetWorkflowInstanceImage(int? shipmentNumber)
        {
            return _shipmentController.WorkflowInstanceImageUsingGET(shipmentNumber, _apiContext.TenantId,
                _apiContext.SiteId);
        }
    }
}