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
                        content: `You are a professional Kenyan real estate marketing expert. You write ads in a ${selectedTone} tone. Use emojis and prioritize local selling points like security and water.`
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
