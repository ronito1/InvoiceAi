// knowledgeBase.js

export const templates = {
    // NEW TEMPLATE FOR COMPLEX INVOICES
    multi_project_invoice: {
      id: 'multi_project_invoice',
      keywords: ['project:', 'managed by', 'item total', 'man hour'],
      prompt_instructions: `
        This is a complex, multi-part invoice organized by 'Project'. 
        1. Identify each separate project block.
        2. For each project, extract the 'Project Name' and the 'Managed by' person (who is the vendor for that section).
        3. For each project, list all of its line items.
        4. CRITICAL: For each project, calculate the sub-total by summing all the values in the 'Item Total' column.
        5. Respond with a JSON object that has a single key: "projects". The value of "projects" should be an ARRAY, where each object in the array represents one project and contains: 'projectName', 'vendor', 'calculatedTotal', and 'items'.
      `
    },
    university_receipt: {
      id: 'university_receipt',
      keywords: ['university', 'receipt', 'semester', 'tuition'],
      prompt_instructions: "This is a university receipt. The vendor is the university name. The date is labeled 'Date'. The total is labeled 'Total'. Line items are in a table."
    },
    generic_store: {
      id: 'generic_store',
      keywords: ['store', 'shop', 'market', 'inc'],
      prompt_instructions: "This is a generic store receipt. The vendor name is at the top. The total is labeled 'TOTAL'. Look for a list of items with prices."
    }
  };
  
  // This function remains the same, but will now find our new template
  export function retrieveTemplate(text) {
      const lowerCaseText = text.toLowerCase();
      for (const key in templates) {
          const template = templates[key];
          for (const keyword of template.keywords) {
              if (lowerCaseText.includes(keyword)) {
                  return template;
              }
          }
      }
      // If no specific template is found, we can't process this complex invoice reliably.
      // It's better to return a specific "unknown" template.
      return {
          id: 'unknown',
          prompt_instructions: "This is an unknown invoice format. Try to extract a single vendor, date, total, and items into a JSON object. If there are multiple sections, focus on the first one."
      };
  }