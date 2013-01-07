using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class BehaviorsController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public BehaviorsController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "/")]
        public Response<List<Behavior>> GetAll()
        {
            var behaviors = _permissionsRepository.GetBehaviors();

            return behaviors.IsNullOrEmpty() ? EmptyList<Behavior>() : List(behaviors);
        }

        [WebGet(UriTemplate = "/behavior/{id}")]
        public Response<Behavior> Get(int? id)
        {
            var behavior = _permissionsRepository.GetBehavior(id);

            return behavior == null ? EmptySingle<Behavior>(false) : Single(behavior);
        }
    }
}