/**
 * Email Scanning API - Gmail Integration
 * POST /api/v1/email/scan - Scan emails for bills and statements
 */

import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { requireAuth, withErrorHandler, successResponse } from '@/lib/api/supabase-route-helpers'

async function getGoogleClient(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/integrations/google/callback`
  )
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  })
  
  return oauth2Client
}

// Keywords to identify financial emails
const FINANCIAL_KEYWORDS = {
  bills: ['bill', 'invoice', 'payment due', 'amount due', 'statement'],
  banks: ['bank statement', 'account statement', 'checking account', 'savings account'],
  cards: ['credit card', 'card statement', 'minimum payment', 'payment due'],
  utilities: ['electric bill', 'gas bill', 'water bill', 'utility bill', 'internet bill'],
  insurance: ['insurance', 'premium', 'policy', 'coverage'],
  investments: ['investment', 'portfolio', 'brokerage', 'dividend', '401k', 'ira']
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  const supabase = await createClient()
  
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const daysBack = parseInt(searchParams.get('days') || '30')
  
  // Get Google integration
  const { data: integration } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', user.id)
    .eq('provider', 'google')
    .eq('is_active', true)
    .single()
  
  if (!integration) {
    return NextResponse.json({ error: 'Google account not connected' }, { status: 404 })
  }
  
  try {
    // Initialize Gmail API
    const auth = await getGoogleClient(integration.refresh_token)
    const gmail = google.gmail({ version: 'v1', auth })
    
    // Build search query
    const after = new Date()
    after.setDate(after.getDate() - daysBack)
    const query = `after:${Math.floor(after.getTime() / 1000)} has:attachment (${Object.values(FINANCIAL_KEYWORDS).flat().join(' OR ')})`
    
    // Search for emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 50
    })
    
    const messages = response.data.messages || []
    const processedEmails = []
    
    // Process each message
    for (const message of messages) {
      try {
        // Get full message
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!
        })
        
        const headers = fullMessage.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || ''
        const from = headers.find(h => h.name === 'From')?.value || ''
        const date = headers.find(h => h.name === 'Date')?.value || ''
        
        // Check for attachments
        const attachments = []
        const parts = fullMessage.data.payload?.parts || []
        
        for (const part of parts) {
          if (part.filename && part.body?.attachmentId) {
            // Check if it's a PDF or image
            if (part.mimeType?.includes('pdf') || part.mimeType?.includes('image')) {
              attachments.push({
                filename: part.filename,
                mimeType: part.mimeType,
                size: part.body.size,
                attachmentId: part.body.attachmentId
              })
            }
          }
        }
        
        if (attachments.length > 0) {
          // Categorize email
          let category = 'OTHER'
          const lowerSubject = subject.toLowerCase()
          const lowerFrom = from.toLowerCase()
          
          if (FINANCIAL_KEYWORDS.bills.some(k => lowerSubject.includes(k))) {
            category = 'BILL'
          } else if (FINANCIAL_KEYWORDS.banks.some(k => lowerSubject.includes(k))) {
            category = 'BANK_STATEMENT'
          } else if (FINANCIAL_KEYWORDS.cards.some(k => lowerSubject.includes(k))) {
            category = 'CREDIT_CARD_STATEMENT'
          } else if (FINANCIAL_KEYWORDS.investments.some(k => lowerSubject.includes(k))) {
            category = 'INVESTMENT_STATEMENT'
          }
          
          // Store email record
          const { data: emailRecord } = await supabase
            .from('email_documents')
            .insert({
              user_id: user.id,
              gmail_message_id: message.id,
              subject,
              sender: from,
              received_date: new Date(date),
              category,
              attachments,
              processed: false,
              metadata: {
                threadId: message.threadId,
                labels: fullMessage.data.labelIds
              }
            })
            .select()
            .single()
          
          processedEmails.push(emailRecord)
        }
      } catch (error) {
        console.error('Error processing message:', message.id, error)
      }
    }
    
    // Update scan status
    await supabase
      .from('integrations')
      .update({
        last_email_scan: new Date(),
        metadata: {
          ...integration.metadata,
          lastEmailScanCount: processedEmails.length
        }
      })
      .eq('id', integration.id)
    
    return successResponse({
      scannedMessages: messages.length,
      financialDocuments: processedEmails.length,
      documents: processedEmails
    }, 'Email scan completed successfully')
    
  } catch (error: any) {
    console.error('Email scan error:', error)
    throw error
  }
})