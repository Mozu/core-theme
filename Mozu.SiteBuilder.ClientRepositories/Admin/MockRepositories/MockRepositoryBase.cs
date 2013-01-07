using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volusion.SiteBuilder.ClientRepositories.ServiceClient;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
	public abstract class MockRepositoryBase<T> : IRepositoryServiceClient<T>, IRepositoryServiceClientAsync<T> where T : class, new()
	{
		protected readonly IList<T> Repo = new List<T>();

		public abstract void Patch( T updatedEntity, T existingEntity);

		public Func<T, object> GetEntityId { get; set; }
		public Func<T, object> SetEntityId { get; set; }

		public T Get(object id)
		{
			return Repo.FirstOrDefault(e=>GetEntityId(e).Equals(id));
		}

		public T Update(T entity)
		{
			var old = Get(GetEntityId(entity));
			Patch(entity, old);
			return old;
		}

		public T Create(T entity)
		{
			var newEntity = new T();
			SetEntityId(newEntity);
			Repo.Add(newEntity);
			return Update(entity);
		}

		public void Delete(object id)
		{
			var entity = Get(id);
			if (entity != null)
			{
				Repo.Remove(entity);
			}
		}

		public Task<T> GetAsync(object id)
		{
			return new Task<T>(()=>Get(id));
		}

		public Task<T> UpdateAsync(T entity)
		{
			return new Task<T>(()=>Update(entity));
		}

		public Task<T> CreateAsync(T entity)
		{
			return new Task<T>(() => Create(entity));
		}

		public Task DeleteAsync(object id)
		{
			return new Task(()=>Delete(id));
		}
	}
}