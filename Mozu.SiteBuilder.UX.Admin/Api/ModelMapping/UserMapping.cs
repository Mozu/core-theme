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
            Mapper.CreateMap<Behavior, Core.Api.Contracts.Behavior>().ForMember(x => x.RequiresBehaviorIds, m => m.Ignore());
            Mapper.CreateMap<Core.Api.Contracts.Behavior, Behavior>().ForMember(x => x.Category, m => m.Ignore());

            Mapper.CreateMap<Role, Core.Api.Contracts.Role>();
            Mapper.CreateMap<Core.Api.Contracts.Role, Role>();

            Mapper.CreateMap<BehaviorCategory, Core.Api.Contracts.BehaviorCategory>();
            Mapper.CreateMap<Core.Api.Contracts.BehaviorCategory, BehaviorCategory>()
                  .ForMember(x => x.Behaviors, m => m.Ignore());


            

            Mapper.CreateMap<Mozu.AdminUser.Contracts.Invitation, Mozu.SiteBuilder.UX.Admin.Api.Models.Account.Invitation>();
            Mapper.CreateMap<Mozu.SiteBuilder.UX.Admin.Api.Models.Account.Invitation,Mozu.AdminUser.Contracts.Invitation>();
        }
    }
}