import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type, context } = await request.json();
    
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' }, 
        { status: 500 }
      );
    }

    let prompt = '';
    
    switch (type) {
      case 'metric':
        prompt = `Generate a realistic business metric for a dashboard. Return ONLY a JSON object with this exact structure:
{
  "name": "metric name (max 20 chars)",
  "value": "value with unit (max 20 chars, e.g., 85%, 1.2s, 42)",
  "change": "change with +/- (max 20 chars, e.g., +3%, -0.1s)",
  "trend": "up, down, or neutral"
}

Keep ALL fields under 20 characters. Focus on short metric names like "CTR", "CAC", "MRR", "DAU".`;
        break;
        
      case 'priority':
        prompt = `Generate a realistic business task/priority for a dashboard. Return ONLY a JSON object with this exact structure:
{
  "task": "task description (max 30 chars)",
  "deadline": "deadline (max 30 chars, e.g., Today, Dec 15)",
  "status": "pending, in-progress, or completed"
}

Keep ALL fields under 30 characters. Use concise task names like "Fix critical login bug", "Update payment API", "Review Q4 metrics".`;
        break;
        
      case 'recommendation':
        prompt = `Generate a realistic AI business recommendation for a dashboard. Return ONLY a JSON object with this exact structure:
{
  "text": "recommendation text (max 30 chars)",
  "urgency": "high, medium, or low",
  "impact": "high, medium, or low"
}

Keep text field under 30 characters. Use concise recommendations like "Optimize database queries", "Add A/B testing framework", "Fix mobile UI responsiveness".`;
        break;
        
      case 'chart_labels':
        const { metric, numericValue, chartType } = context;
        prompt = `Generate contextually appropriate chart labels for a ${chartType} chart showing ${metric} data with ${numericValue} values. Return ONLY a JSON array of objects with this exact structure:
[
  {"id": "label-1", "label": "Descriptive Label 1", "value": 100},
  {"id": "label-2", "label": "Descriptive Label 2", "value": 85},
  {"id": "label-3", "label": "Descriptive Label 3", "value": 72}
]

Generate ${chartType === 'pie' ? '5' : '7'} realistic labels that make sense for ${metric}. Each label should be descriptive and specific to the metric type. Values should be realistic numbers for ${numericValue} of ${metric}.`;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid generation type' }, 
          { status: 400 }
        );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a business analytics AI that generates realistic dashboard content. Always respond with valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content.trim();
    
    try {
      const parsedContent = JSON.parse(generatedContent);
      return NextResponse.json({ data: parsedContent });
    } catch {
      console.error('Failed to parse AI response:', generatedContent);
      return NextResponse.json(
        { error: 'Invalid AI response format' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI content' }, 
      { status: 500 }
    );
  }
} 