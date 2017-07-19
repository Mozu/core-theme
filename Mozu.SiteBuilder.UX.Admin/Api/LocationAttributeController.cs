using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;
using AttributeDC = Mozu.Core.Extensible.Contracts.Attribute;
using AttributeModel = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Extensible.Attribute;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/locationattributes", SuppressDescriptorGeneration = true)]
    public class LocationAttributeController : BaseController
    {
        private readonly ILocationAttributeDefinitionWebApiClient _locationAttributeDefinitionWebApiClient;

        public LocationAttributeController(ILocationAttributeDefinitionWebApiClient locationAttributeDefinitionWebApiClient)
        {
            _locationAttributeDefinitionWebApiClient = locationAttributeDefinitionWebApiClient.CloneWithApiContext(context => context.LocaleCode = "en-US");
        }

        [HttpGetRoute(UriTemplate = "{attributeFQN}/enable")]
        public async Task<HttpResponseMessage> Enable(string attributeFQN)
        {
            var attribute = (await _locationAttributeDefinitionWebApiClient.GetAttribute(attributeFQN)).ReadAsSync();
            attribute.IsActive = true;

            await _locationAttributeDefinitionWebApiClient.UpdateAttribute(attributeFQN, attribute).ConfigureAwait(false);
            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<AttributeModel>>> List([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                var dcitem = (await _locationAttributeDefinitionWebApiClient.GetAttribute(pagingParams.id)).ReadAsSync();
                var vmitem = Mapper.Map<AttributeModel>(dcitem);
                return List2(vmitem);
            }

            var sortBy = "isactive desc";
            if (pagingParams.sort != null && pagingParams.sort.Any())
            {
                sortBy = pagingParams.sort.ToSortString();
            }

            var filter = extFilter?.ToFilterString();

            var results = (await _locationAttributeDefinitionWebApiClient.GetAttributes(
                startIndex: pagingParams.startIndex,
                pageSize: pagingParams.pageSize,
                sortBy: sortBy,
                filter: filter
            )).ReadAsSync();

            var attributes = Mapper.Map<List<AttributeModel>>(results.Items);
            return List2(attributes, results.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<AttributeModel>>> CreateAttribute([FromBody] List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>)
                .Select(attribute =>
                {
                    attribute.AttributeCode = string.IsNullOrEmpty(attribute.AttributeCode)
                        ? attribute.AttributeFQN.Split('~')[1]
                        : attribute.AttributeCode;
                    return _locationAttributeDefinitionWebApiClient.CreateAttribute(attribute);
                })
                .ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(task => task.Result.ReadAsSync())
                .Select(Mapper.Map<AttributeModel>)
                .ToList();
            return List2(newAttributes);
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<AttributeModel>>> EditAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>)
                .Select(attribute => _locationAttributeDefinitionWebApiClient.UpdateAttribute(attribute.AttributeFQN, attribute))
                .ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(task => task.Result.ReadAsSync())
                .Select(Mapper.Map<AttributeModel>)
                .ToList();
            return List2(newAttributes);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<AttributeModel>>> DeleteAttribute(List<AttributeModel> attributes)
        {
            var tasks = attributes.Select(Mapper.Map<AttributeDC>)
                .Select(attribute => _locationAttributeDefinitionWebApiClient.DeleteAttribute(attribute.AttributeFQN))
                .ToList();
            await Task.WhenAll(tasks);

            var newAttributes = tasks.Select(task => task.Result.ResponseMessage.IsSuccessStatusCode).ToList();
            return List2(attributes);
        }
    }
}