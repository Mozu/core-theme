using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Volusion.ProductService.DataContracts.Administration;
using Volusion.SiteBuilder.ClientRepositories.Admin.ServiceClients;
using Volusion.SiteBuilder.ClientRepositories.ServiceClient;

namespace Volusion.SiteBuilder.ClientRepositories.Admin.MockRepositories
{
	public class MockCategoryRepository : ICategoryServiceClient
	{
		private static readonly List<Category> AllCats;

		static MockCategoryRepository()
		{
			AllCats = new List<Category>
			            	{
			            		new Category
			            			{
			            				CategoryId = 1,
			            				CategoryCode = "Scooters",
			            				IsDisplayed = true,
											ParentCategoryId = 0,
											Sequence = 0,
											ProductSetId = 1,
											ProductCount = 2,
											AtomLinks = new Atom
											            	{
											            		Links = new List<AtomLink>
											            		        	{
											            		        		new AtomLink
											            		        			{
											            		        				Rel = "edit",
																							Href = "categories/1",
																							Title = "",
																							MimeType = ""
											            		        			},
																						new AtomLink
											            		        			{
											            		        				Rel = "http://www.volusion.com/schemas/products/search",
																							Href = "products?category=1",
																							Title = "",
																							MimeType = ""
											            		        			}
											            		        	},
																				Base = "http://deviis03.adsdev.volusion.com:8080/Volusion.ProductServices.API/",
																				IsDeferred = false
											            	},
											Content = new LocalizedCategoryContent
			            				                   			{
			            				                   				CategoryId = 1,
			            				                   				Description = "Razor Scooters",
			            				                   				LocaleCode = "en-US",
			            				                   				Name = "Razor Scooters",
																					SearchMetaTags = new List<MetaTag>
																					                 	{
																					                 		new MetaTag
																					                 			{
																					                 				Name = "description",
																														Content = "Scooters"
																					                 			},
																												new MetaTag(){Name = "keywords", Content = "Scooter, Razor"}
																					                 	}
			            				                   			},
			            			},
										
			            		new Category
			            			{
			            				CategoryId = 2,
			            				CategoryCode = "bks",
			            				IsDisplayed = true,
											ParentCategoryId = 0,
											Sequence = 0,
											ProductSetId = 1,
											ProductCount = 3,
											AtomLinks = new Atom
											            	{
											            		Links = new List<AtomLink>
											            		        	{
											            		        		new AtomLink
											            		        			{
											            		        				Rel = "edit",
																							Href = "categories/2",
																							Title = "",
																							MimeType = ""
											            		        			},
																						new AtomLink
											            		        			{
											            		        				Rel = "http://www.volusion.com/schemas/products/search",
																							Href = "products?category=2",
																							Title = "",
																							MimeType = ""
											            		        			}
											            		        	},
																				Base = "http://deviis03.adsdev.volusion.com:8080/Volusion.ProductServices.API/",
																				IsDeferred = false
											            	},
											Content = new LocalizedCategoryContent
			            				                   			{
			            				                   				CategoryId = 2,
			            				                   				Description = "Bikes",
			            				                   				LocaleCode = "en-US",
			            				                   				Name = "Bikes",
																					SearchMetaTags = new List<MetaTag>
																					                 	{
																					                 		new MetaTag
																					                 			{
																					                 				Name = "description",
																														Content = "Bikes"
																					                 			},
																												new MetaTag(){Name = "keywords", Content = "Bike"}
																					                 	}
			            				                   			},
										},
									new Category
			            			{
			            				CategoryId = 3,
			            				CategoryCode = "mtnbks",
			            				IsDisplayed = true,
											ParentCategoryId = 2,
											Sequence = 0,
											ProductSetId = 1,
											ProductCount = 1,
											AtomLinks = new Atom
											            	{
											            		Links = new List<AtomLink>
											            		        	{
											            		        		new AtomLink
											            		        			{
											            		        				Rel = "edit",
																							Href = "categories/3",
																							Title = "",
																							MimeType = ""
											            		        			},
																						new AtomLink
											            		        			{
											            		        				Rel = "http://www.volusion.com/schemas/products/search",
																							Href = "products?category=3",
																							Title = "",
																							MimeType = ""
											            		        			}
											            		        	},
																				Base = "http://deviis03.adsdev.volusion.com:8080/Volusion.ProductServices.API/",
																				IsDeferred = false
											            	},
											Content = new LocalizedCategoryContent
			            				                   			{
			            				                   				CategoryId = 3,
			            				                   				Description = "Moutain Bikes",
			            				                   				LocaleCode = "en-US",
			            				                   				Name = "Mountain Bikes",
																					SearchMetaTags = new List<MetaTag>
																					                 	{
																					                 		new MetaTag
																					                 			{
																					                 				Name = "description",
																														Content = "Mountain Bikes"
																					                 			},
																												new MetaTag(){Name = "keywords", Content = "Mountain Bike"}
																					                 	}
			            				                   			},
										},
			            		new Category
			            			{
			            				CategoryId = 4,
			            				CategoryCode = "XmasSale",
			            				IsDisplayed = false,
			            				ParentCategoryId = 0,
											Sequence = 0,
											ProductSetId = 1,
											ProductCount = 2,
											AtomLinks = new Atom
											            	{
											            		Links = new List<AtomLink>
											            		        	{
											            		        		new AtomLink
											            		        			{
											            		        				Rel = "edit",
																							Href = "categories/4",
																							Title = "",
																							MimeType = ""
											            		        			},
																						new AtomLink
											            		        			{
											            		        				Rel = "http://www.volusion.com/schemas/products/search",
																							Href = "products?category=4",
																							Title = "",
																							MimeType = ""
											            		        			}
											            		        	},
																				Base = "http://deviis03.adsdev.volusion.com:8080/Volusion.ProductServices.API/",
																				IsDeferred = false
											            	},
											Content = new LocalizedCategoryContent
			            				                   			{
			            				                   				CategoryId = 4,
			            				                   				Description = "Xmas Items",
			            				                   				LocaleCode = "en-US",
			            				                   				Name = "Xmas Items"
			            				                   			},
										}
			            	};
		}

		#region IRestCategoryRepository Members

		public Category Get(object id)
		{
			return AllCats.First(x => x.CategoryId == (int) id);
		}

		public Category Update(Category entity)
		{
			int id = AllCats.FindIndex(x => x.CategoryId == entity.CategoryId);
			AllCats[id] = entity;
			return entity;
		}

		public Category Create(Category entity)
		{
			AllCats.Add(entity);
			return entity;
		}

		public void Delete(object id)
		{
			int nid = AllCats.FindIndex(x => x.CategoryId == (int) id);
			AllCats.RemoveAt(nid);
		}

		public Task<Category> GetAsync(object id)
		{
			return Task<Category>.Factory.StartNew(() => AllCats.First(x => x.CategoryId == (int) id));
		}

		public Task<Category> UpdateAsync(Category entity)
		{
			throw new System.NotImplementedException();
		}

		public Task<Category> CreateAsync(Category entity)
		{
			throw new System.NotImplementedException();
		}

		public Task DeleteAsync(object id)
		{
			throw new System.NotImplementedException();
		}

		public CategoryCollection List()
		{
			return new CategoryCollection { Items = AllCats };
		}

		#endregion

		public Category GetCategory()
		{
			return AllCats.First();
		}

		#region Implementation of IRestCategoryRepository

		public void Update(Category[] categories)
		{
			if (categories.Any())
			{
				foreach (var category in categories)
				{
					Update(category);
				}
			}
		}

		#endregion
	}
}