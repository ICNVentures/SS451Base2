four51.app.controller('OrderApprCtrl', ['$scope', '$location', '$window', 'OrderSearchCriteria', 'OrderSearch', 'Order', 'Address',
	function ($scope,  $location, $window, OrderSearchCriteria, OrderSearch, Order, Address) {
		$scope.settings = {
			currentPage: 1,
			pageSize: 100
		};

		OrderSearchCriteria.query(function(data) {
			$scope.OrderSearchCriteria = data;
			$scope.hasStandardTypes = _hasType(data, 'Standard');
		});

		$scope.$watch('settings.currentPage', function() {
			Query($scope.currentCriteria);
		});

        //Query(OrderSearchCriteria("Type:'Standard', Status:'AwaitingApproval'"));

		$scope.OrderSearch = function($event, criteria) {
			//$event.preventDefault();
			$scope.currentCriteria = criteria;
			Query(criteria);
		};

		function _hasType(data, type) {
			var hasType = false;
			angular.forEach(data, function(o) {
				if (hasType || o.Type == type && o.Count > 0)
					hasType = true;
			});
			return hasType;
		}

        $scope.linelist = function(id)
        {
            var x = $scope.ordid.indexOf(id);
            
            if (x >= 0)
            {
                return $scope.ordli[x];
            }
        }
        
		function Query(criteria) {
			if (!criteria) return;
			$scope.showNoResults = false;
			$scope.pagedIndicator = true;
			$scope.ordli = [];
			$scope.ordid = [];
			
			OrderSearch.search(criteria, function (list, count) {
                function compare(a,b) {
                    if (a.DateCreated < b.DateCreated)
                        return -1;
                    if (a.DateCreated > b.DateCreated)
                        return 1;
                    return 0;
                }

			    list.sort(compare);
				$scope.orders = list;
			    
			    angular.forEach(list, function(ord) {
            		Order.get(ord.ID, function(order) {
            			$scope.ordli.push(order.LineItems);
            			$scope.ordid.push(order.ID);
        	        });
				
    			});

				$scope.settings.listCount = count;
				$scope.showNoResults = list.length == 0;
				$scope.pagedIndicator = false;
			}, $scope.settings.currentPage, $scope.settings.pageSize);
			$scope.orderSearchStat = criteria;
		}

	    $scope.approveOrder = function(id) 
	    {
            var idx = $scope.ordid.indexOf(id);
            
		    $scope.loadingIndicator = true;
		    $scope.approveClicked = true;

		    Order.approve($scope.orders[idx],
			    function(data) {
				    $scope.order = data;
				    if ($scope.order.IsMultipleShip()) {
					    angular.forEach(data.LineItems, function(item) {
						    if (item.ShipAddressID) {
							    Address.get(item.ShipAddressID, function(add) {
								    item.ShipAddress = add;
							    });
						    }
					    });
				    }
				    else {
					    Address.get(data.ShipAddressID || data.LineItems[0].ShipAddressID, function(add) {
						    data.ShipAddress = add;
					    });
				    }

				    Address.get(data.BillAddressID, function(add){
					    data.BillAddress = add;
				    });
				    $scope.loadingIndicator = false;
            		$window.location.href = 'approval';
			    },
			    function(ex) {
				    $scope.approveClicked = false;
				    $scope.loadingIndicator = false;
				    $scope.error = ex.Detail;
			    }
		    );
	    }

	    $scope.declineOrder = function(id) 
	    {
            var idx = $scope.ordid.indexOf(id);
            
		    $scope.loadingIndicator = true;
		    Order.decline($scope.orders[idx],
			    function(data) {
				    $scope.order = data;
				    $scope.loadingIndicator = false;
            		$window.location.href = 'approval';
			    },
			    function(ex) {
				    $scope.loadingIndicator = false;
				    $scope.error = "An error occurred while processing.";
			    }
		    );
	    }

    	$scope.editOrder = function(id) 
	    {
            var idx = $scope.ordid.indexOf(id);
            
	    	$scope.loadingIndicator = true;
    		$location.path('apprcart/' + $scope.ordid[idx]);
    	}

    	$scope.editCheckout = function(id) 
	    {
            var idx = $scope.ordid.indexOf(id);
            
	    	$scope.loadingIndicator = true;
    		$location.path('apprcheckout/' + $scope.ordid[idx]);
    	}

        $scope.editLine = function(id, lidx) 
        {
            var oidx = $scope.ordid.indexOf(id);

            if ($scope.ordli[oidx][lidx].Variant)
            {
                $location.path('product/' + $scope.ordli[oidx][lidx].Product.InteropID + '/' + $scope.ordli[oidx][lidx].Variant.InteropID + '/edit/approval');
            }
            else
            {
    		    $location.path('cart/' + $scope.ordli[oidx][lidx].Product.InteropID + '/' + $scope.ordid[oidx] + '/' + lidx + '/approval');
            }
        }

	}]);