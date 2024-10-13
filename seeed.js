import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://swvbrjjgflgqbkbpghjw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dmJyampnZmxncWJrYnBnaGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ5MzgwODMsImV4cCI6MjA0MDUxNDA4M30.zqoFhMqAGBQ6yDh1ZwEnTy_omTaOo0GOQXlPKo-RG_U'; // Use the correct key
const supabase = createClient(supabaseUrl, supabaseKey);

async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*');

    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }

    return data;
}
function mapProductToApiFormat(product) {
    return {
        seller: 'velonna', // This will be static or dynamic based on your logic
        category: mapCategory(product.category), // Example: You might need a function to map category strings to IDs
        hsn: parseInt(product.hsn, 10),
        title: product.name,
        price: product.price.toString(),
        material: product.material || '',
        gender: null, // Adjust based on your data if available
        age: null, // Adjust based on your data if available
        is_live: true, // Or any logic based on product availability
        quantity: 2147483647, // Adjust based on stock or any relevant field
        size: product.size || '',
        description: product.description || '',
        gross_weight: product.weight || 0,
        net_weight: product.weight || 0,
        diamond_weight: product.diamond_weight || 0,
        kt: product.kt || '',
        diamond_clearity: '', // Adjust if available
        is_gold: product.kt == 14 ? true : false,
        is_diamond: product.kt == 14 ? true : false,
        for_counter:product.slct_for_counter
    };
}

function mapCategory(category) {
    const categoryMap = {
        'ring': 3,
        'bracelet': 4,
        'chains': 5,
        'necklace': 6,
        'set': 7,
        'necklace set ring and bracelet': 8,
        'earring': 9,
        'bangles': 10,
        'anklet': 11,
        'studs': 12,
        'pendant set': 13,
        'chain pendant': 14,
        'chain pendant set': 15,
        'hoops': 16,
        'pendant': 17,
        'necklace set': 18
    };

    // Strip leading/trailing spaces and map the category
    return categoryMap[category.trim().toLowerCase()] || 0; // Default to 0 if category not found
}

function mapCollection(collection) {
    const collectionMap = {
        'eclipse': 3,
        'cascade': 4,
        'embrace': 5,
        'chromatic': 6,
        'blush': 7,
        'regalia': 8,
        'crowns': 9,
        'bands': 11,
        'strings': 12,
        'celestial sphere': 13,
        'wild wristlets': 14,
        'eternity': 15,
        'charms': 16,
        'lunar': 17,
        'minimal': 18,
        'negligee': 19,
        'sautoir': 20,
        'torsade': 21,
        'hoops': 22,
        'drop earrings': 23,
        'charm drops': 24,
        'artistic accents': 25,
        'tiny treasures': 26,
        'mini eclipse': 27,
        'sweet charms': 28,
        'flare': 29,
        'lilac': 30,
        'solitaire': 31,
        'amethyst': 32,
        'myriad': 33,
        'coven': 34,
        'lavender': 35,
        'serenity': 36,
        'elegance': 37,
        'willow': 38,
        'harmony duet': 39,
        'moon light': 40,
        "shrimm's authentic": 41,
        'dazzle': 42,
        'enigma': 43,
        'allure': 44,
        'cherie': 45,
        'brilliance': 46,
        'beads': 47
    };

    // Strip leading/trailing spaces and map the collection
    return collectionMap[collection.trim().toLowerCase()] || 0; // Default to 0 if collection not found
}


async function sendProductToApi(product, token) {
    const apiUrl = 'https://your-api-url.com/products';
    const apiData = mapProductToApiFormat(product);

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add Bearer token for authentication
        },
        body: JSON.stringify(apiData)
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error sending product to API:', errorData);
        return null;
    }

    const responseData = await response.json();
    return responseData;
}



console.log(getProducts())
// sendProductToApi();
