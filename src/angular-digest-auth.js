'use strict';

/**
 * dgAuth provides functionality to manage
 * user authentication
 */
var dgAuth = angular.module('dgAuth', ['angular-md5', 'ngCookies']);

/**
 * Configures http to intercept requests and responses with error 401.
 */
dgAuth.config(['$httpProvider', function($httpProvider)
{
    $httpProvider.interceptors.push([
        '$rootScope',
        '$q',
        'authServer',
        'authEvents',
    function($rootScope, $q, authServer, authEvents)
    {
        return {
            'request': function(request)
            {
                $rootScope.$broadcast(authEvents.getEvent('process.request'), request);

                return (request || $q.when(request));
            },
            'responseError': function(rejection)
            {
                if(rejection.status === 401)
                {
                    $rootScope.$broadcast(authEvents.getEvent('process.response'), rejection);

                    if(rejection.mustTerminate)
                        return $q.reject(rejection);

                    console.debug("Server has requested an authentication.");

                    if(!authServer.parseHeader(rejection))
                    {
                        $rootScope.$broadcast(authEvents.getEvent('authentication.notFound'));
                        return $q.reject(rejection);
                    }

                    var deferred = $q.defer();
                    var request = {
                        config: rejection.config,
                        deferred: deferred
                    };

                    console.debug('Parse header for authentication.');
                    $rootScope.$broadcast(authEvents.getEvent('authentication.header'), request);
                    $rootScope.$broadcast(authEvents.getEvent('signin.required'));

                    return deferred.promise;
                }

                return $q.reject(rejection);
            }
        };
    }]);
}]);

/**
 * Uses components to manage authentication.
 */
dgAuth.run([
    '$rootScope',
    'authEvents',
    'authService',
    'authClient',
function($rootScope, authEvents, authService, authClient)
{
    $rootScope.$on(authEvents.getEvent('process.request'), function(event, request)
    {
        if(authClient.isConfigured())
        {
            var login = authService.getCredentials();
            authClient.processRequest(login.username, login.password, request);
        }
    });

    $rootScope.$on(authEvents.getEvent('process.response'), function(event, response)
    {
        authService.mustTerminate(response);
    });

    $rootScope.$on(authEvents.getEvent('authentication.header'), function(event, request)
    {
        authService.setHttpRequest(request);
    });
}]);