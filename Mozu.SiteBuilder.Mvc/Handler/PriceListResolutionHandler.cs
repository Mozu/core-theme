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
        Task<string> ResolvePriceList();

   
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

        Task<string> IPriceListResolutionHandler.ResolvePriceList()
        {
            return _priceListRuntimeWebApiClient.Value.GetResolvedPriceList(customerAccountId: null)
                .ContinueWith(x =>  x.Result == null ? null : x.Result.ReadAsSync().PriceListCode);
        }

        //public async Task<string> ResolvePriceList()
        //{

        //    var client = _priceListRuntimeWebApiClient.Value;

        //   // var newSession = _session.GetSessionForContext(newCtx);

        //    var res = await client.GetResolvedPriceList(customerAccountId: null).ConfigureAwait(false);
        //    if (res.HasException)
        //    {
        //        _logger.Warn("error calling price list resolver", res.ReadException());
        //        return null ;
        //    }

        //    var plCode = res.ReadAsSync()?.PriceListCode;
        //    if (plCode != null)
        //    {
        //        _session.Value.SetValue("priceListCode", plCode);
        //        _apiContext.SetPriceListCode(plCode);
        //        return plCode;
        //    }
        //    return null; ;

        //}

    }
}
