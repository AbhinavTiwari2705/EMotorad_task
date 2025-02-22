
import dotenv from 'dotenv';

dotenv.config();

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    PORT: process.env.PORT || 3000,
    
    DATABASE_URL: process.env.NEON_DATABASE_URL,
    
    API_VERSION: process.env.API_VERSION || 'v1',

    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || 15 * 60 * 1000, 
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || 100 
};


const requiredEnvVars = ['NEON_DATABASE_URL'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export default env;