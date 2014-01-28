using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.Core.ErrorHandling;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers.AttributeHelpers;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;
using Mozu.ProductAdmin.Contracts.Clients;

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
        public async Task<Response<List<Attribute>>> ListAttributes([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {
            if (!String.IsNullOrEmpty(pagingParams.id))
            {
                // get single Attribute
                var item = await _attributeHelper.GetAttribute(pagingParams.id);
                return List2(item);
            }
            else
            {
                string filter = extFilter.ToFilterString();
                string sort = null;   // pagingParams.sort.ToSortString();

                var result = await _attributeWebApiClient.GetAttributes(
                    /* startIndex:     */ pagingParams.startIndex,
                    /* pageSize:       */ pagingParams.pageSize,
                    /* sortBy:         */ sort,
                    /* filter:         */ filter,
                    /* responseGroups: */ null
                    ).ConfigureAwait(false);
                var res = result.ReadAsAsync().Result;
                var mapped = res.Items.Map<List<Attribute>>();

                return List2(mapped.ToList(), (int)res.TotalCount);
            }
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Attribute>>> CreateAttribute([FromBody] List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were created because they were not sent correctly. Please try again.");

            
            try
            {
                IEnumerable<Attribute> createdAttributes = await _attributeHelper.CreateAttributes(attributes);
                return List2(createdAttributes.ToList());
            }
            catch (AggregateException aggEx)
            {
                Exception simpleEx = aggEx.UnwrapAgg();
                var mozuEx = simpleEx as MozuApplicationException;
                if (mozuEx != null)
                    return FriendlyMozuFailure<Attribute>(mozuEx);

                return FailureList2<Attribute>(simpleEx.Message);
            }
            catch (AutoMapperMappingException mapEx)
            {
                Exception innerEx = mapEx.InnerException;
                return FailureList2<Attribute>(innerEx.Message);
            }
            catch (ArgumentException argEx)
            {
                return FailureList2<Attribute>(argEx.Message);
            }
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<Attribute>>> EditAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were edited because they were not sent correctly. Please try again.");

            var editedAttributes = await _attributeHelper.EditAttributes(attributes);
            return List2(editedAttributes.ToList());
        }

        [HttpPostRoute(UriTemplate = "destroy")]
        public async Task<Response<List<Attribute>>> DeleteAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were deleted because they were not sent correctly. Please try again.");

            var deletedAttributes = await _attributeHelper.DeleteAttributes(attributes);
            return List2(deletedAttributes.ToList());
        }
    }
}