using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Product.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [AllowAnonymous]
    [WebApi("app/attribute", SuppressDescriptorGeneration = true)]
    public class AttributeController : BaseController
    {
        private readonly IAttributeWebApiClient _attributeWebApiClient;
        private readonly IAttributeHelper _attributeHelper;

        public AttributeController(IAttributeHelper attributeHelper, IAttributeWebApiClient attributeWebApiClient)
        {
            _attributeHelper = attributeHelper;
            _attributeWebApiClient = attributeWebApiClient;
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<Attribute>>> ListAttributes([FromUri] PagingParamaters pagingParams, 
            [FromUri] FilterCollection extFilter)
        {
            if (!string.IsNullOrEmpty(pagingParams.id))
            {
                return await GetSingleAttribute(pagingParams);
            }

            // search coming from the attributePickerField. Treat is like a normal keyword search;
            var query = extFilter.QueryString.Get("query");

            if (!string.IsNullOrEmpty(query))
            {
                extFilter.Add(new FilterCollectionItem
                {
                    comparison = "eq",
                    field = "all",
                    value = query
                });
            }

            // allow the list to be filtered on type (Property, Extra, Option); 
            // will be passed in via the extraParams on the ui proxy; this is separate from the advanced search filter;
            if (extFilter.QueryString.Get("type") != null)
            {
                extFilter.Add(new FilterCollectionItem
                {
                    comparison = "eq",
                    field = "type",
                    value = extFilter.QueryString.Get("type")
                });
            }
           
            var responseFields = "";
            bool isGridOut;
            var isGrid = extFilter.QueryString.Get("isgrid");

            if (!string.IsNullOrEmpty(isGrid) && bool.TryParse(isGrid, out isGridOut) && bool.Parse(isGrid))
            {
                responseFields =
                    "items(attributeCode,adminName,attributeFQN,inputType,isProperty,isExtra,isOption,isValueMappingAttribute,content(name))";
            }

            var dcAttributes = await GetAttributesRaw(pagingParams, extFilter, responseFields);
            var mapped = Mapper.Map<List<Attribute>>(dcAttributes.Item1 );
            return List2(mapped, (int)dcAttributes.Item2);
        }

        private async Task<Response<List<Attribute>>> GetSingleAttribute(PagingParamaters pagingParams)
        {
            var item = await _attributeHelper.GetAttribute(pagingParams.id);
            return List2(item);
        }

        public async Task<Tuple<List<ProductAdmin.Contracts.Attribute>, long>> GetAttributesRaw(PagingParamaters pagingParams, 
            FilterCollection extFilter, 
            string responseFields = null)
        {
            var filter = extFilter.ToFilterString();
            var sort = pagingParams.sort.ToSortString();
            var dcAttributes = new List<ProductAdmin.Contracts.Attribute>();
            long totalCount = 0;
            var startIndex = pagingParams.startIndex.GetValueOrDefault(0);

            while (true)
            {
                var result = await _attributeWebApiClient.GetAttributes(
                    startIndex: startIndex,
                    pageSize: pagingParams.pageSize.GetValueOrDefault(200),
                    sortBy: sort,
                    filter: filter,
                    responseGroups: extFilter.ResponseGroups,
                    responseFields: responseFields
                    ).ConfigureAwait(false);

                var res = result.ReadAsAsync().Result;
                totalCount = res.TotalCount;
                dcAttributes.AddRange(res.Items);
                startIndex = res.PageSize + res.StartIndex;

                if (startIndex >= pagingParams.startIndex.GetValueOrDefault(0) +
                    pagingParams.pageSize.GetValueOrDefault(200) || startIndex >= totalCount)
                {
                    break;
                }
            }

            return new Tuple<List<ProductAdmin.Contracts.Attribute>, long>(dcAttributes, totalCount);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Attribute>>> CreateAttribute([FromBody] List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
            {
                return Message3<List<Attribute>>(false,
                    "No attributes were created because they were not sent correctly. Please try again.");
            }

            var createdAttributes = await _attributeHelper.CreateAttributes(attributes);
            return List2(createdAttributes.ToList());
        }

     
	    [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<Attribute>>> EditAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
            {
                return Message3<List<Attribute>>(false,
                    "No attributes were edited because they were not sent correctly. Please try again.");
            }

            var editedAttributes = await _attributeHelper.EditAttributes(attributes);
            return List2(editedAttributes.ToList());
        }

        [HttpPostRoute(UriTemplate = "destroy")]
        public async Task<Response<List<Attribute>>> DeleteAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
            {
                return Message3<List<Attribute>>(false,
                    "No attributes were deleted because they were not sent correctly. Please try again.");
            }

            var deletedAttributes = await _attributeHelper.DeleteAttributes(attributes);
            return List2(deletedAttributes.ToList());
        }
    }
}