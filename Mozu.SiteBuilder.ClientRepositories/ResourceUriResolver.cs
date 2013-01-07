using System;
using System.Collections.Generic;

namespace Volusion.SiteBuilder.ClientRepositories
{
	public class ResourceUriResolver : IResourceUriResolver
	{
		private readonly IDictionary<string, Uri> _uris;

		public ResourceUriResolver(IResourceUriMappingProvider resourceUriMappingProvider)
		{
			_uris = resourceUriMappingProvider.GetResourceMappings();
		}

		public Uri ResolveResourceUri(string resourceName)
		{
			return _uris[resourceName];

		}
	}
}