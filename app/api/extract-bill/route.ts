import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mediaType } = await request.json()

    if (!imageBase64 || !mediaType) {
      return NextResponse.json(
        { error: 'Image data and media type are required' },
        { status: 400 }
      )
    }

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this bill/invoice image and extract all payment-relevant information. 
              
Return ONLY a JSON object (no markdown, no backticks) with these exact fields:
{
  "billerName": "name of the company/utility sending the bill",
  "accountNumber": "customer account number",
  "amountDue": "total amount due with currency symbol",
  "dueDate": "payment due date in readable format",
  "paymentUrl": "any payment website URL found on the bill, or empty string if none",
  "pinOrPasscode": "any PIN, passcode, or access code needed for online payment, or empty string if none",
  "additionalNotes": "any other important payment notes (autopay, late fees, etc.)",
  "confidence": "high if all major fields found clearly, medium if some fields unclear, low if bill is hard to read"
}

If a field is not found, use an empty string. Be precise with account numbers and amounts.`,
            },
          ],
        },
      ],
    })

    const textContent = response.content.find(c => c.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    let extracted
    try {
      const cleaned = textContent.text.replace(/```json|```/g, '').trim()
      extracted = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'Could not parse bill data', raw: textContent.text },
        { status: 422 }
      )
    }

    return NextResponse.json({ success: true, data: extracted })
  } catch (error: unknown) {
    console.error('Bill extraction error:', error)
    const message = error instanceof Error ? error.message : 'Failed to extract bill'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
