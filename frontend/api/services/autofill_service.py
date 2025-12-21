import json

class AutofillService:
    @staticmethod
    def get_field_mappings(platform: str):
        """
        Common field mappings for ATS platforms.
        This helps the browser agent find which resume field goes into which HTML element.
        """
        mappings = {
            "google": {
                "first_name": ["firstName", "first-name", "First name"],
                "last_name": ["lastName", "last-name", "Last name"],
                "email": ["email", "emailAddress", "Email address"],
                "phone": ["phone", "phoneNumber", "Mobile phone number"],
                "linkedin": ["linkedin", "LinkedIn profile URL"],
                "website": ["website", "Portfolio URL"],
                "location": ["location", "City"],
                "is_authorized_us": ["authorized", "legally eligible"],
                "requires_sponsorship": ["sponsorship", "visa status"],
                "gender": ["gender", "sex"],
                "race": ["race", "ethnicity"],
                "veteran": ["veteran"],
                "disability": ["disability"],
            },
            "greenhouse": {
                "first_name": ["first_name"],
                "last_name": ["last_name"],
                "email": ["email"],
                "phone": ["phone"],
                "linkedin": ["linkedin", "job_application_answers_attributes_0_text_value"],
                "website": ["website", "portfolio"],
            },
            "lever": {
                "full_name": ["name"],
                "email": ["email"],
                "phone": ["phone"],
                "linkedin": ["urls[LinkedIn]"],
                "website": ["urls[Portfolio]"],
            }
        }
        return mappings.get(platform.lower(), mappings["google"])
    
    @staticmethod
    def generate_autofill_script(resume_data: dict, platform: str) -> str:
        """
        Generates a JavaScript snippet that can be executed in the browser to autofill fields.
        """
        mapping = AutofillService.get_field_mappings(platform)
        
        # Simple name splitting
        name = resume_data.get("name", "")
        name_parts = name.split()
        first_name = name_parts[0] if name_parts else ""
        last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
        
        data_to_fill = {
            "first_name": first_name,
            "last_name": last_name,
            "full_name": name,
            "email": resume_data.get("email"),
            "phone": resume_data.get("phone"),
            "linkedin": resume_data.get("linkedin"),
            "website": resume_data.get("website"),
            "location": resume_data.get("location", "Philadelphia, PA"),
            "is_authorized_us": "Yes" if resume_data.get("is_authorized_us") else "No",
            "requires_sponsorship": "Yes" if resume_data.get("requires_sponsorship") else "No",
            "gender": resume_data.get("gender"),
            "race": resume_data.get("race"),
            "disability": resume_data.get("disability"),
            "is_veteran": resume_data.get("is_veteran"),
            "sexual_orientation": resume_data.get("sexual_orientation")
        }
        
        # Merge custom learned questions
        custom_q = resume_data.get("custom_questions", {})
        data_to_fill.update(custom_q)
        
        js_code = f"""
        (function() {{
            const mapping = {json.dumps(mapping)};
            const data = {json.dumps(data_to_fill)};
            const customQuestions = {json.dumps(custom_q)};
            
            function fillField(selectors, value) {{
                if (!value) return false;
                if (!Array.isArray(selectors)) selectors = [selectors];
                
                for (const selector of selectors) {{
                    // 1. Try typical input fields
                    let el = document.getElementById(selector) || 
                             document.querySelector(`input[name*="${{selector}}"]`) ||
                             document.querySelector(`input[aria-label*="${{selector}}"]`);
                             
                    // 2. Try select dropdowns
                    if (!el) {{
                        el = document.querySelector(`select[name*="${{selector}}"]`) ||
                             document.querySelector(`select[aria-label*="${{selector}}"]`);
                    }}

                    // 3. Try finding by label text for radio groups or specific text
                    if (!el) {{
                        const labels = Array.from(document.querySelectorAll('label'));
                        const label = labels.find(l => l.textContent.toLowerCase().includes(selector.toLowerCase()));
                        if (label && label.htmlFor) {{
                            el = document.getElementById(label.htmlFor);
                        }} else if (label) {{
                             el = label.querySelector('input') || label.parentElement.querySelector('input') || label.querySelector('select');
                        }}
                    }}
                    
                    if (el) {{
                        if (el.type === 'radio' || el.type === 'checkbox') {{
                             const groupName = el.name;
                             const radios = document.querySelectorAll(`input[name="${{groupName}}"]`);
                             radios.forEach(r => {{
                                 const rLabel = document.querySelector(`label[for="${{r.id}}"]`) || r.parentElement;
                                 if (rLabel.textContent.toLowerCase().includes(value.toLowerCase())) {{
                                     r.click();
                                 }}
                             }});
                        }} else {{
                            el.value = value;
                            el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                            el.dispatchEvent(new Event('change', {{ bubbles: true }}));
                        }}
                        console.log('Processed autofill for:', selector);
                        return true;
                    }}
                }}
                return false;
            }}

            // Fill standard mappings
            for (const [key, selectors] of Object.entries(mapping)) {{
                if (data[key]) {{
                    fillField(selectors, data[key]);
                }}
            }}

            // Fill custom learned questions by searching labels
            const labels = Array.from(document.querySelectorAll('label'));
            labels.forEach(label => {{
                for (const [qText, qAnswer] of Object.entries(customQuestions)) {{
                    if (label.textContent.toLowerCase().includes(qText.toLowerCase())) {{
                        const input = document.getElementById(label.htmlFor) || label.querySelector('input') || label.parentElement.querySelector('input') || label.querySelector('select');
                        if (input) {{
                            fillField([label.textContent], qAnswer);
                        }}
                    }}
                }}
            }});

            return "Enhanced AI Autofill attempt completed";
        }})();
        """
        return js_code
