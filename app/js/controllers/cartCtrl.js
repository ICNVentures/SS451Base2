four51.app.controller('CartViewCtrl', ['$scope', '$routeParams', '$location', '$451', 'Order', 'OrderConfig', 'User',
function ($scope, $routeParams, $location, $451, Order, OrderConfig, User) {
	$scope.isEditforApproval = $routeParams.id != null && $scope.user.Permissions.contains('EditApprovalOrder');
	if ($scope.isEditforApproval) {
		Order.get($routeParams.id, function(order) {
			$scope.currentOrder = order;
			// add cost center if it doesn't exists for the approving user
			var exists = false;
			angular.forEach(order.LineItems, function(li) {
				angular.forEach($scope.user.CostCenters, function(cc) {
					if (exists) return;
					exists = cc == li.CostCenter;
				});
				if (!exists) {
					$scope.user.CostCenters.push({
						'Name': li.CostCenter
					});
				}
			});
		});
	}
    
    makerealuser();
    
	$scope.currentDate = new Date();
	$scope.errorMessage = null;
	$scope.continueShopping = function() {
		if (!$scope.cart.$invalid) {
			if (confirm('Do you want to save changes to your order before continuing?') == true)
				$scope.saveChanges(function() { $location.path('catalog') });
		}
		else
			$location.path('catalog');
	};

	$scope.cancelOrder = function() {
		if (confirm('Are you sure you wish to cancel your order?') == true) {
			$scope.displayLoadingIndicator = true;
			$scope.actionMessage = null;
			Order.delete($scope.currentOrder,
				function(){
					$scope.currentOrder = null;
					$scope.user.CurrentOrderID = null;
					User.save($scope.user, function(){
						$location.path('catalog');
					});
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved';
				},
				function(ex) {
					$scope.actionMessage = 'An error occurred: ' + ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.saveChanges = function(callback) {
		$scope.actionMessage = null;
		$scope.errorMessage = null;
		if($scope.currentOrder.LineItems.length == $451.filter($scope.currentOrder.LineItems, {Property:'Selected', Value: true}).length) {
			$scope.cancelOrder();
		}
		else {
			$scope.displayLoadingIndicator = true;
			OrderConfig.address($scope.currentOrder, $scope.user);
			Order.save($scope.currentOrder,
				function(data) {
					$scope.currentOrder = data;
					$scope.displayLoadingIndicator = false;
					if (callback) callback();
					$scope.actionMessage = 'Your Changes Have Been Saved';
					
					if ($location.path().indexOf("apprcart") > -1)
					{
					    $location.path('approval');
					}
				},
				function(ex) {
					$scope.errorMessage = ex.Message;
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	};

	$scope.removeItem = function(item) {
		if (confirm('Are you sure you wish to remove this item from your cart?') == true) {
			Order.deletelineitem($scope.currentOrder.ID, item.ID,
				function(order) {
					$scope.currentOrder = order;
					Order.clearshipping($scope.currentOrder);
					if (!order) {
						$scope.user.CurrentOrderID = null;
						User.save($scope.user, function(){
							$location.path('catalog');
						});
					}
					$scope.displayLoadingIndicator = false;
					$scope.actionMessage = 'Your Changes Have Been Saved';
				},
				function (ex) {
					$scope.errorMessage = ex.Message.replace(/\<<Approval Page>>/g, 'Approval Page');
					$scope.displayLoadingIndicator = false;
				}
			);
		}
	}

	$scope.checkOut = function() {
		$scope.displayLoadingIndicator = true;
		if (!$scope.isEditforApproval)
			OrderConfig.address($scope.currentOrder, $scope.user);
		Order.save($scope.currentOrder,
			function(data) {
				$scope.currentOrder = data;
                $location.path($scope.isEditforApproval ? 'checkout/' + $routeParams.id : 'checkout');
				$scope.displayLoadingIndicator = false;
			},
			function(ex) {
				$scope.errorMessage = ex.Message;
				$scope.displayLoadingIndicator = false;
			}
		);
	};

	$scope.$watch('currentOrder.LineItems', function(newval) {
		var newTotal = 0;
		if (!$scope.currentOrder) return newTotal;
		angular.forEach($scope.currentOrder.LineItems, function(item){
			if (item.IsKitParent)
				$scope.cart.$setValidity('kitValidation', !item.KitIsInvalid);
			newTotal += item.LineTotal;
		});
		$scope.currentOrder.Subtotal = newTotal;
	}, true);

	$scope.copyAddressToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.DateNeeded = $scope.currentOrder.LineItems[0].DateNeeded;
		});
	};

	$scope.copyCostCenterToAll = function() {
		angular.forEach($scope.currentOrder.LineItems, function(n) {
			n.CostCenter = $scope.currentOrder.LineItems[0].CostCenter;
		});
	};

	$scope.onPrint = function()  {
		window.print();
	};

	$scope.cancelEdit = function() {
	    if ($location.path().indexOf("apprcart") > -1)
	    {
		    $location.path('approval');
	    }
	    else
	    {
		    $location.path('order');
	    }
	};

    $scope.downloadProof = function(item) {
        window.location = item.Variant.ProofUrl;
    };

    $scope.clickItem = function(item, isEditforApproval, ID, idx) 
    {
        var x = (item.Product.Type == 'Kit' ? 'kit' : 'cart') + '/' + (item.Product.InteropID) + '/' + 
                (isEditforApproval ? ID + '/' : '') + idx + ($location.path().indexOf("/apprcart/") > -1 ? "/approval" : "");
        
        $location.path(x);
    };

    $scope.isApproval = function()
    {
        return $location.path().indexOf("/apprcart/") > -1;
    }

    function makerealuser()
    {
	    //console.log('[' + $scope.user.Email + '][' + $scope.user.Type + ']');
	    //alert('IN TEST MODE!  Order was not submitted. Please try again later.');
	    //return;
        var buy = $location.absUrl().split('/')[3];
        
        if (buy[0] == 'G')
        {
	        if ($scope.user.Type == "TempCustomer")
	        {
                var userGUID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    //Use a 'Bitwise OR' to replace an 'x' with an Decimal between 1 and 15 and replace a 'y' with an Decimal between 8 and 11.
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    //Convert the Decimal to a Hexadecimal
                    return v.toString(16);
                    //Hexadecimal:  0   1   2   3   4   5   6   7   8   9   A   B   C   D   E   F
                    //Decimal:      0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15
                }).toUpperCase();
            
                $scope.user.Username = userGUID;   
                $scope.user.Email = "noreply@smartsourcellc.com";
                $scope.user.FirstName = 'Guest';
                $scope.user.LastName = 'User';
                $scope.user.Password = userGUID;
                $scope.user.ConfirmPassword = userGUID;
                $scope.user.ConvertFromTempUser = true;
    
	            User.save($scope.user, function(data) 
	            { 
	                $scope.user = data;
	                
                    angular.forEach($scope.user.CustomFields, function(field) 
                    {
                        //console.log('[' + field.Name + '][' + field.DefaultValue + ']');
                        if (field.Name.indexOf("SSBGuestEmail") > -1)
                        {
                            $scope.user.Email = field.DefaultValue;
                            
                            //console.log('email[' +  $scope.user.Email + ']');

            	            User.save($scope.user, function(data2) 
                            { 
                                $scope.user = data2;
                                //console.log('emailaftersave[' +  $scope.user.Email + ']');
                            });
                        }
                    });
                    //User.login({Username: $scope.Username, Password: $scope.Password, ID: $scope.user.ID, Type: $scope.user.Type}, function (u) 
                    //{
        		        //console.log('after login[' + $scope.user.Type + ']');
                    //}, function (err) 
                    //{
                        //$scope.loginAsExistingError = err.Message;
        		        //console.log('login err[' + err.Message + ']');
                    //});
    
        		    //console.log('after save[' + $scope.user.Type + ']');
                });
            
	        }    
	    }
    }
}]);