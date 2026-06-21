// Production host profile for container/PaaS deploys (Coolify, Docker, etc.).
// Activates whenever REDIS_HOST is provided in the environment, pulling the
// runtime settings from env vars so nothing is hard-coded in config.json.
var config = {};

config.port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
config.redis_host = process.env.REDIS_HOST;
config.redis_port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
config.redis_password = process.env.REDIS_PASSWORD || undefined;

config.isActive = function() {
    return process.env.REDIS_HOST !== undefined;
};

module.exports = config;
