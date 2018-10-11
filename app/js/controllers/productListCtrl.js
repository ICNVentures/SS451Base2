four51.app.controller('ProductListCtrl', ['$routeParams', '$rootScope', '$scope', 'Product',
function ($routeParams,$rootScope, $scope, Product) {
    $scope.loadSearch = function(){

        if($scope.category && $scope.category.products){
            $scope.Products = $scope.category.products;
            return;
        }

        if ($scope.category) 
        {
            var buyerid = window.location.pathname.split('/')[1];

            if ($scope.categoryInteropID.indexOf(buyerid + "FAVE") >= 0)
            {
                $scope.products = [];
                $scope.productCount = "None";
                
                var cnt = 0;
        		angular.forEach($scope.shoppingList.split('|'), function(pn) 
                {
                    var prod = buyerid + pn;
                    
                    Product.get(prod, function(product)
                    {
                        $scope.products.push(product);
                        cnt++;
                        $scope.productCount = cnt;
                    });
                });                        
            }
            else
            {
                Product.search($scope.categoryInteropID, null, null, function(data) 
                {
                    $scope.category.products = $scope.Products = data;
    	            $scope.productCount = data.Count;
                });
            }
        }
    }
}]);