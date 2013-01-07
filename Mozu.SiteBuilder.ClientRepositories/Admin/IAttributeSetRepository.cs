namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
    public interface IAttributeSetRepository : IRepository<Attribute.Contracts.Administration.AttributeSet>
    {
        Attribute.Contracts.Administration.AttributeSetCollection GetAttributeSets();
    }
}
