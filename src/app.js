// Global application state
let currentQuestionIndex = 0;
let userResponses = {};
let generatedPlan = null;
let chatOpen = false;

// Question data based on the knowledgebase
const questions = [
    {
        id: 'frequency',
        title: 'How often would you like to ruck?',
        description: 'Choose a frequency that fits your schedule and recovery needs. Beginners often start with 3 days per week.',
        type: 'single-choice',
        options: [
            { value: '3x', label: '3 times per week', icon: 'fas fa-calendar-week', description: 'Ideal for beginners - quality over quantity with ample recovery' },
            { value: '5x', label: '5 times per week', icon: 'fas fa-calendar-alt', description: 'Balanced approach for intermediate fitness levels' },
            { value: '7x', label: '7 times per week', icon: 'fas fa-calendar', description: 'Advanced - requires careful management and recovery planning' }
        ]
    },
    {
        id: 'terrain',
        title: 'What terrain will you primarily ruck on?',
        description: 'Different terrains provide different challenges and benefits for your training.',
        type: 'single-choice',
        options: [
            { value: 'pavement', label: 'Pavement/Sidewalk', icon: 'fas fa-road', description: 'Steady pace tracking, convenient but higher impact' },
            { value: 'trail', label: 'Trails/Nature', icon: 'fas fa-tree', description: 'Lower impact, builds stabilizing muscles, more scenic' },
            { value: 'incline', label: 'Hills/Incline', icon: 'fas fa-mountain', description: 'Maximum intensity, builds leg strength and conditioning' },
            { value: 'mixed', label: 'Mixed Terrain', icon: 'fas fa-route', description: 'Best of all worlds - varied training stimulus' }
        ]
    },
    {
        id: 'bodyWeight',
        title: 'What is your current body weight?',
        description: 'This helps determine your target ruck weight. We use the 150lb rule: under 150lb targets 20lb, over 150lb targets 30lb.',
        type: 'number-input',
        unit: 'lbs',
        min: 80,
        max: 400,
        placeholder: 'Enter your weight'
    },
    {
        id: 'experience',
        title: 'What is your rucking experience level?',
        description: 'This is separate from general fitness - even a very fit runner could be a rucking novice.',
        type: 'single-choice',
        options: [
            { value: 'amateur', label: 'Amateur/New', icon: 'fas fa-seedling', description: 'New to rucking - we\'ll start you easy and build gradually' },
            { value: 'moderate', label: 'Moderate', icon: 'fas fa-walking', description: 'Some rucking or long hiking experience' },
            { value: 'expert', label: 'Expert/Veteran', icon: 'fas fa-medal', description: 'Seasoned rucker with event experience' }
        ]
    },
    {
        id: 'fitness',
        title: 'What is your overall fitness level?',
        description: 'Your baseline activity level helps us adjust the initial training intensity.',
        type: 'single-choice',
        options: [
            { value: 'sedentary', label: 'Sedentary', icon: 'fas fa-couch', description: 'Limited regular exercise' },
            { value: 'moderate', label: 'Moderately Active', icon: 'fas fa-running', description: 'Regular exercise 2-3 times per week' },
            { value: 'fit', label: 'Very Fit', icon: 'fas fa-dumbbell', description: 'Regular intense exercise, strong cardio base' }
        ]
    },
    {
        id: 'health',
        title: 'Do you have any injury or health considerations?',
        description: 'Any joint issues, past injuries, or health concerns that might affect your training intensity.',
        type: 'single-choice',
        options: [
            { value: 'none', label: 'No concerns', icon: 'fas fa-check-circle', description: 'Good to go with standard progression' },
            { value: 'minor', label: 'Minor concerns', icon: 'fas fa-exclamation-triangle', description: 'Some joint stiffness or minor past injuries' },
            { value: 'major', label: 'Significant concerns', icon: 'fas fa-band-aid', description: 'Recent injuries or ongoing health issues' }
        ]
    },
    {
        id: 'goal',
        title: 'What is your primary training goal?',
        description: 'This influences target distances, paces, and training emphasis.',
        type: 'single-choice',
        options: [
            { value: 'fitness', label: 'General Fitness', icon: 'fas fa-heart', description: 'Overall health and wellness improvement' },
            { value: 'weight-loss', label: 'Weight Loss', icon: 'fas fa-weight', description: 'Focus on calorie burn and endurance' },
            { value: 'military', label: 'Military Test Prep', icon: 'fas fa-shield-alt', description: 'Specific distance/time/weight standards' },
            { value: 'event', label: 'GORUCK/Event Prep', icon: 'fas fa-flag-checkered', description: 'Preparing for specific rucking events' }
        ]
    },
    {
        id: 'timeAvailable',
        title: 'How much time can you dedicate per session?',
        description: 'This helps us scale distance and intensity to fit your schedule.',
        type: 'single-choice',
        options: [
            { value: '30-45', label: '30-45 minutes', icon: 'fas fa-clock', description: 'Short, focused sessions' },
            { value: '45-60', label: '45-60 minutes', icon: 'fas fa-clock', description: 'Standard training duration' },
            { value: '60-90', label: '60-90 minutes', icon: 'fas fa-clock', description: 'Extended training sessions' },
            { value: '90+', label: '90+ minutes', icon: 'fas fa-clock', description: 'Long endurance focused training' }
        ]
    },
    {
        id: 'budget',
        title: 'What is your gear budget preference?',
        description: 'We can recommend everything from DIY solutions to premium gear based on your budget.',
        type: 'single-choice',
        options: [
            { value: 'diy', label: 'DIY/Free', icon: 'fas fa-tools', description: 'Use household items and creative solutions' },
            { value: 'under-300', label: 'Under $300', icon: 'fas fa-dollar-sign', description: 'Budget-conscious gear recommendations' },
            { value: 'under-500', label: 'Under $500', icon: 'fas fa-credit-card', description: 'Quality gear investment' },
            { value: 'premium', label: 'Premium', icon: 'fas fa-gem', description: 'Best-in-class equipment' }
        ]
    }
];

// Therapy-like conversation responses
const conversationResponses = {
    frequency: {
        '3x': "Excellent choice! Three times per week is perfect for building a sustainable habit. You'll have quality sessions with proper recovery time.",
        '5x': "Great balance! Five days a week will build excellent consistency while still giving you rest days for recovery.",
        '7x': "Ambitious! Daily rucking can be very effective but requires careful attention to recovery and varying intensity."
    },
    terrain: {
        'pavement': "Perfect for tracking progress and maintaining steady paces. We'll make sure to include tips for reducing impact.",
        'trail': "Wonderful choice! Trail rucking is easier on your joints and builds amazing stabilizing muscles. Plus, nature is the best therapy.",
        'incline': "You're not messing around! Hill training will build incredible strength and conditioning. We'll progress you safely to handle the intensity.",
        'mixed': "The best of all worlds! Varied terrain will prepare you for anything and keep your training interesting."
    },
    goal: {
        'fitness': "Perfect goal! Rucking is one of the most efficient full-body workouts. You'll see amazing improvements in both strength and cardio.",
        'weight-loss': "Excellent choice! Rucking burns up to 3x more calories than walking. Combined with proper progression, you'll see great results.",
        'military': "Roger that! We'll structure your plan to meet specific military standards with targeted distance and weight progressions.",
        'event': "Outstanding! Event training requires specific preparation. We'll make sure you're ready for whatever challenges come your way."
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('RuckingStart app initialized');
    showScreen('welcome');
});

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Start the assessment
function startAssessment() {
    showScreen('assessment');
    currentQuestionIndex = 0;
    userResponses = {};
    loadQuestion();
    updateProgress();
}

// Load current question
function loadQuestion() {
    const question = questions[currentQuestionIndex];
    const container = document.getElementById('questionContainer');
    
    let optionsHtml = '';
    
    if (question.type === 'single-choice') {
        optionsHtml = `
            <div class="question-options">
                ${question.options.map(option => `
                    <button class="option-button" onclick="selectOption('${option.value}', this)">
                        <i class="${option.icon}"></i>
                        <div>
                            <div style="font-weight: 600;">${option.label}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.2rem;">${option.description}</div>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;
    } else if (question.type === 'number-input') {
        optionsHtml = `
            <div class="input-group">
                <label for="numberInput">${question.title}</label>
                <input type="number" id="numberInput" min="${question.min}" max="${question.max}" 
                       placeholder="${question.placeholder}" onchange="handleNumberInput(this.value)">
                <small>Range: ${question.min} - ${question.max} ${question.unit}</small>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="question">
            <h3>${question.title}</h3>
            <p>${question.description}</p>
            ${optionsHtml}
        </div>
    `;
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Add conversational message
    if (currentQuestionIndex > 0) {
        addChatMessage(getConversationalResponse(), 'assistant');
    }
}

// Handle option selection
function selectOption(value, button) {
    // Remove selection from other buttons
    document.querySelectorAll('.option-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Select current button
    button.classList.add('selected');
    
    // Store response
    const questionId = questions[currentQuestionIndex].id;
    userResponses[questionId] = value;
    
    // Enable next button
    document.getElementById('nextButton').disabled = false;
}

// Handle number input
function handleNumberInput(value) {
    const questionId = questions[currentQuestionIndex].id;
    userResponses[questionId] = parseInt(value);
    
    // Enable next button if value is valid
    const question = questions[currentQuestionIndex];
    const isValid = value && value >= question.min && value <= question.max;
    document.getElementById('nextButton').disabled = !isValid;
}

// Get conversational response based on previous answer
function getConversationalResponse() {
    if (currentQuestionIndex === 0) return null;
    
    const prevQuestion = questions[currentQuestionIndex - 1];
    const prevResponse = userResponses[prevQuestion.id];
    
    if (conversationResponses[prevQuestion.id] && conversationResponses[prevQuestion.id][prevResponse]) {
        return conversationResponses[prevQuestion.id][prevResponse];
    }
    
    return "Thanks for that information! Let's continue building your perfect plan.";
}

// Navigation functions
function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion();
        updateProgress();
    } else {
        // Assessment complete - generate plan
        generatePlan();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
        updateProgress();
    }
}

// Update progress bar and navigation buttons
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = questions.length;
    
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    
    prevButton.disabled = currentQuestionIndex === 0;
    
    // Check if current question is answered
    const questionId = questions[currentQuestionIndex].id;
    const isAnswered = userResponses.hasOwnProperty(questionId);
    nextButton.disabled = !isAnswered;
    
    // Update button text for last question
    if (currentQuestionIndex === questions.length - 1) {
        nextButton.innerHTML = 'Generate Plan <i class="fas fa-magic"></i>';
    } else {
        nextButton.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    }
}

// Plan generation
function generatePlan() {
    showScreen('generating');
    
    // Simulate plan generation with loading steps
    const steps = ['step1', 'step2', 'step3', 'step4'];
    const messages = [
        'Analyzing your fitness profile...',
        'Calculating weight progression...',
        'Building your weekly schedule...',
        'Finalizing your custom plan...'
    ];
    
    let currentStep = 0;
    
    const stepInterval = setInterval(() => {
        if (currentStep < steps.length) {
            // Deactivate previous step
            if (currentStep > 0) {
                document.getElementById(steps[currentStep - 1]).classList.remove('active');
            }
            
            // Activate current step
            document.getElementById(steps[currentStep]).classList.add('active');
            document.getElementById('loadingMessage').textContent = messages[currentStep];
            
            currentStep++;
        } else {
            clearInterval(stepInterval);
            
            // Generate the actual plan
            generatedPlan = createPersonalizedPlan();
            
            setTimeout(() => {
                showEmailGate();
            }, 1000);
        }
    }, 1500);
}

// Create personalized plan based on user responses
function createPersonalizedPlan() {
    const responses = userResponses;
    
    // Calculate target weight based on body weight
    const targetWeight = responses.bodyWeight < 150 ? 20 : 30;
    const startWeight = responses.experience === 'amateur' ? 10 : 
                       responses.experience === 'moderate' ? 15 : 20;
    
    // Calculate weekly progression
    const weeklyProgression = generateWeeklyProgression(responses);
    
    // Generate gear recommendations
    const gearRecommendations = generateGearRecommendations(responses);
    
    // Create plan summary
    const planSummary = {
        frequency: responses.frequency,
        terrain: responses.terrain,
        startWeight: startWeight,
        targetWeight: targetWeight,
        duration: '12 weeks',
        goal: responses.goal
    };
    
    return {
        summary: planSummary,
        weeklyProgression: weeklyProgression,
        gearRecommendations: gearRecommendations,
        responses: responses
    };
}

// Generate weekly progression based on user inputs
function generateWeeklyProgression(responses) {
    const weeks = [];
    const frequency = parseInt(responses.frequency.replace('x', ''));
    const startWeight = responses.experience === 'amateur' ? 10 : 
                       responses.experience === 'moderate' ? 15 : 20;
    const targetWeight = responses.bodyWeight < 150 ? 20 : 30;
    
    for (let week = 1; week <= 12; week++) {
        // Progressive weight increase
        let weekWeight = startWeight + Math.floor((week - 1) * (targetWeight - startWeight) / 11);
        weekWeight = Math.min(weekWeight, targetWeight);
        
        // Progressive distance increase
        let baseDistance = responses.timeAvailable === '30-45' ? 1.5 :
                          responses.timeAvailable === '45-60' ? 2 :
                          responses.timeAvailable === '60-90' ? 3 : 4;
        
        if (responses.experience === 'amateur') baseDistance *= 0.8;
        if (responses.fitness === 'sedentary') baseDistance *= 0.8;
        
        const weekDistance = Math.round((baseDistance + (week - 1) * 0.3) * 100) / 100;
        
        // Generate weekly schedule
        const schedule = generateWeeklySchedule(frequency, weekWeight, weekDistance, week, responses);
        
        weeks.push({
            week: week,
            weight: weekWeight,
            distance: Math.round(weekDistance * 10) / 10,
            schedule: schedule,
            focus: getWeeklyFocus(week, responses)
        });
    }
    
    return weeks;
}

// Generate weekly schedule based on frequency
function generateWeeklySchedule(frequency, weight, distance, week, responses) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = {};
    
    // Initialize all days as rest
    days.forEach(day => {
        schedule[day] = { type: 'rest', activity: 'Rest Day' };
    });
    
    if (frequency === 3) {
        schedule['Monday'] = { type: 'ruck', activity: `${parseFloat(distance.toFixed(2))} miles @ ${weight}lbs`, intensity: 'moderate' };
        schedule['Wednesday'] = { type: 'ruck', activity: `${parseFloat((distance * 0.8).toFixed(2))} miles @ ${weight}lbs`, intensity: 'easy' };
        schedule['Saturday'] = { type: 'ruck', activity: `${parseFloat((distance * 1.2).toFixed(2))} miles @ ${weight}lbs`, intensity: 'long' };
    } else if (frequency === 5) {
        schedule['Monday'] = { type: 'ruck', activity: `${parseFloat((distance * 0.8).toFixed(2))} miles @ ${weight}lbs`, intensity: 'easy' };
        schedule['Tuesday'] = { type: 'ruck', activity: `${parseFloat((distance * 0.6).toFixed(2))} miles @ ${Math.round(weight * 0.8)}lbs`, intensity: 'recovery' };
        schedule['Wednesday'] = { type: 'ruck', activity: `${parseFloat(distance.toFixed(2))} miles @ ${weight}lbs`, intensity: 'moderate' };
        schedule['Friday'] = { type: 'ruck', activity: `${parseFloat((distance * 0.7).toFixed(2))} miles @ ${weight}lbs`, intensity: 'moderate' };
        schedule['Saturday'] = { type: 'ruck', activity: `${parseFloat((distance * 1.3).toFixed(2))} miles @ ${weight}lbs`, intensity: 'long' };
    } else if (frequency === 7) {
        days.forEach((day, index) => {
            if (index % 2 === 0) {
                schedule[day] = { type: 'ruck', activity: `${parseFloat((distance * 0.8).toFixed(2))} miles @ ${weight}lbs`, intensity: 'moderate' };
            } else {
                schedule[day] = { type: 'ruck', activity: `${parseFloat((distance * 0.5).toFixed(2))} miles @ ${Math.round(weight * 0.7)}lbs`, intensity: 'recovery' };
            }
        });
        // Make Sunday the long ruck
        schedule['Sunday'] = { type: 'ruck', activity: `${parseFloat((distance * 1.2).toFixed(2))} miles @ ${weight}lbs`, intensity: 'long' };
    }
    
    return schedule;
}

// Get weekly focus based on progression
function getWeeklyFocus(week, responses) {
    if (week <= 2) return 'Form and adaptation';
    if (week <= 4) return 'Building base endurance';
    if (week <= 6) return 'Increasing load capacity';
    if (week <= 8) return 'Distance progression';
    if (week === 9) return 'Recovery and assessment';
    if (week <= 11) return 'Peak training';
    return 'Test and celebration';
}

// Generate gear recommendations based on budget and preferences
function generateGearRecommendations(responses) {
    const budget = responses.budget;
    const targetWeight = responses.bodyWeight < 150 ? 20 : 30;
    
    const recommendations = {
        backpack: [],
        weight: [],
        footwear: [],
        accessories: []
    };
    
    // Backpack recommendations
    if (budget === 'diy') {
        recommendations.backpack.push({
            name: 'Any sturdy backpack you own',
            price: 'Free',
            description: 'Start with what you have - school or hiking backpack works great initially'
        });
    } else if (budget === 'under-300') {
        recommendations.backpack.push({
            name: 'Military Surplus ALICE Pack',
            price: '$50-80',
            description: 'Durable, time-tested design with frame support'
        });
        recommendations.backpack.push({
            name: '5.11 RUSH Series',
            price: '$150-200',
            description: 'Modern tactical pack with excellent organization'
        });
    } else {
        recommendations.backpack.push({
            name: 'GORUCK GR1 or Rucker',
            price: '$300-400',
            description: 'Premium rucking pack with lifetime warranty'
        });
    }
    
    // Weight recommendations
    if (budget === 'diy') {
        recommendations.weight.push({
            name: 'Sand in ziplock bags',
            price: '$0.10/lb',
            description: 'Cheapest option - 50lb bag of play sand for ~$5'
        });
        recommendations.weight.push({
            name: 'Bricks (wrapped in duct tape)',
            price: '$0.10/lb',
            description: 'Standard house bricks ~$0.50 each (4-5 lbs each)'
        });
        recommendations.weight.push({
            name: 'Water jugs',
            price: 'Free',
            description: 'Adjustable weight - can dump water if needed'
        });
    } else {
        recommendations.weight.push({
            name: 'Ruck Plates (GORUCK/Rogue)',
            price: '$2-3/lb',
            description: `${targetWeight}lb plate for ${targetWeight < 25 ? '$50-60' : '$70-80'}`
        });
        recommendations.weight.push({
            name: 'Standard weight plates',
            price: '$1-2/lb',
            description: 'Gym weight plates wrapped in towels'
        });
    }
    
    // Footwear recommendations
    recommendations.footwear.push({
        name: 'Your current athletic shoes',
        price: 'Free',
        description: 'Start with comfortable, broken-in shoes you own'
    });
    recommendations.footwear.push({
        name: 'Trail running shoes',
        price: '$80-150',
        description: 'Better grip and support for varied terrain'
    });
    recommendations.footwear.push({
        name: 'Light hiking boots',
        price: '$100-200',
        description: 'Maximum support and protection for heavy loads'
    });
    
    // Accessories
    recommendations.accessories.push({
        name: 'Merino wool socks',
        price: '$15-25/pair',
        description: 'Moisture-wicking, blister prevention'
    });
    recommendations.accessories.push({
        name: 'Hydration bladder',
        price: '$20-40',
        description: 'Hands-free hydration during longer rucks'
    });
    recommendations.accessories.push({
        name: 'Foam padding',
        price: '$10-15',
        description: 'Cushion for hard weights against your back'
    });
    
    return recommendations;
}

// Show results screen
function showResults() {
    showScreen('results');
    displayPlanSummary();
    // Auto-select overview tab
    document.querySelector('.tab-button').classList.add('active');
    showOverviewTab();
}

// Display plan summary
function displayPlanSummary() {
    const summary = generatedPlan.summary;
    const summaryContainer = document.getElementById('planSummary');
    
    summaryContainer.innerHTML = `
        <div class="summary-item">
            <span class="value">${summary.frequency}</span>
            <span class="label">per week</span>
        </div>
        <div class="summary-item">
            <span class="value">${summary.startWeight}→${summary.targetWeight}lb</span>
            <span class="label">weight progression</span>
        </div>
        <div class="summary-item">
            <span class="value">${summary.terrain}</span>
            <span class="label">terrain focus</span>
        </div>
        <div class="summary-item">
            <span class="value">${summary.duration}</span>
            <span class="label">program length</span>
        </div>
    `;
}

// Tab management
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Show tab content
    const tabContent = document.getElementById('tabContent');
    
    switch(tabName) {
        case 'overview':
            showOverviewTab();
            break;
        case 'schedule':
            showScheduleTab();
            break;
        case 'gear':
            showGearTab();
            break;
        case 'tips':
            showTipsTab();
            break;
    }
}

// Show overview tab
function showOverviewTab() {
    const tabContent = document.getElementById('tabContent');
    const plan = generatedPlan;
    
    tabContent.innerHTML = `
        <div class="overview-content">
            <h3>Your Personalized Training Plan</h3>
            <p>Based on your responses, we've created a comprehensive 12-week program that will safely progress you from your current level to confidently completing weighted hikes. Here's what makes your plan special:</p>
            
            <div class="plan-highlights">
                <div class="highlight-card">
                    <i class="fas fa-target"></i>
                    <h4>Progressive Overload</h4>
                    <p>Starting at ${plan.summary.startWeight}lbs and building to ${plan.summary.targetWeight}lbs over 12 weeks using safe 10% weekly increases.</p>
                </div>
                <div class="highlight-card">
                    <i class="fas fa-clipboard-list"></i>
                    <h4>Summary</h4>
                    <p>Safe progression following exercise science principles with built-in recovery and deload weeks.</p>
                </div>
                <div class="highlight-card">
                    <i class="fas fa-calendar-check"></i>
                    <h4>Flexible Schedule</h4>
                    <p>Your ${plan.summary.frequency} per week schedule fits your lifestyle while building consistency and allowing proper recovery.</p>
                </div>
                <div class="highlight-card">
                    <i class="fas fa-route"></i>
                    <h4>Terrain Optimized</h4>
                    <p>Training designed for ${plan.summary.terrain} with specific tips and techniques for your preferred environment.</p>
                </div>
                <div class="highlight-card">
                    <i class="fas fa-bullseye"></i>
                    <h4>Goal Focused</h4>
                    <p>Every session is designed to support your ${plan.summary.goal} goal with appropriate intensity and volume.</p>
                </div>
            </div>
            
            <div class="weekly-progression-preview">
                <h4>Weekly Progression Overview</h4>
                <div class="progression-chart-container">
                    <div class="progression-chart">
                        ${plan.weeklyProgression.map(week => `
                            <div class="week-preview">
                                <strong>Week ${week.week}</strong>
                                <div>${week.weight}lbs</div>
                                <div>${parseFloat(week.distance.toFixed(2))}mi</div>
                                <small>${week.focus}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Show schedule tab
function showScheduleTab() {
    const tabContent = document.getElementById('tabContent');
    const weeks = generatedPlan.weeklyProgression;
    
    tabContent.innerHTML = `
        <div class="schedule-content">
            <h3>12-Week Training Schedule</h3>
            <p>Your complete week-by-week progression. Click on any week to see the detailed daily schedule.</p>
            
            <div class="weeks-container">
                ${weeks.map((week, index) => `
                    <div class="week-card ${index === 0 ? 'expanded' : ''}" onclick="toggleWeek(${index})">
                        <div class="week-header">
                            <h4>Week ${week.week}: ${week.focus}</h4>
                            <div class="week-stats">
                                <span class="stat">${week.weight}lbs</span>
                                <span class="stat">${week.distance}mi avg</span>
                            </div>
                            <i class="fas fa-chevron-down toggle-icon"></i>
                        </div>
                        <div class="week-details">
                            <div class="weekly-calendar">
                                ${Object.entries(week.schedule).map(([day, activity]) => `
                                    <div class="day-card ${activity.type === 'ruck' ? 'active' : ''}">
                                        <div class="day-name">${day.substring(0, 3)}</div>
                                        <div class="day-activity ${activity.type === 'rest' ? 'rest-day' : ''}">
                                            ${activity.activity}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            ${week.week <= 4 ? '<div class="week-note"><strong>Focus:</strong> Form and base building</div>' :
                              week.week <= 8 ? '<div class="week-note"><strong>Focus:</strong> Progressive overload</div>' :
                              week.week === 9 ? '<div class="week-note"><strong>Focus:</strong> Recovery week - reduce intensity</div>' :
                              '<div class="week-note"><strong>Focus:</strong> Peak performance and testing</div>'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Show gear tab
function showGearTab() {
    const tabContent = document.getElementById('tabContent');
    const gear = generatedPlan.gearRecommendations;
    
    tabContent.innerHTML = `
        <div class="gear-content">
            <h3>Gear Recommendations</h3>
            <p>Based on your ${userResponses.budget} budget preference, here are the best options to get you started:</p>
            
            ${Object.entries(gear).map(([category, items]) => `
                <div class="gear-category">
                    <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div class="gear-items">
                        ${items.map(item => `
                            <div class="gear-item">
                                <h4>${item.name}</h4>
                                <div class="price">${item.price}</div>
                                <p>${item.description}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
            
            <div class="gear-tips">
                <h4>💡 Pro Tips</h4>
                <ul>
                    <li><strong>Start Simple:</strong> You can begin rucking today with any backpack and household items for weight</li>
                    <li><strong>Prioritize Fit:</strong> A well-fitting pack is more important than expensive features</li>
                    <li><strong>Break It In:</strong> Test all gear on shorter rucks before committing to long distances</li>
                    <li><strong>Safety First:</strong> Invest in good socks and footwear to prevent blisters and injuries</li>
                </ul>
            </div>
        </div>
    `;
}

// Show tips tab
function showTipsTab() {
    const tabContent = document.getElementById('tabContent');
    
    tabContent.innerHTML = `
        <div class="tips-content">
            <h3>Success Tips & Progress Tracking</h3>
            
            <div class="tips-section">
                <h4>🎯 Keys to Success</h4>
                <div class="tips-grid">
                    <div class="tip-card">
                        <i class="fas fa-chart-line"></i>
                        <h5>Consistency Over Intensity</h5>
                        <p>Better to ruck regularly with lighter weight than sporadically with heavy weight.</p>
                    </div>
                    <div class="tip-card">
                        <i class="fas fa-ear-listen"></i>
                        <h5>Listen to Your Body</h5>
                        <p>Soreness is normal, sharp pain is not. Take extra rest days if needed.</p>
                    </div>
                    <div class="tip-card">
                        <i class="fas fa-clipboard-check"></i>
                        <h5>Track Your Progress</h5>
                        <p>Log each session - distance, weight, how you felt. You'll be amazed at your progress!</p>
                    </div>
                    <div class="tip-card">
                        <i class="fas fa-utensils"></i>
                        <h5>Fuel Properly</h5>
                        <p>Rucking burns 3x more calories than walking. Eat protein for recovery, carbs for energy.</p>
                    </div>
                </div>
            </div>
            
            <div class="progress-tracking">
                <h4>📊 Track Your Progress</h4>
                <p>Use this simple tracking method for each ruck session:</p>
                <div class="tracking-template">
                    <div class="track-item">📅 <strong>Date:</strong> ___________</div>
                    <div class="track-item">⚖️ <strong>Weight:</strong> _______ lbs</div>
                    <div class="track-item">📏 <strong>Distance:</strong> _______ miles</div>
                    <div class="track-item">⏱️ <strong>Time:</strong> _______ minutes</div>
                    <div class="track-item">🌡️ <strong>Weather:</strong> ___________</div>
                    <div class="track-item">😊 <strong>How I felt (1-10):</strong> _____</div>
                    <div class="track-item">📝 <strong>Notes:</strong> ___________</div>
                </div>
            </div>
            
            <div class="form-tips">
                <h4>🏃‍♂️ Perfect Your Form</h4>
                <ul>
                    <li><strong>Posture:</strong> Stand tall, shoulders back, core engaged</li>
                    <li><strong>Pack Position:</strong> High and tight against your back</li>
                    <li><strong>Foot Strike:</strong> Land on mid-foot, not heel</li>
                    <li><strong>Breathing:</strong> Steady rhythm, breathe through your nose when possible</li>
                    <li><strong>Hydration:</strong> Drink before you feel thirsty</li>
                </ul>
            </div>
            
            <div class="milestone-rewards">
                <h4>🏆 Celebrate Milestones</h4>
                <div class="milestones">
                    <div class="milestone">
                        <strong>Week 2:</strong> First 2-mile ruck completed!
                    </div>
                    <div class="milestone">
                        <strong>Week 4:</strong> One month of consistency!
                    </div>
                    <div class="milestone">
                        <strong>Week 6:</strong> Halfway to target weight!
                    </div>
                    <div class="milestone">
                        <strong>Week 8:</strong> 2/3 complete - you're crushing it!
                    </div>
                    <div class="milestone">
                        <strong>Week 12:</strong> Program complete - you're now a certified rucker! 🎉
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Toggle week expansion in schedule
function toggleWeek(weekIndex) {
    const weekCard = document.querySelectorAll('.week-card')[weekIndex];
    weekCard.classList.toggle('expanded');
}

// Chat functionality
function openChat() {
    document.getElementById('chatAssistant').classList.add('active');
    document.getElementById('chatFab').classList.add('hidden');
    chatOpen = true;
}

function toggleChat() {
    document.getElementById('chatAssistant').classList.remove('active');
    document.getElementById('chatFab').classList.remove('hidden');
    chatOpen = false;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (message) {
        addChatMessage(message, 'user');
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            const response = generateChatResponse(message);
            addChatMessage(response, 'assistant');
        }, 1000);
    }
}

function addChatMessage(message, sender) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}`;
    messageElement.innerHTML = `<div class="message-content">${message}</div>`;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function generateChatResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('weight') || lowerMessage.includes('heavy')) {
        return "Great question about weight! Remember, we follow the body weight rule: under 150lbs targets 20lbs, over 150lbs targets 30lbs. Start lighter and build gradually - your body needs time to adapt to the load.";
    } else if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        return "I'm sorry to hear you're experiencing discomfort. It's important to distinguish between muscle soreness (normal) and sharp pain (concerning). If you have sharp or persistent pain, please consider taking an extra rest day and consult a healthcare provider if needed.";
    } else if (lowerMessage.includes('gear') || lowerMessage.includes('backpack')) {
        return "For gear, start with what you have! Any sturdy backpack can work initially. Focus on proper fit and weight distribution. Check the Gear Guide tab for budget-specific recommendations.";
    } else if (lowerMessage.includes('schedule') || lowerMessage.includes('time')) {
        return "Your schedule is designed to be flexible! If you miss a day, just pick up where you left off. Consistency matters more than perfection. The most important thing is to keep moving forward.";
    } else {
        return "I'm here to help with any questions about your rucking journey! Feel free to ask about training, gear, technique, or anything else. Remember, every expert was once a beginner - you've got this!";
    }
}

// Action button functions
function downloadPDF() {
    // Generate a unique plan ID
    const planId = generatePlanId();
    
    // Create HTML content for PDF generation
    const htmlContent = generatePDFHTML();
    
    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Trigger print dialog which allows saving as PDF
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
    
    // Show success message
    addChatMessage("PDF generation window opened! Use your browser's print dialog to save as PDF.", 'assistant');
    if (!chatOpen) openChat();
}

function getShareableLink() {
    const shareLink = generatedPlan.publicUrl || `${window.location.origin}${window.location.pathname}?plan=${generatedPlan.id}&token=${generatedPlan.accessToken}`;
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('shareModal').classList.add('active');
}

function addToCalendar() {
    const planId = generatePlanId();
    const calendarUrl = `https://ruckingstart.com/calendar/${planId}`;
    
    // Open calendar subscription in new tab
    window.open(calendarUrl, '_blank');
    
    addChatMessage("Calendar link generated! You can subscribe to this calendar to get daily reminders and sync with your devices.", 'assistant');
    if (!chatOpen) openChat();
}

// Utility functions
function generatePlanId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generatePDFHTML() {
    const plan = generatedPlan;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>RuckingStart 12-Week Plan</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #3498db; }
        .summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .week { margin: 20px 0; padding: 15px; border: 1px solid #e9ecef; border-radius: 5px; }
        .schedule { margin: 10px 0; }
        .day { margin: 5px 0; padding: 5px; background: #f1f3f4; border-radius: 3px; }
        .gear-category { margin: 15px 0; }
        .gear-item { margin: 8px 0; padding: 8px; background: #f8f9fa; border-left: 3px solid #3498db; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <h1>🏔️ RuckingStart 12-Week Personalized Training Plan</h1>
    
    <div class="summary">
        <h2>Plan Summary</h2>
        <p><strong>Frequency:</strong> ${plan.summary.frequency} per week</p>
        <p><strong>Terrain:</strong> ${plan.summary.terrain}</p>
        <p><strong>Weight Progression:</strong> ${plan.summary.startWeight}lbs → ${plan.summary.targetWeight}lbs</p>
        <p><strong>Goal:</strong> ${plan.summary.goal}</p>
        <p><strong>Duration:</strong> 12 weeks</p>
    </div>
    
    <h2>📅 Weekly Progression</h2>
    ${plan.weeklyProgression.map(week => `
        <div class="week">
            <h3>Week ${week.week}: ${week.focus}</h3>
            <p><strong>Target Weight:</strong> ${week.weight}lbs | <strong>Average Distance:</strong> ${parseFloat(week.distance.toFixed(2))} miles</p>
            <div class="schedule">
                <strong>Weekly Schedule:</strong>
                ${Object.entries(week.schedule).map(([day, activity]) => `
                    <div class="day"><strong>${day}:</strong> ${activity.activity}</div>
                `).join('')}
            </div>
        </div>
    `).join('')}
    
    <h2>🎒 Gear Recommendations</h2>
    ${Object.entries(plan.gearRecommendations).map(([category, items]) => `
        <div class="gear-category">
            <h3>${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
            ${items.map(item => `
                <div class="gear-item">
                    <strong>${item.name}</strong> (${item.price})<br>
                    ${item.description}
                </div>
            `).join('')}
        </div>
    `).join('')}
    
    <div style="margin-top: 40px; padding: 20px; background: #e8f4f8; border-radius: 8px;">
        <p><strong>Remember:</strong> Consistency is key! Listen to your body and adjust as needed.</p>
        <p><em>Generated by RuckingStart - Your personalized path to rucking excellence.</em></p>
    </div>
</body>
</html>
    `;
}

function copyLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    
    // Show feedback
    const copyButton = document.querySelector('.copy-button');
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        copyButton.innerHTML = originalText;
    }, 2000);
}

function shareOnFacebook() {
    const shareUrl = document.getElementById('shareLink').value;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

function shareOnTwitter() {
    const shareUrl = document.getElementById('shareLink').value;
    const text = "Check out my personalized 12-week rucking plan from RuckingStart!";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn() {
    const shareUrl = document.getElementById('shareLink').value;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Feedback form functionality
function openFeedbackForm() {
    document.getElementById('feedbackModal').classList.add('active');
    // Reset form
    document.getElementById('feedbackForm').reset();
    document.querySelector('input[name="feedbackType"][value="feedback"]').checked = true;
    document.getElementById('feedbackForm').style.display = 'block';
    document.getElementById('feedbackSuccess').style.display = 'none';
}

function submitFeedback(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const feedbackData = {
        type: formData.get('feedbackType'),
        name: document.getElementById('feedbackName').value || 'Anonymous',
        email: document.getElementById('feedbackEmail').value || '',
        message: document.getElementById('feedbackMessage').value,
        timestamp: new Date().toISOString(),
        planId: generatedPlan ? generatedPlan.id : null
    };
    
    // Simulate form submission (in a real app, this would be sent to a server)
    setTimeout(() => {
        console.log('Feedback submitted:', feedbackData);
        
        // Show success message
        document.getElementById('feedbackForm').style.display = 'none';
        document.getElementById('feedbackSuccess').style.display = 'block';
        
        // Store feedback locally for demo purposes
        const existingFeedback = JSON.parse(localStorage.getItem('ruckingStartFeedback') || '[]');
        existingFeedback.push(feedbackData);
        localStorage.setItem('ruckingStartFeedback', JSON.stringify(existingFeedback));
        
    }, 1000);
}

// Add event listeners
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('chatInput') === document.activeElement) {
        sendMessage();
    }
});

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('feedbackForm').addEventListener('submit', submitFeedback);
    document.getElementById('emailCaptureForm').addEventListener('submit', submitEmailCapture);
    
    // Set today's date as default in progress tracker
    document.getElementById('trackDate').value = new Date().toISOString().split('T')[0];
    loadProgressHistory();
    
    // Check if user is accessing via email link
    checkForDirectPlanAccess();
});

// Weight Calculator Functions
function openWeightCalculator() {
    document.getElementById('weightCalculatorModal').classList.add('active');
    document.getElementById('weightResults').style.display = 'none';
}

function calculateWeight() {
    const bodyWeight = parseFloat(document.getElementById('calcBodyWeight').value);
    const experience = document.getElementById('calcExperience').value;
    
    if (!bodyWeight || bodyWeight < 80 || bodyWeight > 400) {
        alert('Please enter a valid body weight between 80-400 lbs');
        return;
    }
    
    // Apply the 150lb rule and experience adjustments
    let baseWeight = bodyWeight < 150 ? 20 : 30;
    
    // Adjust for experience
    if (experience === 'beginner') {
        baseWeight = Math.max(baseWeight * 0.6, 10); // Reduce by 40%, minimum 10lbs
    } else if (experience === 'advanced') {
        baseWeight = Math.min(baseWeight * 1.2, bodyWeight * 0.33); // Increase by 20%, max 1/3 body weight
    }
    
    const recommendedWeight = Math.round(baseWeight);
    
    // Update display
    document.getElementById('recommendedWeight').textContent = recommendedWeight;
    
    let explanation = `Based on your ${bodyWeight}lb body weight and ${experience} experience level. `;
    if (bodyWeight < 150) {
        explanation += "Following the 150lb rule for lighter individuals.";
    } else {
        explanation += "Following standard weight progression for your size.";
    }
    
    document.getElementById('weightExplanation').textContent = explanation;
    
    // Generate weight options
    generateWeightOptions(recommendedWeight);
    
    document.getElementById('weightResults').style.display = 'block';
}

function generateWeightOptions(targetWeight) {
    const options = [
        {
            name: 'Sand (DIY)',
            cost: '$5-10',
            description: 'Cheapest option. Use sand in ziplock bags or old socks. Easy to adjust weight.',
            costPerPound: 0.25
        },
        {
            name: 'Bricks (DIY)',
            cost: '$15-25',
            description: 'Hardware store bricks wrapped in towels. Durable but harder to adjust.',
            costPerPound: 0.75
        },
        {
            name: 'Water Bottles',
            cost: '$0-5',
            description: 'Free if you have bottles. Easy to adjust but can leak or freeze.',
            costPerPound: 0.15
        },
        {
            name: 'Weight Plates',
            cost: '$40-80',
            description: 'Professional option. Precise weights, durable, but more expensive.',
            costPerPound: 2.50
        },
        {
            name: 'Ruck Plates',
            cost: '$60-120',
            description: 'Purpose-built for rucking. Best fit and comfort, premium price.',
            costPerPound: 4.00
        }
    ];
    
    const optionsHTML = options.map(option => `
        <div class="weight-option">
            <h5>${option.name}</h5>
            <div class="cost">${option.cost}</div>
            <p>${option.description}</p>
            <small>~$${(option.costPerPound * targetWeight).toFixed(2)} for ${targetWeight}lbs</small>
        </div>
    `).join('');
    
    document.getElementById('weightOptions').innerHTML = optionsHTML;
}

// Progress Tracker Functions
function openProgressTracker() {
    document.getElementById('progressTrackerModal').classList.add('active');
    loadProgressHistory();
}

function logProgress() {
    const date = document.getElementById('trackDate').value;
    const weight = parseFloat(document.getElementById('trackWeight').value);
    const distance = parseFloat(document.getElementById('trackDistance').value);
    const time = document.getElementById('trackTime').value;
    const notes = document.getElementById('trackNotes').value;
    
    if (!date || !weight || !distance) {
        alert('Please fill in date, weight, and distance');
        return;
    }
    
    const progressEntry = {
        date,
        weight,
        distance,
        time,
        notes,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const existingProgress = JSON.parse(localStorage.getItem('ruckingProgress') || '[]');
    existingProgress.unshift(progressEntry); // Add to beginning
    existingProgress.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date desc
    localStorage.setItem('ruckingProgress', JSON.stringify(existingProgress));
    
    // Clear form
    document.getElementById('trackWeight').value = '';
    document.getElementById('trackDistance').value = '';
    document.getElementById('trackTime').value = '';
    document.getElementById('trackNotes').value = '';
    document.getElementById('trackDate').value = new Date().toISOString().split('T')[0];
    
    // Refresh history
    loadProgressHistory();
    
    alert('Progress logged successfully!');
}

function loadProgressHistory() {
    const progress = JSON.parse(localStorage.getItem('ruckingProgress') || '[]');
    const progressList = document.getElementById('progressList');
    
    if (progress.length === 0) {
        progressList.innerHTML = `
            <div class="no-progress">
                <i class="fas fa-chart-line"></i>
                <p>Start logging your rucks to see your progress here!</p>
            </div>
        `;
        return;
    }
    
    const progressHTML = progress.map(entry => {
        const pace = entry.time ? ` • ${entry.time}` : '';
        const notesHTML = entry.notes ? `<div class="progress-notes">"${entry.notes}"</div>` : '';
        
        return `
            <div class="progress-entry">
                <div class="date">${formatDate(entry.date)}</div>
                <div class="progress-stats">
                    <div class="progress-stat">
                        <i class="fas fa-weight-hanging"></i>
                        <span>${entry.weight}lbs</span>
                    </div>
                    <div class="progress-stat">
                        <i class="fas fa-route"></i>
                        <span>${entry.distance}mi</span>
                    </div>
                    ${entry.time ? `<div class="progress-stat"><i class="fas fa-clock"></i><span>${entry.time}</span></div>` : ''}
                </div>
                ${notesHTML}
            </div>
        `;
    }).join('');
    
    progressList.innerHTML = progressHTML;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Community Links Function
function openCommunityLinks() {
    document.getElementById('communityModal').classList.add('active');
}

// Email Gate Functions
function showEmailGate() {
    hideAllScreens();
    document.getElementById('emailGate').classList.add('active');
    
    // Populate blurred plan summary
    populateBlurredPlanSummary();
}

function populateBlurredPlanSummary() {
    if (!generatedPlan) return;
    
    const summary = document.getElementById('planSummaryPreview');
    summary.innerHTML = `
        <div class="summary-item">
            <span class="value">${generatedPlan.duration}</span>
            <span class="label">weeks</span>
        </div>
        <div class="summary-item">
            <span class="value">${generatedPlan.frequency}</span>
            <span class="label">per week</span>
        </div>
        <div class="summary-item">
            <span class="value">${generatedPlan.startWeight}lbs</span>
            <span class="label">starting weight</span>
        </div>
        <div class="summary-item">
            <span class="value">${generatedPlan.targetWeight}lbs</span>
            <span class="label">target weight</span>
        </div>
    `;
}

function submitEmailCapture(event) {
    event.preventDefault();
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    
    if (!name || !email) {
        alert('Please fill in both name and email fields');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Generate unique plan ID if not exists
    if (!generatedPlan.id) {
        generatedPlan.id = generatePlanId();
    }
    
    // Store plan data with user info
    const planData = {
        ...generatedPlan,
        userName: name,
        userEmail: email,
        createdAt: new Date().toISOString(),
        accessToken: generateAccessToken()
    };
    
    // Save to localStorage (in real app, this would be saved to database)
    localStorage.setItem(`plan_${generatedPlan.id}`, JSON.stringify(planData));
    
    // Simulate email sending (in real app, this would call Klaviyo API)
    sendEmailWithKlaviyo(planData);
    
    // Show email sent confirmation
    showEmailSent(email);
}

function generatePlanId() {
    return 'plan_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateAccessToken() {
    return 'access_' + Math.random().toString(36).substr(2, 16);
}

function sendEmailWithKlaviyo(planData) {
    // In a real application, this would integrate with Klaviyo API:
    // 
    // const klaviyoData = {
    //     data: {
    //         type: 'event',
    //         attributes: {
    //             profile: {
    //                 data: {
    //                     type: 'profile',
    //                     attributes: {
    //                         email: planData.userEmail,
    //                         first_name: planData.userName,
    //                         properties: {
    //                             plan_id: planData.id,
    //                             start_weight: planData.startWeight,
    //                             target_weight: planData.targetWeight,
    //                             frequency: planData.frequency
    //                         }
    //                     }
    //                 }
    //             },
    //             metric: {
    //                 data: {
    //                     type: 'metric',
    //                     attributes: {
    //                         name: 'Plan Generated'
    //                     }
    //                 }
    //             },
    //             properties: {
    //                 plan_url: planUrl,
    //                 plan_type: 'rucking',
    //                 user_responses: planData.responses
    //             }
    //         }
    //     }
    // };
    // 
    // fetch('https://a.klaviyo.com/api/events/', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': 'Klaviyo-API-Key YOUR_PRIVATE_KEY',
    //         'Content-Type': 'application/json',
    //         'revision': '2024-10-15'
    //     },
    //     body: JSON.stringify(klaviyoData)
    // });
    
    const planUrl = `${window.location.origin}${window.location.pathname}?plan=${planData.id}&token=${planData.accessToken}`;
    
    console.log('📧 Email would be sent via Klaviyo API with:', {
        to: planData.userEmail,
        subject: `${planData.userName}, your personalized 12-week rucking plan is ready! 🎒`,
        template: 'rucking-plan-delivery',
        planUrl: planUrl,
        userData: {
            name: planData.userName,
            email: planData.userEmail,
            startWeight: planData.startWeight,
            targetWeight: planData.targetWeight,
            frequency: planData.frequency
        }
    });
    
    console.log('🔗 Direct plan access URL:', planUrl);
    
    // Store the plan URL for potential sharing
    generatedPlan.publicUrl = planUrl;
}

function showEmailSent(email) {
    hideAllScreens();
    document.getElementById('emailSent').classList.add('active');
    document.getElementById('confirmedEmail').textContent = email;
}

function goBackToEmailCapture() {
    hideAllScreens();
    document.getElementById('emailGate').classList.add('active');
}

// Check if user is accessing via email link
function checkForDirectPlanAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const accessToken = urlParams.get('token');
    
    if (planId && accessToken) {
        // Try to load plan from localStorage
        const planData = JSON.parse(localStorage.getItem(`plan_${planId}`) || 'null');
        
        if (planData && planData.accessToken === accessToken) {
            // Valid plan access - show results directly
            generatedPlan = planData;
            showResults();
            return true;
        } else {
            // Invalid or expired link
            alert('This plan link is invalid or has expired. Please generate a new plan.');
            window.location.href = window.location.pathname; // Remove query params
            return false;
        }
    }
    
    return false;
}

// Styles are now defined in the main CSS file