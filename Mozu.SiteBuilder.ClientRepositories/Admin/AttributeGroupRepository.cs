using Volusion.Attribute.Contracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
    public class AttributeGroupRepository : BaseRepository<AttributeGroup>, IAttributeGroupRepository
    {
        public AttributeGroupRepository(IRestRepositoryConfiguration restConfig) : base(restConfig)
        {
            RelativeUrl = "/Volusion.Attribute.WebApi/AttributeGroups";
            GetId = (d) => d.Id;
        }

        public AttributeGroupCollection GetAttributeGroups()
        {
            var requestUri = RelativeUrl;
            using (var client = GetServiceClient())
            {
                using (var resp = client.GetAsync(requestUri).Result)
                {
                    Validate(resp);
                    return ToObjectContent<AttributeGroupCollection>(resp.Content).ReadAsAsync().Result;
                }
            }
        }
    }
}
