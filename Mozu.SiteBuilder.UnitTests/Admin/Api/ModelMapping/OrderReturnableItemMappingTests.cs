using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.CommerceRuntime.Contracts.Fulfillment;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Products;
using Mozu.CommerceRuntime.Contracts.Returns;
using Mozu.SiteBuilder.UX.Admin.Api.ModelMapping;
using NUnit.Framework;
using Should;

namespace Mozu.SiteBuilder.UnitTests.Admin.Api.ModelMapping
{
    [TestFixture]
    public class OrderReturnableItemMappingTests
    {
        private OrderReturnableItemMapping CreateObjectUnderTest()
        {
            return new OrderReturnableItemMapping();
        }

        /// <summary>
        /// 4 parents, 3 fulfilled
        /// 4 x 3 extras, 8 fulfilled
        /// </summary>
        private Order CreateOrderWithParentWithExtras()
        {
            var order = new Order
            {
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        LineId = 1,
                        Quantity = 4,
                        Product = new Product
                        {
                            ProductCode = "parent-code",
                            VariationProductCode = "parent-variation-code",
                            ProductUsage = "Standard",
                            BundledProducts = new List<BundledProduct>
                            {
                                new BundledProduct
                                {
                                    ProductCode = "extra-code",
                                    OptionAttributeFQN = "extra-attribute",
                                    Quantity = 3
                                }
                            }
                        }
                    }
                },
                Packages = new List<Package>
                {
                    new Package
                    {
                        Status = "Fulfilled",
                        Items = new List<PackageItem>
                        {
                            new PackageItem
                            {
                                LineId = 1, ProductCode = "parent-variation-code", OptionAttributeFQN = null, Quantity = 3
                            },
                            new PackageItem
                            {
                                LineId = 1, ProductCode = "extra-code", OptionAttributeFQN = "extra-attribute", Quantity = 8
                            }
                        }
                    }
                }
            };
            return order;
        }

        /// <summary>
        /// 4 x 3 bundle items, 11 fulfilled
        /// 4 x 3 extras, 8 fulfilled
        /// </summary>
        /// <returns></returns>
        private Order CreateOrderWithBundleWithExtras()
        {
            var order = new Order
            {
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Id = Guid.NewGuid().ToString(),
                        LineId = 1,
                        Quantity = 4,
                        Product = new Product
                        {
                            ProductCode = "bundle-code",
                            ProductUsage = "Bundle",
                            BundledProducts = new List<BundledProduct>
                            {
                                new BundledProduct
                                {
                                    ProductCode = "child-code",
                                    Quantity = 3
                                },
                                new BundledProduct
                                {
                                    ProductCode = "extra-code",
                                    OptionAttributeFQN = "extra-attribute",
                                    Quantity = 3
                                }
                            }
                        }
                    }
                },
                Packages = new List<Package>
                {
                    new Package
                    {
                        Status = "Fulfilled",
                        Items = new List<PackageItem>
                        {
                            new PackageItem
                            {
                                LineId = 1, ProductCode = "child-code", OptionAttributeFQN = null, Quantity = 11
                            },
                            new PackageItem
                            {
                                LineId = 1, ProductCode = "extra-code", OptionAttributeFQN = "extra-attribute", Quantity = 8
                            }
                        }
                    }
                }
            };
            return order;
        }

        [Test]
        public void Check_using_return_containing_product_with_extras()
        {
            var order = CreateOrderWithParentWithExtras();

            var rma = new Return
            {
                Items = new List<ReturnItem>
                {
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "parent-variation-code"
                        },
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 2 }
                        },
                        ExcludeProductExtras = false
                    }
                }
            };

            var mapping = CreateObjectUnderTest();
            var returnableItems = mapping.GetReturnableItems(order, new List<Return> { rma });

            returnableItems.Count.ShouldEqual(3);
            var parentWithExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
            var parentSansExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
            var extra = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId));

            parentWithExtras.QuantityOrdered.ShouldEqual(4);
            parentWithExtras.QuantityFulfilled.ShouldEqual(2); // Fulfilled 3 parents, but only 2 whole units worth of extras
            parentWithExtras.QuantityDirectlyReturned.ShouldEqual(2);
            parentWithExtras.QuantityIndirectlyReturned.ShouldEqual(0);
            parentWithExtras.QuantityReturnable.ShouldEqual(0); // Only 2 extras left, can't return a whole unit.

            parentSansExtras.QuantityOrdered.ShouldEqual(4);
            parentSansExtras.QuantityFulfilled.ShouldEqual(3); // Don't care about extras, 3 parents fulfilled.
            parentSansExtras.QuantityDirectlyReturned.ShouldEqual(0);
            parentSansExtras.QuantityIndirectlyReturned.ShouldEqual(2); // 2 parent w/ extras returned.
            parentSansExtras.QuantityReturnable.ShouldEqual(1); // Don't care about extras. 1 parent left fulfilled.

            extra.QuantityOrdered.ShouldEqual(12);
            extra.QuantityFulfilled.ShouldEqual(8);
            extra.QuantityDirectlyReturned.ShouldEqual(0);
            extra.QuantityIndirectlyReturned.ShouldEqual(6);
            extra.QuantityReturnable.ShouldEqual(2);
        }

        [Test]
        public void Check_using_return_containing_just_product_extras()
        {
            var order = CreateOrderWithParentWithExtras();

            var rma = new Return
            {
                Items = new List<ReturnItem>
                {
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "extra-code"
                        },
                        OrderItemOptionAttributeFQN = "extra-attribute",
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 4 }
                        }
                    }
                }
            };

            var mapping = CreateObjectUnderTest();
            var returnableItems = mapping.GetReturnableItems(order, new List<Return> { rma });

            returnableItems.Count.ShouldEqual(3);
            var parentWithExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
            var parentSansExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
            var extra = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId));

            parentWithExtras.QuantityOrdered.ShouldEqual(4);
            parentWithExtras.QuantityFulfilled.ShouldEqual(2); // Fulfilled 3 parents, but only 2 whole units worth of extras
            parentWithExtras.QuantityDirectlyReturned.ShouldEqual(0);
            parentWithExtras.QuantityIndirectlyReturned.ShouldEqual(2); // Returned 1 whole and 1 partial unit worth of extras.
            parentWithExtras.QuantityReturnable.ShouldEqual(1); // 3 parents and 4 extras left = 1 whole unit left (1 parent 3 extras).

            parentSansExtras.QuantityOrdered.ShouldEqual(4);
            parentSansExtras.QuantityFulfilled.ShouldEqual(3); // Don't care about extras, 3 parents fulfilled.
            parentSansExtras.QuantityDirectlyReturned.ShouldEqual(0); // Don't care about extras.
            parentSansExtras.QuantityIndirectlyReturned.ShouldEqual(0); // Don't care about extras.
            parentSansExtras.QuantityReturnable.ShouldEqual(3); // Don't care about extras.

            extra.QuantityOrdered.ShouldEqual(12);
            extra.QuantityFulfilled.ShouldEqual(8);
            extra.QuantityDirectlyReturned.ShouldEqual(4);
            extra.QuantityIndirectlyReturned.ShouldEqual(0);
            extra.QuantityReturnable.ShouldEqual(4);
        }

        [Test]
        public void Check_using_return_containing_product_sans_extra_plus_extra()
        {
            var order = CreateOrderWithParentWithExtras();

            var rma = new Return
            {
                Items = new List<ReturnItem>
                {
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "parent-variation-code"
                        },
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 1 }
                        },
                        ExcludeProductExtras = true
                    },
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "extra-code"
                        },
                        OrderItemOptionAttributeFQN = "extra-attribute",
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 1 }
                        }
                    }
                }
            };

            var mapping = CreateObjectUnderTest();
            var returnableItems = mapping.GetReturnableItems(order, new List<Return> { rma });

            returnableItems.Count.ShouldEqual(3);
            var parentWithExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
            var parentSansExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
            var extra = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId));

            parentWithExtras.QuantityOrdered.ShouldEqual(4);
            parentWithExtras.QuantityFulfilled.ShouldEqual(2); // Fulfilled 3 parents, but only 2 whole units worth of extras
            parentWithExtras.QuantityDirectlyReturned.ShouldEqual(0);
            parentWithExtras.QuantityIndirectlyReturned.ShouldEqual(1); // Returned 1 partial unit worth of parent and extras. Don't double count the parent and the extra.
            parentWithExtras.QuantityReturnable.ShouldEqual(2); // 2 parents and 7 extras left = 2 whole units left (1 parent 3 extras).

            parentSansExtras.QuantityOrdered.ShouldEqual(4);
            parentSansExtras.QuantityFulfilled.ShouldEqual(3); // Don't care about extras, 3 parents fulfilled.
            parentSansExtras.QuantityDirectlyReturned.ShouldEqual(1); // Don't care about extras.
            parentSansExtras.QuantityIndirectlyReturned.ShouldEqual(0); // Don't care about extras.
            parentSansExtras.QuantityReturnable.ShouldEqual(2); // Don't care about extras.

            extra.QuantityOrdered.ShouldEqual(12);
            extra.QuantityFulfilled.ShouldEqual(8);
            extra.QuantityDirectlyReturned.ShouldEqual(1);
            extra.QuantityIndirectlyReturned.ShouldEqual(0);
            extra.QuantityReturnable.ShouldEqual(7);
        }

        [Test]
        public void Check_using_return_containing_bundle_with_extras()
        {
            var order = CreateOrderWithBundleWithExtras();

            var rma = new Return
            {
                Items = new List<ReturnItem>
                {
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "bundle-code"
                        },
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 2 }
                        },
                        ExcludeProductExtras = false
                    }
                }
            };

            var mapping = CreateObjectUnderTest();
            var returnableItems = mapping.GetReturnableItems(order, new List<Return> { rma });

            returnableItems.Count.ShouldEqual(4);
            var parentWithExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
            var parentSansExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
            var child = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId) && string.IsNullOrEmpty(x.OrderItemOptionAttributeFQN));
            var extra = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId) && !string.IsNullOrEmpty(x.OrderItemOptionAttributeFQN));

            parentWithExtras.QuantityOrdered.ShouldEqual(4);
            parentWithExtras.QuantityFulfilled.ShouldEqual(2); // Fulfilled 3 whole units worth of bundles, but only 2 whole units worth of extras
            parentWithExtras.QuantityDirectlyReturned.ShouldEqual(2);
            parentWithExtras.QuantityIndirectlyReturned.ShouldEqual(0);
            parentWithExtras.QuantityReturnable.ShouldEqual(0); // Only 2 extra left, can't return a whole unit.

            parentSansExtras.QuantityOrdered.ShouldEqual(4);
            parentSansExtras.QuantityFulfilled.ShouldEqual(3); // Don't care about extras, 3 whole units worth of bundles fulfilled.
            parentSansExtras.QuantityDirectlyReturned.ShouldEqual(0);
            parentSansExtras.QuantityIndirectlyReturned.ShouldEqual(2); // 2 bundle w/ extras returned.
            parentSansExtras.QuantityReturnable.ShouldEqual(1); // Don't care about extras. 5 bundle items = 1 whole unit left.

            child.QuantityOrdered.ShouldEqual(12);
            child.QuantityFulfilled.ShouldEqual(11);
            child.QuantityDirectlyReturned.ShouldEqual(0);
            child.QuantityIndirectlyReturned.ShouldEqual(6);
            child.QuantityReturnable.ShouldEqual(5);

            extra.QuantityOrdered.ShouldEqual(12);
            extra.QuantityFulfilled.ShouldEqual(8);
            extra.QuantityDirectlyReturned.ShouldEqual(0);
            extra.QuantityIndirectlyReturned.ShouldEqual(6);
            extra.QuantityReturnable.ShouldEqual(2);
        }

        [Test]
        public void Check_using_return_containing_just_bundle_extras()
        {
            var order = CreateOrderWithBundleWithExtras();

            var rma = new Return
            {
                Items = new List<ReturnItem>
                {
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "extra-code"
                        },
                        OrderItemOptionAttributeFQN = "extra-attribute",
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 4 }
                        }
                    }
                }
            };

            var mapping = CreateObjectUnderTest();
            var returnableItems = mapping.GetReturnableItems(order, new List<Return> { rma });

            returnableItems.Count.ShouldEqual(4);
            var parentWithExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
            var parentSansExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
            var child = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId) && string.IsNullOrEmpty(x.OrderItemOptionAttributeFQN));
            var extra = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId) && !string.IsNullOrEmpty(x.OrderItemOptionAttributeFQN));

            parentWithExtras.QuantityOrdered.ShouldEqual(4);
            parentWithExtras.QuantityFulfilled.ShouldEqual(2); // Fulfilled 3 whole units worth of bundles, but only 2 whole units worth of extras
            parentWithExtras.QuantityDirectlyReturned.ShouldEqual(0);
            parentWithExtras.QuantityIndirectlyReturned.ShouldEqual(2); // Returned 1 whole and 1 partial unit worth of extras.
            parentWithExtras.QuantityReturnable.ShouldEqual(1); // 3 bundles and 4 extras left = 1 whole unit left (1 bundle 3 extras).

            parentSansExtras.QuantityOrdered.ShouldEqual(4);
            parentSansExtras.QuantityFulfilled.ShouldEqual(3); // Don't care about extras, 3 bundles fulfilled.
            parentSansExtras.QuantityDirectlyReturned.ShouldEqual(0); // Don't care about extras.
            parentSansExtras.QuantityIndirectlyReturned.ShouldEqual(0); // Don't care about extras.
            parentSansExtras.QuantityReturnable.ShouldEqual(3); // Don't care about extras.

            child.QuantityOrdered.ShouldEqual(12);
            child.QuantityFulfilled.ShouldEqual(11);
            child.QuantityDirectlyReturned.ShouldEqual(0);
            child.QuantityIndirectlyReturned.ShouldEqual(0);
            child.QuantityReturnable.ShouldEqual(11);

            extra.QuantityOrdered.ShouldEqual(12);
            extra.QuantityFulfilled.ShouldEqual(8);
            extra.QuantityDirectlyReturned.ShouldEqual(4);
            extra.QuantityIndirectlyReturned.ShouldEqual(0);
            extra.QuantityReturnable.ShouldEqual(4);
        }

        [Test]
        public void Check_using_return_containing_bundle_sans_extra_plus_extra()
        {
            var order = CreateOrderWithBundleWithExtras();

            var rma = new Return
            {
                Items = new List<ReturnItem>
                {
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "bundle-code"
                        },
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 1 }
                        },
                        ExcludeProductExtras = true
                    },
                    new ReturnItem
                    {
                        OrderItemId = order.Items.First().Id,
                        OrderLineId = order.Items.First().LineId,
                        Product = new Product
                        {
                            ProductCode = "extra-code"
                        },
                        OrderItemOptionAttributeFQN = "extra-attribute",
                        Reasons = new List<ReturnReason>
                        {
                            new ReturnReason { Quantity = 1 }
                        }
                    }
                }
            };

            var mapping = CreateObjectUnderTest();
            var returnableItems = mapping.GetReturnableItems(order, new List<Return> { rma });

            returnableItems.Count.ShouldEqual(4);
            var parentWithExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && !x.ExcludeProductExtras);
            var parentSansExtras = returnableItems.Single(x => string.IsNullOrEmpty(x.ParentItemId) && x.ExcludeProductExtras);
            var child = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId) && string.IsNullOrEmpty(x.OrderItemOptionAttributeFQN));
            var extra = returnableItems.Single(x => !string.IsNullOrEmpty(x.ParentItemId) && !string.IsNullOrEmpty(x.OrderItemOptionAttributeFQN));

            parentWithExtras.QuantityOrdered.ShouldEqual(4);
            parentWithExtras.QuantityFulfilled.ShouldEqual(2); // Fulfilled 3 whole units worth of bundles, but only 2 whole units worth of extras
            parentWithExtras.QuantityDirectlyReturned.ShouldEqual(0);
            parentWithExtras.QuantityIndirectlyReturned.ShouldEqual(1); // Returned 1 partial unit worth of parent and extras. Don't double count the parent and the extra.
            parentWithExtras.QuantityReturnable.ShouldEqual(2); // 2 bundles and 7 extras left = 2 whole units left (1 bundle 3 extras).

            parentSansExtras.QuantityOrdered.ShouldEqual(4);
            parentSansExtras.QuantityFulfilled.ShouldEqual(3); // Don't care about extras, 3 bundles fulfilled.
            parentSansExtras.QuantityDirectlyReturned.ShouldEqual(1); // Don't care about extras.
            parentSansExtras.QuantityIndirectlyReturned.ShouldEqual(0); // Don't care about extras.
            parentSansExtras.QuantityReturnable.ShouldEqual(2); // Don't care about extras.

            child.QuantityOrdered.ShouldEqual(12);
            child.QuantityFulfilled.ShouldEqual(11);
            child.QuantityDirectlyReturned.ShouldEqual(0);
            child.QuantityIndirectlyReturned.ShouldEqual(3);
            child.QuantityReturnable.ShouldEqual(8);

            extra.QuantityOrdered.ShouldEqual(12);
            extra.QuantityFulfilled.ShouldEqual(8);
            extra.QuantityDirectlyReturned.ShouldEqual(1);
            extra.QuantityIndirectlyReturned.ShouldEqual(0);
            extra.QuantityReturnable.ShouldEqual(7);
        }
    }
}
