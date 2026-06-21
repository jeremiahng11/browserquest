// Production host profile for container/PaaS deploys (Coolify, Docker, etc.).
// Activates whenever a Redis target is provided in the environment — either a
// single REDIS_URL (e.g. Coolify's internal URL) or the discrete REDIS_HOST /
// REDIS_PORT / REDIS_PASSWORD vars — so nothing is hard-coded in config.json.
var url = require('url');

// Parse a redis:// URL into { host, port, password }. Returns null if the env
// var is absent or unparseable, so we can fall back to the discrete vars.
function parseRedisUrl(redisUrl) {
    if (!redisUrl) {
        return null;
    }
    try {
        var parsed = url.parse(redisUrl);
        if (!parsed.hostname) {
            return null;
        }
        // auth is "user:password" (or just "password"); redis AUTH only needs
        // the password, so take whatever follows the first colon, else the whole.
        var password;
        if (parsed.auth) {
            var sep = parsed.auth.indexOf(':');
            password = sep === -1 ? parsed.auth : parsed.auth.slice(sep + 1);
        }
        return {
            host: parsed.hostname,
            port: parsed.port ? parseInt(parsed.port, 10) : 6379,
            password: password || undefined
        };
    } catch (e) {
        return null;
    }
}

var fromUrl = parseRedisUrl(process.env.REDIS_URL);

var config = {};

config.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
config.redis_host = (fromUrl && fromUrl.host) || process.env.REDIS_HOST;
config.redis_port = (fromUrl && fromUrl.port) ||
    (process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379);
config.redis_password = (fromUrl && fromUrl.password) || process.env.REDIS_PASSWORD || undefined;

config.isActive = function() {
    // Active if we resolved a redis host from either the URL or the discrete var.
    return config.redis_host !== undefined && config.redis_host !== null;
};

module.exports = config;
