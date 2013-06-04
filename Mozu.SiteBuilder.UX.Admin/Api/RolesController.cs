using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Users;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Users;
using System.Linq;
namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class RoleBehaviorsController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public RoleBehaviorsController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "read")]
        public async Task<Response<List<Mozu.SiteBuilder.UX.Models.Users.BehaviorTree.BehaviorTreeNode>>> GetRoleBehaviors(int? roleId ,FilterCollection extFilter)
        {
          
            RoleBehavior roleBehavior = null;
            if (roleId.HasValue && roleId.Value > -1 )
            {
                roleBehavior = await _permissionsRepository.GetRoleBehavior(roleId.Value );
            }
            else
            {
                roleBehavior = new RoleBehavior(){ Children = new List<int>(), RoleId=-1};
            }
            

            var tree = await _permissionsRepository.GetBehaviorTree();
        
            tree.Nodes.ForEach( x =>  x.Children.ForEach(y => y.RoleId = roleId));

            return  List2(tree.Assign(roleBehavior).Nodes);
        }

        [WebInvoke(UriTemplate = "edit", Method = "POST")]
        public async Task<Response<List<RoleBehavior>>> EditRoleBehaviors([FromBody] List<RoleBehavior> behaviors)
        {
            var serverRole = await _permissionsRepository.GetRole(behaviors.First().RoleId);

            

            
            foreach (var beh in behaviors)
            {
                var foundBeh = serverRole.Behaviors.FirstOrDefault(x=> x.Id ==beh.Id);
                if (foundBeh == null && beh.IsGranted.GetValueOrDefault(false))
                {
                    foundBeh= new Behavior()
                                  {
                                      Id = beh.Id 
                                  };
                    serverRole.Behaviors.Add(foundBeh);
                }
                else
                {
                    serverRole.Behaviors.Remove(foundBeh);
                }
                
                
            }

            await _permissionsRepository.UpdateRole(serverRole);


            return List2<RoleBehavior>(behaviors);
        }
    }

    [ServiceContract]
    public class RolesController : BaseController
    {
        private readonly IPermissionsRepository _permissionsRepository;

        public RolesController(IPermissionsRepository permissionsRepository)
        {
            _permissionsRepository = permissionsRepository;
        }

        [WebGet(UriTemplate = "")]
        public async Task<Response<List<Role>>> GetAll()
        {
            var roles = await _permissionsRepository.GetRoles();

            return roles.IsNullOrEmpty() ? EmptyList2<Role>() : List2(roles);
        }

        [WebGet(UriTemplate = "role/{id}")]
        public async Task<Response<Role>> GetRole(int? id)
        {
            var role = await _permissionsRepository.GetRole(id);

            return role == null ? EmptySingle2<Role>(false) : Single2(role);
        }

        [WebInvoke(UriTemplate = "create", Method = "POST")]
        public async Task<Response<Role>> Create(Role role)
        {
            var addedRole = await _permissionsRepository.AddRole(role);

            return addedRole == null ? EmptySingle2<Role>(false) : Single2(addedRole);
        }

        [WebInvoke(UriTemplate = "update", Method = "POST")]
        public async Task<Response<Role>> Update(Role role)
        {
            var updatedRole = await _permissionsRepository.UpdateRole(role);

            return updatedRole == null ? EmptySingle2<Role>(false) : Single2(updatedRole);
        }

        [WebInvoke(UriTemplate = "delete", Method = "POST")]
        public async Task<Response<Role>> Delete(Role role)
        {
            await _permissionsRepository.DeleteRole(role);

            return EmptySingle2<Role>();
        }

        [WebGet(UriTemplate = "tree")]
        public async Task<Response<BehaviorTree>> GetTree()
        {
            var tree = await _permissionsRepository.GetBehaviorTree();

            return Single2(tree);
        }
    }
}