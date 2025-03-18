document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const toggleApiKeyBtn = document.getElementById('toggleApiKey');
    const apiKeyInput = document.getElementById('apiKey');
    const outputContainer = document.getElementById('outputContainer');
    const outputElement = document.getElementById('output');
    const loadingElement = document.getElementById('loading');
    const copyModal = document.getElementById('copyModal');
    const closeModalBtn = document.getElementById('closeModal');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeAboutModalBtn = document.getElementById('closeAboutModal');
    
    // Check for dark mode preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Load saved API key if available
    if (localStorage.getItem('geminiApiKey')) {
        apiKeyInput.value = localStorage.getItem('geminiApiKey');
    }
    
    // Event Listeners
    darkModeToggle.addEventListener('click', toggleDarkMode);
    generateBtn.addEventListener('click', generateSyllabus);
    copyBtn.addEventListener('click', copySyllabusToClipboard);
    toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
    closeModalBtn.addEventListener('click', () => copyModal.style.display = 'none');
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'flex';
    });
    closeAboutModalBtn.addEventListener('click', () => aboutModal.style.display = 'none');
    
    // API Key input change - save to localStorage
    apiKeyInput.addEventListener('change', () => {
        localStorage.setItem('geminiApiKey', apiKeyInput.value);
    });
    
    // Functions
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    function toggleApiKeyVisibility() {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
            toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            apiKeyInput.type = 'password';
            toggleApiKeyBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
    
    async function generateSyllabus() {
        // Get input values
        const courseName = document.getElementById('courseName').value.trim();
        const courseCode = document.getElementById('courseCode').value.trim();
        const courseDescription = document.getElementById('courseDescription').value.trim();
        const referenceContent = document.getElementById('referenceContent').value.trim();
        const apiKey = apiKeyInput.value.trim();
        
        // Validate inputs
        if (!courseName || !courseCode || !courseDescription) {
            alert('Please fill in the required fields: Course Name, Course Code, and Course Description.');
            return;
        }
        
        if (!apiKey) {
            alert('Please enter your Gemini API Key.');
            return;
        }
        
        // Show loading
        loadingElement.style.display = 'block';
        outputElement.innerHTML = '';
        copyBtn.disabled = true;
        
        try {
            const response = await callGeminiAPI({
                courseName,
                courseCode,
                courseDescription,
                referenceContent,
                apiKey
            });
            
            // Display result
            outputElement.innerHTML = response;
            copyBtn.disabled = false;
        } catch (error) {
            outputElement.innerHTML = `<div class="error">Error: ${error.message}</div>`;
        } finally {
            loadingElement.style.display = 'none';
        }
    }
    
    async function callGeminiAPI({ courseName, courseCode, courseDescription, referenceContent, apiKey }) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
        
        const prompt = `
       Generate a comprehensive academic course syllabus in markdown format for the following course:

Course Name: ${courseName}
Course Code: ${courseCode}
Course Description: ${courseDescription}
Duration: ${weeksDuration}
${referenceContent ? `Reference Content: ${referenceContent}` : ''}

The syllabus should include:
1. Course Information (name, code, credits, semester)
2. Instructor Information (use placeholder info)
3. Course Description
4. Course Objectives/Learning Outcomes
5. Required Materials and Texts (if reference content is minimal [<50 words], generate appropriate scholarly textbooks, academic papers, and case studies that would enhance this course)
6. Course Schedule (detailed weekly breakdown based on number of weeks duration input by user)
7. Assessment Components (include diverse modern evaluation methods such as projects, presentations, participation AND a final examination worth 25-30% of the grade)
8. Course Policies (attendance, late work, etc.)
9. Academic Integrity Statement
10. Accommodation and Accessibility Statement

If reference content is limited, develop a rich, pedagogically sound curriculum that reflects current academic standards in this field.

Use these specific formatting guidelines:
- Main title: Use a single # (H1) followed by the course name and code
- Section headings: Use ## (H2) for all major sections
- Subsection headings: Use ### (H3) for subsections
- Text formatting: Use **bold** for important terms and policies, *italics* for emphasis
- Lists: Use - for unordered lists and 1. for ordered lists with consistent indentation
- Tables: Use standard markdown tables with | delimiters for all tabular content
- Course schedule: Present as a markdown table with columns for Week, Topic, Readings, and Assignments
- Important notices: Highlight with > blockquotes for emphasis
- Links: Use [text](URL) format for any external resources
- Use --- for horizontal rules between major sections

Include notes at the beginning indicating which elements could be colored when formatted in Word (e.g., "Heading 1 could be formatted in dark blue, Heading 2 in medium blue"). Format the syllabus in clean, consistent markdown that will paste into Microsoft Word and be easily formatted with Word's built-in styling tools.
        `;
        
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8192,
            }
        };
        
        try {
            const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }
            
            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response generated. Please try again.');
            }
            
            // Extract the text content from the response
            let textContent = '';
            
            data.candidates[0].content.parts.forEach(part => {
                if (part.text) {
                    textContent += part.text;
                }
            });
            
            return textContent;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    function copySyllabusToClipboard() {
        const textToCopy = outputElement.textContent;
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                copyModal.style.display = 'flex';
            })
            .catch((error) => {
                console.error('Failed to copy text:', error);
                alert('Failed to copy text to clipboard. Please try again or copy manually.');
            });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === copyModal) {
            copyModal.style.display = 'none';
        }
        if (event.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });
});
