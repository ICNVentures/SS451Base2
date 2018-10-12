four51.app.controller('CheckOutViewCtrl', ['$scope', '$routeParams', '$location', '$filter', '$rootScope', '$451', 'User', 'Order', 'OrderConfig', 'FavoriteOrder', 'AddressList', 'GoogleAnalytics',
function ($scope, $routeParams, $location, $filter, $rootScope, $451, User, Order, OrderConfig, FavoriteOrder, AddressList, GoogleAnalytics) {
	$scope.errorSection = 'open';

	$scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if ($scope.isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
		});
	}

	if (!$scope.currentOrder) {
        $location.path('catalog');
    }

    setDefaults();

	$scope.hasOrderConfig = OrderConfig.hasConfig($scope.currentOrder, $scope.user);
	$scope.checkOutSection = $scope.hasOrderConfig ? 'order' : 'shipping';

    function submitOrder() {
	    $scope.displayLoadingIndicator = true;
		$scope.submitClicked = true;
	    $scope.errorMessage = null;
        Order.submit($scope.currentOrder,
	        function(data) {
				if ($scope.user.Company.GoogleAnalyticsCode) {
					GoogleAnalytics.ecommerce(data, $scope.user);
				}
				$scope.user.CurrentOrderID = null;
				User.save($scope.user, function(data) {
			        $scope.user = data;
	                $scope.displayLoadingIndicator = false;
		        });
		        $scope.currentOrder = null;
				$location.path('/order/new/' + data.ID);
	        },
	        function(ex) {
				$scope.submitClicked = false;
		        $scope.errorMessage = ex.Message;
		        $scope.displayLoadingIndicator = false;
		        $scope.shippingUpdatingIndicator = false;
		        $scope.shippingFetchIndicator = false;
	        }
        );
    }
    
    function setDefaults()
    {
        var rc = false;

        angular.forEach($scope.user.CustomFields, function(field) 
        {
            if (field.Name.indexOf("SSBDefaultCheckout") > -1)
            {
                rc = true;
            }
        });               
            
        if (rc)
        {
    	    angular.forEach($scope.currentOrder.OrderFields, function(fld) 
    	    {
    	        if (fld.Name == "BASE_ORDBY_EMAIL")
                {
                    if (fld.Value === null || fld.value === '' || fld.Value.length === 0)
                    {
                        if ($scope.user.Email !== null && $scope.user.Email !== '' && $scope.user.Email.length > 0)
                        {
                            fld.Value = $scope.user.Email;
                        }
                    }
                }
    	        else if (fld.Name == "BASE_ORDBY_PH")
                {
                    if (fld.Value === null || fld.value === '' || fld.Value.length === 0)
                    {
                        if ($scope.user.Phone !== null && $scope.user.Phone !== '' && $scope.user.Phone.length > 0)
                        {
                            fld.Value = $scope.user.Phone;
                        }
                    }
                }
                else if (fld.Name == "BASE_ORDEREDBY")
                {
                    if (fld.Value === null || fld.value === '' || fld.Value.length === 0)
                    {
                        var nm = '';
                    
                        if ($scope.user.FirstName !== null && $scope.user.FirstName !== '' && $scope.user.FirstName.length > 0)
                        {
                            nm = $scope.user.FirstName;
                        }
    
                        if ($scope.user.LastName !== null && $scope.user.LastName !== '' && $scope.user.LastName.length > 0)
                        {
                            nm += ' ' + $scope.user.LastName;
                        }
                    
                        if (nm != "Guest User")
                        {
                            fld.Value = nm;
                        }
                    }
                }
    	    });
        }
    }

    $scope.showme = function(data)
    {
        return JSON.stringify(data);
    };
    
    $scope.billingType = function()
    {
        var rc = '';
        var po = $scope.user.Permissions.contains('PayByPO');
        var cc = $scope.user.Permissions.contains('PayByCreditCard');
        var sa = $scope.user.Permissions.contains('PayByBudgetAccount');

        if (sa)
        {
            rc = "budget";
        }
        else if (po && cc)
        {
            rc = "both";
        }
        else if (po)
        {
            rc = "po";
        }
        else if (cc)
        {
            rc = "cc";
        }
        
        return rc;
    };
    
    $scope.authErrorCnt = function()
    {
        if (document.getElementsByName("authCode").length === 0)
        {
            return 0;
        }

        var val = document.getElementsByName("authCode")[0].value;
        
        if ($scope.cart_order.authCode !== null && val !== null && val !== '')
        {
            if ($scope.cart_order.authCode.$invalid)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        }
        
        return 0;
    }
    
    $scope.authCodeError = function()
    {
        if (!hasAuthorization())
        {
            return false;
        }

        if (document.getElementsByName("authCode").length === 0)
        {
            return false;
        }

        if ($scope.cart_order.authCode !== null)
        {
            return $scope.cart_order.authCode.$invalid;
        }
        else
        {
            return false;
        }
    }
    
    function hasAuthorization()
    {
        var rc = false;

        angular.forEach($scope.user.CustomFields, function(field) 
        {
            if (field.Name.indexOf("SSBAuthorization") > -1)
            {
                rc = true;
            }
        });               
            
        return rc;
    }

	$scope.$watch('currentOrder.CostCenter', function() {
		OrderConfig.address($scope.currentOrder, $scope.user);
	});

    function saveChanges(callback) {
	    $scope.displayLoadingIndicator = true;
	    $scope.errorMessage = null;
	    $scope.actionMessage = null;
	    var auto = $scope.currentOrder.autoID;

        if ($scope.user.Permissions.contains('EditShipToName')) 
        {	    
	        $scope.currentOrder.ShipFirstName = $scope.orderShipAddress.FirstName;
	        $scope.currentOrder.ShipLastName = $scope.orderShipAddress.LastName;
            angular.forEach($scope.currentOrder.LineItems, function(item) 
            {
                item.ShipFirstName = $scope.orderShipAddress.FirstName;
                item.ShipLastName = $scope.orderShipAddress.LastName;
            });
        }

	    Order.save($scope.currentOrder,
	        function(data) {
		        $scope.currentOrder = data;
		        if (auto) {
			        $scope.currentOrder.autoID = true;
			        $scope.currentOrder.ExternalID = 'auto';
		        }
		        $scope.displayLoadingIndicator = false;
		        if (callback) callback($scope.currentOrder);
	            $scope.actionMessage = "Your changes have been saved";

				if ($location.path().indexOf("apprcheckout") > -1)
				{
				    $location.path('approval');
				}
	        },
	        function(ex) {
		        $scope.currentOrder.ExternalID = null;
		        $scope.errorMessage = ex.Message;
		        $scope.displayLoadingIndicator = false;
		        $scope.shippingUpdatingIndicator = false;
		        $scope.shippingFetchIndicator = false;
	        }
        );
    };

    $scope.continueShopping = function() {
	    if (confirm('Do you want to save changes to your order before continuing?') == true)
	        saveChanges(function() { $location.path('catalog') });
        else
		    $location.path('catalog');
    };

    $scope.cancelOrder = function() {
	    if (confirm('Are you sure you wish to cancel your order?') == true) {
		    $scope.displayLoadingIndicator = true;
	        Order.delete($scope.currentOrder,
		        function() {
		            $scope.user.CurrentOrderID = null;
		            $scope.currentOrder = null;
			        User.save($scope.user, function(data) {
				        $scope.user = data;
				        $scope.displayLoadingIndicator = false;
				        $location.path('catalog');
			        });
		        },
		        function(ex) {
			        $scope.actionMessage = ex.Message;
			        $scope.displayLoadingIndicator = false;
		        }
	        );
	    }
    };

    $scope.saveChanges = function() {
        saveChanges();
    };

    $scope.submitOrder = function() {
       submitOrder();
    };

    $scope.saveFavorite = function() {
        FavoriteOrder.save($scope.currentOrder);
    };

	$scope.cancelEdit = function() {
	    if ($location.path().indexOf("apprcheckout") > -1)
	    {
		    $location.path('approval');
	    }
	    else
	    {
		    $location.path('order');
	    }
	};

    $scope.isApproval = function()
    {
        return $location.path().indexOf("/apprcheckout/") > -1;
    }

}]);