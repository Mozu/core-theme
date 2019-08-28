using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.Fulfiller.Contracts.Api;
using Mozu.Fulfiller.Contracts.Model;

namespace Mozu.SiteBuilder.UX.ApiWrappers
{
    public interface IFulfillerApiWrapper
    {
        ResourceOfPickWave GetPickWave(int pickWaveNumber);
    }

    public class FulfillerApiWrapper : IFulfillerApiWrapper
    {
        private readonly IApiContext _apiContext;
        private readonly ISettings _settings;
        private readonly IPickWaveControllerApi _pickWaveControllerApi;

        public FulfillerApiWrapper(IApiContext apiContext, ISettings settings)
        {
            _apiContext = apiContext;
            _settings = settings;

            var basePath = settings.Urls("service-url-PickWaveWebApi");

            if (!string.IsNullOrEmpty(basePath) && basePath.Contains("pickWaves"))
            {
                basePath = basePath.Substring(0, basePath.IndexOf("pickWaves"));
            }

            _pickWaveControllerApi = new PickWaveControllerApi(basePath);

        }

        public ResourceOfPickWave GetPickWave(int pickWaveNumber)
        {
            return _pickWaveControllerApi.GetPickWaveUsingGET(pickWaveNumber, _apiContext.TenantId, _apiContext.SiteId);
        }
    }
}