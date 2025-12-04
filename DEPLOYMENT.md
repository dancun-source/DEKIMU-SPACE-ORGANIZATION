# DEKIMU SPACE PROGRAM - Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables
Copy `.env.example` to `.env` and fill in all required values:
- `MONGO_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random string (use: `openssl rand -base64 32`)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Set to `production`
- `FRONTEND_URL` - Your domain URL for CORS
- M-Pesa credentials (if using payment features)

### 2. Database Setup
- Ensure MongoDB is running and accessible
- Run `node make_admin.js` to create admin account
- Test admin login: `admin@dekimu.org` / `Dekimu@2025`

### 3. File Uploads
- Ensure `uploads/` directory exists (will be auto-created)
- Set proper permissions: `chmod 755 uploads/`

### 4. Dependencies
```bash
npm install --production
```

### 5. Test Locally
```bash
npm start
```
Visit `http://localhost:5000` and test:
- ✅ User signup/login
- ✅ Admin login and Mission Control access
- ✅ Course creation/editing
- ✅ File uploads (photos, PDFs)
- ✅ Payment flow (if enabled)

## Deployment Options

### Option 1: VPS/Server (Ubuntu/Debian)

1. **Install Node.js & MongoDB**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb
```

2. **Clone & Setup**
```bash
git clone <your-repo>
cd DKM
npm install --production
cp .env.example .env
# Edit .env with your values
```

3. **Use PM2 (Process Manager)**
```bash
npm install -g pm2
pm2 start server.js --name dekimu
pm2 save
pm2 startup
```

4. **Setup Nginx Reverse Proxy**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Heroku

1. **Install Heroku CLI**
2. **Create app**: `heroku create dekimu-space`
3. **Set environment variables**:
```bash
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production
```
4. **Deploy**: `git push heroku main`

### Option 3: Railway/Render

1. Connect your GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on push

## Post-Deployment

1. **Verify admin access**: Login to `admin.html`
2. **Test file uploads**: Upload a test image
3. **Monitor logs**: `pm2 logs dekimu` (if using PM2)
4. **Setup SSL**: Use Let's Encrypt for HTTPS
5. **Backup database**: Setup regular MongoDB backups

## Security Notes

- ✅ Never commit `.env` file
- ✅ Use strong JWT_SECRET in production
- ✅ Enable HTTPS/SSL
- ✅ Set proper CORS origins
- ✅ Regular database backups
- ✅ Keep dependencies updated

## Support

For issues, check:
- Server logs: `pm2 logs` or `npm start`
- Browser console (F12)
- Database connection status
