#!/usr/bin/env node

/**
 * Monthly Invoice Summary Cron Job
 * 
 * This script generates and sends a monthly invoice summary email.
 * Designed to run as a cron job on Railway.com
 * 
 * Usage: npm run cron:monthly-invoice-summary
 */

const { execSync } = require('child_process');
const path = require('path');

// Set NODE_ENV to production for proper database connections
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log('🚀 Starting Monthly Invoice Summary Cron Job');
console.log(`📅 Execution time: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

async function runMonthlySummary() {
    try {
        console.log('🔄 Importing required modules...');
        
        // Import and run the monthly summary function
        // Try different import paths for TypeScript compilation
        let sendMonthlyInvoiceSummaryEmail;
        try {
            const module = await import('../db/actions.js');
            sendMonthlyInvoiceSummaryEmail = module.sendMonthlyInvoiceSummaryEmail;
        } catch (importError) {
            // Fallback for development or different build configurations
            const module = await import('../db/actions.ts');
            sendMonthlyInvoiceSummaryEmail = module.sendMonthlyInvoiceSummaryEmail;
        }
        
        // Calculate previous month
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        console.log(`📊 Generating summary for: ${lastMonth.toISOString().slice(0, 7)}`);
        console.log(`📅 Target month: ${lastMonth.toLocaleDateString('cs-CZ', { year: 'numeric', month: 'long' })}`);
        
        // Send the email
        const success = await sendMonthlyInvoiceSummaryEmail(lastMonth);
        
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
        console.error('Stack trace:', error.stack);
        
        // Log additional context for debugging
        console.error('📍 Current working directory:', process.cwd());
        console.error('🌍 Node version:', process.version);
        console.error('⚙️ Environment variables available:', Object.keys(process.env).filter(key => 
            key.includes('DATABASE') || key.includes('NODE_ENV') || key.includes('PORT')
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