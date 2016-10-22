angular.module('nibs_ibeacon.profile', ['nibs_ibeacon.s3uploader', 'nibs_ibeacon.config', 'nibs_ibeacon.status'])

    // Routes
    .config(function ($stateProvider) {

        $stateProvider

            .state('app.profile', {
                url: "/profile",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/profile.html",
                        controller: "ProfileCtrl"
                    }
                }
            })

            .state('app.edit-profile', {
                url: "/edit-profile",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/edit-profile.html",
                        controller: "EditProfileCtrl"
                    }
                }
            })

    })

    // Services
    .factory('User', function ($http, $rootScope) {
        return {
            get: function () {
                return $http.get($rootScope.server.url + '/users/me', null)
            },

            update: function (user) {
                return $http.put($rootScope.server.url + '/users/me', user)
            }
        };

    })

    //<------- Mo -------

    .factory('Protein', function() {

        var proteins = [
            { text: 'High', value: 'High' },
            { text: 'Medium', value: 'Medium' },
            { text: 'Low', value: 'Low' }
        ];

        return {
            all: function() {
                return proteins;
            }
        }
    })

    .factory('Frequency', function() {

        var frequencies = [
            { text: 'Weekly', value: 'Weekly' },
            { text: 'Bi-weekly', value: 'Bi-weekly' },
            { text: 'Monthly', value: 'Monthly' }
        ];

        return {
            all: function() {
                return frequencies;
            }
        }
    })

    .factory('Type', function() {

        var types = [
            { text: 'Oats', value: 'Oats' },
            { text: 'Barley', value: 'Barley' },
            { text: 'Fruit-Mix', value: 'Fruit-Mix' },
            { text: 'Weetabix', value: 'Weetabix' }
        ];

        return {
            all: function() {
                return types;
            }
        }
    })

    //>------- Mo -------

    //Controllers
    .controller('ProfileCtrl', function ($rootScope, $scope, $state, User, STATUS_LABELS, STATUS_DESCRIPTIONS) {

        User.get().success(function(user) {
            $rootScope.user = user;
            $scope.statusLabel = STATUS_LABELS[user.status - 1];
            $scope.statusDescription = STATUS_DESCRIPTIONS[user.status - 1];
        });

        $scope.popupDialog = function() {

            if (navigator.notification) {
                navigator.notification.alert(
                    'You have a new message!',  // message
                    function() {                // callback
                        $state.go('app.messages');
                    },
                    'Nibs',                     // title
                    'Open Inbox'             // buttonName
                );
            } else {
                alert('You have a new message!');
                $state.go('app.messages');
            }

        }

    })

    .controller('EditProfileCtrl', function ($scope, $window, $ionicPopup, S3Uploader, User, Protein, Frequency, Type, Status) {

        User.get().success(function(user) {
            $scope.user = user;
        });
        $scope.proteins     = Protein.all();
        $scope.frequencies  = Frequency.all();
        $scope.types        = Type.all();

        $scope.panel = 1;

        $scope.update = function () {
            console.log('Updating User...');
            User.update($scope.user).success(function() {
                Status.show('Your profile has been saved.');
            })
        };

        $scope.addPicture = function (from) {

            if (!navigator.camera) {
                $ionicPopup.alert({title: 'Sorry', content: 'This device does not support Camera'});
                return;
            }

            var fileName,
                options = {   quality: 45,
                    allowEdit: true,
                    targetWidth: 300,
                    targetHeight: 300,
                    destinationType: Camera.DestinationType.FILE_URI,
                    encodingType: Camera.EncodingType.JPEG };
            if (from === "LIBRARY") {
                options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                options.saveToPhotoAlbum = false;
            } else {
                options.sourceType = Camera.PictureSourceType.CAMERA;
                options.saveToPhotoAlbum = true;
            }

            navigator.camera.getPicture(
                function (imageURI) {
                    // without setTimeout(), the code below seems to be executed twice.
                    setTimeout(function () {
                        fileName = new Date().getTime() + ".jpg";
                        S3Uploader.upload(imageURI, fileName).then(function () {
                            $scope.user.pictureurl = 'https://accor-static.s3.amazonaws.com/' + fileName;
                        });
                    });
                },
                function (message) {
                    // We typically get here because the use canceled the photo operation. Seems better to fail silently.
                }, options);
            return false;
        };
    });
