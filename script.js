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
        Generate a comprehensive academic course syllabus in PDF-ready markdown format for:

Course Name: ${courseName}
Course Code: ${courseCode}
Course Description: ${courseDescription}
Duration: ${weeksDuration}
${referenceContent ? `Reference Content: ${referenceContent}` : ''}

Structure your syllabus following the ESMT MBA program format with these specific required elements:

# ${courseName}
${courseCode}

[Instructor Name]
[instructor.email@institution.edu]

**Pre-requisite to this course:** [specify or indicate "none"]
**This course is a pre-requisite for:** [specify or indicate "none"]

## Purpose of the course
Expand the provided course description into a compelling 2-3 paragraph introduction that explains why this course matters and how it connects to broader academic/professional contexts. Use an engaging opening quote if appropriate.

## Competencies developed
List 5-7 specific learning objectives using action verbs (analyze, evaluate, create, etc.) that clearly state what students will be able to do upon completing the course. Format as bullet points with clear, measurable outcomes.

## Content
Provide a detailed 2-3 paragraph overview of the course content, organized into logical themes or modules. Explain how the content builds progressively and connects to the competencies.

## Teaching methods
Detail the pedagogical approaches used in the course (lectures, case discussions, simulations, group work, etc.) with approximate time allocations. Specify any special tools, software, or platforms students will need to access.

## Participant evaluation
Create a detailed assessment table with these columns:
- Assessment type
- Deadline/Date
- Weighting (%)
- Group/Individual

Include diverse assessment methods (exams, projects, presentations, participation) with clear weighting. Include detailed descriptions of major assignments. The final exam should be worth 25-30% of the grade.

## Course Sessions
Create a detailed session-by-session breakdown covering the full duration. For each session include:
- Session number and date
- Session topic (bold and descriptive)
- Required reading (with full citations)
- Optional reading (with full citations)
- Study questions or preparation instructions
- Case studies where applicable

For reading materials, if reference content is limited, research and specify appropriate scholarly textbooks, academic papers, and case studies that align with the course topic. Include author, year, title, publisher/journal, and pages where appropriate.

## Bibliography
Compile a comprehensive reading list with complete academic citations following a consistent style (APA, MLA, etc.) organized into:
- Required textbooks
- Required readings
- Optional readings

## Academic Integrity and Policies
Include standard but detailed sections on:
- Plagiarism declaration
- Attendance requirements
- Late submission policies
- Electronic device usage
- Participation expectations
- Accommodation and accessibility

Format the entire syllabus with clean, professional markdown:
- Use # for main title, ## for sections, ### for subsections
- Use bold (**text**) for important terms and policies
- Use tables for structured information (evaluation, schedule)
- Use consistent indentation for lists
- Include page breaks (---) between major sections

The final syllabus should be comprehensive (approximately 2,500-3,500 words), academically rigorous, and follow the patterns seen in exemplary business school syllabi.
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
                temperature: 0.7,
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
