export default async function handler(req, res) {
    const { selectedTone, input, location, price, amenities, phone } = req.body;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                   {
                        role: "system", 
                        content: `You are a professional Kenyan real estate marketing expert. 
                        Write high-converting ads optimized for WhatsApp.
    
                         FORMATTING RULES:
                        1. Use ALL CAPS and *asterisks* for headings (e.g., *MAIN FEATURES*).
                        2. Use bullet points (-) for amenities.
                        3. Use bolding (*text*) for the price and contact info.
                        4. Do NOT use Markdown hashtags (###) or long symbol lines (=======).
                        5. Use relevant emojis (🏠, 💧, 🛡️) and highlight local selling points like security and water.
                        6. Ensure the tone is ${selectedTone}.`
                   },
                    {
                        role: "user",
                        content: `Write a high-converting real estate ad with these details:
                        - Details: ${input}
                        - Location: ${location}
                        - Price: ${price}
                        - Key Amenities: ${amenities}
                        - Contact Info: ${phone}
                        Format with clear headings, bullet points for amenities, and a strong Call to Action. Ensure the price is prominent.`
                    }
                ]
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to connect to AI" });
    }
}
