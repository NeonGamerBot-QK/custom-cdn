const { join  } = require('path');
const crypto = require('crypto');
module.exports = function useConfig() {
    const env = process.env;
  let res =  {
        TITLE: env.TITLE || `CDN server`,
        PORT: env.PORT || env.SERVER_PORT || 3000,
        FILESTORE_PATH: env.FILESTORE_PATH || join(__dirname, '..','..', 'db.json'),
        DESCRIPTION: env.DESCRIPTION || `A simple CDN server`,
        URL: env.URL,
        KEY: env.KEY || crypto.randomBytes(64).toString('hex'),
        MAX_COOKIE_AGE: env.MAX_COOKIE_AGE || 24 * 60 * 60 * 1000 // 24 hours
    }
    if(!res.URL) res.URL = `http://localhost:${res.PORT}`
    return res;
}