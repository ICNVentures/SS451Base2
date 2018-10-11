four51.app.directive('orderdetails', function() {
	var obj = {
		restrict: 'AE',
		templateUrl: 'partials/controls/orderDetails.html',
		controller: ['$scope', 'Address', function($scope, Address) {
			if ($scope.isEditforApproval) {
				var exists = false;
				angular.forEach($scope.user.CostCenters, function(cc) {
					if (exists) return;
					exists = cc == $scope.currentOrder.CostCenter;
				});
				if (!exists) {
					$scope.user.CostCenters.push({
						'Name': $scope.currentOrder.CostCenter
					});
				}
			}

            $scope.updateCostCenter = updateCostCenter;

            function updateCostCenter() {
                angular.forEach($scope.user.CostCenters, function(cc) {
                   if (cc.Name == $scope.currentOrder.CostCenter && cc.DefaultAddressID) {
                       Address.get(cc.DefaultAddressID, function(address) {
                            if (address.IsShipping) {
                                $scope.currentOrder.ShipAddressID = cc.DefaultAddressID;
                            }
                       });
                   }
                });
            }
            
            $scope.hasAuthorization = function()
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
            };   
            
			$scope.$watch('ngmodelAuth', function(auth) 
			{
				if (!auth) return;

                var valid = false;

                var authcode = '';
                
                angular.forEach($scope.user.CustomFields, function(field) 
                {
                    if (field.Name.indexOf("SSBAuthorization1") > -1)
                    {
                        authcode = field.DefaultValue;
                    }
                });

                if (auth == authcode)
                {
                    valid = true;
                }
                else
                {
                    valid = false;
                }
                
                $scope.cart_order.authCode.$setValidity('sameName', valid);
                //alert(JSON.stringify($scope.cart_order.authCode));
			});            
		}]
	};
	return obj;
});