using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.Core.Api.Client;
using AttributeDC = Mozu.Core.Extensible.Contracts.Attribute;
using AttributeModel = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Extensible.Attribute;
using System.Net.Http;
using System.Net;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/orderattributes", SuppressDescriptorGeneration = true)]
    public class OrderAttributeController : BaseController
    {
        private readonly IOrderAttributeWebApiClient _orderAttributeDefinitionWebApiClient;

        public OrderAttributeController(IOrderAttributeWebApiClient  orderAttributeDefinitionWebApiClient)
        {
            _orderAttributeDefinitionWebApiClient = orderAttributeDefinitionWebApiClient.CloneWithApiContext(x => x.LocaleCode = "en-US");

        }

        [HttpGetRoute(UriTemplate = "{attributeFQN}/enable")]
        public async Task<HttpResponseMessage> Enable(string attributeFQN)
        {
            var attribute = await (await _orderAttributeDefinitionWebApiClient.GetAttribute(attributeFQN).ConfigureAwait(false)).ReadAsAsync();
            attribute.IsActive = true;

            await _orderAttributeDefinitionWebApiClient.UpdateAttribute(attributeFQN, attribute).ConfigureAwait(false);

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<AttributeModel>>> List([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {


            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                var dcitem = (await _orderAttributeDefinitionWebApiClient.GetAttribute(  pagingParams.id )).ReadAsSync();
                var vmitem = Mapper.Map<AttributeModel>(dcitem);
                return this.List2(vmitem);
            }
            else
            {
                var sort = "isactive desc";
                if(pagingParams.sort != null && pagingParams.sort.Count != 0)
                {
                    sort = pagingParams.sort.ToSortString();
                }

                var results = (await _orderAttributeDefinitionWebApiClient.GetAttributes(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, sortBy: sort)).ReadAsSync();
                var vmItems = Mapper.Map<List<AttributeModel>>(results.Items);
                return this.List2(vmItems, (int)results.TotalCount);


            }
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<AttributeModel>>> CreateAttribute([FromBody] List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _orderAttributeDefinitionWebApiClient.CreateAttribute(_)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ReadAsSync()).Select(Mapper.Map<AttributeModel>).ToList();
            return this.List2(newAttributes);

        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<AttributeModel>>> EditAttribute(List<AttributeModel> attributes)
        {
            //Dictionary<string, string> lookup = new Dictionary<string, string>();
           
        
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _orderAttributeDefinitionWebApiClient.UpdateAttribute(_.AttributeFQN , _)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ReadAsSync()).Select(Mapper.Map<AttributeModel>).ToList();
            return this.List2(newAttributes);

        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<AttributeModel>>> DeleteAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _orderAttributeDefinitionWebApiClient.DeleteAttribute( _.AttributeFQN)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ResponseMessage.IsSuccessStatusCode).ToList();
            return this.List2<AttributeModel>(attributes);
        }
    }
}
