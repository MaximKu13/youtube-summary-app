import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YoutubeTranscript } from 'youtube-transcript';

// Check API Key status
console.log('API Key status:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const transcripts = await YoutubeTranscript.fetchTranscript(videoId);
    return transcripts.map(t => t.text).join(' ');
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw new Error('Failed to fetch video transcript. Please ensure the video has captions enabled.');
  }
}

async function proofreadTranscript(prompt: string, transcript: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: transcript }
      ],
      temperature: 0.2
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('OpenAI response is missing content during transcript proofreading.');
    }

    return content.trim();
  } catch (error) {
    console.error('Error proofreading transcript:', error);
    throw new Error('Failed to proofread transcript.');
  }
}

async function getSummaryForLongText(prompt: string, sourceData: string, verbose = true): Promise<string | null> {
  const step = 150000;
  let final: string | null = null;
  let result = '';
  let counter = 1;
  let i = 0;

  if (sourceData.length > 10) {
    if (verbose) {
      console.log('Source data length:', sourceData.length);
    }

    while (i < sourceData.length) {
      try {
        if (verbose) {
          console.log(`GPT request number: ${counter}`);
        }

        const textChunk = sourceData.slice(i, i + step);
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: textChunk }
          ],
          temperature: 0
        });

        const content = completion?.choices?.[0]?.message?.content;
        if (!content) {
          throw new Error('OpenAI response is missing content during summarization.');
        }

        result += content + '\n';
        i += step;
        counter += 1;

        // Add a delay to avoid hitting API limits
        await delay(2000);
      } catch (error) {
        console.error('Error during OpenAI request:', error);
        throw new Error('OpenAI API error while processing text. Please try again later.');
      }
    }

    if (counter > 2) {
      if (verbose) {
        console.log('Forming final structured summary');
      }
      try {
        const finalCompletion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Combine and format the following text into a structured summary:\n\n${result}` }
          ],
          temperature: 0
        });

        const finalContent = finalCompletion?.choices?.[0]?.message?.content;
        if (!finalContent) {
          throw new Error('OpenAI response is missing content during final summarization.');
        }

        final = finalContent;
      } catch (error) {
        console.error('Error during final OpenAI request:', error);
        throw new Error('OpenAI API error while generating final summary.');
      }
    } else {
      final = result;
    }
  }

  return final;
}

export async function POST(request: Request) {
  try {
    console.log('🟢 Summarize API called');
    
    const { videoId } = await request.json();
    if (!videoId) {
      console.log('❌ No videoId provided');
      throw new Error('Video ID is required');
    }
    console.log('📼 Processing video ID:', videoId);

    // Fetch transcript
    console.log('📝 Fetching transcript...');
    const rawTranscript = await fetchTranscript(videoId);
    console.log('✅ Transcript fetched, length:', rawTranscript.length, 'characters');

    // Proofread and structure the transcript
    console.log('✍️ Proofreading transcript...');
    const proofreadingPrompt = `You are a professional editor. Proofread and restructure the provided transcript. 
    Ensure it has correct grammar, proper sentence structure, and logical flow. Format it into well-written paragraphs.`;
    const polishedTranscript = await proofreadTranscript(proofreadingPrompt, rawTranscript);
    console.log('✅ Transcript proofread successfully');

    // Generate summary
    console.log('🤖 Generating summary...');
    const summaryPrompt = `You are a helpful assistant that creates structured summaries of video transcripts. 
    Format the summary as follows:
    1. Start with a 2-3 sentence paragraph summarizing the video content.
    2. Follow this with a bulleted list of key takeaways and insights. 
    Ensure clarity and conciseness, and always use English.`;
    
    const summary = await getSummaryForLongText(summaryPrompt, polishedTranscript);
    if (!summary) {
      throw new Error('Failed to generate summary');
    }
    console.log('✅ Summary generated successfully');

    return NextResponse.json({ 
      summary,
      transcript: polishedTranscript
    });

  } catch (error: any) {
    console.error('❌ Error in summarize route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate summary' },
      { status: 500 }
    );
  }
}