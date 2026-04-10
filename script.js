// 1. Dynamic Amenities Logic: Shows/Hides based on Property Type
function updateAmenities() {
    const type = document.getElementById('propertyType').value;
    
    // Hide all groups first
    document.querySelectorAll('.amenity-group').forEach(group => {
        group.classList.add('hidden');
    });

    // Uncheck everything when switching types to keep data clean
    document.querySelectorAll('.amenity').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Show the specific group
    if (type === "Apartment") {
        document.getElementById('apartmentFeatures').classList.remove('hidden');
    } else if (type === "Standalone") {
        document.getElementById('standaloneFeatures').classList.remove('hidden');
    } else if (type === "Plot") {
        document.getElementById('plotFeatures').classList.remove('hidden');
    }
}

async function generateAd() {
    // 1. Capture all input values
    const propertyType = document.getElementById('propertyType').value;
    const selectedTone = document.getElementById("toneSelect").value;
    const price = document.getElementById('price').value;
    const location = document.getElementById('location').value;
    const phone = document.getElementById('phone').value;
    const userInput = document.getElementById('userInput').value; 
    
    // Get all checked amenities
    const amenities = Array.from(document.querySelectorAll('.amenity:checked'))
                           .map(el => el.value)
                           .join(", ");

    const output = document.getElementById('output');
    const loader = document.getElementById('loader');
    const copyBtn = document.getElementById('copyBtn');
    const whatsappBtn = document.getElementById('whatsappBtn');
    const mapContainer = document.getElementById('mapContainer');
    const mapLink = document.getElementById('mapLink');

    // 2. Validation
    if(!location.trim()){
        output.innerText = "Please at least provide a location so I can map it!";
        output.classList.remove('empty');
        return;
    }

    // 3. UI State: Start Loading
    copyBtn.classList.add("hidden");
    whatsappBtn.classList.add("hidden"); 
    mapContainer.classList.add("hidden"); 
    loader.style.display = "block";
    output.innerText = `Crafting your ${propertyType} ad for the ${location} market...`; 
    output.classList.add('empty');

    try {
        const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                propertyType,
                selectedTone, 
                userInput, 
                location, 
                price, 
                amenities, 
                phone 
            })
        });

        const data = await response.json();
        loader.style.display = "none";
        output.classList.remove('empty');
        
        if (data.choices && data.choices[0]) {
            // Remove hashtags (#) which look messy in WhatsApp
            let adText = data.choices[0].message.content.replace(/#/g, '');
            
            // --- GOOGLE MAPS LOGIC ---
            // Fixed the syntax to use `${}` instead of `0{`
            const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(location + " Kenya")}`;
            
            mapLink.href = mapUrl;
            mapContainer.classList.remove('hidden');
            
            // This is the "Secret Suffix" that only appears on Copy or WhatsApp
            const mapSuffix = `\n\n📍 View Location: ${mapUrl}`;
            const fullAdText = adText + mapSuffix; 
            
            // Update the UI Box with ONLY the clean text (No link visible here)
            output.innerText = adText;
            copyBtn.classList.remove('hidden');

            // --- WHATSAPP LOGIC ---
            whatsappBtn.classList.remove('hidden');
            whatsappBtn.onclick = () => {
                const encodedMsg = encodeURIComponent(fullAdText);
                window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
            };

            // --- OVERRIDE COPY BUTTON LOGIC ---
            // We redefine the copy button here so it has access to 'fullAdText'
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(fullAdText).then(() => {
                    const originalText = copyBtn.innerText;
                    copyBtn.innerText = "Copied with Map Link! ✅";
                    setTimeout(() => { copyBtn.innerText = originalText; }, 2000);
                });
            };

        } else {
            output.innerText = "AI is currently over capacity. Please try again in a moment.";
        }
    } catch (error) {
        loader.style.display = "none";
        output.innerText = "Network Error: Check your internet connection.";
    }
}

// Keep a backup simple copy function if needed, but the one inside generateAd is the main one
function copyAd(){
    const text = document.getElementById("output").innerText;
    navigator.clipboard.writeText(text);
}
