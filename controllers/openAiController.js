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
                    content:`You will provide an easy code snippet to explain a programming concept in ${concept} using ${language}.
                    The example should ${description}`,
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