using Volusion.Attribute.Contracts.Administration;

namespace Volusion.SiteBuilder.ClientRepositories.Admin
{
    public class AttributeRepository : BaseRepository<Attribute.Contracts.Administration.Attribute>, IAttributeRepository
    {
        public AttributeRepository(IRestRepositoryConfiguration restConfig) : base(restConfig)
        {
            RelativeUrl = "/Volusion.Attribute.WebApi/Attributes";
            GetId = (d) => d.Id;
        }

        public AttributeCollection GetAttributes()
        {
            var requestUri = RelativeUrl;
            using (var client = GetServiceClient())
            {
                using (var resp = client.GetAsync(requestUri).Result)
                {
                    Validate(resp);
                    return ToObjectContent<AttributeCollection>(resp.Content).ReadAsAsync().Result;
                }
            }
        }
    }
}
