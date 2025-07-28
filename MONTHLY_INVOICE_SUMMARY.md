# Monthly Invoice Summary Email System

This system automatically generates and sends a comprehensive monthly invoice summary email on the 1st day of each month using Railway.com cron service.

## Features

### Email Template (`/db/monthly_invoice_summary_email.ts`)
- Professional Czech language email template
- Detailed breakdown of invoice data with VAT calculations
- Responsive HTML design matching BeBrave Studio branding
- Multiple data sections:
  - Overall monthly summary (total invoices, amounts, VAT)
  - Breakdown by class type
  - Breakdown by payment method
  - VAT breakdown by rate
  - Month-over-month comparison with colored indicators

### Server Actions (`/db/actions.ts`)
- `generateMonthlyInvoiceSummary(targetMonth?, recipientEmail?)` - Generates summary data
- `sendMonthlyInvoiceSummaryEmail(targetMonth?, recipientEmail?)` - Sends formatted email
- Handles currency formatting in Czech crowns (Kč)
- Calculates percentage changes and trends
- Groups and aggregates invoice data by multiple dimensions

### Railway Cron Service

#### Standalone Script (`/scripts/monthly-invoice-summary.ts`)
- TypeScript script using tsx that runs independently as a cron job
- Makes HTTPS requests to bebravestudio.cz API for email generation
- Automatically calculates and sends summary for previous month
- Handles errors and logging for Railway environment
- Runs via npm command: `npm run cron:monthly-invoice-summary`

#### Manual Cron Setup
- The script can be run manually or scheduled externally
- Command: `npm run cron:monthly-invoice-summary`
- Targets: `https://bebravestudio.cz/api/monthly-invoice-summary`

### API Routes (Optional - for manual testing)

#### `/api/monthly-invoice-summary`
- **POST**: Send monthly summary email with custom parameters
- **GET**: Generate summary data without sending email (testing)

## Manual Execution

### 1. Local Testing

Run the cron script manually:
```bash
npm run cron:monthly-invoice-summary
```

### 2. API Testing (Optional)

You can also test the API endpoints directly:

```bash
# Test data generation without sending
GET https://bebravestudio.cz/api/monthly-invoice-summary?targetMonth=2024-01-01

# Send test email
POST https://bebravestudio.cz/api/monthly-invoice-summary
Content-Type: application/json
{
  "targetMonth": "2024-01-01",
  "recipientEmail": "test@example.com"  
}
```

### 3. External Scheduling

Since the railway.toml configuration is removed, you can schedule the script using external services:

#### Option A: GitHub Actions
Create `.github/workflows/monthly-invoice-summary.yml`:

```yaml
name: Monthly Invoice Summary
on:
  schedule:
    - cron: '0 9 1 * *'  # 9:00 AM on 1st day of each month
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-summary:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install
      - run: npm run cron:monthly-invoice-summary
```

#### Option B: External Cron Services
Use services like cron-job.org, EasyCron, or similar to call:
```bash
npm run cron:monthly-invoice-summary
```

#### Option C: Manual Execution
Run the command manually on the 1st of each month:
```bash
npm run cron:monthly-invoice-summary
```


## Email Content Details

### Data Included
- **Total Overview**: Invoice count, amounts with/without VAT
- **Class Type Breakdown**: Revenue per fitness class type
- **Payment Method Analysis**: Card payments, on-site, QR payments, etc.
- **VAT Summary**: Breakdown by VAT rates (0%, 21%, etc.)
- **Trend Analysis**: Month-over-month comparison with percentage changes

### Formatting
- Currency amounts in Czech crowns with proper formatting
- Color-coded trend indicators (green for positive, red for negative)
- Professional table layout with proper spacing
- Czech language throughout

### Recipients
- Default: `bgaluskova@intaste.cz`
- Customizable via API parameters
- Sent from: `BeBrave Studio <info@bebravestudio.cz>`

### 3. Environment Variables

Ensure these environment variables are set in your Railway project:

```bash
# Database connection (automatically provided by Railway if using Railway PostgreSQL)
DATABASE_URL=postgresql://...

# Email service (Resend API key is already in the code)
# No additional email env vars needed

# TypeScript execution environment
NODE_ENV=production
```

### 4. Deployment Steps

1. **Push to Railway**: Deploy your project to Railway.com
2. **Verify Services**: Check that both `web` and `monthly-invoice-summary-cron` services are created
3. **Test Manually**: Run `npm run cron:monthly-invoice-summary` locally first
4. **Monitor Logs**: Check Railway logs for successful cron execution

## Security Considerations

1. **Railway Security**: Cron jobs run in Railway's secure environment
2. **Data Privacy**: Email contains financial data - Railway provides secure transmission
3. **Database Access**: Uses existing database connection with proper authentication

## Monitoring & Logging

- **Railway Logs**: All console output visible in Railway dashboard
- **Cron Status**: Railway shows success/failure status of cron jobs
- **Email Tracking**: Resend service provides delivery confirmation
- **Error Handling**: Script exits with proper error codes for Railway monitoring

## Troubleshooting

### Common Issues
1. **Cron Not Running**: Check Railway service status and cron schedule
2. **Missing Invoices**: Verify database connection and data availability
3. **Email Delivery**: Check Resend API key and sender domain configuration
4. **Script Errors**: Review Railway logs for detailed error information

### Debug Methods
- **Local Testing**: `npm run cron:monthly-invoice-summary`
- **Railway Logs**: Check service logs in Railway dashboard
- **Manual API**: Use `/api/monthly-invoice-summary` endpoint for testing
- **Database Check**: Verify invoice data exists in target month

## Example Email Output

The system generates a comprehensive email with:
- Professional header with BeBrave Studio branding
- Executive summary with key metrics
- Detailed breakdowns in tabular format
- Visual indicators for trends and changes
- Footer with generation timestamp and branding

Sample metrics might show:
- 45 invoices totaling 67,500 Kč (including 21% VAT)
- Top class type: "HIIT Training" with 15 sessions
- Primary payment method: Credit card (60% of revenue)
- Month-over-month growth: +15.3%