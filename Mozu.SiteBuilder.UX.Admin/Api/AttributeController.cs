using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.Core.ErrorHandling;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
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
        public async Task<Models.Response<List<Attribute>>> ListAttributes([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {
            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                // get single Attribute
                var item = await _attributeHelper.GetAttribute(pagingParams.id);
                return List2(item);
            }


            // search coming from the attributePickerField. Treat is like a normal keyword search;
            var query = extFilter.QueryString.Get("query");
            if (!String.IsNullOrEmpty(query))
            {
                extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "all", value = query });
            }

            // allow the list to be filtered on type (Property, Extra, Option); will be passed in via the extraParams on the ui proxy; this is seperate from the advanced search filter;
            if (extFilter.QueryString.Get("type") != null)
            {

                extFilter.Add(new FilterCollectionItem { comparison = "eq", field = "type", value = extFilter.QueryString.Get("type") });
            }

            long totalCount;
            var dcAttributes = await GetAttributesRaw(pagingParams, extFilter);

            var mapped = Mapper.Map<List<Attribute>>(dcAttributes.Item1 );
            return List2(mapped, (int)dcAttributes.Item2);
        }

        public async Task<Tuple<List<ProductAdmin.Contracts.Attribute>,long>> GetAttributesRaw(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            string filter = extFilter.ToFilterString();
            //string sort = null; // pagingParams.sort.ToSortString();
            string sort = pagingParams.sort.ToSortString();



            var dcAttributes = new List<Mozu.ProductAdmin.Contracts.Attribute>();
            long totalCount = 0;

            int startIndex = pagingParams.startIndex.GetValueOrDefault(0);
            while (true)
            {
                var result = await _attributeWebApiClient.GetAttributes(
                    startIndex: startIndex,
                        pageSize:pagingParams.pageSize.GetValueOrDefault(200),
                        sortBy:sort,
                        filter:filter,
                        responseGroups:extFilter.ResponseGroups 
                       
                    ).ConfigureAwait(false);
                var res = result.ReadAsAsync().Result;

                totalCount = res.TotalCount;

                dcAttributes.AddRange(res.Items);


                startIndex = res.PageSize + res.StartIndex;

                if (startIndex >= pagingParams.startIndex.GetValueOrDefault(0) + pagingParams.pageSize.GetValueOrDefault(200) || startIndex >= totalCount)
                {
                    break;
                }
            }
            return new Tuple<List<ProductAdmin.Contracts.Attribute>, long>(dcAttributes, totalCount);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Models.Response<List<Attribute>>> CreateAttribute([FromBody] List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were created because they were not sent correctly. Please try again.");

            GenTestData(attributes);


            IEnumerable<Attribute> createdAttributes = await _attributeHelper.CreateAttributes(attributes);
            return List2(createdAttributes.ToList());

        }

        void GenTestData(List<Attribute> attributes)
	    {
	        IEnumerable<string> vals;
	        var tasks = new List<Task>();
	        if (Request.Headers.TryGetValues("createTestData", out vals))
	        {
	            int cnt = int.Parse(vals.First());
	            var att = attributes[0];

	            var testAtts = new List<Attribute>() {att};
	            for (int i = 1; i < cnt; i++)
	            {
	                var dcatt = Mapper.Map<Mozu.ProductAdmin.Contracts.Attribute>(att);
	                dcatt.AttributeCode += i;
	                dcatt.AdminName += i;
	                if (dcatt.Content != null && dcatt.Content.Name != null)
	                {
	                    dcatt.Content.Name += i;
	                }
	                tasks.Add(_attributeWebApiClient.AddAttribute(dcatt));
	            }
	            Task.WaitAll(tasks.ToArray());
                
	            throw new NotImplementedException("nope");
	        }
	    }

	    [HttpPostRoute(UriTemplate = "update")]
        public async Task<Models.Response<List<Attribute>>> EditAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were edited because they were not sent correctly. Please try again.");

            var editedAttributes = await _attributeHelper.EditAttributes(attributes);
            return List2(editedAttributes.ToList());
        }

        [HttpPostRoute(UriTemplate = "destroy")]
        public async Task<Models.Response<List<Attribute>>> DeleteAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were deleted because they were not sent correctly. Please try again.");

            var deletedAttributes = await _attributeHelper.DeleteAttributes(attributes);
            return List2(deletedAttributes.ToList());
        }
    }
}