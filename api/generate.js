export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Capture the new fields: propertyType and userInput
    const { propertyType, selectedTone, userInput, location, price, amenities, phone } = req.body;

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
                        content: `You are an expert Kenyan real estate marketer specializing in the Nairobi market (Kilimani, Westlands, Kamakis, etc.).
                        Your goal is to write high-converting WhatsApp ads.

                        CORE RULES:
                        1. PROPERTY CONTEXT: If property is a "Plot", focus on Title Deeds, Beacons, and Investment potential. If "Apartment", focus on lifestyle/amenities. If "Standalone", focus on privacy/compound.
                        2. FORMATTING: Use *asterisks* for bolding (WhatsApp style). Use ALL CAPS for catchy headers.
                        3. STRUCTURE: Use a hook, then a list of features, then a clear Price and Call to Action.
                        4. NO HASHTAGS: Do not use # symbols. Use emojis instead (🏘️, 💎, 🛡️, 📞).
                        5. TONE GUIDES:
                           - If Tone is 'Friendly/Sheng', use a mix of English and Sheng like "Hii ni deal poa sana" or "Usiwachwe nyuma".
                           - If Tone is 'Investment', talk about ROI, rental yields, and land value appreciation.
                           - If Tone is 'Hype', use urgent language like "LAST UNIT REMAINING" or "BOOK NOW".`
                   },
                    {
                        role: "user",
                        content: `Create a professional WhatsApp ad for a ${propertyType} in ${location}.
                        - Tone: ${selectedTone}
                        - Price: ${price}
                        - Key Amenities: ${amenities}
                        - Additional Unique Selling Points: ${userInput}
                        - Contact: ${phone}

                        Ensure the ad feels local to Nairobi. If a price is provided, make it bold. If a phone number is provided, place it at the end with a 'Call/WhatsApp' prompt.`
                    }
                ],
                temperature: 0.7 
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
