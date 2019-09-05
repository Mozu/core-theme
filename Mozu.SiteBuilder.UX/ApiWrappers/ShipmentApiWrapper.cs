using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.Fulfiller.Contracts.Api;
using Mozu.Fulfiller.Contracts.Model;

namespace Mozu.SiteBuilder.UX.ApiWrappers
{
    public interface IShipmentApiWrapper
    {
        ResourceOfShipment GetShipment(int shipmentNumber);
    }

    public class ShipmentApiWrapper: IShipmentApiWrapper
    {
        private readonly IApiContext _apiContext;
        private readonly ISettings _settings;
        private readonly IShipmentControllerApi _shipmentControllerApi;

        public ShipmentApiWrapper(IApiContext apiContext, ISettings settings)
        {
            _apiContext = apiContext;
            _settings = settings;

            var basePath = settings.Urls("service-url-ShipmentsWebAPi");

            if (!string.IsNullOrEmpty(basePath) && basePath.Contains("shipments"))
            {
                basePath = basePath.Substring(0, basePath.IndexOf("shipments"));
            }

            _shipmentControllerApi = new ShipmentControllerApi(basePath);
        }

        public ResourceOfShipment GetShipment(int shipmentNumber)
        {
            return _shipmentControllerApi.GetShipmentUsingGET(shipmentNumber, _apiContext.TenantId, null, _apiContext.SiteId);
        }
    }
}