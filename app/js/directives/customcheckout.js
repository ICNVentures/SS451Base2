four51.app.directive('customcheckout', function() {
    var obj = 
    {
        scope: {
            ccorder : '='
        },
        restrict: 'E',
        replace: true,
        templateUrl: 'partials/controls/customCheckout.html',
        controller: CustomCheckoutCtrl,
    };

    return obj;
});

CustomCheckoutCtrl.$inject = ['$scope', '$location'];
function CustomCheckoutCtrl($scope, $location) 
{
    $scope.ccBuyer = "";
    $scope.ccAOSmithBuyer = aoSmithBuyer();
    
    function aoSmithBuyer()
    {
        var buylist = 
        [
            "2100001755", //American
            "2100095876", //AO Smith
            "2100098944", //Permatank
            "2100001761", //Premier
            "2100097120", //Reliance
            "2100097123", //State
            "2100009114", //Takagi
            "2100001759", //US Craftmaster
            // "3200002500", //BAM for testing
        ];
        
        $scope.ccBuyer = $location.absUrl().split('/')[3];

        if (buylist.indexOf($scope.ccBuyer) >= 0)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    $scope.ccRepLabel = "Rep Code (5-character)";
    $scope.ccCustLabel = "Customer # (up to 10 char)";
    
    $scope.ccPrimaryValue = '';
    $scope.ccRepValue = '';
    $scope.ccCustValue = '';
    
    $scope.ccRepShow = false;
    $scope.ccCustShow = false;
    
    $scope.ccPrimaryRequired = true;
    
    if ($scope.ccorder.Comments !== null && $scope.ccorder.Comments !== '' && $scope.ccorder.Comments.length > 0)
    {
        angular.forEach($scope.ccorder.Comments.split(','), function(co) 
        {
            var cos = co.split(':');
            var nm = cos[0].trim();
            var val = cos[1].trim();
            
            if (nm == "Primary Function")
            {
                $scope.ccPrimaryValue = val;
                showRepCust(val);
            }
            else if (nm == "Rep Code")
            {
                $scope.ccRepValue = val;
            }
            else if (nm == "Customer #")
            {
                $scope.ccCustValue = val;
            }
        });
    }
    
    $scope.ccPrimaryOpt = function(opt)
    {
        switch ($scope.ccBuyer)
        {
            case "2100001756": //American
                return (opt == 1 || opt == 3 || opt == 4 || opt == 6 || opt == 8 || opt == 10);

            case "2100095876": //AO Smith
                return (opt == 1 || opt == 3 || opt == 4 || opt == 6 || opt == 8 || opt == 11);

            case "2100098944": //Permatank
                return (opt == 1 || opt == 3 || opt == 5 || opt == 9);
                
            case "2100001761": //Premier
                return false;
                
            case "2100097120": //Reliance
                return (opt == 1 || opt == 2 || opt == 8 || opt == 12);
                
            case "2100097123": //State
                return (opt == 1 || opt == 3 || opt == 4 || opt == 6 || opt == 8 || opt == 13);
            
            case "2100009114": //Takagi
                return (opt == 1 || opt == 3 || opt == 4 || opt == 6 || opt == 14);

            case "2100001759": //US Craftmaster
                return (opt == 1 || opt == 2 || opt == 8 || opt == 15);
            
           // case "3200002500": //BAM for testing
           //    return (opt == 1 || opt == 3 || opt == 4 || opt == 6 || opt == 8 || opt == 10);
        }
    }

    $scope.ccPrimaryChange = function(sel)
    {
        showRepCust(sel);
        $scope.ccPrimaryValue = sel;
        setOrderComments();
    };
    
    function showRepCust(sel)
    {
        switch ($scope.ccBuyer)
        {
            case "2100095876": //AO Smith
                $scope.ccRepRequired = false;
                $scope.ccRepLen = 0;
                $scope.ccRepShow = true;
                $scope.ccCustRequired = false;
                $scope.ccCustShow = true;
                
                break;
                
            case "2100001756": //American
            case "2100098944": //Permatank
            case "2100001761": //Premier
            case "2100097123": //State
            case "2100009114": //Takagi
            case "3200002500": //BAM for testing
                if (sel == "Manufacturer Representative")
                {
                    $scope.ccRepRequired = true;
                    $scope.ccRepLen = 5;
                    $scope.ccRepShow = true;
                    $scope.ccCustRequired = false;
                    $scope.ccCustShow = false;
                }
                else if (sel == "Wholesale Distributor")
                {
                    $scope.ccRepRequired = false;
                    $scope.ccRepLen = 5;
                    $scope.ccRepShow = false;
                    $scope.ccCustRequired = true;
                    $scope.ccCustShow = true;
                }
                else
                {
                    $scope.ccRepRequired = false;
                    $scope.ccRepLen = 0;
                    $scope.ccRepShow = false;
                    $scope.ccCustRequired = false;
                    $scope.ccCustShow = false;
                }
                
                break;

            case "2100097120": //Reliance
            case "2100001759": //US Craftmaster
                $scope.ccCustRequired = false;
                $scope.ccRepLen = 0;
                $scope.ccCustShow = false;

                if (sel == "Manufacturer Representative")
                {
                    $scope.ccRepRequired = true;
                    $scope.ccRepLen = 5;
                    $scope.ccRepShow = true;
                }
                else
                {
                    $scope.ccRepRequired = false;
                    $scope.ccRepLen = 0;
                    $scope.ccRepShow = false;
                }
                
                break;
                
            default:
                $scope.ccRepRequired = false;
                $scope.ccRepLen = 0;
                $scope.ccRepShow = false;
                $scope.ccCustRequired = false;
                $scope.ccCustShow = false;

                break;
        }        
    }
    
    $scope.ccRepChange = function(val)
    {
        if (typeof(val) === "undefined" || val === null)
        {
            $scope.ccRepValue = "";
        }
        else
        {
            $scope.ccRepValue = val;
        
            if ($scope.ccRepValue.length === 0 || $scope.ccRepValue.length === 5)
            {
                setOrderComments();
            }
        }
    }
    
    $scope.ccCustChange = function(val)
    {
        if (typeof(val) === "undefined" || val === null)
        {
            $scope.ccCustValue = "";
        }
        else
        {
            $scope.ccCustValue = val;
            setOrderComments();
        }
    };
    
    function setOrderComments()
    {
        var x = '';
        var sep = '';
        
        if (typeof($scope.ccPrimaryValue) != "undefined" && $scope.ccPrimaryValue.length > 0)
        {
            x += sep + "Primary Function: " + $scope.ccPrimaryValue;
            sep = ', ';
        }
        
        if (typeof($scope.ccRepValue) != "undefined" &&  $scope.ccRepValue.length > 0)
        {
            x += sep + "Rep Code: " + $scope.ccRepValue;
            sep = ', ';
        }
        
        if (typeof($scope.ccCustValue) != "undefined" && $scope.ccCustValue.length > 0)
        {
            x += sep + "Customer #: " + $scope.ccCustValue;
            sep = ', ';
        }
        
        $scope.ccorder.Comments = x;
    }
}