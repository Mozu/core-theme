

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.ErrorHandling;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.MediaTypeFormatters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;
using AttributeModel = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
using AttributeDC = Mozu.Core.Extensible.Contracts.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [AllowAnonymous]
    [WebApi("app/customerattributes", SuppressDescriptorGeneration = true)]
    public class CustomerAttributeController : BaseController
    {
        private readonly ICustomerAttributeDefinitionWebApiClient _customerAttributeDefinitionWebApiClient;

        public CustomerAttributeController(ICustomerAttributeDefinitionWebApiClient  customerAttributeDefinitionWebApiClient)
        {
            _customerAttributeDefinitionWebApiClient = customerAttributeDefinitionWebApiClient;
            
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<AttributeModel>>> Read([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
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

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<AttributeModel>>> EditAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _customerAttributeDefinitionWebApiClient.UpdateAttribute( _.AttributeFQN , _)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ReadAsSync()).Select(Mapper.Map<AttributeModel>).ToList();
            return this.List2(newAttributes);

        }

        [HttpPostRoute(UriTemplate = "destroy")]
        public async Task<Response<List<AttributeModel>>> DeleteAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _customerAttributeDefinitionWebApiClient.DeleteAttribute(_.AttributeFQN)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ResponseMessage.IsSuccessStatusCode ).ToList();
            return this.List2<AttributeModel>(attributes);
        }
    }


    [AllowAnonymous]
    [WebApi("app/orderattributes", SuppressDescriptorGeneration = true)]
    public class OrderAttributeController : BaseController
    {
        private readonly IOrderAttributeWebApiClient _customerAttributeDefinitionWebApiClient;

        public OrderAttributeController(IOrderAttributeWebApiClient  customerAttributeDefinitionWebApiClient)
        {
            _customerAttributeDefinitionWebApiClient = customerAttributeDefinitionWebApiClient;

        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<AttributeModel>>> Read([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {


            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                var dcitem = (await _customerAttributeDefinitionWebApiClient.GetAttribute(  pagingParams.id )).ReadAsSync();
                var vmitem = Mapper.Map<AttributeModel>(dcitem);
                return this.List2(vmitem);
            }
            else
            {
                var results = (await _customerAttributeDefinitionWebApiClient.GetAttributes(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize)).ReadAsSync();
                var vmItems = Mapper.Map<List<AttributeModel>>(results.Items);
                return this.List2(vmItems, (int)results.TotalCount);


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

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<AttributeModel>>> EditAttribute(List<AttributeModel> attributes)
        {
            //Dictionary<string, string> lookup = new Dictionary<string, string>();
           
        
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _customerAttributeDefinitionWebApiClient.UpdateAttribute(_.AttributeFQN , _)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ReadAsSync()).Select(Mapper.Map<AttributeModel>).ToList();
            return this.List2(newAttributes);

        }

        [HttpPostRoute(UriTemplate = "destroy")]
        public async Task<Response<List<AttributeModel>>> DeleteAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(_ => _customerAttributeDefinitionWebApiClient.DeleteAttribute( _.AttributeFQN)).ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(x => x.Result.ResponseMessage.IsSuccessStatusCode).ToList();
            return this.List2<AttributeModel>(attributes);
        }
    }


}