dgAuth.factory('authIdentity', function()
{
    function AuthIdentity()
    {
        /**
         *
         * @type {Object|null}
         * @private
         */
        var _identity = null;

        /**
         *
         * @param {string} [key]
         * @param {Object|string|Array} value
         */
        this.set = function(key, value)
        {
            if(key)
            {
                if(null == _identity)
                    _identity = {};

                _identity[key] = value;
            }
            else
            {
                if(value instanceof Object)
                    _identity = value;
                else
                    throw 'You have to provide an object if you want to set the identity without a key.';
            }
        };

        /**
         *
         *
         * @param {string} [key]
         * @returns {Object|Array|string|null}
         */
        this.get = function(key)
        {
            if(!key)
                return _identity;

            if(!_identity || !_identity.hasOwnProperty(key))
                return null;

            return _identity[key];
        };

        /**
         *
         * @returns {boolean}
         */
        this.has = function()
        {
            return (null !== _identity);
        };

        /**
         *
         */
        this.clear = function()
        {
            _identity = null;
        };
    }

    return new AuthIdentity();
});