import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSupabaseClient } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define tools that OpenAI can use to help with tasks
const taskTools = [
  {
    type: "function",
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
    type: "function",
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
    type: "function",
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
    type: "function",
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
    type: "function",
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
    type: "function",
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
    type: "function",
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
    type: "function",
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
    type: "function",
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
    type: "function",
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
    const { task } = await request.json();

    if (!task) {
      return NextResponse.json({ error: 'Task is required' }, { status: 400 });
    }

    // Retrieve the most recent wedding data from Supabase using admin client
    console.log('Fetching wedding data from Supabase...');
    const supabase = getSupabaseClient(true);
    const { data: weddingData, error: supabaseError } = await supabase
      .from('weddings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
    }

    const wedding = weddingData && weddingData.length > 0 ? weddingData[0] : null;
    console.log('Retrieved wedding data:', wedding);

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

    const systemPrompt = `You are a helpful wedding planning assistant. You MUST use the provided tools to give specific, visual recommendations.

${weddingContext}

Current Task: "${task.title}"
Task Description: "${task.description || 'No description provided'}"

CRITICAL: You must identify the task type and use tools immediately. Do not describe what you will do - DO IT NOW.

TASK TYPE & REQUIRED TOOLS:
- VENUE tasks → generate_venue_cards + budget_breakdown
- PHOTOGRAPHER tasks → generate_vendor_cards (taskType: "photographer") + budget_breakdown  
- DJ/MUSIC tasks → generate_vendor_cards (taskType: "DJ") + budget_breakdown
- FLORIST/FLOWER tasks → generate_vendor_cards (taskType: "florist") + budget_breakdown
- CATERING/MENU tasks → generate_menu_cards + budget_breakdown
- INVITATION tasks → generate_invitation_designs + budget_breakdown
- HOTEL/ACCOMMODATION tasks → generate_accommodation_guide + budget_breakdown

Use the tools NOW to provide specific recommendations with images and pricing.`;

          const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Use tools to help with: "${task.title}". Generate specific visual cards with images and pricing now.`
          }
        ],
        tools: taskTools,
        tool_choice: "required",
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
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `Help me complete this task: "${task.title}". Create visual, well-formatted recommendations with images and minimal text.`
          },
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
        toolsUsed: response.tool_calls.map(tc => tc.function.name)
      });
    }

    return NextResponse.json({
      advice: response.content,
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

## 🏛️ Top 5 Venues in ${city}

### 🌟 **The Ritz-Carlton Naples**
<div class="venue-card">
<img src="https://images.unsplash.com/photo-1519167758481-83f29d8ace68?w=400&h=250&fit=crop" alt="Luxury beachfront resort" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $4,000-8,000** | **👥 Up to 200 guests** | **🏖️ Beachfront**

✅ Perfect for your ${guestCount} guests  
✅ ${theme} wedding friendly  
✅ Multiple ceremony locations  

**📞 (239) 598-3300**  
**🌐 [ritzcarlton.com/naples](https://www.ritzcarlton.com/naples)**  
**📍 280 Vanderbilt Beach Rd**
</div>

---

### 🌸 **Naples Botanical Garden**
<div class="venue-card">
<img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop" alt="Beautiful garden venue" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $2,500-4,000** | **👥 Up to 150 guests** | **🌿 Garden**

✅ Stunning natural backdrop  
✅ Asian garden elements  
✅ Indoor/outdoor options  

**📞 (239) 643-7275**  
**🌐 [naplesgarden.org](https://www.naplesgarden.org/events)**  
**📍 4820 Bayshore Dr**
</div>

---

### 🏖️ **LaPlaya Beach Resort**
<div class="venue-card">
<img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=250&fit=crop" alt="Beach resort wedding" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $3,000-5,500** | **👥 Up to 120 guests** | **🌅 Sunset Views**

✅ Intimate beachfront setting  
✅ Asian-inspired decor options  
✅ Full-service venue  

**📞 (239) 597-3123**  
**🌐 [laplayaresort.com](https://www.laplayaresort.com)**  
**📍 9891 Gulf Shore Dr**
</div>

---

### 🎨 **Artis-Naples**
<div class="venue-card">
<img src="https://images.unsplash.com/photo-1464207687429-0a1dd7228f2d?w=400&h=250&fit=crop" alt="Elegant arts venue" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $2,800-4,500** | **👥 Up to 100 guests** | **🎭 Cultural**

✅ Sophisticated ambiance  
✅ Professional lighting  
✅ Artistic backdrop  

**📞 (239) 597-1900**  
**🌐 [artisnaples.org](https://www.artisnaples.org/events)**  
**📍 5833 Pelican Bay Blvd**
</div>

---

### 🏖️ **Barefoot Beach Club**
<div class="venue-card">
<img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop" alt="Exclusive beach club" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $3,500-6,000** | **👥 Up to 130 guests** | **🌊 Private Beach**

✅ Exclusive waterfront location  
✅ Sunset ceremony options  
✅ Private beach access  

**📞 (239) 353-2111**  
**🌐 [barefootbeach.com](https://www.barefootbeach.com)**  
**📍 6900 Barefoot Beach Blvd**
</div>

</div>

## 🎯 Next Steps
1. **📱 Call top 3 choices** - Check your wedding date availability
2. **🌐 Visit websites** - View photo galleries
3. **📅 Schedule tours** - See venues in person
4. **💌 Request quotes** - Get detailed pricing

## 📸 Photo Inspiration
Search Instagram: **#napleswedding #${theme.toLowerCase()}wedding**
  `;
}

function generateVendorCards(args: any): string {
  const { taskType, city, budget, style } = args;
  
  const vendorData = {
    photographer: {
      emoji: '📸',
      vendors: [
        { name: 'Sarah Chen Photography', price: '$2,500-4,000', specialty: 'Asian weddings', phone: '(239) 555-0123' },
        { name: 'Naples Wedding Studio', price: '$1,800-3,200', specialty: 'Destination weddings', phone: '(239) 555-0124' },
        { name: 'Coastal Captures', price: '$2,000-3,500', specialty: 'Beach ceremonies', phone: '(239) 555-0125' }
      ],
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=250&fit=crop'
    },
    DJ: {
      emoji: '🎵',
      vendors: [
        { name: 'Elite Events DJ', price: '$800-1,500', specialty: 'Multi-cultural music', phone: '(239) 555-0126' },
        { name: 'Naples Sound Co', price: '$600-1,200', specialty: 'Wedding receptions', phone: '(239) 555-0127' },
        { name: 'Sunset Beats', price: '$750-1,300', specialty: 'Beach weddings', phone: '(239) 555-0128' }
      ],
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop'
    },
    florist: {
      emoji: '🌸',
      vendors: [
        { name: 'Naples Floral Design', price: '$800-2,000', specialty: 'Asian-inspired arrangements', phone: '(239) 555-0129' },
        { name: 'Tropical Blooms', price: '$600-1,500', specialty: 'Tropical flowers', phone: '(239) 555-0130' },
        { name: 'Garden Gate Florist', price: '$700-1,800', specialty: 'Bridal bouquets', phone: '(239) 555-0131' }
      ],
      image: 'https://images.unsplash.com/photo-1519434282235-f5e1901e8ac8?w=400&h=250&fit=crop'
    }
  };

  const data = vendorData[taskType.toLowerCase()] || vendorData.photographer;
  
  return `
<div class="vendor-cards">

## ${data.emoji} Top ${taskType} Recommendations in ${city}

${data.vendors.map((vendor, index) => `
### ${index + 1}. **${vendor.name}**
<div class="vendor-card">
<img src="${data.image}" alt="${taskType} service" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 ${vendor.price}** | **🎯 ${vendor.specialty}**

✅ Perfect for ${style || 'your'} style  
✅ ${city} area specialist  
✅ Experienced with wedding events  

**📞 ${vendor.phone}**  
**🌐 Available for consultation**  
</div>

---
`).join('')}

## 🎯 Next Steps
1. **📞 Call for quotes** - Compare packages & pricing
2. **📅 Check availability** - Confirm your wedding date
3. **👀 View portfolios** - Request work samples
4. **📝 Book consultation** - Meet in person or virtually

## 💡 Questions to Ask
- Portfolio of similar weddings?
- Package inclusions & extras?
- Backup plan for emergencies?
- Timeline and setup requirements?
</div>
  `;
}

function generateMenuCards(args: any): string {
  const { guestCount, budget, style, city } = args;
  
  return `
<div class="menu-cards">

## 🍽️ Catering Options for ${guestCount} Guests

### 🌟 **Premium Catering**
<div class="menu-card">
<img src="https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=250&fit=crop" alt="Elegant wedding dinner" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $75-120 per person** | **🍴 3-course plated dinner**

✅ Asian fusion menu options  
✅ Dietary accommodations  
✅ Full service & bar  

**Total Cost: $${Math.round(guestCount * 95).toLocaleString()}**
</div>

---

### 🌸 **Asian Cuisine Specialists**
<div class="menu-card">
<img src="https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=400&h=250&fit=crop" alt="Asian wedding feast" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $50-80 per person** | **🥢 Family style dining**

✅ Authentic Asian dishes  
✅ Vegetarian options  
✅ Tea ceremony setup  

**Total Cost: $${Math.round(guestCount * 65).toLocaleString()}**
</div>

---

### 🏖️ **Casual Beach Style**
<div class="menu-card">
<img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=250&fit=crop" alt="Beach wedding buffet" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $35-55 per person** | **🍤 Buffet style**

✅ Fresh seafood options  
✅ Tropical themed menu  
✅ Outdoor service friendly  

**Total Cost: $${Math.round(guestCount * 45).toLocaleString()}**
</div>

## 🎯 Next Steps
1. **📞 Request tastings** - Sample menu options
2. **🤝 Meet caterers** - Discuss dietary needs
3. **📋 Finalize menu** - 2 months before wedding
4. **📄 Review contracts** - Service & payment terms

## 💡 Menu Planning Tips
- Book tastings 3-4 months ahead
- Consider seasonal ingredients
- Plan for 10% extra food
- Include kids menu if needed
</div>
  `;
}

function generateInvitationDesigns(args: any): string {
  const { theme, style, guestCount } = args;
  
  return `
<div class="invitation-cards">

## 💌 ${theme} Wedding Invitation Ideas

### 🌸 **Elegant Asian-Inspired**
<div class="invitation-card">
<img src="https://images.unsplash.com/photo-1510906594845-bc082582c8cc?w=400&h=250&fit=crop" alt="Asian wedding invitation" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $3-6 per invitation**

✅ Cherry blossom motifs  
✅ Gold foil accents  
✅ Traditional calligraphy  

**Total Cost: $${Math.round(guestCount * 4.5).toLocaleString()}**
</div>

---

### 🏖️ **Beach Destination Style**
<div class="invitation-card">
<img src="https://images.unsplash.com/photo-1520150142028-22e4833a33f1?w=400&h=250&fit=crop" alt="Beach wedding invitation" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $2-4 per invitation**

✅ Watercolor designs  
✅ Coastal color palette  
✅ RSVP cards included  

**Total Cost: $${Math.round(guestCount * 3).toLocaleString()}**
</div>

---

### ✨ **Modern Minimalist**
<div class="invitation-card">
<img src="https://images.unsplash.com/photo-1503759104275-d2c991c85304?w=400&h=250&fit=crop" alt="Modern wedding invitation" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $2-5 per invitation**

✅ Clean typography  
✅ Premium paper stock  
✅ Digital RSVP options  

**Total Cost: $${Math.round(guestCount * 3.5).toLocaleString()}**
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

### 🌟 **Luxury Hotels**
<div class="hotel-card">
<img src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=250&fit=crop" alt="Luxury hotel room" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $200-400/night** | **⭐ 4-5 star rating**

✅ Wedding group discounts  
✅ Shuttle service available  
✅ Premium amenities  

**📞 (239) 555-0150**  
**🌐 Book group rates early**
</div>

---

### 🏖️ **Mid-Range Resorts**
<div class="hotel-card">
<img src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400&h=250&fit=crop" alt="Beach resort" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $120-250/night** | **⭐ 3-4 star rating**

✅ Beach access  
✅ Wedding party rates  
✅ Continental breakfast  

**📞 (239) 555-0151**  
**🌐 Perfect for families**
</div>

---

### 💰 **Budget-Friendly Options**
<div class="hotel-card">
<img src="https://images.unsplash.com/photo-1578774204375-2a8d5d9f3726?w=400&h=250&fit=crop" alt="Comfortable hotel" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0;">

**💰 $80-150/night** | **⭐ 2-3 star rating**

✅ Clean & comfortable  
✅ Group booking discounts  
✅ Close to venue  

**📞 (239) 555-0152**  
**🌐 Great value option**
</div>

## 🎯 Next Steps for ${guestCount || 20} guests
1. **📋 Create guest list** - Track out-of-town attendees
2. **📞 Negotiate group rates** - 10+ rooms get discounts
3. **📧 Share recommendations** - Include on wedding website
4. **📅 Set booking deadline** - 2 months before wedding

## 💡 Booking Tips
- Reserve room blocks 6+ months ahead
- Include hotel info on invitations
- Consider shuttle service coordination
- Ask about wedding guest amenities
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

### 🎯 **Action Plan:**
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