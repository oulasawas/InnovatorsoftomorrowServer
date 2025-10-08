import OpenAI from "openai";

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
export async function teach(req, res){
    const {goal, langauge} = req.body;
    try{
        const completion = await openai.chat.completions.create({
            model:"gpt-4o-mini",
            messages:[
                {
                    role:"system",
                    content:`You are an automated programming tutor. 
Your job is to check if the student code solves the goal correctly.
Return your answer strictly in JSON format with two fields:
- success: true or false
- feedback: a short message explaining what is correct or missing
`,
                    role:"user",
                    content: `The student wants to achieve this goal: ${goal}. Explain what concepts they should learn.`
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
                    content:`You are a friendly programming coach reviewing a student's ${language} code.
                    Give feedback, point out logic errors, and offer hints to improve it - but never write the full code or give them the solution!`

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
