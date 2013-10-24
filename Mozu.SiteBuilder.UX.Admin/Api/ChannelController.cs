using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Channels;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
     [WebApi("app/channel", SuppressDescriptorGeneration = true)]
  
    public class ChannelController : BaseController
    {
         private readonly IChannelWebApiClient _channelWebApiClient;

         public ChannelController(Mozu.CommerceRuntime.Contracts.Clients.IChannelWebApiClient channelWebApiClient)
         {
             _channelWebApiClient = channelWebApiClient;
         }
         [HttpGetRoute(UriTemplate = "read")]
         public async Task<HttpResponseMessage > ListProductTypes([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
         {
             var res = (await _channelWebApiClient.GetChannels(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize)).ReadAsSync();
             var list =  List2(res.Items , (int)res.TotalCount);
             return this.Request.CreateResponse(HttpStatusCode.OK, list, LowerCaseJsonMediaTypeFormatter.Default);
         }

         [HttpPostRoute(UriTemplate = "create")]
         public async Task<HttpResponseMessage> CreateProduct(List<Channel> channels )
         {
             var tasks = channels.Select(_ => _channelWebApiClient.CreateChannel(_)).ToList();
             await Task.WhenAll(tasks);
             var newChannels = tasks.Select(x => x.Result.ReadAsSync()).ToList();
             return this.Request.CreateResponse(HttpStatusCode.OK, this.List2(newChannels), LowerCaseJsonMediaTypeFormatter.Default);
         }

         [HttpPostRoute(UriTemplate = "edit")]
         public async Task<HttpResponseMessage> EditProduct(List<Channel> channels)
         {
             var tasks = channels.Select(_ =>
                 {
                     _.TenantId = this.SbApiContext.TenantId;

                     return _channelWebApiClient.UpdateChannel(_.Code, _);
                 }).ToList();
             await Task.WhenAll(tasks);
             var newChannels = tasks.Select(x => x.Result.ReadAsSync()).ToList();
             return this.Request.CreateResponse(HttpStatusCode.OK, this.List2(newChannels), LowerCaseJsonMediaTypeFormatter.Default);
         }

         [HttpPostRoute(UriTemplate = "delete")]
         public async Task<HttpResponseMessage> DeleteProduct(List<Channel> channels)
         {
             var tasks = channels.Select(_ => _channelWebApiClient.DeleteChannel( _.Code)).ToList();
             await Task.WhenAll(tasks);
             var newChannels = tasks.Select(x =>
                 {
                     if (x.Result.HasException )
                     {
                         throw x.Result.ReadException();
                     }
                     return true;
                 });
             return this.Request.CreateResponse(HttpStatusCode.OK, this.SuccessWithTotal2<Channel>(channels.Count));
         }
    }
}
