
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.Fulfillment.Contracts.Api;
using Mozu.Fulfillment.Contracts.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.UX.Admin.ApiWrappers
{
    public interface IFulfillerApiWrapper
    {
        ResourceOfShipment BackorderShipment(BackorderShipmentRequest body, int? shipmentNumber);
        void CancelShipment(CancelShipment request, int? shipmentNumber);
        ResourceOfShipment CancelItems(List<CanceledItem> request, int? shipmentNumber);
        void DeleteShipment(int? shipmentNumber);
        ResourceOfShipment Execute(Dictionary<string, object> request, int? shipmentNumber, string taskId);
        void FulfillShipment(int? shipmentNumber);
        ResourceOfShipment GetShipment(int? shipmentNumber, string fields);
        PagedResourcesOfResourceOfShipment GetShipments(string fields, string filter, bool? isLate, int? page,
            string quicksearch, int size, string sort);
        ResourcesOfTask GetTasks(int? shipmentNumber);
        ResourceOfShipment NewShipment(Shipment request);
        ResourceOfShipment ReassignShipmentItems(int? shipmentNumber, List<ReassignItem> items);
        ResourceOfShipment ReassignShipment(int? shipmentNumber, ReassignShipment reassignShipment);
        void RejectShipment(RejectShipment request, int? shipmentNumber);
        ResourceOfShipment ReplaceShipment(Shipment request, int? shipmentNumber);
        ResourceOfShipment SkipTask(int? shipmentNumber, string taskId);
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
            var basePath = settings.Urls("service-url-ShipmentsWebAPi");
            _shipmentController = new ShipmentControllerApi(basePath);
            //_shipmentController.ApiClient.DefaultHeader["x-vol-tenant"] = apiContext.TenantId.ToString();
            //_shipmentController.ApiClient.DefaultHeader["x-vol-Site"] = apiContext.SiteId.ToString();
            //_shipmentController.ApiClient.DefaultHeader["x-vol-master-catalog"] = apiContext.MasterCatalogId.ToString();
            //_shipmentController.ApiClient.DefaultHeader["x-vol-catalog"] = apiContext.CatalogId.ToString();
        }


        public ResourceOfShipment BackorderShipment(BackorderShipmentRequest body, int? shipmentNumber)
        {
            return _shipmentController.BackorderShipmentUsingPUT(body, _apiContext.TenantId, shipmentNumber, _apiContext.SiteId);
        }

        public void CancelShipment(CancelShipment request, int? shipmentNumber)
        {
            _shipmentController.CancelShipmentUsingPUT(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public ResourceOfShipment CancelItems(List<CanceledItem> request, int? shipmentNumber)
        {
            return _shipmentController.CanceledItemsUsingPOST(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public void DeleteShipment(int? shipmentNumber)
        {
            _shipmentController.DeleteShipmentUsingDELETE(shipmentNumber, _apiContext.TenantId,
                _apiContext.SiteId);
        }

        public ResourceOfShipment Execute(Dictionary<string, object> request, int? shipmentNumber, string taskId)
        {
            return _shipmentController.ExecuteUsingPUT(request, _apiContext.TenantId, shipmentNumber, taskId, _apiContext.SiteId);
        }

        public void FulfillShipment(int? shipmentNumber)
        {
            _shipmentController.FulfillShipmentUsingPUT(shipmentNumber, _apiContext.TenantId,
                _apiContext.SiteId);
        }

        public ResourceOfShipment GetShipment(int? shipmentNumber, string fields)
        {
            return _shipmentController.GetShipmentUsingGET(shipmentNumber, _apiContext.TenantId, fields,
                _apiContext.SiteId);
        }

        public PagedResourcesOfResourceOfShipment GetShipments(string fields, string filter, bool? isLate, int? page,
            string quicksearch, int size, string sort)
        {
            return _shipmentController.GetShipmentsUsingGET(_apiContext.TenantId, fields, filter, isLate,page,size,quicksearch,sort, _apiContext.SiteId);
        }

        public ResourcesOfTask GetTasks(int? shipmentNumber)
        {
            return _shipmentController.GetTasksUsingGET(shipmentNumber, _apiContext.TenantId, _apiContext.SiteId);
        }

        public ResourceOfShipment NewShipment(Shipment request)
        {
            return _shipmentController.NewShipmentUsingPOST(request, _apiContext.TenantId, _apiContext.SiteId);
        }

        public ResourceOfShipment ReassignShipmentItems(int? shipmentNumber, List<ReassignItem> items)
        {
            return _shipmentController.ReassignItemsUsingPUT(items,_apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public ResourceOfShipment ReassignShipment(int? shipmentNumber, ReassignShipment reassignShipment)
        {
            return _shipmentController.ReassignShipmentUsingPUT(reassignShipment, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public void RejectShipment(RejectShipment request, int? shipmentNumber)
        {
            _shipmentController.RejectShipmentUsingPUT(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public ResourceOfShipment ReplaceShipment(Shipment request, int? shipmentNumber)
        {
            return _shipmentController.ReplaceShipmentUsingPUT(request, _apiContext.TenantId, shipmentNumber,
                _apiContext.SiteId);
        }

        public ResourceOfShipment SkipTask(int? shipmentNumber, string taskId)
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