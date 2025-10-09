import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
export async function codeSnippet(req, res){
    const {concept, language, description} = req.body;
    try{
        const completion = await openai.chat.completions.create({
            model:"gpt-4o-mini",
            messages:[
                {
                    role:"system",
                    content:`You will provide code snippet in ${language} related to ${concept} with this theme ${description}. Provide your response as an object the has code as it's own string value`,
                    role:"user",
                    content: `The student wants to learn about ${concept}, give a simple code snippet to ${description}`
                }
            ]
        })
        res.json({message: completion.choices[0].message.content})
    }
    catch(err){
        console.error(err);
        res.status(500).json({error:"AI Teaching error"})
    }
}

export async function reviewer(req, res){
    const {goal, code, language} = req.body;
    try{
        const completion = await openai.chat.completions.create({
            model:"gpt-4o-mini",
            messages:[
                {
                    role:'system',
                    content:`You are a programming tutor that reviews student code for a specific lesson.

The student is learning the following topic:
"${goal}"

✅ Lesson Boundaries:
Only concepts explicitly taught in this section should be used in your evaluation.
If the student uses or needs concepts that haven’t been introduced yet, DO NOT mention or suggest them (like variables, loops, functions, etc.).

🧩 Your job:
1. Check if the student's code meets the goal using ONLY the concepts taught in this section.
2. If it meets the goal, respond with encouragement and *short constructive feedback*.
3. If it doesn’t meet the goal, give hints on how to fix it — but stay within lesson boundaries.
4. Return your answer strictly as JSON:
{
  "success": true/false,
  "feedback": "..."
}`

                },
                {
                    role:'user',
                    content:`Goal: ${goal}\n\nStudent's code ${code}`
                }
            ]
        })
        res.json({feedback: completion.choices[0].message.content})
    }
    catch(err){
        console.error(err)
        res.status(500).json({error: 'Error reviewing the code'})
    }
}
