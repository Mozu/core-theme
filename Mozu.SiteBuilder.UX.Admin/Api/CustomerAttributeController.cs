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
using AttributeModel = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Extensible.Attribute;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/customerattributes", SuppressDescriptorGeneration = true)]
    public class CustomerAttributeController : BaseController
    {
        private readonly ICustomerAttributeDefinitionWebApiClient _customerAttributeDefinitionWebApiClient;

        public CustomerAttributeController(
            ICustomerAttributeDefinitionWebApiClient customerAttributeDefinitionWebApiClient)
        {
            _customerAttributeDefinitionWebApiClient =
                customerAttributeDefinitionWebApiClient.CloneWithApiContext(x => x.LocaleCode = "en-US");
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<AttributeModel>>> List([FromUri] PagingParamaters pagingParams,
            [FromUri] FilterCollection extFilter)
        {
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                var dcItem = (await _customerAttributeDefinitionWebApiClient.GetAttribute(pagingParams.id))
                    .ReadAsSync();
                var vmItem = Mapper.Map<AttributeModel>(dcItem);
                return List2(vmItem);
            }
            var results = (await _customerAttributeDefinitionWebApiClient.GetAttributes(
                startIndex: pagingParams.startIndex,
                pageSize: pagingParams.pageSize)).ReadAsSync();

            var vmItems = Mapper.Map<List<AttributeModel>>(results.Items);
            return List2(vmItems, results.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<AttributeModel>>> CreateAttribute([FromBody] List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>)
                .Select(a => _customerAttributeDefinitionWebApiClient.CreateAttribute(a))
                .ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(t => t.Result.ReadAsSync()).Select(Mapper.Map<AttributeModel>).ToList();
            return List2(newAttributes);
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<AttributeModel>>> EditAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>).Select(a =>
                {
                    a.AttributeCode = string.IsNullOrEmpty(a.AttributeCode)
                        ? a.AttributeFQN.Split('~')[1]
                        : a.AttributeCode;
                    return _customerAttributeDefinitionWebApiClient.UpdateAttribute(a.AttributeFQN, a);
                }
            ).ToList();
            await Task.WhenAll(tasks);
            
            var newAttributes = tasks.Select(t => t.Result.ReadAsSync())
                .Select(Mapper.Map<AttributeModel>)
                .ToList();
            return List2(newAttributes);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<AttributeModel>>> DeleteAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>)
                .Select(a => _customerAttributeDefinitionWebApiClient.DeleteAttribute(a.AttributeFQN))
                .ToList();
            await Task.WhenAll(tasks);

            tasks.ForEach(t =>
            {
                if (!t.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    throw t.Result.ReadException();
                }
            });

            var deletedAttributes = tasks.Select(t => t.Result.ResponseMessage.IsSuccessStatusCode).ToList();
            return List2(attributes);
        }
    }
}