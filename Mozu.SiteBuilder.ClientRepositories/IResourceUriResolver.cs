using System;

namespace Volusion.SiteBuilder.ClientRepositories
{
	public interface IResourceUriResolver
	{
		Uri ResolveResourceUri(string resourceName);
	}
}