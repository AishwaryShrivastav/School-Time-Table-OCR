# Environment Variables Configuration

This document describes all environment variables used in the Timetable OCR Platform.

## Backend Environment Variables

Located in: `backend/.env`

### Required Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key for GPT-4 Vision | `sk-proj-...` | *None* (Required) |
| `PORT` | Port number for the backend server | `5000` | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` | `development` |

### OpenAI API Configuration

#### Getting Your API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key immediately (you won't be able to see it again)
6. Add it to your `.env` file

#### API Key Format
```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Important Notes
- Keep your API key secret and never commit it to version control
- The key should start with `sk-proj-` or `sk-`
- OpenAI charges per API call, so monitor your usage
- Free tier has limitations; consider upgrading for production use

### Optional Variables

You can add these for additional configuration:

```env
# File Upload Configuration
MAX_FILE_SIZE=10485760                    # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf

# OpenAI Configuration
OPENAI_MODEL=gpt-4o                       # GPT-4 with vision capabilities
OPENAI_MAX_TOKENS=2000                    # Maximum response length
OPENAI_TEMPERATURE=0.1                    # Lower = more deterministic

# CORS Configuration
FRONTEND_URL=http://localhost:3000        # Frontend URL for CORS

# Logging
LOG_LEVEL=info                            # debug, info, warn, error
```

## Frontend Environment Variables

Located in: `frontend/.env` (optional)

The frontend uses Vite and can access environment variables prefixed with `VITE_`:

```env
# API Configuration
VITE_API_URL=http://localhost:5000        # Backend API URL
VITE_API_TIMEOUT=30000                    # Request timeout in ms

# Feature Flags
VITE_ENABLE_ANALYTICS=false               # Enable analytics tracking
VITE_MAX_FILE_SIZE=10                     # Max file size in MB
```

### Using Environment Variables in Frontend

```javascript
// In your React components
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

## Development vs Production

### Development (.env)
```env
NODE_ENV=development
PORT=5000
OPENAI_API_KEY=sk-proj-your-dev-key
```

### Production (.env.production)
```env
NODE_ENV=production
PORT=80
OPENAI_API_KEY=sk-proj-your-prod-key
FRONTEND_URL=https://your-domain.com
```

## Security Best Practices

### ✅ DO:
- Use different API keys for development and production
- Add `.env` to `.gitignore`
- Rotate API keys periodically
- Use environment variable management tools (AWS Secrets Manager, Azure Key Vault, etc.)
- Validate environment variables on application startup

### ❌ DON'T:
- Commit `.env` files to version control
- Share API keys in chat, email, or documentation
- Use production keys in development
- Hardcode sensitive values in source code
- Expose API keys in client-side code

## Validation

The backend includes environment variable validation. If required variables are missing, the server will not start:

```javascript
// Add to server.js for validation
function validateEnv() {
  const required = ['OPENAI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

validateEnv();
```

## Troubleshooting

### "OpenAI API key not found"
- Check that `.env` file exists in `backend/` directory
- Verify the key is properly formatted: `OPENAI_API_KEY=sk-proj-...`
- Ensure no extra spaces or quotes around the key
- Restart the backend server after changing `.env`

### "Invalid API key"
- Verify the key is active in your OpenAI account
- Check if the key has been revoked or expired
- Ensure you're using the correct key for your environment

### "Rate limit exceeded"
- You've hit OpenAI's rate limits
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan
- Implement rate limiting in your application

### Environment variables not loading
- Check file name is exactly `.env` (not `.env.txt` or similar)
- Ensure `dotenv` package is installed
- Verify `dotenv.config()` is called at the top of `server.js`
- Check file permissions (should be readable)

## Example .env File

```env
# ===================================
# Backend Environment Configuration
# ===================================

# Server Configuration
PORT=5000
NODE_ENV=development

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Advanced Configuration
# MAX_FILE_SIZE=10485760
# FRONTEND_URL=http://localhost:3000
# LOG_LEVEL=info
```

## Deployment Considerations

When deploying to production:

1. **Use Platform Environment Variables**
   - Heroku: `heroku config:set OPENAI_API_KEY=sk-proj-...`
   - Vercel: Add in Project Settings → Environment Variables
   - AWS: Use Parameter Store or Secrets Manager
   - Docker: Use secrets or environment files

2. **Don't Include .env in Docker Images**
   ```dockerfile
   # .dockerignore
   .env
   .env.*
   ```

3. **Use CI/CD Pipeline Secrets**
   ```yaml
   # GitHub Actions example
   env:
     OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
   ```

## Cost Monitoring

OpenAI API usage incurs costs. Monitor your usage:

```env
# Set up billing alerts in OpenAI dashboard
# Recommended: Set a monthly budget limit
# Track usage via OpenAI API dashboard
```

### Estimated Costs (as of 2024)
- GPT-4 Vision: ~$0.01-0.03 per timetable extraction
- Typical monthly cost for development: $5-20
- Production cost depends on usage volume

---

**Remember**: Keep your environment variables secure and never share them publicly! 🔐

