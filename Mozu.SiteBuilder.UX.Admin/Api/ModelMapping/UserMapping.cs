using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Models.Users;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class UserMapping : Profile
    {
        public override string ProfileName
        {
            get
            {
                return this.GetType().FullName;
            }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<Behavior, Core.Api.Contracts.Behavior>()
                //ignores
                .ForMember(x => x.RequiresBehaviorIds, m => m.Ignore())
                .ForMember(x => x.ValidUserTypes, op => op.Ignore())
                .ForMember(x => x.IsPrivate, op => op.Ignore())
                .ForMember(x => x.SystemRoles, op => op.Ignore())   // todo: xverify - Greg Murray on 2014-08-28
                ;
            
            Mapper.CreateMap<Core.Api.Contracts.Behavior, Behavior>()
                .ForMember(x => x.Category, m => m.Ignore());

            Mapper.CreateMap<Role, Core.Api.Contracts.Role>()
                //ignores
                .ForMember(x => x.UserScope, op => op.Ignore())
                .ForMember(x => x.AuditInfo, op => op.Ignore())
                ;

            Mapper.CreateMap<Core.Api.Contracts.Role, Role>()
                  .ForMember(x => x.IsSystemRole, opt => opt.ResolveUsing(x => !x.IsSystemRole));

            Mapper.CreateMap<BehaviorCategory, Core.Api.Contracts.BehaviorCategory>();
            Mapper.CreateMap<Core.Api.Contracts.BehaviorCategory, BehaviorCategory>()
                //ignore  
                .ForMember(x => x.Behaviors, m => m.Ignore())
                .ForMember(x => x.ParentCategoryId, op => op.Ignore())
                .ForMember(x => x.Categories, op => op.Ignore())                
                  ;
            
            InvitationRoleMapping.Configure();
            InvitationMapping.Configure();
        }
    }
}