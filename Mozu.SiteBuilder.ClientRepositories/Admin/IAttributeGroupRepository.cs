namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
    public interface IAttributeGroupRepository : IRepository<Attribute.Contracts.Administration.AttributeGroup>
    {
        Attribute.Contracts.Administration.AttributeGroupCollection GetAttributeGroups();
    }
}
