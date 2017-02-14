using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Products;
using Mozu.CommerceRuntime.Contracts.Returns;
using BundledProduct = Mozu.CommerceRuntime.Contracts.Products.BundledProduct;
using API = Mozu.SiteBuilder.UX.Admin.Api.Models.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class OrderReturnableItemMapping
    {
        // Pulling this logic out to its own class since it's rather complex and I want it unit tested.
        public List<API.OrderReturnableItem> GetReturnableItems(Order order, List<Return> liveReturns)
        {
            var returnableItemMappings = PullItemsFromOrder(order);
            UpdateQuantityFulfilled(order, returnableItemMappings);
            UpdateQuantityReturned(liveReturns, returnableItemMappings);
            UpdateQuantityReturnable(order, liveReturns, returnableItemMappings);
            return returnableItemMappings.SelectMany(x => x.Value).ToList();
        }

        private Dictionary<OrderItem, List<API.OrderReturnableItem>> PullItemsFromOrder(Order order)
        {
            var returnableItemMappings = new Dictionary<OrderItem, List<API.OrderReturnableItem>>();

            foreach (var item in order.Items)
            {
                var returnableItems = new List<API.OrderReturnableItem>();
                returnableItemMappings[item] = returnableItems;

                // Add entry for standalone/parent/bundle with extras
                var parentWithExtras = CreateForParent(item);
                parentWithExtras.ExcludeProductExtras = false;
                returnableItems.Add(parentWithExtras);

                // Add entry for parent without extras
                if (item.Product.BundledProducts.Any(x => !string.IsNullOrEmpty(x.OptionAttributeFQN)))
                {
                    var parentSansExtras = CreateForParent(item);
                    parentSansExtras.ExcludeProductExtras = true;
                    returnableItems.Add(parentSansExtras);
                }

                // Add bundle items / extras
                foreach (var bundledProduct in item.Product.BundledProducts)
                {
                    var child = CreateForChild(item, bundledProduct);
                    returnableItems.Add(child);
                }
            }
            return returnableItemMappings;
        }

        private string GetProductCode(Product product)
        {
            return !string.IsNullOrEmpty(product.VariationProductCode)
                ? product.VariationProductCode
                : product.ProductCode;
        }

        private API.OrderReturnableItem CreateForParent(OrderItem item)
        {
            return new API.OrderReturnableItem
            {
                Key = item.Id,
                OrderItemId = item.Id,
                OrderLineId = item.LineId.GetValueOrDefault(),
                ProductCode = GetProductCode(item.Product),
                ProductName = item.Product.Name,
                QuantityOrdered = item.Quantity,
                UnitPrice = item.UnitPrice?.ExtendedAmount,
                FulfillmentStatus = item.Product.FulfillmentStatus,
                UnitQuantity = 1
            };
        }

        private API.OrderReturnableItem CreateForChild(OrderItem item, BundledProduct bundledProduct)
        {
            return new API.OrderReturnableItem
            {
                Key = item.Id + "-" + bundledProduct.ProductCode,
                OrderItemId = item.Id,
                OrderLineId = item.LineId.GetValueOrDefault(),
                ProductCode = bundledProduct.ProductCode,
                ProductName = bundledProduct.Name,
                QuantityOrdered = item.Quantity * bundledProduct.Quantity,
                UnitPrice = null,
                ParentItemId = item.Id,
                ParentProductCode = item.Product.ProductCode,
                ParentProductName = item.Product.Name,
                FulfillmentStatus = bundledProduct.FulfillmentStatus,
                OrderItemOptionAttributeFQN = bundledProduct.OptionAttributeFQN ?? string.Empty,
                UnitQuantity = bundledProduct.Quantity
            };
        }

        private void UpdateQuantityFulfilled(Order order, Dictionary<OrderItem, List<API.OrderReturnableItem>> returnableItemMappings)
        {
            foreach (var mapping in returnableItemMappings)
            {
                var orderItem = mapping.Key;
                var returnableItems = mapping.Value;

                // Start with the children so we can keep track of fulfillment quantities.
                var wholeUnitsByBundleItem = orderItem.Quantity;
                var wholeUnitsByExtra = orderItem.Quantity;

                foreach (var child in returnableItems.Where(x => !string.IsNullOrEmpty(x.ParentItemId)))
                {
                    child.QuantityFulfilled = GetFulfilledItemCount(order, child);

                    // Intentionally doing int division to drop the remainder.
                    // For example, 4 parents ordered, an extra has qty 3. If 7 extras fulfilled, 7 / 3 = 2 parent units fulfilled by child.
                    var wholeUnits = child.QuantityFulfilled / child.UnitQuantity;
                    if (string.IsNullOrEmpty(child.OrderItemOptionAttributeFQN))
                    {
                        wholeUnitsByBundleItem = Math.Min(wholeUnitsByBundleItem, wholeUnits);
                    }
                    else
                    {
                        wholeUnitsByExtra = Math.Min(wholeUnitsByExtra, wholeUnits);
                    }
                }

                // Now that we have child counts, update the parent.
                var parentWithExtras = returnableItems.First(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
                parentWithExtras.QuantityFulfilled = string.Equals(orderItem.Product?.ProductUsage, "Bundle")
                    ? Math.Min(wholeUnitsByExtra, wholeUnitsByBundleItem)
                    : Math.Min(wholeUnitsByExtra, GetFulfilledItemCount(order, parentWithExtras));

                var parentSansExtras = returnableItems.FirstOrDefault(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
                if (parentSansExtras != null)
                {
                    parentSansExtras.QuantityFulfilled = string.Equals(orderItem.Product?.ProductUsage, "Bundle")
                        ? wholeUnitsByBundleItem
                        : GetFulfilledItemCount(order, parentWithExtras);
                }
            }
        }

        private int GetFulfilledItemCount(Order order, API.OrderReturnableItem returnableItem)
        {
            Func<AbstractFulfillmentItem, bool> productMatch = packageItem =>
                packageItem.LineId.HasValue && packageItem.LineId == returnableItem.OrderLineId
                && packageItem.ProductCode == returnableItem.ProductCode
                && (packageItem.OptionAttributeFQN ?? string.Empty) == (returnableItem.OrderItemOptionAttributeFQN ?? string.Empty);

            var packageCount = order.Packages?.Where(p => p.Status == "Fulfilled").SelectMany(p => p.Items).Where(productMatch).Sum(i => i.Quantity) ?? 0;
            var pickupCount = order.Pickups?.Where(p => p.Status == "Fulfilled").SelectMany(p => p.Items).Where(productMatch).Sum(i => i.Quantity) ?? 0;
            var digitalCount = order.DigitalPackages?.Where(p => p.Status == "Fulfilled").SelectMany(p => p.Items).Where(productMatch).Sum(i => i.Quantity) ?? 0;

            return packageCount + pickupCount + digitalCount;
        }

        private void UpdateQuantityReturned(List<Return> liveReturns, Dictionary<OrderItem, List<API.OrderReturnableItem>> returnableItemMappings)
        {
            foreach (var mapping in returnableItemMappings)
            {
                var orderItem = mapping.Key;
                var returnableItems = mapping.Value;

                var parentWithExtras = returnableItems.First(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
                parentWithExtras.QuantityDirectlyReturned = GetReturnedItemCount(liveReturns, parentWithExtras.OrderLineId, parentWithExtras.ProductCode, string.Empty, false);

                var parentSansExtras = returnableItems.FirstOrDefault(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
                if (parentSansExtras != null)
                {
                    parentSansExtras.QuantityDirectlyReturned = GetReturnedItemCount(liveReturns, parentSansExtras.OrderLineId, parentSansExtras.ProductCode, string.Empty, true);
                }

                var wholeUnitsByBundleItem = 0;
                var wholeUnitsByExtra = 0;
                foreach (var child in returnableItems.Where(x => !string.IsNullOrEmpty(x.ParentItemId)))
                {
                    var isBundleItem = string.IsNullOrEmpty(child.OrderItemOptionAttributeFQN);
                    child.QuantityDirectlyReturned = GetReturnedItemCount(liveReturns, child.OrderLineId, child.ProductCode, child.OrderItemOptionAttributeFQN, null);
                    child.QuantityIndirectlyReturned = parentWithExtras.QuantityDirectlyReturned * child.UnitQuantity;
                    if (isBundleItem)
                    {
                        child.QuantityIndirectlyReturned += (parentSansExtras?.QuantityDirectlyReturned ?? 0) * child.UnitQuantity;
                    }

                    // Need to round up in this case.
                    var wholeUnits = (int)Math.Ceiling((double)child.QuantityDirectlyReturned / child.UnitQuantity);
                    if (isBundleItem)
                    {
                        wholeUnitsByBundleItem = Math.Max(wholeUnitsByBundleItem, wholeUnits);
                    }
                    else
                    {
                        wholeUnitsByExtra = Math.Max(wholeUnitsByExtra, wholeUnits);
                    }
                }

                parentWithExtras.QuantityIndirectlyReturned = string.Equals(orderItem.Product?.ProductUsage, "Bundle")
                    ? Math.Max((parentSansExtras?.QuantityDirectlyReturned ?? 0) + wholeUnitsByBundleItem, wholeUnitsByExtra)
                    : Math.Max((parentSansExtras?.QuantityDirectlyReturned ?? 0), wholeUnitsByExtra);

                if (parentSansExtras != null)
                {
                    parentSansExtras.QuantityIndirectlyReturned = string.Equals(orderItem.Product?.ProductUsage, "Bundle")
                        ? parentWithExtras.QuantityDirectlyReturned + wholeUnitsByBundleItem
                        : parentWithExtras.QuantityDirectlyReturned;
                }
            }
        }

        // NOTE: If excludeProductExtras parameter is null, bypass it when matching ReturnItems.
        private int GetReturnedItemCount(List<Return> liveReturns, int lineId, string productCode, string optionAttributeFQN, bool? excludeProductExtras)
        {
            Func<ReturnItem, bool> productMatch = returnItem =>
                returnItem.OrderLineId.HasValue && returnItem.OrderLineId.Value == lineId
                && GetProductCode(returnItem.Product) == productCode
                && (returnItem.OrderItemOptionAttributeFQN ?? string.Empty) == (optionAttributeFQN ?? string.Empty)
                && (!excludeProductExtras.HasValue || returnItem.ExcludeProductExtras.GetValueOrDefault() == excludeProductExtras.Value);

            var total = liveReturns.Sum(rma => rma.Items.Where(productMatch).SelectMany(x => x.Reasons).Sum(x => x.Quantity));
            return total;
        }

        private void UpdateQuantityReturnable(Order order, List<Return> liveReturns, Dictionary<OrderItem, List<API.OrderReturnableItem>> returnableItemMappings)
        {
            foreach (var mapping in returnableItemMappings)
            {
                var orderItem = mapping.Key;
                var returnableItems = mapping.Value;

                // Start with the children since they're easy, QuantityIndirectlyReturned aren't partials, and we can track whole units worth of child items.
                var wholeUnitsByBundleItem = orderItem.Quantity;
                var wholeUnitsByExtra = orderItem.Quantity;

                foreach (var child in returnableItems.Where(x => !string.IsNullOrEmpty(x.ParentItemId)))
                {
                    child.QuantityReturnable = child.QuantityFulfilled - child.QuantityDirectlyReturned - child.QuantityIndirectlyReturned;

                    // Intentionally doing int division to drop the remainder.
                    var wholeUnits = child.QuantityReturnable / child.UnitQuantity;
                    if (string.IsNullOrEmpty(child.OrderItemOptionAttributeFQN))
                    {
                        wholeUnitsByBundleItem = Math.Min(wholeUnitsByBundleItem, wholeUnits);
                    }
                    else
                    {
                        wholeUnitsByExtra = Math.Min(wholeUnitsByExtra, wholeUnits);
                    }
                }

                // Now that we have child counts, update the parent.
                var parentWithExtras = returnableItems.First(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
                // Since parent QuantityFulfilled and QuantityIndirectlyReturned can include partials,
                // we need to redo a count of fulfilled and returned parents regardless of extras.
                var parentReturnableCount = GetFulfilledItemCount(order, parentWithExtras) - GetReturnedItemCount(liveReturns, parentWithExtras.OrderLineId, parentWithExtras.ProductCode, string.Empty, null);

                parentWithExtras.QuantityReturnable = string.Equals(orderItem.Product?.ProductUsage, "Bundle")
                    ? Math.Min(wholeUnitsByExtra, wholeUnitsByBundleItem)
                    : Math.Min(wholeUnitsByExtra, parentReturnableCount);

                var parentSansExtras = returnableItems.FirstOrDefault(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
                if (parentSansExtras != null)
                {
                    parentSansExtras.QuantityReturnable = string.Equals(orderItem.Product?.ProductUsage, "Bundle")
                        ? wholeUnitsByBundleItem
                        : parentReturnableCount;
                }
            }

        }
    }
}