
using Mozu.CARS.Contracts.Api;
using Mozu.CARS.Contracts.Model;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.Swagger.Client;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.Serialization;
using System.Text;
using System.Web;
namespace Mozu.SiteBuilder.UX.Admin.ApiWrappers
{
    public interface ICARSApiWrapper
    {
        GenerateLabelResponse GenerateLabelUsingPOST(GenerateLabelRequest body);
    }
    public class CARSApiWrapper : ICARSApiWrapper
    {
        private readonly IApiContext _apiContext;
        private readonly ISettings _settings;
        private readonly GenerateLabelControllerApi _generateLabelController;

        public CARSApiWrapper(IApiContext apiContext, ISettings settings)
        {
            _apiContext = apiContext;
            _settings = settings;
            var basePath = settings.Services.First(x => x.Name == "CARS").BaseUrl;
            basePath = "http://services-tp-dev01.kubedev.kibo-dev.com/carrier-service";
            _generateLabelController = new GenerateLabelControllerApi(basePath);
            _generateLabelController.ApiClient.DefaultHeader["x-vol-tenant"] = "1";// _apiContext.TenantId.ToString();
        }

        public GenerateLabelResponse GenerateLabelUsingPOST(GenerateLabelRequest body)
        {
            return _generateLabelController.GenerateLabelUsingPOST(body);
        }
    }
}

