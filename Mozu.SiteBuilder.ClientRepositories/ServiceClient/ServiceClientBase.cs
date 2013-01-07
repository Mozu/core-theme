using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Formatting;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Volusion.Core.EnsureThat;
using Volusion.Core.Logging;
using Volusion.SiteBuilder.Mvc;
using Volusion.Core.ErrorHandling;

namespace Volusion.SiteBuilder.ClientRepositories.ServiceClient
{
	public abstract class ServiceClientBase<T> : IRepositoryServiceClient<T>, IRepositoryServiceClientAsync<T>, IDisposable where T : class
	{
		private readonly HttpClient _httpClient;
		private readonly List<MediaTypeFormatter> _mediaTypeFormatters =
			new List<MediaTypeFormatter> {new JsonMediaTypeFormatter()};

		private readonly ISiteBuilderContext _siteBuilderContext;
		protected ILogger Logger;

		#region .ctor

		protected ServiceClientBase(ISiteBuilderContext siteBuilderContext, IResourceUriResolver resourceUriResolver)
		{
			Volusion.Core.EnsureThat.Ensure.That(() => resourceUriResolver).IsNotNull();
			Volusion.Core.EnsureThat.Ensure.That(() => siteBuilderContext).IsNotNull();

			_siteBuilderContext = siteBuilderContext;
			_httpClient = new HttpClient(new WebRequestHandler {MaxRequestContentBufferSize = 4*1024*1024})
			              	{
			              		MaxResponseContentBufferSize = 4*1024*1024
			              	};
			_httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json", .5));
			_httpClient.BaseAddress = resourceUriResolver.ResolveResourceUri(typeof(T).Name);

			AddDefaultHeaders();
		}

		#endregion

		#region Properties

		protected HttpClient HttpClient
		{
			get { return _httpClient; }
		}

		public Func<T, object> GetEntityId { get; set; }

		protected List<MediaTypeFormatter> MediaTypeFormatters
		{
			get { return _mediaTypeFormatters; }

			set
			{
				_mediaTypeFormatters.Clear();
				_mediaTypeFormatters.AddRange(value);
				HttpClient.DefaultRequestHeaders.Accept.Clear();
				foreach (MediaTypeHeaderValue mediaType in MediaTypeFormatters.SelectMany(m => m.SupportedMediaTypes))
				{
					HttpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(mediaType.MediaType, .5));
				}
			}
		}

		#endregion

		#region Implementation of IRepositoryServiceClient<T>
		public virtual Task<T> GetAsync(object id)
		{
			string requestUri = GetRequestUriForId(id);
			Logger.Debug(String.Format("Sending GET request for resource: {0}", requestUri));

			return HttpClient.GetAsync(requestUri).ContinueWith(responseTask => GetResult<T>(responseTask));
		}

		public Task<T> UpdateAsync(T entity)
		{
			var content = new ObjectContent<T>(entity, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
														  MediaTypeFormatters);
			string requestUri = GetRequestUriForId(GetEntityId(entity));

			Logger.Debug(String.Format("Putting update for resource: {0}:{1}", requestUri, content.ReadAsStringAsync().Result));
			return HttpClient.PutAsync(requestUri, content).ContinueWith(responseTask => GetResult<T>(responseTask));
		}

		public Task<T> CreateAsync(T entity)
		{
			var content = new ObjectContent<T>(entity, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
														  MediaTypeFormatters);
			Logger.Debug(String.Format("Posting new resource to: {0}:{1}", GetRepresentationBaseUri(),
												content.ReadAsStringAsync().Result));
			return HttpClient.PostAsync(GetRepresentationBaseUri(), content).ContinueWith(responseTask => GetResult<T>(responseTask));
		}

		public Task DeleteAsync(object id)
		{
			string requestUri = GetRequestUriForId(id);
			Logger.Debug(String.Format("Deleting resource: {0}", requestUri));

			return 
				HttpClient.DeleteAsync(requestUri)
				.ContinueWith(responseTask =>
			   {

			      try
			      {
			         ValidateResponse(responseTask.Result);
			      }
			      finally
			      {
			         if (responseTask != null)
			            responseTask.Dispose();
			      }
			   });
		}

		public Task<TCollection> ListAsync<TCollection>()
		{
			Logger.Debug(String.Format("Getting a list of resources: {0}", GetRepresentationBaseUri()));
			return HttpClient.GetAsync(GetRepresentationBaseUri().ToString())
				.ContinueWith(responseTask => GetResult<TCollection>(responseTask));
		}

		public virtual T Get(object id)
		{
			string requestUri = GetRequestUriForId(id);
			Logger.Debug(String.Format("Sending GET request for resource: {0}", requestUri));

			using (HttpResponseMessage resp = HttpClient.GetAsync(requestUri).Result)
			{
				ValidateResponse(resp);
				T retVal = resp.Content.ReadAsAsync<T>(MediaTypeFormatters).Result;
				return retVal;
			}
		}

		public virtual T Update(T entity)
		{
			var content = new ObjectContent<T>(entity, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
			                                   MediaTypeFormatters);
			string requestUri = GetRequestUriForId(GetEntityId(entity));

			Logger.Debug(String.Format("Putting update for resource: {0}:{1}", requestUri, content.ReadAsStringAsync().Result));
			using (HttpResponseMessage resp = HttpClient.PutAsync(requestUri, content).Result)
			{
				ValidateResponse(resp);
				entity = resp.Content.ReadAsAsync<T>(MediaTypeFormatters).Result;
			}
			return entity;
		}

		public virtual T Create(T entity)
		{
			var content = new ObjectContent<T>(entity, MediaTypeFormatters[0].SupportedMediaTypes[0].MediaType,
			                                   MediaTypeFormatters);
			Logger.Debug(String.Format("Posting new resource to: {0}:{1}", GetRepresentationBaseUri(),
			                           content.ReadAsStringAsync().Result));
			using (HttpResponseMessage resp = HttpClient.PostAsync(GetRepresentationBaseUri(), content).Result)
			{
				ValidateResponse(resp);
				entity = resp.Content.ReadAsAsync<T>(MediaTypeFormatters).Result;
			}
			return entity;
		}

		public virtual void Delete(object id)
		{
			string requestUri = GetRequestUriForId(id);
			Logger.Debug(String.Format("Deleting resource: {0}", requestUri));
			using (HttpResponseMessage resp = HttpClient.DeleteAsync(requestUri).Result)
			{
				ValidateResponse(resp);
			}
		}


		public virtual TCollection List<TCollection>()
		{
			Logger.Debug(String.Format("Getting resources: {0}", GetRepresentationBaseUri()));
			using (HttpResponseMessage resp = HttpClient.GetAsync(GetRepresentationBaseUri()).Result)
			{
				ValidateResponse(resp);
                var res = resp.Content.ReadAsAsync<TCollection>(MediaTypeFormatters).Result;
			    return res;
			}
		}

		#endregion

		protected void ValidateResponse(HttpResponseMessage msg)
		{
			Logger.Debug(String.Format("{0}\nContent:{1}", msg, msg.Content.ReadAsStringAsync().Result));

			if (!msg.IsSuccessStatusCode || msg.Headers.Contains("x-error-code"))
			{
             //   msg.Content.LoadIntoBufferAsync().RunSynchronously();
                var error = msg.Content.ReadAsAsync<Volusion.Api.Contracts.ErrorCollection>().Result;

                if (error.ExceptionDetail.Type == "Volusion.Core.ErrorHandling.VolusionApplicationException")
                {
                    var apError = new ApplicationError(new ErrorCode("", error.Items[0].MajorCode), new ErrorCode("", error.Items[0].MinorCode), msg.StatusCode, error.Items[0].Message, error.Items[0].Property);


                    var ex = new VolusionApplicationException(apError);


                    throw ex;
                }
                else if (error.ExceptionDetail.Type == "VolusionApplicationAggregateException")
                {
                    var apError = new ApplicationError(new ErrorCode("", error.Items[0].MajorCode), new ErrorCode("", error.Items[0].MinorCode), msg.StatusCode, error.Items[0].Message, error.Items[0].Property);


                    var ex = new VolusionApplicationException(apError);
                    throw ex;
                }

				Logger.Warn(String.Format("{0}\nContent:{1}", msg, msg.Content.ReadAsStringAsync().Result));

				string errorMessage = "";
				if (msg.Headers != null && msg.Headers.Contains("x-error-code"))
				{
					errorMessage = msg.Headers.FirstOrDefault(x => x.Key.Equals("x-error-code")).Value.FirstOrDefault();
				}

				throw new HttpRequestException(String.Format("Call to service has failed with status: {0}, x-error-code: {1}",
				                                             msg.StatusCode, errorMessage));
			}
		}

		#region Private Methods	

		private void AddDefaultHeaders()
		{
			_httpClient.DefaultRequestHeaders.Add("tenant", _siteBuilderContext.TenantId.ToString(CultureInfo.InvariantCulture));
            _httpClient.DefaultRequestHeaders.Add("siteId", _siteBuilderContext.SiteId.ToString(CultureInfo.InvariantCulture));
		}

		private string GetRequestUriForId(object id)
		{
			return String.Format("{0}/{1}", GetRepresentationBaseUri(), id);
		}

		protected Uri GetRepresentationBaseUri()
		{
			return HttpClient.BaseAddress;
		}

		protected TResult GetResult<TResult>(Task<HttpResponseMessage> responseTask)
		{
			try
			{
				ValidateResponse(responseTask.Result);
				var retVal = responseTask.Result.Content.ReadAsAsync<TResult>(MediaTypeFormatters).Result;
				return retVal;
			}
			finally
			{
				if (responseTask != null)
					responseTask.Dispose();
			}
		}

		#endregion

		#region Implementation of IDisposable

		private volatile bool _disposed;

		/// <summary>
		/// Performs application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
		/// </summary>
		/// <filterpriority>2</filterpriority>
		public void Dispose()
		{
			Dispose(true);
			GC.SuppressFinalize(this);
		}

		protected virtual void Dispose(bool disposing)
		{
			Logger.Debug(() => "Entering RestClientService.Dispose");
			if (!disposing || _disposed) return;

			_disposed = true;

			if (HttpClient != null)
			{
				Logger.Debug(() => "Calling _httpClient.Dispose");
				HttpClient.Dispose();
			}

			Logger.Debug(() => "Exiting RestClientService.Dispose");
		}

		#endregion

		protected void ValidateVoidAsyncResponse(Task<HttpResponseMessage> responseTask)
		{
			try
			{
				ValidateResponse(responseTask.Result);
			}
			finally
			{
				if (responseTask != null)
					responseTask.Dispose();
			}
		}
	}
}