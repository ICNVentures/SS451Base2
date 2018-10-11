angular.module('OrderCloud-ContactModal', []);

angular.module('OrderCloud-ContactModal')
    .directive('contactmodal', contactmodal)
    .controller('ContactModalCtrl', ContactModalCtrl)
;

function contactmodal() {
    var directive = {
        restrict: 'E',
        template: template,
        controller: 'ContactModalCtrl'
    };
    return directive;

    function template() {
        return [
            '<style>',
            //this style is conditional based on nav placement and site css
            'contactmodal a, contactmodal a:hover, contactmodal a:focus {color:#fff; text-decoration:none;}',
            '</style>',
            // update the size of the modal window within the open()
            '<a ng-click="openContactModal(500)">',
            // replace the *Open Modal* below with your link name
            '<span class="fa fa-envelope-o"></span> {{\'Contact Us\' | r | xlat}}',
            '</a>'
        ].join('');
    }
}

ContactModalCtrl.$inject = ['$scope', '$modal'];
function ContactModalCtrl($scope, $modal) {

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            size: size,
            template: contactmodalopen,
            controller: ContactModalOpenCtrl,
            resolve: {
                item: function () {
                    //pass a scope variable into the modal content. in this case we are providing line item as an example for product use
                    return $scope.LineItem;
                }
            }
        });

        function contactmodalopen() {
            return [
                '<style>',
                '.modal-header {background-color:#f5f5f5;border-bottom: 1px solid #ccc; min-height: 36px; padding: 2px;}',
                '.modal-header h3 { margin-top:0;}',
                '.modal-header h5 { font-size:1.16em; font-weight:bold; padding:5px 10px; text-shadow: 0 1px 0 #ffffff;}',
                '.modal-header a.close {margin:0;padding:0;position:absolute;top:8px;right:10px;font-size:1.5em;color:#000;}',
                '.modal-body {width:100%; margin:0 auto; padding:10px 25px;}',
                '</style>',
                '<div class="modal-header" class="col-xs-12 row pull-right">',
                //Optional title in top header
                '<h5 class="modal-title text-primary">Title</h5>',
                //Optional close (x) in top header
                '<a class="pull-right close" ng-click="closeContactModal()">',
                '<i class="fa fa-times"></i>',
                '</a>',
                '</div>',
                '<div class="modal-body">',
                '<h3>Heading</h3>',
                //content block 1
                '<h4>Subheading</h4>',
                '<p>',
                'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s,' +
                'when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
                '</p>',
                //content block 2
                '<h4>Subheading</h4>',
                '<p>',
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed tempus lacinia nisl, et hendrerit enim consequat posuere. Etiam ut interdum nisl, in ultricies arcu. ' +
                'In mattis ultrices velit, et tristique sem mattis nec. Nullam fermentum quis erat non dapibus. Aenean sodales est at aliquet bibendum. Suspendisse ultricies quam ' +
                'nec blandit tincidunt. Phasellus viverra est sit amet tortor semper facilisis. Vivamus vitae ipsum lacus. Proin pharetra, tellus in efficitur blandit, tellus nisl ' +
                'venenatis turpis, ut commodo sapien felis eget quam.',
                '</p>',
                '</div>',
                //Optional footer
                '<div class="modal-footer">',
                '<div class="pull-left">',
                '<a class="btn btn-default" ng-click="cancel()">Cancel</a>',
                '</div>',
                '<div class="pull-right">',
                '<a target="_blank" class="btn btn-primary " ng-click="close()">Close</a>',
                '</div>',
                '</div>'
            ].join('');
        }

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

    };

    var ContactModalOpenCtrl = ['$scope', '$modalInstance', '$modal', function($scope, $modalInstance, $modal, item) {

        $scope.item = item; // this is the item passed in from the ContentModalCtrl resolve

        $scope.closeContactModal = function () {
            $modalInstance.close();
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }];

}