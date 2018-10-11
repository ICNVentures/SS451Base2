angular.module('OrderCloud-ngFader', []);

angular.module('OrderCloud-ngFader')
    .directive('ngFader', ngFader)
;

ngFader.$inject = ['$interval'];
function ngFader($interval) {
    link.$inject = ['scope'];
    function link(scope) {
        //Set your interval time. 4000 = 4 seconds
		scope.setTime = 4000;

		//List your images here. 
		scope.images = [
			{
			src: 'css/images/GTE_jumbotron.jpg',
			alt: 'Slide 1!'
			},
		 	{
			src: 'css/images/GTE_jumbotron_SLIDE2.jpg',
			alt: 'Slide 2'
			}
		];

		/*****************************************************
			STOP! NO FURTHER CODE SHOULD HAVE TO BE EDITED
		******************************************************/

		//Pagination dots - gets number of images
        scope.numberOfImages = scope.images.length;
        scope.dots = function(num) {
          return new Array(num);   
        };

        //Pagination - click on dots and change image
        scope.selectedImage = 0;
        scope.setSelected = function (idx) {
          scope.stopSlider();
          scope.selectedImage = idx;
        };

        //Slideshow controls
        scope.sliderBack = function() {
          scope.stopSlider();
          scope.selectedImage === 0 ? scope.selectedImage = scope.numberOfImages - 1 : scope.selectedImage--;
        };

        scope.sliderForward = function() {
          scope.stopSlider();
          scope.autoSlider();
        };

        scope.autoSlider = function (){
          scope.selectedImage < scope.numberOfImages - 1 ? scope.selectedImage++ : scope.selectedImage = 0;
        };

        scope.stopSlider = function() {
          $interval.cancel(scope.intervalPromise);
          scope.activePause = true;
          scope.activeStart = false;
        };

        scope.toggleStartStop = function() {
          if(scope.activeStart) {
          	scope.stopSlider();
          } else {
          	scope.startSlider();
          }
        };
        
        scope.startSlider = function(){
          scope.intervalPromise = $interval(scope.autoSlider, scope.setTime);
          scope.activeStart = true;
          scope.activePause = false;
        };
        scope.startSlider();

        scope.show = function(idx){
        	if (scope.selectedImage==idx) {
        		return "show";
        	}
        };
    };
    var directive = {
        restrict: 'E',
	    scope: false,
        link: link,
        template: '<div class="ng-fader">'+
	    		//images will render here
			'<ul>' + 
				'<li ng-repeat="image in images" ng-click="toggleStartStop()" ng-swipe-right="sliderBack()" ng-swipe-left="sliderForward()"><img data-ng-src="{{image.src}}" data-ng-alt="{{image.alt}}" ng-class="show($index)"/></li>' + 
			'</ul>' + 
			//pagination dots will render here
			'<div class="ng-fader-pagination">' + 
				'<ul>' + 
					'<li ng-repeat="i in dots(numberOfImages) track by $index" ng-class="{current: selectedImage==$index}" ng-click="setSelected($index)"></li>' + 
				'</ul>' + 
			'</div>' + 
			//controls are here
			'<div class="ng-fader-controls">' + 
				'<ul>' + 
					'<li ng-click="sliderBack()">' + 
						'<i class="ngfader-back"></i>' + 
					'</li>' + 
					'<li ng-click="stopSlider()">' + 
						'<i class="ngfader-pause" ng-class="{\'active\': activePause}"></i>' + 
					'</li>' + 
					'<li ng-click="startSlider()">' + 
						'<i class="ngfader-play"  ng-class="{\'active\': activeStart}"></i>' + 
					'</li>' + 
					'<li ng-click="sliderForward()">' + 
						'<i class="ngfader-forward"></i>' + 
					'</li>' + 
				'</ul>' + 
			'</div>' +
		'</div>'
    };
    return directive;
}