#!/usr/bin/env npx tsx

/**
 * Monthly Invoice Summary Cron Job
 * 
 * This script generates and sends a monthly invoice summary email.
 * Designed to run as a cron job on Railway.com
 * 
 * Usage: npm run cron:monthly-invoice-summary
 */

import https from 'https';

// Set NODE_ENV to production for proper database connection

console.log('🚀 Starting Monthly Invoice Summary Cron Job');
console.log(`📅 Execution time: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

async function runMonthlySummary() {
    try {
        console.log('🔄 Making external API call to bebravestudio.cz...');
        
        // Calculate previous month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const targetMonth = lastMonth.toISOString().slice(0, 10); // YYYY-MM-DD format
        
        console.log(`📊 Generating summary for: ${lastMonth.toISOString().slice(0, 7)}`);
        console.log(`📅 Target month: ${lastMonth.toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long' })}`);
        
        const baseUrl = 'https://bebravestudio.cz';
        console.log(`🌐 Making request to: ${baseUrl}/api/monthly-invoice-summary`);
        
        // Make POST request to the API endpoint
        const postData = JSON.stringify({
            targetMonth: targetMonth,
            recipientEmail: process.env.MONTHLY_SUM_EMAIL || 'nevlud3@gmail.com'
        });
        
        const options = {
            hostname: 'bebravestudio.cz',
            port: 443,
            path: '/api/monthly-invoice-summary',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'BeBrave-Cron/1.0'
            }
        };
        
        const success = await new Promise<boolean>((resolve) => {
            const req = https.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        console.log(`📡 API Response Status: ${res.statusCode}`);
                        console.log(`📡 API Response: ${data}`);
                        
                        if (res.statusCode === 200) {
                            const response = JSON.parse(data);
                            console.log(`📧 Email sent successfully: ${response.message}`);
                            resolve(true);
                        } else {
                            console.error(`❌ API returned status ${res.statusCode}: ${data}`);
                            resolve(false);
                        }
                    } catch (parseError) {
                        console.error('❌ Error parsing API response:', parseError);
                        resolve(false);
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('❌ HTTPS request error:', error);
                resolve(false);
            });
            
            req.setTimeout(30000, () => {
                console.error('❌ Request timeout after 30 seconds');
                req.destroy();
                resolve(false);
            });
            
            req.write(postData);
            req.end();
        });
        
        if (success) {
            console.log('✅ Monthly invoice summary email sent successfully!');
            console.log(`📧 Sent at: ${new Date().toISOString()}`);
            console.log(`🎯 Recipient: bgaluskova@intaste.cz (default)`);
            process.exit(0);
        } else {
            console.error('❌ Failed to send monthly invoice summary email');
            console.error('🔍 Check Railway logs for detailed error information');
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 Error in monthly summary cron job:', error);
        console.error('Stack trace:', (error as Error).stack);
        
        // Log additional context for debugging
        console.error('📍 Current working directory:', process.cwd());
        console.error('🌍 Node version:', process.version);
        console.error('⚙️ Environment variables available:', Object.keys(process.env).filter(key => 
            key.includes('DATABASE') || key.includes('NODE_ENV') || key.includes('PORT') || key.includes('RAILWAY')
        ));
        
        process.exit(1);
    }
}

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the script
runMonthlySummary();