using Mozu.Core;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using Mozu.Inventory.Contracts.Api;
using Mozu.Inventory.Contracts.Model;
using System.Collections.Generic;

namespace Mozu.Provisioning.Domain.ApiWrappers
{
    public interface IInventoryApiWrapper
    {
        List<InventoryResponse> PostQueryInventory(InventoryRequest body);
        List<InventoryResponse> GetInventory(string type, List<ItemQuantity> items, RequestLocation requestLocation, List<string> locationWhitelist, List<string> locationBlacklist, int? limit, bool? ignoreSafetyStock, bool? includeNegativeInventory, bool? shippingLocation, bool? transferEnabled, bool? pickup, bool? includeInAggregate, bool? includeAttributes);
    }

    public class InventoryApiWrapper : IInventoryApiWrapper
    {
        private readonly IApiContext _apiContext;
        private readonly ISettings _settings;
        //private readonly IJwtService _jwtService;

        private readonly InventoryControllerApi _inventoryControllerApi;

        public InventoryApiWrapper(
            IApiContext apiContext,
            ISettings settings
            ////IJwtService jwtService
            )
        {
            _apiContext = apiContext;
            _settings = settings;
            ////_jwtService = jwtService;

            var basePath = settings.Urls("service-url-InventoryWebApi");

            _inventoryControllerApi = new InventoryControllerApi(basePath);

            var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL3d3dy5raWJvY29tbWVyY2UuY29tL2FwcF9jbGFpbXMiOnsic3NsIjoiMCIsImVudCI6IjEiLCJtdHIiOiIxIiwidWMiOiIwIiwicm5kIjotODU5OTk2MDAxLCJhaWQiOiJ0ZXN0YXBwIiwiYWtleSI6Im1venUudGVzdGFwcC4xLjAuMC5SZWxlYXNlIiwiYnYiOlswLC0xNTc3NzkyMiwxLDIwNzkwNjQwNjMsMiwyMTQ3NDgzNTgyLDMsLTk3LDQsODE5MSw1LC0xNzE1Myw2LC0xMzQyMTc3MjksNywxMzQyMTc3MjcsMzEsODM4ODM1Ml0sImV4cCI6IjIwMjQtMDYtMTdUMTc6NDE6NDEiLCJlbnYiOiJkZXYwMSJ9LCJuYmYiOjE1NjA3OTMzMDEsImV4cCI6MTcxODY0NjEwMSwiaWF0IjoxNTYwNzkzMzAxLCJpc3MiOiJodHRwczovL3d3dy5raWJvY29tbWVyY2UuY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cua2lib2NvbW1lcmNlLmNvbSJ9.9jFs2XFHvl6msEcnxCpKMqqfAFqA4OLSC-KtiigpSW4";

            _inventoryControllerApi.ApiClient.DefaultHeader["Authorization"] = $"Bearer {token}";
        }

        public List<InventoryResponse> GetInventory(string type, List<ItemQuantity> items,
            RequestLocation requestLocation,
            List<string> locationWhitelist, List<string> locationBlacklist, int? limit,
            bool? ignoreSafetyStock, bool? includeNegativeInventory, bool? shippingLocation,
            bool? transferEnabled, bool? pickup, bool? includeInAggregate, bool? includeAttributes)
        {
            return _inventoryControllerApi.GetInventory(_apiContext.TenantId, "ALL", _apiContext.SiteId, items, requestLocation,
                locationWhitelist, locationBlacklist,
                limit, ignoreSafetyStock, includeNegativeInventory, shippingLocation,
                transferEnabled, pickup, includeInAggregate, includeAttributes);
        }

        public List<InventoryResponse> PostQueryInventory(InventoryRequest body)
        {
            return _inventoryControllerApi.PostQueryInventory(body, _apiContext.TenantId, _apiContext.SiteId);
        }
    }
}
