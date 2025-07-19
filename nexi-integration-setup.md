# Nexi XPay Integration Setup Guide

## Test Connection Results

❌ **API Connection Status**: 401 Unauthorized
❌ **Payment Session Creation**: 401 Unauthorized

## Test Environment Configuration

### API Details

- **Base URL**: `https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1`
- **Test API Key (Explicit)**: `c25f1119-07af-4ad0-b978-b297f62a4320`
- **Test API Key (Implicit)**: `bcf67740-9013-4dd9-bbfb-02debdf7206f`
- **Header Format**: `X-API-KEY`

### Test Results

- ✅ API endpoint responds (not 404/500)
- ✅ Headers configured correctly
- ✅ Request structure valid
- ❌ Authentication failing with 401

## Required Setup Steps

### 1. Account Setup

The 401 errors suggest you may need to:

1. **Register for Nexi XPay CEE** developer account
2. **Activate test environment** access
3. **Generate personal test API keys** (the public ones might be expired)

### 2. Environment Variables Setup

Add these to your `.env` file once you have working credentials:

```env
# Nexi XPay Configuration
NEXI_API_KEY=your_working_api_key_here
NEXI_API_URL=https://xpay.nexigroup.com/api/phoenix-0.0/psp/api/v1
NEXI_ENVIRONMENT=test
```

### 3. Integration Points Identified

Based on the codebase analysis, the integration will touch:

1. **Database Schema** (`lib/db/schema.ts`)
    - Add payment status fields to reservations table

2. **Server Actions** (`lib/actions/reservation.ts`)
    - Modify `createReservation()` for payment flow

3. **Payment Components** (`components/blocks/PaymentMethodRadio.tsx`)
    - Enable credit card payment option

4. **Email Templates** (`emails/`)
    - Update with payment confirmation details

5. **Admin Interface** (`app/(administration)/admin/`)
    - Add payment status tracking

## Current Payment Flow

The existing system supports:

- ✅ On-site payments (cash/card at studio)
- ✅ QR code bank transfers
- ❌ Credit card payments (disabled, showing "Coming soon")

## Target Integration Flow

1. User selects credit card payment
2. System creates Nexi payment session
3. User redirected to hosted payment page
4. Payment processed on Nexi's secure form
5. User redirected back with payment result
6. Reservation confirmed/cancelled based on result
7. Email confirmation sent

## Next Steps

1. **Contact Nexi Support** to get working test credentials
2. **Register for developer account** if needed
3. **Update test script** with working API key
4. **Test payment session creation**
5. **Implement integration** once API works

## Implementation Plan

### Phase 1: Database Updates

```sql
ALTER TABLE reservations ADD COLUMN:
- payment_status (enum: 'pending', 'completed', 'failed', 'cancelled')
- payment_method (enum: 'on_site', 'qr_payment', 'credit_card')
- payment_transaction_id (string)
- payment_amount (decimal)
- payment_currency (string, default: 'CZK')
```

### Phase 2: API Service

```typescript
// lib/services/nexi.ts
export class NexiService {
    async createPaymentSession(reservationData: ReservationData) {
        // POST /orders/hpp
        // Return hosted page URL and security token
    }
}
```

### Phase 3: Payment Flow

- Update reservation form to handle credit card payments
- Add payment processing step
- Handle success/failure callbacks
- Update email templates

## Security Considerations

- API keys in environment variables only
- Server-side payment verification
- Webhook signature validation
- Proper error handling and logging

## Testing Strategy

1. **API Connectivity** - Verify endpoint access
2. **Payment Sessions** - Test session creation
3. **Hosted Page Flow** - Test redirect workflow
4. **Result Handling** - Test callbacks
5. **Error Scenarios** - Test failure handling