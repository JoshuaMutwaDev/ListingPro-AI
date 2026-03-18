export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

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
                        3. Use bolding (*text*) for the price and contact info using WhatsApp syntax (stars).
                        4. Do NOT use Markdown hashtags (###) or long symbol lines.
                        5. Use relevant emojis (🏠, 💧, 🛡️) and highlight local Nairobi selling points like 24/7 security and water reliability.
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
                        Format with clear headings, bullet points, and a strong Call to Action. Ensure the price and phone number are prominent.`
                    }
                ],
                temperature: 0.7 // Added for a balance of professional and creative
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({ error: "AI service error" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to connect to AI" });
    }
}
