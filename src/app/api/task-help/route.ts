import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseClient } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define tools that OpenAI can use to help with tasks
const taskTools = [
  {
    type: "function" as const,
    function: {
      name: "search_web",
      description: "Search the web for current information about venues, vendors, or wedding services",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query to find information" },
          location: { type: "string", description: "Geographic location to focus search" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_venue_cards",
      description: "Generate beautifully formatted venue recommendation cards with images",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Wedding city/location" },
          guestCount: { type: "number", description: "Expected number of guests" },
          budget: { type: "number", description: "Budget range for venue" },
          theme: { type: "string", description: "Wedding theme or style" }
        },
        required: ["city", "guestCount"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_vendor_cards",
      description: "Generate beautifully formatted vendor recommendation cards with images and pricing",
      parameters: {
        type: "object",
        properties: {
          taskType: { type: "string", description: "Type of vendor (photographer, DJ, florist, etc.)" },
          city: { type: "string", description: "Wedding city/location" },
          budget: { type: "number", description: "Budget range for vendor" },
          style: { type: "string", description: "Preferred style or theme" }
        },
        required: ["taskType", "city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_menu_cards",
      description: "Generate beautifully formatted catering and menu recommendation cards",
      parameters: {
        type: "object",
        properties: {
          guestCount: { type: "number", description: "Number of guests" },
          budget: { type: "number", description: "Catering budget" },
          style: { type: "string", description: "Food style or cuisine preference" },
          city: { type: "string", description: "Wedding location" }
        },
        required: ["guestCount", "city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_invitation_designs",
      description: "Generate invitation design ideas and recommendations",
      parameters: {
        type: "object",
        properties: {
          theme: { type: "string", description: "Wedding theme" },
          style: { type: "string", description: "Design style preference" },
          guestCount: { type: "number", description: "Number of invitations needed" }
        },
        required: ["theme"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "generate_accommodation_guide",
      description: "Generate hotel and accommodation recommendations for wedding guests",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Wedding city/location" },
          guestCount: { type: "number", description: "Expected number of out-of-town guests" },
          budget: { type: "string", description: "Budget range (budget/mid-range/luxury)" }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_venue_checklist",
      description: "Create a detailed checklist for booking a wedding venue",
      parameters: {
        type: "object",
        properties: {
          budget: { type: "number", description: "Wedding budget" },
          guestCount: { type: "number", description: "Expected number of guests" },
          city: { type: "string", description: "Wedding city/location" },
          theme: { type: "string", description: "Wedding theme or style" }
        },
        required: ["guestCount", "city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "suggest_vendors",
      description: "Suggest wedding vendors based on task type and location",
      parameters: {
        type: "object",
        properties: {
          taskType: { type: "string", description: "Type of vendor needed (photographer, DJ, florist, etc.)" },
          city: { type: "string", description: "Wedding city/location" },
          budget: { type: "number", description: "Budget range for this vendor" },
          style: { type: "string", description: "Preferred style or theme" }
        },
        required: ["taskType", "city"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "create_timeline",
      description: "Create a timeline for completing wedding tasks",
      parameters: {
        type: "object",
        properties: {
          weddingDate: { type: "string", description: "Wedding date" },
          taskType: { type: "string", description: "Type of task to timeline" },
          priority: { type: "string", enum: ["high", "medium", "low"], description: "Task priority level" }
        },
        required: ["weddingDate", "taskType"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "budget_breakdown",
      description: "Provide budget breakdown and recommendations for a specific task",
      parameters: {
        type: "object",
        properties: {
          taskType: { type: "string", description: "Type of task (venue, photography, catering, etc.)" },
          totalBudget: { type: "number", description: "Total wedding budget" },
          guestCount: { type: "number", description: "Number of guests" }
        },
        required: ["taskType", "totalBudget"]
      }
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    const { task, message, chatHistory, weddingDetails } = await request.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Use wedding details from frontend if available, otherwise fetch from Supabase as fallback
    let wedding = weddingDetails;
    
    if (!wedding) {
      console.log('No wedding details provided from frontend, fetching from Supabase as fallback...');
      const supabase = getSupabaseClient(true);
      const { data: weddingData, error: supabaseError } = await supabase
        .from('weddings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
      }

      wedding = weddingData && weddingData.length > 0 ? weddingData[0] : null;
    }

    console.log('Using wedding data:', wedding);

    // Create context with wedding details
    const weddingContext = wedding ? `
Wedding Details:
- Partners: ${wedding.partner1name || 'N/A'} & ${wedding.partner2name || 'N/A'}
- Date: ${wedding.weddingdate || 'N/A'}
- Location: ${wedding.city || 'N/A'}
- Theme: ${wedding.theme || 'N/A'}
- Guest Count: ${wedding.estimatedguestcount || 'N/A'}
- Budget: $${wedding.budget ? wedding.budget.toLocaleString() : 'N/A'}
- Special Requirements: ${wedding.specialrequirements?.join(', ') || 'None'}
- Contact: ${wedding.contactemail || 'N/A'}
- Phone: ${wedding.phone || 'N/A'}
` : 'No wedding details available.';

    // Create messages array for conversation
    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful wedding planning assistant. You MUST use the provided tools to give specific, visual recommendations when appropriate.

${weddingContext}

Current Task: "${task.title}"
Task Description: "${task.description || 'No description provided'}"

IMPORTANT: When calling tools, you MUST use the wedding details from the context above:
- city: "${wedding?.city || 'Not specified'}"
- guestCount: ${wedding?.estimatedguestcount || 100}
- budget: ${wedding?.budget || 10000}
- theme: "${wedding?.theme || 'Classic'}"

TASK TYPE & AVAILABLE TOOLS:
- VENUE tasks → generate_venue_cards (use city, guestCount, budget, theme from wedding details) + budget_breakdown
- PHOTOGRAPHER tasks → generate_vendor_cards (taskType: "photographer", use city, budget from wedding details) + budget_breakdown  
- DJ/MUSIC tasks → generate_vendor_cards (taskType: "DJ", use city, budget from wedding details) + budget_breakdown
- FLORIST/FLOWER tasks → generate_vendor_cards (taskType: "florist", use city, budget from wedding details) + budget_breakdown
- CATERING/MENU tasks → generate_menu_cards (use guestCount, budget, city from wedding details) + budget_breakdown
- INVITATION tasks → generate_invitation_designs (use theme from wedding details) + budget_breakdown
- HOTEL/ACCOMMODATION tasks → generate_accommodation_guide (use city, guestCount from wedding details) + budget_breakdown

ALWAYS use the wedding details context when calling tools. Do not use generic or example data. Use tools when providing recommendations, but also engage in helpful conversation. Be friendly and conversational while being informative.`
      }
    ];

    // Add chat history if available
    if (chatHistory && chatHistory.length > 0) {
      chatHistory.forEach((msg: any) => {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current message or initial prompt
    if (message) {
      messages.push({
        role: "user",
        content: message
      });
    } else {
      // Initial request - provide task recommendations
      messages.push({
        role: "user",
        content: `Help me complete this task: "${task.title}". Create visual, well-formatted recommendations with images and pricing.`
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      tools: taskTools,
      tool_choice: message ? "auto" : "required", // Required for initial requests, auto for follow-up
      max_tokens: 2000,
      temperature: 0.3,
    });

    const response = completion.choices[0].message;
    
    // Handle tool calls if any
    if (response.tool_calls && response.tool_calls.length > 0) {
      const toolResults = [];
      
      for (const toolCall of response.tool_calls) {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        let result = '';
        
        switch (functionName) {
          case 'search_web':
            result = await searchWeb(args);
            break;
          case 'generate_venue_cards':
            result = generateVenueCards(args);
            break;
          case 'generate_vendor_cards':
            result = generateVendorCards(args);
            break;
          case 'generate_menu_cards':
            result = generateMenuCards(args);
            break;
          case 'generate_invitation_designs':
            result = generateInvitationDesigns(args);
            break;
          case 'generate_accommodation_guide':
            result = generateAccommodationGuide(args);
            break;
          case 'create_venue_checklist':
            result = createVenueChecklist(args);
            break;
          case 'suggest_vendors':
            result = suggestVendors(args);
            break;
          case 'create_timeline':
            result = createTimeline(args);
            break;
          case 'budget_breakdown':
            result = budgetBreakdown(args);
            break;
          default:
            result = 'Tool not implemented yet.';
        }
        
        toolResults.push({
          tool_call_id: toolCall.id,
          output: result
        });
      }
      
      // Get final response with tool results
      const finalCompletion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          ...messages,
          response,
          ...toolResults.map(result => ({
            role: "tool" as const,
            content: result.output,
            tool_call_id: result.tool_call_id
          }))
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });
      
      return NextResponse.json({
        advice: finalCompletion.choices[0].message.content,
        content: finalCompletion.choices[0].message.content,
        toolsUsed: response.tool_calls.map(tc => tc.function.name)
      });
    }

    return NextResponse.json({
      advice: response.content,
      content: response.content,
      toolsUsed: []
    });

  } catch (error) {
    console.error('Error in task help API:', error);
    return NextResponse.json(
      { error: 'Failed to get AI help' },
      { status: 500 }
    );
  }
}

// Tool implementation functions
async function searchWeb(args: any): Promise<string> {
  const { query, location } = args;
  
  try {
    const searchQuery = location ? `${query} in ${location}` : query;
    
    // Handle different task types
    if (query.toLowerCase().includes('venue')) {
      return `Found venue options in ${location || 'your area'} with pricing, capacity, and contact details. Ready for venue cards.`;
    } else if (query.toLowerCase().includes('photographer')) {
      return `Found wedding photographers in ${location || 'your area'} with portfolios, pricing, and specialties. Ready for vendor cards.`;
    } else if (query.toLowerCase().includes('dj') || query.toLowerCase().includes('music')) {
      return `Found DJs and music entertainment in ${location || 'your area'} with experience and pricing. Ready for vendor cards.`;
    } else if (query.toLowerCase().includes('florist') || query.toLowerCase().includes('flower')) {
      return `Found wedding florists in ${location || 'your area'} with arrangements and pricing. Ready for vendor cards.`;
    } else if (query.toLowerCase().includes('catering') || query.toLowerCase().includes('menu')) {
      return `Found catering options in ${location || 'your area'} with menu styles and pricing. Ready for menu cards.`;
    } else if (query.toLowerCase().includes('hotel') || query.toLowerCase().includes('accommodation')) {
      return `Found guest accommodation options in ${location || 'your area'} with rates and amenities. Ready for accommodation guide.`;
    }
    
    return `Web search completed for "${searchQuery}". Found current vendor and service information.`;
    
  } catch (error) {
    console.error('Web search error:', error);
    return 'Web search completed with local data.';
  }
}

function generateVenueCards(args: any): string {
  const { city, guestCount, budget, theme } = args;
  
  return `
<div class="venue-cards">

## 🏛️ Top Venue Types to Consider in ${city}

### 🌟 [**Luxury Hotel/Resort**](https://www.google.com/search?q=Luxury+Hotel+Resort+in+${encodeURIComponent(city)})
<div class="venue-card">
**💰 $4,000-8,000** | **👥 Up to 200 guests** | **🏨 Full Service**

✅ Perfect for your ${guestCount} guests  
✅ ${theme} wedding friendly  
✅ Multiple ceremony locations  
✅ Professional wedding coordinators

**🔍 Search:** "luxury wedding venues ${city}"  
**💡 Tip:** Book 12-18 months in advance  
</div>

---

### 🌸 [**Garden/Botanical Venue**](https://www.google.com/search?q=Garden+or+Botanical+Venue+in+${encodeURIComponent(city)})
<div class="venue-card">
**💰 $2,500-4,000** | **👥 Up to 150 guests** | **🌿 Natural Setting**

✅ Stunning natural backdrop  
✅ Beautiful photo opportunities  
✅ Indoor/outdoor options  
✅ Seasonal flower displays

**🔍 Search:** "botanical garden weddings ${city}"  
**💡 Tip:** Consider seasonal bloom schedules  
</div>

---

### 🏖️ [**Waterfront/Beach Venue**](https://www.google.com/search?q=Waterfront+or+Beach+Venue+in+${encodeURIComponent(city)})
<div class="venue-card">
**💰 $3,000-5,500** | **👥 Up to 120 guests** | **🌅 Scenic Views**

✅ Intimate waterfront setting  
✅ Natural romantic ambiance  
✅ Sunset ceremony potential  
✅ Unique photo opportunities

**🔍 Search:** "waterfront wedding venues ${city}"  
**💡 Tip:** Check wind and weather backup plans  
</div>

---

### 🎨 [**Historic/Cultural Venue**](https://www.google.com/search?q=Historic+or+Cultural+Venue+in+${encodeURIComponent(city)})
<div class="venue-card">
**💰 $2,800-4,500** | **👥 Up to 100 guests** | **🏛️ Character**

✅ Sophisticated ambiance  
✅ Unique architectural features  
✅ Built-in elegant decor  
✅ Historic charm and character

**🔍 Search:** "historic wedding venues ${city}"  
**💡 Tip:** Ask about restoration restrictions  
</div>

---

### 🏡 [**Private Estate/Mansion**](https://www.google.com/search?q=Private+Estate+or+Mansion+in+${encodeURIComponent(city)})
<div class="venue-card">
**💰 $3,500-6,000** | **👥 Up to 130 guests** | **🏰 Exclusive**

✅ Private and intimate setting  
✅ Customizable to your vision  
✅ Beautiful grounds and gardens  
✅ Exclusive use of property

**🔍 Search:** "private estate weddings ${city}"  
**💡 Tip:** Verify catering and vendor policies  
</div>

</div>

## 🎯 Next Steps
1. **📱 Research venues** - Use suggested search terms above
2. **🌐 Visit websites** - View photo galleries and pricing
3. **📅 Schedule tours** - See venues in person
4. **💌 Request quotes** - Get detailed pricing for your date
5. **📝 Check availability** - Confirm your wedding date is open

## 📸 Photo Inspiration
Search Instagram: **#${city.toLowerCase()}wedding #${theme.toLowerCase()}wedding**

## 💡 Questions to Ask Venues
- What's included in the base rental fee?
- Are there preferred vendor lists or restrictions?
- What's the backup plan for bad weather?
- How many hours are included in the rental?
- What are the payment terms and cancellation policy?
  `;
}

function generateVendorCards(args: any): string {
  const { taskType, city, budget, style } = args;
  
  const vendorData = {
    photographer: {
      emoji: '📸',
      vendors: [
        { name: 'Premier Wedding Photography', price: '$2,500-4,000', specialty: 'Artistic wedding photography', tip: 'View portfolio online' },
        { name: 'Classic Captures Studio', price: '$1,800-3,200', specialty: 'Traditional & candid shots', tip: 'Ask about engagement sessions' },
        { name: 'Modern Lens Photography', price: '$2,000-3,500', specialty: 'Contemporary wedding style', tip: 'Check social media reviews' }
      ],
    },
    DJ: {
      emoji: '🎵',
      vendors: [
        { name: 'Elite Wedding Entertainment', price: '$800-1,500', specialty: 'Multi-cultural music', tip: 'Request music style samples' },
        { name: 'Sound & Celebration DJs', price: '$600-1,200', specialty: 'Reception entertainment', tip: 'Ask about MC services' },
        { name: 'Rhythm & Romance', price: '$750-1,300', specialty: 'Custom playlists', tip: 'Discuss special song requests' }
      ],
    },
    florist: {
      emoji: '🌸',
      vendors: [
        { name: 'Elegant Floral Design', price: '$800-2,000', specialty: 'Custom arrangements', tip: 'Bring inspiration photos' },
        { name: 'Garden Fresh Flowers', price: '$600-1,500', specialty: 'Seasonal blooms', tip: 'Ask about delivery timing' },
        { name: 'Bridal Bouquet Boutique', price: '$700-1,800', specialty: 'Bridal accessories', tip: 'Consider preservation options' }
      ],
    }
  };

  const data = vendorData[taskType.toLowerCase()] || vendorData.photographer;
  
  return `
<div class="vendor-cards">

## ${data.emoji} Top ${taskType} Recommendations in ${city}

${data.vendors.map((vendor, index) => `
### ${index + 1}. [**${vendor.name}**](https://www.google.com/search?q=${encodeURIComponent(vendor.name)}+${encodeURIComponent(city)})
<div class="vendor-card">
**💰 ${vendor.price}** | **🎯 ${vendor.specialty}**

✅ Perfect for ${style || 'your'} style  
✅ ${city} area specialist  
✅ Experienced with wedding events  
✅ ${vendor.tip}

**🔍 Search:** "${vendor.name.toLowerCase()} ${city.toLowerCase()}"  
**💡 Tip:** Book consultation early  
</div>

---
`).join('')}

## 🎯 Next Steps
1. **📞 Research locally** - Search "${taskType} ${city}" online
2. **📅 Check availability** - Confirm your wedding date
3. **👀 View portfolios** - Request work samples and references
4. **📝 Book consultation** - Meet in person or virtually
5. **💰 Compare packages** - Get detailed quotes from 3+ vendors

## 💡 Questions to Ask
- Can you show me a portfolio of similar weddings?
- What packages do you offer and what's included?
- Do you have a backup plan for emergencies?
- What are your setup and timeline requirements?
- How far in advance do you book up?

## 🔍 Where to Find ${taskType}s in ${city}
- **The Knot:** Search local vendor directory
- **WeddingWire:** Read reviews and view portfolios  
- **Google:** "${taskType} near ${city}" + read reviews
- **Instagram:** #${city.toLowerCase()}${taskType.toLowerCase()} #${city.toLowerCase()}wedding
- **Facebook:** Local wedding groups and recommendations
</div>
  `;
}

function generateMenuCards(args: any): string {
  const { guestCount, budget, style, city } = args;
  
  return `
<div class="menu-cards">

## 🍽️ Catering Options for ${guestCount} Guests in ${city}

### 🌟 [**Premium Catering**](https://www.google.com/search?q=Premium+Catering+in+${encodeURIComponent(city)})
<div class="menu-card">
**💰 $75-120 per person** | **🍴 3-course plated dinner**

✅ ${style || 'Customizable'} menu options  
✅ Dietary accommodations  
✅ Full service & bar  

**Total Cost Estimate: $${Math.round(guestCount * 95).toLocaleString()}**
</div>

---

### 🌿 [**Farm-to-Table Experience**](https://www.google.com/search?q=Farm+to+Table+Catering+in+${encodeURIComponent(city)})
<div class="menu-card">
**💰 $60-100 per person** | **🥗 Buffet or family style**

✅ Locally sourced ingredients  
✅ Fresh, seasonal menu  
✅ Rustic and charming presentation  

**Total Cost Estimate: $${Math.round(guestCount * 75).toLocaleString()}**
</div>

---

### 🌮 [**Casual & Fun (Food Trucks)**](https://www.google.com/search?q=Food+Truck+Catering+for+Weddings+in+${encodeURIComponent(city)})
<div class="menu-card">
**💰 $40-75 per person** | **🚚 Unique & memorable**

✅ Wide variety of cuisine choices  
✅ Fun, interactive guest experience  
✅ Great for relaxed ${style || 'modern'} weddings  

**Total Cost Estimate: $${Math.round(guestCount * 55).toLocaleString()}**
</div>

## 🎯 Next Steps
1. **📞 Contact caterers** - Check availability and get sample menus
2. **🍷 Schedule tastings** - Taste the food before you book
3. **💬 Discuss options** - Talk about your budget and guest needs
4. **📝 Review contracts** - Check for all-inclusive pricing

## 💡 Pro Tip
Ask about service charges, gratuity, and charges for extras like linens and flatware to avoid hidden costs.
</div>
  `;
}

function generateInvitationDesigns(args: any): string {
  const { theme, style, guestCount } = args;
  
  return `
<div class="invitation-cards">

## 💌 Invitation Ideas for a ${theme} Wedding

### 🎨 [**Modern & Minimalist**](https://www.google.com/search?q=Modern+Minimalist+wedding+invitations)
<div class="invitation-card">
**✨ Clean lines & simple fonts**

✅ Perfect for a ${theme} theme  
✅ Focus on typography  
✅ High-quality paper  
</div>

---

### 🌸 [**Floral & Romantic**](https://www.google.com/search?q=Floral+Romantic+wedding+invitations)
<div class="invitation-card">
**🌿 Botanical illustrations & script fonts**

✅ Complements a ${theme} wedding  
✅ Watercolor designs  
✅ Elegant and timeless  
</div>

---

### 🎨 [**Bold & Typographic**](https://www.google.com/search?q=Bold+Typographic+wedding+invitations)
<div class="invitation-card">
**💥 Strong fonts & vibrant colors**

✅ Makes a statement  
✅ Great for modern ${style || 'themes'}  
✅ Unique and memorable  
</div>

## 🎯 Next Steps
1. **🎨 Choose design** - Match your wedding theme
2. **✍️ Write copy** - Include all essential details
3. **📮 Send 6-8 weeks early** - For local guests
4. **📧 Digital backup** - Email save-the-dates

## 📝 Invitation Checklist
- [ ] Couple's names & wedding date
- [ ] Ceremony & reception details
- [ ] RSVP deadline & method
- [ ] Dress code or theme notes
- [ ] Website or registry info
</div>
  `;
}

function generateAccommodationGuide(args: any): string {
  const { city, guestCount, budget } = args;
  
  return `
<div class="accommodation-cards">

## 🏨 Guest Accommodation in ${city}

### 🌟 [**Luxury Hotels**](https://www.google.com/search?q=Luxury+Hotels+in+${encodeURIComponent(city)})
<div class="hotel-card">
**💰 $200-400/night** | **⭐ 4-5 star rating**

✅ Wedding group discounts  
✅ Shuttle service available  
✅ Premium amenities  
✅ Concierge services

**🔍 Search:** "luxury hotels ${city} wedding blocks"  
**💡 Tip:** Book group rates 6+ months early
</div>

---

### 🏖️ [**Mid-Range Resorts**](https://www.google.com/search?q=Mid-Range+Resorts+in+${encodeURIComponent(city)})
<div class="hotel-card">
**💰 $120-250/night** | **⭐ 3-4 star rating**

✅ Comfortable accommodations  
✅ Wedding party rates  
✅ Continental breakfast  
✅ Pool and recreation areas

**🔍 Search:** "hotels near ${city} wedding venues"  
**💡 Tip:** Perfect for families and budget-conscious guests
</div>

---

### 💰 [**Budget-Friendly Options**](https://www.google.com/search?q=Budget-Friendly+Hotels+in+${encodeURIComponent(city)})
<div class="hotel-card">
**💰 $80-150/night** | **⭐ 2-3 star rating**

✅ Clean & comfortable  
✅ Group booking discounts  
✅ Close to venue  
✅ Basic amenities included

**🔍 Search:** "affordable hotels ${city}"  
**💡 Tip:** Great value option for extended stays
</div>

## 🎯 Next Steps for ${guestCount || 20} guests
1. **📋 Create guest list** - Track out-of-town attendees
2. **📞 Negotiate group rates** - 10+ rooms get discounts
3. **📧 Share recommendations** - Include on wedding website
4. **📅 Set booking deadline** - 2 months before wedding
5. **🗺️ Consider location** - Distance from venue and airport

## 💡 Booking Tips
- Reserve room blocks 6+ months ahead
- Include hotel info on invitations
- Consider shuttle service coordination
- Ask about wedding guest amenities
- Get group rate contracts in writing

## 🔍 Where to Search
- **Hotels.com:** Group booking options
- **Booking.com:** Compare rates and locations
- **Google Maps:** "hotels near [your venue address]"
- **Wedding venue:** Ask for recommended accommodations
- **Local tourism board:** ${city} visitor information
</div>
  `;
}

function createVenueChecklist(args: any): string {
  const { budget, guestCount, city, theme } = args;
  
  return `
## ✅ Venue Booking Checklist

### 📋 **Before You Visit**
- [ ] Confirm ${guestCount} guest capacity
- [ ] Budget: $${budget ? budget.toLocaleString() : 'TBD'} allocated
- [ ] Date availability check
- [ ] Initial pricing research

### 🏛️ **During Venue Tours**
- [ ] Test ceremony acoustics
- [ ] Check backup weather plans
- [ ] Evaluate ${theme} decor compatibility
- [ ] Assess parking situation
- [ ] Review vendor restrictions

### 📝 **Questions to Ask**
- [ ] What's included in base price?
- [ ] ${theme} ceremony accommodations?
- [ ] Setup/breakdown timeline?
- [ ] Cancellation policy details?
- [ ] Payment schedule terms?

### 🎯 **Final Decision**
- [ ] Compare all venue options
- [ ] Negotiate package deals
- [ ] Review contract thoroughly
- [ ] Book immediately if satisfied
- [ ] Confirm all details in writing
  `;
}

function suggestVendors(args: any): string {
  const { taskType, city, budget, style } = args;
  
  return `
## 🎯 ${taskType} Recommendations for ${city}

### 💰 Budget Range: $${budget ? budget.toLocaleString() : '1,500-3,500'}

### 📞 Action Steps:
1. **Research local ${taskType}s** - Check portfolios online
2. **Read recent reviews** - Google, Yelp, WeddingWire  
3. **Verify availability** - For your wedding date
4. **Get quotes** - From at least 3 vendors
5. **Check references** - Speak with recent clients

### 🔗 Search Resources:
- **The Knot:** ${city} ${taskType}s
- **WeddingWire:** Local vendor directory
- **Instagram:** #${city.toLowerCase()}${taskType} #${style}style
  `;
}

function createTimeline(args: any): string {
  const { weddingDate, taskType, priority } = args;
  
  const date = new Date(weddingDate);
  const now = new Date();
  const monthsUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  return `
## ⏰ ${taskType.toUpperCase()} Timeline

### 📅 **Your Wedding:** ${weddingDate} (${monthsUntil} months away)

${monthsUntil >= 6 ? '✅ **Plenty of time!**' : monthsUntil >= 3 ? '⚠️ **Book soon!**' : '🚨 **Book immediately!**'}

### 💡 **Action Plan:**
1. **This week:** Start research & get quotes
2. **Next 2 weeks:** Schedule meetings/tours  
3. **Month 1:** Make final decision & book
4. **Month 2:** Confirm all details
  `;
}

function budgetBreakdown(args: any): string {
  const { taskType, totalBudget, guestCount } = args;
  
  const budgetPercentages = {
    venue: 40,
    catering: 30,
    photography: 12,
    flowers: 8,
    music: 8,
    attire: 8,
    transportation: 3,
    other: 5
  };

  const percentage = budgetPercentages[taskType.toLowerCase()] || 10;
  const suggestedBudget = (totalBudget * percentage) / 100;
  const perGuestCost = guestCount ? suggestedBudget / guestCount : 0;

  return `
## 💰 Budget Breakdown

### 🎯 **${taskType.toUpperCase()} Allocation**

**Total Budget:** $${totalBudget.toLocaleString()}  
**${taskType} Budget:** $${suggestedBudget.toLocaleString()} (${percentage}%)  
${guestCount ? `**Per Guest:** $${perGuestCost.toFixed(2)}` : ''}

### 💡 **Money-Saving Tips:**
- **Book off-peak days** (Sunday/Friday)
- **Package deals** save 10-20%
- **Off-season rates** (Nov-Apr)
- **New vendors** offer competitive rates
  `;
} 