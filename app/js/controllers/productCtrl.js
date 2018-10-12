four51.app.controller('ProductCtrl', ['$scope', '$routeParams', '$route', '$location', '$451', '$http', 'Product', 'ProductDisplayService', 'Order', 'Variant', 'User',
function ($scope, $routeParams, $route, $location, $451, $http, Product, ProductDisplayService, Order, Variant, User) {
    $scope.isEditforApproval = $routeParams.orderID && $scope.user.Permissions.contains('EditApprovalOrder');
    if ($scope.isEditforApproval) {
        Order.get($routeParams.orderID, function(order) {
            $scope.currentOrder = order;
        });
    }

    $scope.selected = 1;
    $scope.LineItem = {};
	$scope.addToOrderText = "Add To Cart";
	$scope.loadingIndicator = true;
	$scope.loadingImage = true;
	$scope.searchTerm = null;
	$scope.settings = {
		currentPage: 1,
		pageSize: 10
	};

	$scope.calcVariantLineItems = function(i){
		$scope.variantLineItemsOrderTotal = 0;
		angular.forEach($scope.variantLineItems, function(item){
			$scope.variantLineItemsOrderTotal += item.LineTotal || 0;
		})
	};
	function setDefaultQty(lineitem) {
		if (lineitem.PriceSchedule && lineitem.PriceSchedule.DefaultQuantity != 0)
			$scope.LineItem.Quantity = lineitem.PriceSchedule.DefaultQuantity;
	}
	function init(searchTerm, callback) {
		ProductDisplayService.getProductAndVariant($routeParams.productInteropID, $routeParams.variantInteropID, function (data) {
			$scope.LineItem.Product = data.product;
			$scope.PD = data.product.Description;
            imgList($scope.PD);
            //itemUsage(data.product.InteropID);
			$scope.LineItem.Variant = data.variant;
			ProductDisplayService.setNewLineItemScope($scope);
			ProductDisplayService.setProductViewScope($scope);
			setDefaultQty($scope.LineItem);
			$scope.$broadcast('ProductGetComplete');
			$scope.loadingIndicator = false;
			$scope.setAddToOrderErrors();
			if (angular.isFunction(callback))
				callback();
		}, $scope.settings.currentPage, $scope.settings.pageSize, searchTerm);
	}
	$scope.$watch('settings.currentPage', function(n, o) {
		if (n != o || (n == 1 && o == 1))
			init($scope.searchTerm);
	});

    function imgList(desc)
    {
        var x = '';
        var idx = '<div class="divrl" style="height: 0px; visibility: hidden;">';
        var idx2 = '<div class="divrl" style="height: 0px; visibility: hidden; ">';
        var jdx = '|X=</div>';
        
        var i = desc.indexOf(idx);
        var l = 0;
        
        if (i == -1)
        {
            i = desc.indexOf(idx2);
            l = idx2.length;
        }
        else
        {
            l = idx.length;
        }
        
        var j = desc.indexOf(jdx);
        var help = '';
        var cnt = 0;
        
        if (i >= 0)
        {
            var lst = desc.substring(i + l, j);
            var url = '';
            
    		angular.forEach(lst.split('|'), function(ls) 
    		{
    		    var ti = ls.split('=');
    		    
    		    if (ti[0] == 'U')
    		    {
    		        url = ti[1];
    		    }
    		    else if (ti[0] == 'I')
    		    {
    		        var dlink = url + 'D/' + ti[1];
    		        var tlink = url + 'T/' + ti[1];
    		        var ilink = url + 'I/' + ti[1];
    		        
    		        x += '<a href="javascript:showimg(\'' + dlink + '\',\'' + ilink + '\')"><img src="' + tlink + '" style="height:50px;margin:10px;" /></a>';
    		        //showimg(\'' + link + '\')
    		        cnt++;
    		    }
    		    else if (ti[0] == 'H')
    		    {
    		        help = url + 'Charts/' + ti[1];
    		    }
    		});
        }
        
        if (cnt > 1)
        {
            var elem = document.getElementById('divImageList');
            elem.innerHTML = x;
        }
        
        if (help != '')
        {
            elem = document.getElementById('divChart');
            elem.innerHTML = '<a target="_blank" href="' + help + '"><img style="width:100%" src="' + help + '" /></a';
        }
    }
    
    //function itemUsage(id)
    //{
    //    $http
    //    (
    //        {
    //            url: "https://ssfour51.com/services/WebService.asmx/ItemUsageHTML",
    //            method: "POST",
    //            crossDomain: true,
    //            data: 
    //            { 
    //                "GUID" : "05B6E448-CC3B-4A98-BC13-2C0ECF089933", 
    //                "InteropID": id,
    //            },
    //        }
    //    ).then
    //    (
    //        function successCallback(response) 
    //        {
    //            var elem = document.getElementById('divItemUsage');
    //            elem.innerHTML = response.data.d;
    //        }, 
    //        function errorCallback(response) 
    //        {
    //            var elem = document.getElementById('divItemUsage');
    //            elem.innerHTML = 'Unable to load product usage information at this time';
    //        }
    //    );
    //}

	$scope.searchVariants = function(searchTerm) {
		$scope.searchTerm = searchTerm;
		$scope.settings.currentPage == 1 ?
			init(searchTerm) :
			$scope.settings.currentPage = 1;
	};

	$scope.deleteVariant = function(v, redirect) {
		if (!v.IsMpowerVariant) return;
		// doing this because at times the variant is a large amount of data and not necessary to send all that.
		var d = {
			"ProductInteropID": $scope.LineItem.Product.InteropID,
			"InteropID": v.InteropID
		};
		Variant.delete(d,
			function() {
				redirect ? $location.path('/product/' + $scope.LineItem.Product.InteropID) : $route.reload();
			},
			function(ex) {
				if ($scope.lineItemErrors.indexOf(ex.Message) == -1) $scope.lineItemErrors.unshift(ex.Message);
				$scope.showAddToCartErrors = true;
			}
		);
	}

	$scope.addToOrder = function(){
		if($scope.lineItemErrors && $scope.lineItemErrors.length){
			$scope.showAddToCartErrors = true;
			return;
		}
		if(!$scope.currentOrder){
			$scope.currentOrder = { };
			$scope.currentOrder.LineItems = [];
		}
		if (!$scope.currentOrder.LineItems)
			$scope.currentOrder.LineItems = [];
		if($scope.allowAddFromVariantList){
			angular.forEach($scope.variantLineItems, function(item){
				if(item.Quantity > 0){
					$scope.currentOrder.LineItems.push(item);
					$scope.currentOrder.Type = item.PriceSchedule.OrderType;
				}
			});
		}else{
			$scope.currentOrder.LineItems.push($scope.LineItem);
			$scope.currentOrder.Type = $scope.LineItem.PriceSchedule.OrderType;
		}
		$scope.addToOrderIndicator = true;
		//$scope.currentOrder.Type = (!$scope.LineItem.Product.IsVariantLevelInventory && $scope.variantLineItems) ? $scope.variantLineItems[$scope.LineItem.Product.Variants[0].InteropID].PriceSchedule.OrderType : $scope.LineItem.PriceSchedule.OrderType;
		// shipper rates are not recalcuated when a line item is added. clearing out the shipper to force new selection, like 1.0
		Order.clearshipping($scope.currentOrder).
			save($scope.currentOrder,
				function(o){
					$scope.user.CurrentOrderID = o.ID;
					User.save($scope.user, function(){
						$scope.addToOrderIndicator = true;
						$location.path('/cart' + ($scope.isEditforApproval ? '/' + o.ID : ''));
					});
				},
				function(ex) {
					//remove the last LineItem added to the cart.
					$scope.currentOrder.LineItems.pop();
					$scope.addToOrderIndicator = false;
					$scope.lineItemErrors.push(ex.Detail);
					$scope.showAddToCartErrors = true;
					//$route.reload();
				}
		);
	};

	$scope.setOrderType = function(type) {
		$scope.loadingIndicator = true;
		$scope.currentOrder = { 'Type': type };
		init(null, function() {
			$scope.loadingIndicator = false;
		});
	};

	$scope.$on('event:imageLoaded', function(event, result) {
		$scope.loadingImage = false;
		$scope.$apply();
	});
}]);