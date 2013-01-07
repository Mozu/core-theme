using System;
using System.Collections.Generic;

namespace Volusion.SiteBuilder.ClientRepositories
{
	public interface IResourceUriMappingProvider
	{
		IDictionary<string, Uri> GetResourceMappings();
	}
}