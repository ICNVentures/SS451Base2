four51.app.controller('CategoryCtrl', ['$routeParams', '$sce', '$scope', '$location', '$451', 'Category', 'Product', 'Nav', 'User',
function ($routeParams, $sce, $scope, $location, $451, Category, Product, Nav, User) {

	$scope.productLoadingIndicator = true;
	$scope.settings = {
		currentPage: 1,
		pageSize: 40
	};
	$scope.trusted = function(d){
		if(d) return $sce.trustAsHtml(d);
	}

	function _search() {
		$scope.searchLoading = true;
		
        var buyerid = window.location.pathname.split('/')[1];
        
		if ($routeParams.categoryInteropID == buyerid + 'FAVE')
		{
            $scope.products = [];
            
            if (typeof($scope.shoppingList) === "undefined" || $scope.shoppingList === '')
            {
                $scope.productLoadingIndicator = false;
                $scope.searchLoading = false;
            }
            else 
            {
                var sl = $scope.shoppingList.split('|');
                var cnt = 0;
            
        		angular.forEach(sl, function(pn) 
                {
                    var prod = buyerid + pn;
                    
                    Product.get(prod, function(product)
                    {
                        cnt++;
                        
                        $scope.products.push(product);
                        $scope.productCount = cnt;
                        
                        if (cnt == sl.length)
                        {
                            $scope.productLoadingIndicator = false;
                            $scope.searchLoading = false;
                    
                        }
                    });
                });        
            }
		}
		else
		{
    		Product.search($routeParams.categoryInteropID, null, null, function (products, count) {
    			$scope.products = products;
    			$scope.productCount = count;
    			$scope.productLoadingIndicator = false;
    			$scope.searchLoading = false;
    		}, $scope.settings.currentPage, $scope.settings.pageSize);
		}
	}

	$scope.$watch('settings.currentPage', function(n, o) {
		if (n != o || (n == 1 && o == 1))
			_search();
	});

	if ($routeParams.categoryInteropID) 
	{
        $scope.categoryLoadingIndicator = true;
        
        Category.get($routeParams.categoryInteropID, function(cat) {
            $scope.currentCategory = cat;
            $scope.categoryLoadingIndicator = false;
        });
    }

	$scope.$on("treeComplete", function(data)
	{
	    if (typeof($scope.tree) !== "undefined" && $scope.tree !== null && $scope.tree.count > 0)
	    {
    	    $scope.currentCategory = $scope.tree[0];
	    }
	});

    // panel-nav
    $scope.navStatus = Nav.status;
    $scope.toggleNav = Nav.toggle;
	$scope.$watch('sort', function(s) {
		if (!s) return;
		(s.indexOf('Price') > -1) ?
			$scope.sorter = 'StandardPriceSchedule.PriceBreaks[0].Price' :
			$scope.sorter = s.replace(' DESC', "");
		$scope.direction = s.indexOf('DESC') > -1;
	});

    $scope.showInfo = function()
    {
        return !$routeParams.categoryInteropID;
    }
    
    $scope.showBanner = function()
    {
        var fld = "SSBLandingBanner001";

        if (typeof($scope.user) !== "undefined")
        {
            angular.forEach($scope.user.CustomFields, function(field) 
            {
                if (field.Name.indexOf("SSBLandingBanner") > -1)
                {
                    fld = field.File.Url;
                }
            });
        }
        
        return fld;
    }
    
    $scope.showCat = function()
    {
        var fld = "SSBLandingOptionPro";
        
        if (typeof($scope.user) !== "undefined")
        {
            angular.forEach($scope.user.CustomFields, function(field) 
            {
                if (field.Name.indexOf("SSBLandingOption") > -1)
                {
                    fld = field.Name;
                }
            });

            if (fld == "SSBLandingOptionPro")
            {
                if (!$routeParams.categoryInteropID)
                {
                    var iop = '';
    
    	            if (typeof($scope.tree) !== "undefined" && $scope.tree !== null && $scope.tree.count > 0)
    	            {
        	            iop = $scope.tree[0].InteropID;
    	            }                
    
                    angular.forEach($scope.tree, function(data) 
                    {
                        if (data.Name.toLowerCase() == 'all')
                        {
                            iop = data.InteropID;
                        }
                    });
                    
                    $location.path('catalog/' + iop);
                }
                
                $scope.LandingOption = "PRO";
            }
            else if (fld == "SSBLandingOptionCat")
            {
                if (!$routeParams.categoryInteropID)
                {
                    $scope.LandingOption = "CAT";
                }
                else
                {
                    $scope.LandingOption = "PRO";
                }
            }
            else if (fld == "SSBLandingOptionBan")
            {
                if (!$routeParams.categoryInteropID)
                {
                    $scope.LandingOption = "BAN";
                }
                else
                {
                    $scope.LandingOption = "PRO";
                }
            }

            return $scope.LandingOption;
        }
        else
        {
            return '';
        }
    }	
}]);