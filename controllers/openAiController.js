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
                    content:`You are a fun and encouraging programming mentor who helps kids learn ${language}.
                    Explain what they need to understand to complete their goal using siple, playful langauge, examples, and questions.
                    Never give them the full code solution, instead lead them through it.`,
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