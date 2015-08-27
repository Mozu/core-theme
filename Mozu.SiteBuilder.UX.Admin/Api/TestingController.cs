using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.PaymentService.Contracts;
using Mozu.ShippingAdmin.Contracts;
using Mozu.ShippingAdmin.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;


using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;
using Site = Mozu.SiteBuilder.UX.Admin.Api.Models.Testing.Site;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/testing", SuppressDescriptorGeneration = true)]
    public class TestingController : BaseController
    {
     

      
        public TestingController()
        {
           
        }

	






    }
}
