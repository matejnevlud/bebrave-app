import {NextRequest, NextResponse} from 'next/server';
import {sendMonthlyInvoiceSummaryEmail} from '@/db/actions';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {targetMonth, recipientEmail} = body;
        
        // Parse target month if provided
        let summaryMonth: Date | undefined;
        if (targetMonth) {
            summaryMonth = new Date(targetMonth);
            if (isNaN(summaryMonth.getTime())) {
                return NextResponse.json(
                    {error: 'Invalid target month format'},
                    {status: 400}
                );
            }
        }
        
        // Send the monthly summary email
        const success = await sendMonthlyInvoiceSummaryEmail(summaryMonth, recipientEmail);
        
        if (success) {
            return NextResponse.json({
                message: 'Monthly invoice summary email sent successfully',
                sentAt: new Date().toISOString(),
            });
        } else {
            return NextResponse.json(
                {error: 'Failed to send monthly invoice summary email'},
                {status: 500}
            );
        }
    } catch (error) {
        console.error('Error in monthly invoice summary API:', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}

// GET endpoint to generate summary data without sending email (for testing)
export async function GET(request: NextRequest) {
    try {
        const {searchParams} = new URL(request.url);
        const targetMonthParam = searchParams.get('targetMonth');
        
        // Parse target month if provided
        let summaryMonth: Date | undefined;
        if (targetMonthParam) {
            summaryMonth = new Date(targetMonthParam);
            if (isNaN(summaryMonth.getTime())) {
                return NextResponse.json(
                    {error: 'Invalid target month format. Use YYYY-MM-DD format.'},
                    {status: 400}
                );
            }
        }
        
        // Import generateMonthlyInvoiceSummary for GET endpoint
        const {generateMonthlyInvoiceSummary} = await import('@/db/actions');
        const summaryData = await generateMonthlyInvoiceSummary(summaryMonth);
        
        if (summaryData) {
            return NextResponse.json({
                message: 'Monthly invoice summary generated successfully',
                data: summaryData,
                generatedAt: new Date().toISOString(),
            });
        } else {
            return NextResponse.json(
                {error: 'Failed to generate monthly invoice summary'},
                {status: 500}
            );
        }
    } catch (error) {
        console.error('Error in monthly invoice summary GET API:', error);
        return NextResponse.json(
            {error: 'Internal server error'},
            {status: 500}
        );
    }
}