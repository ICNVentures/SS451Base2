four51.app.factory('SmartSource', [ '$http', function($http) 
{
    var currlist = '';
    
    var _shoppinglist = function(interopid, success) 
    {
        if (currlist === null || currlist === '')
        {
            if (typeof $http !== undefined && $http !== null)
            {
                $http
                (
                    {
                        url: "https://ssfour51.com/services/WebService.asmx/ShoppingList",
                        method: "POST",
                        crossDomain: true,
                        data: 
                        { 
                            "GUID" : "05B6E448-CC3B-4A98-BC13-2C0ECF089933",
                            "InteropID" : interopid,
                        },
                    }
                ).then
                (
                    function successCallback(response) 
                    {
                        currlist = response.data.d;
                    }, 
                    function errorCallback(response) 
                    {
                        console.log('Bad call to ShoppingList: ' + JSON.stringify(response));
                        currlist = '';
                    }
                );
            }
        }
        
        success(currlist);
    };

    var _shoppinglistAdd = function(interopid, prodnum, success) 
    {
        $http
        (
            {
                url: "https://ssfour51.com/services/WebService.asmx/ShoppingListAdd",
                method: "POST",
                crossDomain: true,
                data: 
                { 
                    "GUID" : "05B6E448-CC3B-4A98-BC13-2C0ECF089933",
                    "InteropID" : interopid,
                    "ProdNum" : prodnum,
                },
            }
        ).then
        (
            function successCallback(response) 
            {
                currlist = response.data.d;
            }, 
            function errorCallback(response) 
            {
                console.log('Bad call to ShoppingListAdd: ' + JSON.stringify(response));
                currlist = '';
            }
        );
        
        success(currlist);
    };
    
    var _shoppinglistDel = function(interopid, prodnum, success) 
    {
        $http
        (
            {
                url: "https://ssfour51.com/services/WebService.asmx/ShoppingListDel",
                method: "POST",
                crossDomain: true,
                data: 
                { 
                    "GUID" : "05B6E448-CC3B-4A98-BC13-2C0ECF089933",
                    "InteropID" : interopid,
                    "ProdNum" : prodnum,
                },
            }
        ).then
        (
            function successCallback(response) 
            {
                currlist = response.data.d;
            }, 
            function errorCallback(response) 
            {
                currlist = '';
            }
        );
        
        success(currlist);
    };
        
    return(
    {
        shoppinglist: _shoppinglist,
        shoppinglistAdd: _shoppinglistAdd,
        shoppinglistDel: _shoppinglistDel,
    });
}]);