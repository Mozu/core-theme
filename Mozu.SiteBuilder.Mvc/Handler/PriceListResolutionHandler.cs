using Mozu.Core;
using Mozu.Core.Api.Session;
using Mozu.ProductRuntime.Contracts.Clients;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api;

namespace Mozu.SiteBuilder.Mvc.Handler
{
    public interface IPriceListResolutionHandler
    {
        Task<string> ResolvePriceList(int? customerAccoutnid = null);

   
    }

    public class PriceListResolutionHandler: IPriceListResolutionHandler
    {

        Lazy<Mozu.Core.Api.Session.IMozuSession> _session;
        Lazy<IPriceListRuntimeWebApiClient> _priceListRuntimeWebApiClient;
        ISiteBuilderApiContext _apiContext;
        Mozu.Core.Logging.ILogger _logger;
        public PriceListResolutionHandler(ISiteBuilderApiContext apiContext,
            Lazy<Mozu.Core.Api.Session.IMozuSession> session,
            Lazy<IPriceListRuntimeWebApiClient> priceListRuntimeWebApiClient,
            Mozu.Core.Logging.ILogger logger
            )
        {
            _apiContext = apiContext;
            _session = session;
            _priceListRuntimeWebApiClient = priceListRuntimeWebApiClient;
            _logger = logger;
        }

        Task<string> IPriceListResolutionHandler.ResolvePriceList(int? customerAccoutnid )
        {
            return _priceListRuntimeWebApiClient.Value.GetResolvedPriceList(customerAccountId: customerAccoutnid)
                .ContinueWith(x =>  x.Result == null ? null : x.Result.ReadAsSync().PriceListCode);
        }

        

    }
}
