angular.module('OrderCloud-HeaderNavigation', []);
angular.module('OrderCloud-HeaderNavigation')
    .directive('headernavigation', headernavigation)
    .controller('HeaderNavigationCtrl', HeaderNavigationCtrl)
;

function headernavigation() {
    return {
        restrict: 'E',
        template: template,
    };

    function template() {
        return [
            '<section class="header-navigation">',
            '<div class="row">',
            '<div class="col-xs-12 col-sm-6 pull-left">',
            '<ul style="float:left !important;"><li style="float:left !important;"><span style="color: #000;"><contactinfo></contactinfo></li></span></ul>',
            '</div>',
            '<div class="col-xs-12 col-sm-6 pull-right">',
            '<ul>',
            '<li><a href="catalog">Home</a></li>',
            '<li><span style="color: #000;">&nbsp;&bull;&nbsp;</span></li>',
            '<li ng-if="user.Permissions.contains(\'ViewSelfAdmin\')"><a href="admin">My Account</a></li>',
            '<li ng-if="user.Permissions.contains(\'ViewSelfAdmin\')"><span style="color: #000;">&nbsp;&bull;&nbsp;</span></li>',
            '<li><a href="order">Orders</a></li>',
            '<li><span style="color: #000;">&nbsp;&bull;&nbsp;</span></li>',
            '<li ng-if="user.Permissions.contains(\'EditApprovalOrder\')"><a href="approval">Approval</a></li>',
            '<li ng-if="user.Permissions.contains(\'EditApprovalOrder\')"><span style="color: #000;">&nbsp;&bull;&nbsp;</span></li>',
            '<li ng-if="user.Permissions.contains(\'ViewContactUs\')"><a href="contactus">Support</a></li>',
            '<li ng-if="user.Permissions.contains(\'ViewContactUs\')"><span style="color: #000;">&nbsp;&bull;&nbsp;</span></li>',
            '<li><a href="cart">Cart&nbsp;',
            '<span ng-if="currentOrder.LineItems.length" ng-bind="cartCount" class="badge"></span>',
            '</a></li>',
            '<li><span style="color: #000;">&nbsp;&bull;&nbsp;</span></li>',
            '<li><a ng-click="Logout()">Log Off</a></li>',
            '</ul>',
            '</div>',
            '</div>',
            '</section>'
        ].join('');
    }
}

HeaderNavigationCtrl.$inject = ['$scope','User'];
function HeaderNavigationCtrl($scope, User) 
{
    $scope.Logout = function(){
        User.logout();
        if ($scope.isAnon) {
            $location.path("/logoff");
            User.login(function(user) {
                $scope.user = user;
            });
        }
    };
}
