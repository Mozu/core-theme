using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;



namespace Mozu.SiteBuilder.UX.Models.StoreFront.Commerce
{

    public class CartItem : Mozu.CommerceRuntime.Contracts.Carts.CartItem
    {
        public new Product Product
        {
            get;
            set;
        }

        public string FulfillmentLocationName { get; set; }
    }

    public class Product : Mozu.CommerceRuntime.Contracts.Products.Product
    {
        public string Url
        {
            get
            {
                return "/product/" + ProductCode;
            }
        }
    }

    public class Cart : Mozu.CommerceRuntime.Contracts.Carts.Cart
    {
        public Boolean IsEmpty
        {
            get
            {
                return this.Items == null || this.Items.Count == 0;
            }
        }
        public int Count
        {
            get
            {
                return this.Items.Aggregate(0, (sum, item) => item.Quantity + sum);
            }
        }
        public new List<CartItem> Items
        {
            get;
            set;
        }
    }
}
