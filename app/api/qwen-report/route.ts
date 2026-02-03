import { NextRequest, NextResponse } from 'next/server'
import type { NineDimensionsResult } from '@/types/analysis'

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_BASE_URL = 'https://api.deepseek.com'

interface QwenReportRequest {
  dimensions: NineDimensionsResult
  overallScore: number
  cameraAngle: string
}

export async function POST(request: NextRequest) {
  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: 'AI API key not configured' },
      { status: 500 }
    )
  }

  try {
    const body: QwenReportRequest = await request.json()
    const { dimensions, overallScore, cameraAngle } = body

    const systemPrompt = `你是专业的篮球投篮动作分析师。你的任务是根据用户的投篮动作分析数据，生成个性化、易于理解的AI分析报告。

请生成包含以下内容的报告：
1. 总体评价 - 基于综合得分的整体评价
2. 问题识别 - 指出需要改进的方面
3. 改进建议 - 给出具体、可操作的建议
4. 训练计划 - 根据用户情况推荐训练项目

请使用中文回复，语言要专业但易懂。回复格式为JSON对象，包含以下字段：
- summary: 总体评价（字符串）
- problems: 需要改进的地方（字符串数组，最多5条）
- recommendations: 改进建议（字符串数组，最多8条）
- training_plan: 训练计划（对象，包含title、description、exercises数组和duration_weeks）

训练计划格式：
{
  "title": "X周投篮改进计划",
  "description": "描述...",
  "exercises": [
    {
      "name": "练习名称",
      "description": "练习描述和要点",
      "sets": 组数,
      "reps": 次数,
      "duration": 时长（如"5分钟"）
    }
  ],
  "duration_weeks": 训练周期周数
}

最后一定要加上免责声明。`

    const userPrompt = `请分析以下投篮数据并生成报告：

**综合得分**: ${overallScore}/100
**拍摄视角**: ${cameraAngle}

**各维度得分**:
- 一致性: ${dimensions.consistency.score}/100
- 关节角度: ${dimensions.joint_angles.score}/100
- 对称性: ${dimensions.symmetry.score}/100
- 投篮风格: ${dimensions.shooting_style.score}/100 (${dimensions.shooting_style.style})
- 时序分析: ${dimensions.timing.score}/100
- 稳定性: ${dimensions.stability.score}/100
- 协调性: ${dimensions.coordination.score}/100
- 动力链: ${dimensions.kinetic_chain.score}/100

请生成专业的分析报告。`

    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', response.status, errorText)
      return NextResponse.json(
        { error: `AI API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No content in AI response' },
        { status: 500 }
      )
    }

    let report
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        report = JSON.parse(jsonMatch[0])
      } else {
        report = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    if (!report.disclaimer) {
      report.disclaimer = '本分析基于AI视觉识别技术，存在±15-25°的误差范围。建议结合专业教练指导进行训练。'
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AI Report API (DeepSeek)',
    status: 'ready',
    endpoints: {
      POST: 'Generate AI analysis report',
    },
    model: 'deepseek-chat',
  })
}
