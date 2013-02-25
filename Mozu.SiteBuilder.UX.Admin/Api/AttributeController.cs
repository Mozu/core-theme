using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Attribute = Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes.Attribute;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    [AllowAnonymous]
    public class AttributeController : BaseController
    {
        private readonly IAttributeHelper _attributeHelper;

        public AttributeController(IAttributeHelper attributeHelper)
        {
            _attributeHelper = attributeHelper;
        }

        [WebGet(UriTemplate = "read")]
        public async Task<Response<List<Attribute>>> ListAttributes([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter)
        {
            var items = await _attributeHelper.GetAttributes(pagingParams, extFilter);

            return List2(items.ToList());
        }

        [WebInvoke(UriTemplate = "create", Method = "POST")]
        public async Task<Response<List<Attribute>>> CreateAttribute([FromBody] List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were created because they were not sent correctly. Please try again.");

            var createdAttributes = await _attributeHelper.CreateAttributes(attributes);
            return List2(createdAttributes.ToList());
        }

        [WebInvoke(UriTemplate = "update", Method = "POST")]
        public async Task<Response<List<Attribute>>> EditAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were edited because they were not sent correctly. Please try again.");

            var editedAttributes = await _attributeHelper.EditAttributes(attributes);
            return List2(editedAttributes.ToList());
        }

        [WebInvoke(UriTemplate = "destory", Method = "POST")]
        public async Task<Response<List<Attribute>>> DeleteAttribute(List<Attribute> attributes)
        {
            if (attributes == null || !attributes.Any())
                return Message3<List<Attribute>>(false, "No attributes were deleted because they were not sent correctly. Please try again.");

            var deletedAttributes = await _attributeHelper.DeleteAttributes(attributes);
            return List2(deletedAttributes.ToList());
        }
    }
}