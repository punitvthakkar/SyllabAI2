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
    const weeksDurationInput = document.getElementById('weeksDuration');
    
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
        const discipline = document.getElementById('discipline').value.trim();
        const teachingStyle = document.getElementById('teachingStyle').value;
        const weeksDuration = weeksDurationInput.value.trim();
        const referenceContent = document.getElementById('referenceContent').value.trim();
        const apiKey = apiKeyInput.value.trim();
        
        // Validate inputs
        if (!courseName || !courseCode || !courseDescription || !discipline) {
            alert('Please fill in the required fields: Course Name, Course Code, Course Description, and Discipline.');
            return;
        }
        
        if (!weeksDuration || weeksDuration <= 0) {
            alert('Please enter a valid duration in weeks.');
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
                discipline,
                teachingStyle,
                weeksDuration,
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
    
    // Map teaching style values to descriptive text
    function getTeachingStyleDescription(style) {
        const styleDescriptions = {
            'lecture': 'Instructor delivers structured content through formal presentations while students take notes. Relies on clear explanations of concepts, organized visuals, and occasional student questions. Best for introducing foundational knowledge and theoretical frameworks to larger groups.',
            'case': 'Students analyze authentic scenarios to apply theoretical concepts to practical situations. Instructor facilitates critical analysis through guided questioning and structured frameworks. Develops problem-solving abilities, critical thinking, and professional judgment through realistic contextual learning.',
            'discussion': 'Instructor poses thought-provoking questions and moderates exchanges between students. Requires preparation of discussion prompts, strategic facilitation techniques, and clear expectations for participation. Builds critical thinking, communication skills, and diverse perspective appreciation.',
            'project': 'Students work individually or collaboratively on complex tasks resulting in tangible outcomes. Instructor provides initial guidance, milestone check-ins, and assessment rubrics. Develops practical skills, time management, and real-world application through sustained engagement with authentic challenges.',
            'flipped': 'Students engage with content independently before class (videos, readings) then participate in interactive activities during class time. Requires careful curation of pre-class materials and well-designed in-class application exercises. Maximizes face-to-face time for higher-order thinking and personalized guidance.',
            'hands-on': 'Students learn through direct manipulation of objects, tools, or processes in specialized environments. Instructor demonstrates techniques, supervises practice, and provides immediate feedback. Develops procedural knowledge, technical skills, and experiential understanding through structured practice.',
            'seminar': 'Students lead substantial portions of instruction through prepared presentations and facilitated discussions of advanced topics. Instructor establishes intellectual framework, provides expert guidance, and ensures scholarly rigor. Develops deep subject mastery, research skills, and professional discourse abilities.',
            'hybrid': 'Learning occurs through deliberate integration of online and in-person components with clear purpose for each modality. Requires thoughtful technology selection, seamless transitions between environments, and consistent engagement across platforms. Combines flexibility of digital learning with richness of face-to-face interaction.'
        };
        
        return styleDescriptions[style] || style;
    }
    
    async function callGeminiAPI({ courseName, courseCode, courseDescription, discipline, teachingStyle, weeksDuration, referenceContent, apiKey }) {
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
        
        const teachingStyleDescription = getTeachingStyleDescription(teachingStyle);
        
       const prompt = `
Generate a professional course syllabus using the following information:

COURSE DETAILS:
- Course Name: ${courseName}
- Course Code: ${courseCode}
- Course Description: ${courseDescription}
- Academic Discipline: ${discipline}
- Teaching Style: ${teachingStyle}
- Duration: ${weeksDuration} weeks
${referenceContent ? `- Reference Content: ${referenceContent}` : ''}

REQUIRED SECTIONS:

1. COURSE HEADER
- Course name and code as main title
- Instructor: [Name], [Title]
- Email: [email@institution.edu]
- Office Hours: [Day/Time] or by appointment
- Course Website: [URL]

2. PURPOSE OF THE COURSE
Write 1-2 paragraphs explaining:
- What the course covers and why it matters
- How it fits within the broader curriculum
- Key skills or knowledge students will gain

3. LEARNING OBJECTIVES
List 4-6 clear, measurable learning objectives using action verbs (analyze, create, evaluate, etc.). Focus on what students will actually be able to do after completing the course.

4. TEACHING METHODS
Describe the pedagogical approach based on the ${teachingStyle} teaching style. Explain what a typical class session looks like and any special requirements (software, equipment, etc.).

5. ASSESSMENT AND GRADING
Create a simple table showing:
- Assessment Type | Weight | Description
Include 3-5 different assessment methods with percentages that add to 100%. Briefly describe each assessment type.

6. COURSE SESSIONS
Create a ${weeksDuration}-session schedule using this format:

Sessions X & Y
[Day], [Date], [Time]
Session Topic: [Descriptive title]
[Brief 2-3 sentence description of what will be covered]
Required Reading: [List 1-3 key readings - use realistic textbook chapters or representative articles for the field]
Optional Reading: [1-2 additional sources if relevant]

Repeat this format for each session, ensuring logical progression of topics.

7. REQUIRED MATERIALS
- List primary textbook(s) with basic citation format
- Mention any required software, equipment, or online resources
- Include typical cost estimates where relevant

8. COURSE POLICIES
Include standard policies for:
- Attendance and participation expectations
- Late assignment policy  
- Academic integrity
- Accommodations for students with disabilities
- Communication expectations

FORMATTING:
- Use clean, simple markdown formatting
- Make section headers bold (**Section Name**)
- Use tables for schedules and assessments
- Keep professional, accessible tone
- Target length: 1,500-2,000 words

CONTENT GUIDELINES:
- Make content appropriate for ${discipline} at the specified academic level
- Ensure session topics build logically from foundational to advanced concepts
- For readings, use realistic examples (major textbooks, well-known journals in the field)
- If you're unsure about specific sources, use format like "Representative textbook: [Course Topic] by [Author]"
- Balance theoretical knowledge with practical application
- Reflect the ${teachingStyle} approach naturally throughout

Create a practical, professional syllabus that serves as a clear roadmap for students and instructors. Focus on clarity and usability over elaborate formatting.
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
                temperature: 1.0,
                maxOutputTokens: 20000,
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
