using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Mozu.SiteBuilder.UX.Admin.MockServices;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    using Contracts = ProductAdmin.Contracts;

    [ServiceContract]
    [AllowAnonymous]
    public class AttributeController : BaseController
    {
        private readonly IMoreAwesomeAttributeWebApiClient _attributeWebApiClient;

        public AttributeController(IMoreAwesomeAttributeWebApiClient attributeWebApiClient)
        {
            _attributeWebApiClient = attributeWebApiClient;
        }

        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<Attribute>>> ListAttributes([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {
            string filter = null; // extFilter.ToFilterString();
            string sort = null; // pagingParams.sort.ToSortString();

            var result = await _attributeWebApiClient.GetAttributes(
                /*startIndex: */     pagingParams.startIndex,
                /*pageSize: */       pagingParams.pageSize,
                /*sortBy: */         sort,
                /*responseGroups: */ null,
                /*filter: */         filter
                );
            var res = result.ReadAsAsync().Result;

            return List2(Mapper.Map<List<Attribute>>(res.Items), (int) res.TotalCount);
        }

        [WebInvoke(UriTemplate = "create", Method = "POST")]
        public async Task<Response<List<Attribute>>> CreateAttribute([FromBody] List<Attribute> attributes)
        {
            if (attributes == null)
                return Message3<List<Attribute>>(false, "No attributes were created because they were not sent correctly. Please tray again.");

            var createdAttributes = new List<Attribute>(attributes.Count);
            foreach (var dataModel in attributes.Select(Mapper.Map<Contracts.Attribute>))
            {
                Contracts.Attribute returned;

                try
                {
                    var result = await _attributeWebApiClient.AddAttribute(dataModel);
                    returned = result.ReadAsAsync().Result;
                }
                catch (AggregateException e)
                {
                    return FailureList2<Attribute>(e.UnwrapAgg().Message);
                }

                createdAttributes.Add(Mapper.Map<Attribute>(returned));
            }

            return List2(createdAttributes);
        }

        /*protected IEnumerable<T> FromMappedListAction<T, TContract>(IEnumerable<T> collection, Func<TContract, IEnumerable<T>> selector)
        {
            return collection.Select(x => Mapper.Map<TContract>(x)).Select(item => Mapper.Map<T>(selector(item)));
        }*/

        [WebInvoke(UriTemplate = "edit", Method = "POST")]
        public async Task<Response<List<Attribute>>> EditAttribute(List<Attribute> attributes)
        {
            var editedAttributes = new List<Attribute>(attributes.Count);

            foreach (var mappedPt in attributes.Select(Mapper.Map<Contracts.Attribute>))
            {
                var res = await _attributeWebApiClient.UpdateAttribute(mappedPt, mappedPt.AttributeFQN);
                var returned = res.ReadAsAsync().Result;
                editedAttributes.Add(Mapper.Map<Attribute>(returned));
            }

            return List2(editedAttributes);
        }

        [WebInvoke(UriTemplate = "delete", Method = "POST")]
        public async Task<Response<List<Attribute>>> DeleteAttribute(List<Attribute> attributes)
        {
            var deletedAttributes = new List<Attribute>(attributes.Count);

            foreach (var attribute in attributes.Select(Mapper.Map<Contracts.Attribute>))
            {
                var res = await _attributeWebApiClient.DeleteAttribute(attribute.AttributeFQN);
                var returned = res.ReadAsAsync().Result;
                deletedAttributes.Add(Mapper.Map<Attribute>(returned));
            }
            return List2(deletedAttributes);
        }
    }
}