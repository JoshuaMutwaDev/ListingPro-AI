async function generateAd() {
    // 1. Capture all input values
    const input = document.getElementById('userInput').value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('location').value;
    const phone = document.getElementById('phone').value;
    const selectedTone = document.getElementById("toneSelect").value;
    
    // Get all checked amenities
    const amenities = Array.from(document.querySelectorAll('.amenity:checked'))
                           .map(el => el.value)
                           .join(", ");

    const output = document.getElementById('output');
    const loader = document.getElementById('loader');
    const copyBtn = document.getElementById('copyBtn');
    const whatsappBtn = document.getElementById('whatsappBtn'); // Added this
    const mapContainer = document.getElementById('mapContainer'); // Fixed ID
    const mapLink = document.getElementById('mapLink');
    const locationValue = location || "your";

    // 2. Validation
    if(!input.trim() || !location.trim()){
        output.innerText = "Please provide at least a description and location.";
        output.classList.remove('empty');
        return;
    }

    // 3. UI State: Start Loading
    copyBtn.classList.add("hidden");
    whatsappBtn.style.display = "none"; // Hide WhatsApp while loading
    mapContainer.classList.add("hidden"); 
    loader.style.display = "block";
    output.innerText = `Analyzing property specs & optimizing for ${locationValue} market...`; 
    output.style.color = "#666";

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                selectedTone, 
                input, 
                location, 
                price, 
                amenities, 
                phone 
            })
        });

        const data = await response.json();
        loader.style.display = "none";
        output.style.color = "#000";
        
        if (data.choices && data.choices[0]) {
            // Remove hashtags (#) which look messy in WhatsApp messages
            let adText = data.choices[0].message.content.replace(/#/g, '');
            
            // --- GOOGLE MAPS LOGIC ---
            // Professional Search URL for Google Maps
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
            
            // Update the map link button UI
            mapLink.href = mapUrl;
            mapContainer.classList.remove('hidden');

            // Final text for the ad
            const finalAdText = adText + `\n\n📍 Location Map: ${mapUrl}`;
            
            output.innerText = finalAdText;
            copyBtn.classList.remove('hidden');

            // --- WHATSAPP LOGIC ---
            whatsappBtn.style.display = "block"; // Show button
            whatsappBtn.onclick = () => {
                const encodedMsg = encodeURIComponent(finalAdText);
                window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
            };

        } else {
            output.innerText = "Service temporarily busy. Please try again.";
        }
    } catch (error) {
        loader.style.display = "none";
        output.innerText = "Connection Error: Check your internet and try again.";
    }
}

// Function to handle copying
function copyAd(){
    const text = document.getElementById("output").innerText;
    const copyBtn = document.getElementById("copyBtn");
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "Copied! ✅";
        setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
    });
}
