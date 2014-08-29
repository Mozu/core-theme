using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AttributeDC = Mozu.Core.Extensible.Contracts.Attribute;
using AttributeModel = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/customerattributes", SuppressDescriptorGeneration = true)]
    public class CustomerAttributeController : BaseController
    {
        private readonly ICustomerAttributeDefinitionWebApiClient _customerAttributeDefinitionWebApiClient;

        public CustomerAttributeController(ICustomerAttributeDefinitionWebApiClient  customerAttributeDefinitionWebApiClient)
        {
            _customerAttributeDefinitionWebApiClient = customerAttributeDefinitionWebApiClient.CloneWithApiContext(x => x.LocaleCode = "en-US");

        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<AttributeModel>>> List([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {
           

             if (!String.IsNullOrEmpty(pagingParams.id))
            {
                var dcitem = (await _customerAttributeDefinitionWebApiClient.GetAttribute(pagingParams.id)).ReadAsSync();
                var vmitem = Mapper.Map<AttributeModel>(dcitem);
                return this.List2(vmitem);
            }
            else
            {
                var results = (await _customerAttributeDefinitionWebApiClient.GetAttributes(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize)).ReadAsSync();
                var vmItems = Mapper.Map<List<AttributeModel>>(results.Items);
                return this.List2(vmItems, (int) results.TotalCount);


            }
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<AttributeModel>>> CreateAttribute([FromBody] List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _customerAttributeDefinitionWebApiClient.CreateAttribute(_)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ReadAsSync()).Select(Mapper.Map<AttributeModel>).ToList();
            return this.List2(newAttributes);

        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<AttributeModel>>> EditAttribute(List<AttributeModel> attributes)
        {
           
           
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ =>
            {
                _.AttributeCode = string.IsNullOrEmpty(_.AttributeCode) ? _.AttributeFQN.Split('~')[1] : _.AttributeCode;
                return _customerAttributeDefinitionWebApiClient.UpdateAttribute(_.AttributeFQN, _);
            }
            ).ToList();
            await Task.WhenAll(tasks);
            
            var newAttributes = tasks.Select(x => x.Result.ReadAsSync()).Select(Mapper.Map<AttributeModel>).ToList();
            return this.List2(newAttributes);

        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<AttributeModel>>> DeleteAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _customerAttributeDefinitionWebApiClient.DeleteAttribute(_.AttributeFQN)).ToList();
            await Task.WhenAll(tasks);
             
            tasks.ForEach(x =>
            {
                if (!x.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    throw x.Result.ReadException();
                }
            });
            
            var newAttributes = tasks.Select(x => x.Result.ResponseMessage.IsSuccessStatusCode ).ToList();
            return this.List2<AttributeModel>(attributes);
        }
    }
}