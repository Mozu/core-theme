using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api;



namespace Mozu.SiteBuilder.Mvc
{
    public class SiteBuilderApiContextBuilder : IApiContextBuilder
    {


        public Core.IApiContext BuildApiContext(Core.IApiContext apiContext, System.Net.Http.HttpRequestMessage request)
        {
            return apiContext;
        }
    }
}





