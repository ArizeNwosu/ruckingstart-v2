import React, { useState, useEffect } from 'react';
import { Backpack, MapPin, Users, Target, ChevronRight, Menu, X, Star, Clock, Weight, TrendingUp, Calculator, BarChart3, MessageCircle, Mail, Download, Share, FileText, Twitter, Linkedin, Facebook, Copy, Calendar, Link, Award } from 'lucide-react';

interface UserResponses {
  frequency?: string;
  terrain?: string;
  bodyWeight?: number;
  experience?: string;
  fitness?: string;
  health?: string;
  goal?: string;
  timeAvailable?: string;
  budget?: string;
  email?: string;
  name?: string;
}

interface Question {
  id: string;
  title: string;
  description: string;
  type: 'single-choice' | 'number-input' | 'email-input';
  options?: {
    value: string;
    label: string;
    icon: string;
    description: string;
  }[];
  unit?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}

interface GeneratedPlan {
  weeks: {
    week: number;
    distance: string;
    weight: string;
    frequency: string;
    terrain: string;
    notes: string;
  }[];
  gearRecommendations: {
    essential: { item: string; description: string; price: string }[];
    optional: { item: string; description: string; price: string }[];
  };
  tips: string[];
}

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userResponses, setUserResponses] = useState<UserResponses>({});
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [showEmailGate, setShowEmailGate] = useState(false);
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showWeightCalculator, setShowWeightCalculator] = useState(false);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [progressSessions, setProgressSessions] = useState<any[]>([]);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [planUrl, setPlanUrl] = useState('');

  // Check for URL parameters on load and load progress sessions
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    if (planId) {
      console.log('Loading plan from URL parameter:', planId);
      loadPlanFromDatabase(planId);
    }

    // Load saved progress sessions
    const savedSessions = localStorage.getItem('rucking_progress_sessions');
    if (savedSessions) {
      setProgressSessions(JSON.parse(savedSessions));
    }
  }, []);

  const loadPlanFromDatabase = async (planId: string) => {
    try {
      // First try to load from database
      const response = await fetch(`/api/get-plan?planId=${planId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Plan loaded from database');
        setUserResponses(data.responses);
        setGeneratedPlan(data.plan);
        setCurrentScreen('results');
        const shareUrl = `https://www.ruckingstart.com?plan=${planId}`;
        setPlanUrl(shareUrl);
        return;
      }
      
      // Fallback to localStorage for backward compatibility
      console.log('Trying localStorage fallback...');
      const savedPlan = localStorage.getItem(`plan_${planId}`);
      if (savedPlan) {
        console.log('Found saved plan in localStorage, loading...');
        try {
          const { responses, plan } = JSON.parse(savedPlan);
          setUserResponses(responses);
          setGeneratedPlan(plan);
          setCurrentScreen('results');
          const shareUrl = `https://www.ruckingstart.com?plan=${planId}`;
          setPlanUrl(shareUrl);
          console.log('Plan loaded from localStorage successfully');
          
          // Also save to database for future cross-device access
          savePlanToDatabase(planId, responses, plan);
        } catch (error) {
          console.error('Error loading saved plan from localStorage:', error);
          // Redirect to home if plan can't be loaded
          setCurrentScreen('welcome');
        }
      } else {
        console.log('No saved plan found for ID:', planId);
        // Redirect to home if plan doesn't exist
        setCurrentScreen('welcome');
      }
    } catch (error) {
      console.error('Error loading plan:', error);
      // Try localStorage fallback
      const savedPlan = localStorage.getItem(`plan_${planId}`);
      if (savedPlan) {
        const { responses, plan } = JSON.parse(savedPlan);
        setUserResponses(responses);
        setGeneratedPlan(plan);
        setCurrentScreen('results');
        const shareUrl = `https://www.ruckingstart.com?plan=${planId}`;
        setPlanUrl(shareUrl);
      } else {
        setCurrentScreen('welcome');
      }
    }
  };

  const savePlanToDatabase = async (planId: string, responses: UserResponses, plan: GeneratedPlan) => {
    try {
      const response = await fetch('/api/save-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          responses,
          plan
        })
      });

      if (response.ok) {
        console.log('Plan saved to database successfully');
      } else {
        console.log('Failed to save plan to database');
      }
    } catch (error) {
      console.error('Error saving plan to database:', error);
    }
  };

  // Additional useEffect to ensure plan URL is set when generatedPlan changes
  useEffect(() => {
    if (generatedPlan && !planUrl) {
      const planId = Date.now().toString();
      const planData = { responses: userResponses, plan: generatedPlan };
      
      // Save to localStorage for backward compatibility
      localStorage.setItem(`plan_${planId}`, JSON.stringify(planData));
      
      // Save to database for cross-device access
      savePlanToDatabase(planId, userResponses, generatedPlan);
      
      const shareUrl = `https://www.ruckingstart.com?plan=${planId}`;
      setPlanUrl(shareUrl);
    }
  }, [generatedPlan, planUrl, userResponses]);

  const questions: Question[] = [
    {
      id: 'frequency',
      title: 'How often would you like to ruck?',
      description: 'Choose a frequency that fits your schedule and recovery needs. Beginners often start with 3 days per week.',
      type: 'single-choice',
      options: [
        { value: '3x', label: '3 times per week', icon: '📅', description: 'Ideal for beginners - quality over quantity with ample recovery' },
        { value: '5x', label: '5 times per week', icon: '🗓️', description: 'Balanced approach for intermediate fitness levels' },
        { value: '7x', label: '7 times per week', icon: '📆', description: 'Advanced - requires careful management and recovery planning' }
      ]
    },
    {
      id: 'terrain',
      title: 'What terrain will you primarily ruck on?',
      description: 'Different terrains provide different challenges and benefits for your training.',
      type: 'single-choice',
      options: [
        { value: 'pavement', label: 'Pavement/Sidewalk', icon: '🛣️', description: 'Steady pace tracking, convenient but higher impact' },
        { value: 'trail', label: 'Trails/Nature', icon: '🌲', description: 'Lower impact, builds stabilizing muscles, more scenic' },
        { value: 'incline', label: 'Hills/Incline', icon: '⛰️', description: 'Maximum intensity, builds leg strength and conditioning' },
        { value: 'mixed', label: 'Mixed Terrain', icon: '🗺️', description: 'Best of all worlds - varied training stimulus' }
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
        { value: 'amateur', label: 'Amateur/New', icon: '🌱', description: 'New to rucking - we\'ll start you easy and build gradually' },
        { value: 'moderate', label: 'Moderate', icon: '🚶', description: 'Some rucking or long hiking experience' },
        { value: 'expert', label: 'Expert/Veteran', icon: '🏅', description: 'Seasoned rucker with event experience' }
      ]
    },
    {
      id: 'fitness',
      title: 'What is your overall fitness level?',
      description: 'Your baseline activity level helps us adjust the initial training intensity.',
      type: 'single-choice',
      options: [
        { value: 'sedentary', label: 'Sedentary', icon: '🛋️', description: 'Limited regular exercise' },
        { value: 'moderate', label: 'Moderately Active', icon: '🏃', description: 'Regular exercise 2-3 times per week' },
        { value: 'fit', label: 'Very Fit', icon: '💪', description: 'Regular intense exercise, strong cardio base' }
      ]
    },
    {
      id: 'health',
      title: 'Do you have any injury or health considerations?',
      description: 'Any joint issues, past injuries, or health concerns that might affect your training intensity.',
      type: 'single-choice',
      options: [
        { value: 'none', label: 'No concerns', icon: '✅', description: 'Good to go with standard progression' },
        { value: 'minor', label: 'Minor concerns', icon: '⚠️', description: 'Some joint stiffness or minor past injuries' },
        { value: 'major', label: 'Significant concerns', icon: '🩹', description: 'Recent injuries or ongoing health issues' }
      ]
    },
    {
      id: 'goal',
      title: 'What is your primary training goal?',
      description: 'This influences target distances, paces, and training emphasis.',
      type: 'single-choice',
      options: [
        { value: 'fitness', label: 'General Fitness', icon: '❤️', description: 'Overall health and wellness improvement' },
        { value: 'weight-loss', label: 'Weight Loss', icon: '⚖️', description: 'Focus on calorie burn and endurance' },
        { value: 'military', label: 'Military Test Prep', icon: '🛡️', description: 'Specific distance/time/weight standards' },
        { value: 'event', label: 'GORUCK/Event Prep', icon: '🏁', description: 'Preparing for specific rucking events' }
      ]
    },
    {
      id: 'timeAvailable',
      title: 'How much time can you dedicate per session?',
      description: 'This helps us scale distance and intensity to fit your schedule.',
      type: 'single-choice',
      options: [
        { value: '30-45', label: '30-45 minutes', icon: '⏰', description: 'Short, focused sessions' },
        { value: '45-60', label: '45-60 minutes', icon: '⏱️', description: 'Standard training duration' },
        { value: '60-90', label: '60-90 minutes', icon: '⏲️', description: 'Extended training sessions' },
        { value: '90+', label: '90+ minutes', icon: '⏳', description: 'Long endurance focused training' }
      ]
    },
    {
      id: 'budget',
      title: 'What is your gear budget preference?',
      description: 'We can recommend everything from DIY solutions to premium gear based on your budget.',
      type: 'single-choice',
      options: [
        { value: 'diy', label: 'DIY/Free', icon: '🔧', description: 'Use household items and creative solutions' },
        { value: 'under-300', label: 'Under $300', icon: '💵', description: 'Budget-conscious gear recommendations' },
        { value: 'under-500', label: 'Under $500', icon: '💳', description: 'Quality gear investment' },
        { value: 'premium', label: 'Premium', icon: '💎', description: 'Best-in-class equipment' }
      ]
    }
  ];

  const handleAnswer = (value: any) => {
    const question = questions[currentQuestion];
    setUserResponses(prev => ({ ...prev, [question.id]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // After all questions, show generating screen then email gate
      setIsGenerating(true);
      setCurrentScreen('generating');
      
      // Simulate plan generation
      setTimeout(() => {
        generatePlan();
        setIsGenerating(false);
        setShowEmailGate(true);
        setCurrentScreen('email-gate');
      }, 3000);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const isAnswered = () => {
    const question = questions[currentQuestion];
    const value = userResponses[question.id as keyof UserResponses];
    return value !== undefined && value !== '' && value !== 0;
  };

  const generatePlan = () => {
    // Generate plan based on user responses
    const bodyWeight = userResponses.bodyWeight || 150;
    const targetWeight = bodyWeight < 150 ? 20 : 30;
    const budget = userResponses.budget || 'under-300';
    
    // Generate budget-specific gear recommendations
    const getGearRecommendations = () => {
      switch (budget) {
        case 'diy':
          return {
            essential: [
              { item: 'Any Sturdy Backpack', description: 'Use school backpack or hiking daypack you already own', price: 'Free' },
              { item: 'Play Sand Weight', description: '50lb bag ($4-5) in double-bagged Ziplocs, ~$0.10/lb', price: '$4-8' },
              { item: 'Comfortable Walking Shoes', description: 'Use your current athletic/walking shoes', price: 'Free' },
              { item: 'Regular Socks', description: 'Non-cotton athletic socks you already have', price: 'Free' }
            ],
            optional: [
              { item: 'Water Bottles (Weight)', description: 'Gallon jugs as adjustable weight (8.3lbs each)', price: '$2-4' },
              { item: 'Bricks', description: 'House bricks ($0.50 each) taped for padding, 4-5lbs each', price: '$2-4' },
              { item: 'Old Textbooks', description: 'Heavy textbooks as weight (3-5lbs each)', price: 'Free' },
              { item: 'Towel Padding', description: 'Household towels for back padding and cushioning', price: 'Free' },
              { item: 'Plastic Bags', description: 'Trash bags to waterproof pack interior', price: '$1-2' }
            ]
          };

        case 'under-300':
          return {
            essential: [
              { item: 'Military Surplus Pack', description: 'Used ALICE or MOLLE pack from surplus store', price: '$50-100' },
              { item: 'Weight Plates (Used)', description: 'Used gym plates or one 20lb ruck plate', price: '$30-60' },
              { item: 'Trail Running Shoes', description: 'New Balance, ASICS, or similar trail shoes', price: '$60-100' },
              { item: 'Hiking Socks', description: 'Synthetic blend hiking socks (2-3 pairs)', price: '$15-25' }
            ],
            optional: [
              { item: 'Water Bladder', description: 'Basic 2L hydration bladder system', price: '$20-35' },
              { item: 'Sand Filler Bags', description: 'Dry bags to make custom sand weights', price: '$15-30' },
              { item: 'Foam Padding', description: 'Yoga block or foam for back comfort', price: '$10-20' },
              { item: 'Basic Headlamp', description: 'Simple LED headlamp for visibility', price: '$15-25' },
              { item: 'Compression Straps', description: 'Additional straps to secure load', price: '$10-15' }
            ]
          };

        case 'under-500':
          return {
            essential: [
              { item: 'Quality Hiking Pack', description: '5.11 RUSH or Mystery Ranch pack with frame', price: '$150-250' },
              { item: 'Ruck Plates', description: 'Purpose-built ruck plates (20-30lbs total)', price: '$70-120' },
              { item: 'Trail Shoes/Boots', description: 'Salomon, Merrell, or lightweight hiking boots', price: '$100-150' },
              { item: 'Merino Wool Socks', description: 'Darn Tough or Smartwool hiking socks', price: '$20-40' }
            ],
            optional: [
              { item: 'Premium Hydration', description: 'CamelBak 3L with insulated tube', price: '$40-60' },
              { item: 'Technical Clothing', description: 'Moisture-wicking base layers', price: '$40-80' },
              { item: 'Quality Headlamp', description: 'Petzl or Black Diamond with multiple modes', price: '$40-80' },
              { item: 'Pack Accessories', description: 'MOLLE pouches, rain cover, admin panel', price: '$30-60' },
              { item: 'Recovery Gear', description: 'Foam roller, compression sleeves', price: '$25-50' }
            ]
          };

        case 'premium':
          return {
            essential: [
              { item: 'GORUCK GR1/Rucker', description: 'Lifetime warranty, made in USA, bombproof construction', price: '$295-395' },
              { item: 'GORUCK Ruck Plates', description: 'Official plates with handles, perfect fit', price: '$85-150' },
              { item: 'Premium Footwear', description: 'GORUCK MACV boots or top-tier trail shoes', price: '$200-300' },
              { item: 'Premium Socks', description: 'GORUCK or Darn Tough Vermont socks', price: '$25-35' }
            ],
            optional: [
              { item: 'Complete Hydration', description: 'Source hydration system with cleaning kit', price: '$60-100' },
              { item: 'Technical Apparel', description: 'GORUCK or Arc\'teryx technical clothing', price: '$100-200' },
              { item: 'Professional Headlamp', description: 'Petzl NAO+ with app connectivity', price: '$150-200' },
              { item: 'GPS Watch', description: 'Garmin Fenix or Suunto for detailed metrics', price: '$400-800' },
              { item: 'Complete Kit', description: 'GORUCK accessories, patches, admin pouch', price: '$100-150' }
            ]
          };

        default:
          return {
            essential: [
              { item: 'Military Surplus Pack', description: 'Used ALICE or MOLLE pack from surplus store', price: '$50-100' },
              { item: 'Weight Plates (Used)', description: 'Used gym plates or one 20lb ruck plate', price: '$30-60' },
              { item: 'Trail Running Shoes', description: 'New Balance, ASICS, or similar trail shoes', price: '$60-100' },
              { item: 'Hiking Socks', description: 'Synthetic blend hiking socks (2-3 pairs)', price: '$15-25' }
            ],
            optional: [
              { item: 'Water Bladder', description: 'Basic 2L hydration bladder system', price: '$20-35' },
              { item: 'Sand Filler Bags', description: 'Dry bags to make custom sand weights', price: '$15-30' },
              { item: 'Foam Padding', description: 'Yoga block or foam for back comfort', price: '$10-20' },
              { item: 'Basic Headlamp', description: 'Simple LED headlamp for visibility', price: '$15-25' },
              { item: 'Compression Straps', description: 'Additional straps to secure load', price: '$10-15' }
            ]
          };
      }
    };
    
    const plan: GeneratedPlan = {
      weeks: [
        { week: 1, distance: '2-3 miles', weight: `${Math.max(10, targetWeight - 10)} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Focus on form and base building. Start conservatively.' },
        { week: 2, distance: '2-4 miles', weight: `${Math.max(12, targetWeight - 8)} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Maintain consistency, slight weight increase.' },
        { week: 3, distance: '3-4 miles', weight: `${Math.max(15, targetWeight - 5)} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Build endurance, gradual distance increase.' },
        { week: 4, distance: '3-5 miles', weight: `${Math.max(15, targetWeight - 5)} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Foundation complete, prepare for building phase.' },
        { week: 5, distance: '4-6 miles', weight: `${Math.max(18, targetWeight - 2)} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Building phase begins, increase both distance and weight.' },
        { week: 6, distance: '4-6 miles', weight: `${targetWeight} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Reach target weight, maintain distance progression.' },
        { week: 7, distance: '5-7 miles', weight: `${targetWeight} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Push distance boundaries, solidify weight capacity.' },
        { week: 8, distance: '5-8 miles', weight: `${targetWeight + 2} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Building phase peak, slight weight increase.' },
        { week: 9, distance: '6-8+ miles', weight: `${targetWeight + 5} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Peak phase begins, maximum challenge preparation.' },
        { week: 10, distance: '6-10+ miles', weight: `${targetWeight + 5} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Peak endurance and strength development.' },
        { week: 11, distance: '7-12+ miles', weight: `${targetWeight + 8} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Competition-ready performance level.' },
        { week: 12, distance: '8-15+ miles', weight: `${targetWeight + 10} lbs`, frequency: userResponses.frequency || '3x', terrain: userResponses.terrain || 'mixed', notes: 'Peak performance achieved - goal completion!' }
      ],
      gearRecommendations: getGearRecommendations(),
      tips: [
        'Never increase weight and distance in the same week - progress one variable at a time',
        'Focus on maintaining proper posture: chest up, shoulders back, core engaged',
        'Listen to your body - persistent pain means rest, muscle fatigue is normal',
        'Gradually increase intensity by 10% per week maximum (distance or weight)',
        'Stay hydrated: drink 16-24oz per hour of rucking depending on conditions',
        'Practice proper nutrition: eat 200-300 calories per hour for rucks over 90 minutes',
        'Include at least one rest day between ruck sessions for recovery',
        'Train on similar terrain to your goal event when possible',
        'Break in all gear during training - never use new equipment on event day'
      ]
    };

    setGeneratedPlan(plan);
    
    // Generate shareable URL
    const planId = Date.now().toString();
    const planData = { responses: userResponses, plan };
    
    // Save to localStorage for backward compatibility
    localStorage.setItem(`plan_${planId}`, JSON.stringify(planData));
    
    // Save to database for cross-device access
    savePlanToDatabase(planId, userResponses, plan);
    
    const shareUrl = `https://www.ruckingstart.com?plan=${planId}`;
    setPlanUrl(shareUrl);
  };

  const handleEmailSubmit = async (email: string, name: string) => {
    setUserResponses(prev => ({ ...prev, email, name }));
    setShowEmailGate(false);
    setShowEmailSent(true);
    setCurrentScreen('email-sent');
    
    // Send email with plan link
    try {
      await sendPlanEmail(email, name, planUrl);
    } catch (error) {
      console.log('Email sending failed, but user can still access plan:', error);
    }
    
    // Redirect to results after showing email sent confirmation
    setTimeout(() => {
      setShowEmailSent(false);
      setCurrentScreen('results');
    }, 2000);
  };

  const sendPlanEmail = async (email: string, name: string, planUrl: string) => {
    // Using EmailJS for client-side email sending
    const emailData = {
      to_email: email,
      to_name: name,
      plan_url: planUrl,
      subject: `🎒 Your Personalized Rucking Plan is Ready!`,
      message: `Hi ${name}!\n\nYour personalized 12-week rucking training plan is ready! This custom program has been created specifically based on your fitness level, goals, and preferences.\n\n✅ Personalized training progression\n✅ Custom gear recommendations\n✅ Budget-appropriate equipment suggestions\n✅ Progress tracking tools\n\nAccess your plan here: ${planUrl}\n\nBookmark this link to access your plan anytime. You can also use the progress tracker and other tools to monitor your rucking journey.\n\nReady to start your rucking transformation?\n\nBest regards,\nThe RuckingStart Team\n\nP.S. Share this link with friends who might want to start their own rucking journey!`
    };

    // For now, we'll use a simple fetch to a serverless function
    // This would typically integrate with EmailJS, SendGrid, or similar service
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error('Email sending failed');
      }

      console.log('Email sent successfully');
      return true;
    } catch (error) {
      // Fallback: Store email for manual sending or future processing
      const emailQueue = JSON.parse(localStorage.getItem('email_queue') || '[]');
      emailQueue.push({
        ...emailData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
      localStorage.setItem('email_queue', JSON.stringify(emailQueue));
      
      console.log('Email queued for later delivery');
      throw error;
    }
  };

  const generatePDF = () => {
    // Create PDF content
    const pdfContent = `
      ${userResponses.name ? userResponses.name + '\'s' : 'Your'} Personal Rucking Plan
      
      Plan Overview:
      - Body Weight: ${userResponses.bodyWeight} lbs
      - Primary Goal: ${userResponses.goal?.replace('-', ' ')}
      - Experience Level: ${userResponses.experience}
      - Training Frequency: ${userResponses.frequency}
      - Terrain: ${userResponses.terrain}
      - Time Available: ${userResponses.timeAvailable}
      - Budget: ${userResponses.budget}
      
      12-Week Training Plan:
      ${generatedPlan?.weeks.map(week => `
        Week ${week.week}: ${week.distance} at ${week.weight}
        Frequency: ${week.frequency} | Terrain: ${week.terrain}
        Notes: ${week.notes}
      `).join('')}
      
      Essential Gear:
      ${generatedPlan?.gearRecommendations.essential.map(item => `
        - ${item.item}: ${item.description} (${item.price})
      `).join('')}
      
      Key Tips:
      ${generatedPlan?.tips.map(tip => `- ${tip}`).join('\n      ')}
      
      Generated by RuckingStart - Your Personalized Rucking Coach
    `;
    
    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${userResponses.name ? userResponses.name.replace(/\s+/g, '_') + '_' : ''}rucking_plan.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const copyPlanUrl = () => {
    if (!planUrl) {
      alert('Plan URL is being generated, please try again in a moment.');
      return;
    }
    navigator.clipboard.writeText(planUrl).then(() => {
      alert('✅ Plan URL copied to clipboard! You can now paste it anywhere to share your plan.');
    }).catch(() => {
      alert('Failed to copy URL. Please try again or manually copy: ' + planUrl);
    });
  };

  const shareToTwitter = () => {
    if (!planUrl) {
      alert('Plan URL is being generated, please try again in a moment.');
      return;
    }
    const text = `Just created my personalized 12-week rucking plan with RuckingStart! 🎒 Check out this amazing free tool that builds custom training programs based on your fitness level and goals.`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(planUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    if (!planUrl) {
      alert('Plan URL is being generated, please try again in a moment.');
      return;
    }
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(planUrl)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    if (!planUrl) {
      alert('Plan URL is being generated, please try again in a moment.');
      return;
    }
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(planUrl)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    if (!planUrl) {
      alert('Plan URL is being generated, please try again in a moment.');
      return;
    }
    const text = `Check out my personalized rucking plan! 🎒 RuckingStart created a custom 12-week program just for me. Get yours here: ${planUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = () => {
    // Ensure we have a plan URL
    if (!planUrl) {
      alert('Plan URL is being generated, please try again in a moment.');
      return;
    }

    const subject = `🎒 Check out my personalized rucking training plan!`;
    const body = `Hi there!\n\nI just created a personalized 12-week rucking training plan using RuckingStart - it's completely free and creates custom programs based on your fitness level, goals, and preferences.\n\n✅ Personalized based on fitness level\n✅ Custom gear recommendations\n✅ Progressive 12-week program\n✅ Completely free to use\n\nYou can check out my plan and create your own here: ${planUrl}\n\nRucking is an amazing workout that burns 3x more calories than walking while building full-body strength and mental toughness. Give it a try!\n\nBest regards,\n${userResponses.name || 'Your friend'}`;
    
    // Try multiple email methods
    try {
      // Method 1: Try mailto link
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // For better user experience, show the link they can copy
      const shareText = `${subject}\n\n${body}`;
      
      // Create a temporary textarea to copy the email content
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Modern clipboard API
        navigator.clipboard.writeText(shareText).then(() => {
          alert('📧 Email content copied to clipboard! You can paste it into any email client.\n\n✅ Also opening your default email app...');
          window.open(mailtoLink, '_blank');
        }).catch(() => {
          alert('📧 Opening your email client with pre-filled content...');
          window.open(mailtoLink, '_blank');
        });
      } else {
        // Fallback for older browsers
        try {
          document.execCommand('copy');
          alert('📧 Email content copied to clipboard! You can paste it into any email client.\n\n✅ Also opening your default email app...');
        } catch (err) {
          alert('📧 Opening your email client with pre-filled content...');
        }
        window.open(mailtoLink, '_blank');
      }
      
      document.body.removeChild(textarea);
    } catch (error) {
      alert('📧 Please copy this link to share: ' + planUrl);
    }
  };

  const saveProgressSession = (distance: number, weight: number, duration: number, difficulty: string, notes: string) => {
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      distance,
      weight,
      duration,
      difficulty,
      notes,
      pace: duration / distance // minutes per mile
    };

    const updatedSessions = [newSession, ...progressSessions];
    setProgressSessions(updatedSessions);
    localStorage.setItem('rucking_progress_sessions', JSON.stringify(updatedSessions));
  };

  const getProgressStats = () => {
    if (progressSessions.length === 0) return null;

    const totalSessions = progressSessions.length;
    const totalDistance = progressSessions.reduce((sum, session) => sum + session.distance, 0);
    const totalTime = progressSessions.reduce((sum, session) => sum + session.duration, 0);
    const averagePace = totalTime / totalDistance;
    const longestRuck = Math.max(...progressSessions.map(s => s.distance));
    const heaviestWeight = Math.max(...progressSessions.map(s => s.weight));

    return {
      totalSessions,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime: Math.round(totalTime),
      averagePace: Math.round(averagePace * 10) / 10,
      longestRuck,
      heaviestWeight
    };
  };

  return (
    <div className="font-sans">
      {/* Global Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            onClick={() => setCurrentScreen('welcome')}
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Backpack className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">RuckingStart</span>
          </button>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Hamburger Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-slate-800 transform transition-transform duration-300 shadow-xl">
            <div className="p-6 pt-20">
              <h3 className="text-lg font-semibold text-white mb-6">Menu</h3>
              
              <div className="space-y-4">
                {/* Navigation Options */}
                <button
                  onClick={() => {
                    setCurrentScreen('welcome');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Backpack className="w-5 h-5 text-emerald-400" />
                  <span>Start Over</span>
                </button>

                <button
                  onClick={() => {
                    setShowWeightCalculator(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Calculator className="w-5 h-5 text-emerald-400" />
                  <span>Weight Calculator</span>
                </button>

                <button
                  onClick={() => {
                    setShowProgressTracker(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                  <span>Progress Tracker</span>
                </button>

                <button
                  onClick={() => {
                    setShowCommunity(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Users className="w-5 h-5 text-emerald-400" />
                  <span>Resources</span>
                </button>

                <button
                  onClick={() => {
                    setShowFeedback(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <span>Feedback</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Screen - Updated with benefits and tools */}
      {currentScreen === 'welcome' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24">

          <div className="px-6 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Transform Your Fitness
                <span className="text-emerald-400 block">with Rucking</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Welcome to RuckingStart - a FREE comprehensive 12-week program designed to take you from beginner to confident rucker. 
                Our conversational approach will create a personalized training plan tailored specifically to your needs, fitness level, and goals.
              </p>
              
              <button
                onClick={() => setCurrentScreen('assessment')}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center space-x-3 mb-16"
              >
                <span>Start Your Journey</span>
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Benefits Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-700/50">
                  <div className="text-4xl mb-4">🔥</div>
                  <h3 className="text-xl font-semibold text-white mb-2">3x More Calories</h3>
                  <p className="text-slate-300">Burns up to 3x more calories than regular walking</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-700/50">
                  <div className="text-4xl mb-4">💪</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Full Body Workout</h3>
                  <p className="text-slate-300">Strengthens legs, core, back, and shoulders</p>
                </div>
                <div className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-3xl border border-slate-700/50">
                  <div className="text-4xl mb-4">🧠</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Mental Toughness</h3>
                  <p className="text-slate-300">Builds resilience and improves posture</p>
                </div>
              </div>

              {/* Free Tools Section */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-8">Free Rucking Tools & Resources</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setShowWeightCalculator(true)}
                    className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 text-left"
                  >
                    <Calculator className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Weight Calculator</h4>
                    <p className="text-slate-300">Find your ideal ruck weight instantly</p>
                  </button>
                  <button
                    onClick={() => setShowProgressTracker(true)}
                    className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 text-left"
                  >
                    <BarChart3 className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Progress Tracker</h4>
                    <p className="text-slate-300">Log and monitor your rucking journey</p>
                  </button>
                  <button
                    onClick={() => setShowCommunity(true)}
                    className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 text-left"
                  >
                    <Users className="w-8 h-8 text-emerald-400 mb-4" />
                    <h4 className="text-lg font-semibold text-white mb-2">Community</h4>
                    <p className="text-slate-300">Connect with fellow ruckers worldwide</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Screen - Updated to match 9-question system */}
      {currentScreen === 'assessment' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
          <div className="px-6 py-6 border-b border-slate-700/50">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Backpack className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">RuckingStart</span>
                </div>
                <span className="text-sm text-slate-400">
                  {currentQuestion + 1} of {questions.length}
                </span>
              </div>
              
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-12">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {questions[currentQuestion].title}
                </h2>
                <p className="text-lg text-slate-300">
                  {questions[currentQuestion].description}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
                {questions[currentQuestion].type === 'number-input' && (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="number"
                        value={userResponses[questions[currentQuestion].id as keyof UserResponses] as number || ''}
                        onChange={(e) => handleAnswer(parseInt(e.target.value) || 0)}
                        placeholder={questions[currentQuestion].placeholder}
                        min={questions[currentQuestion].min}
                        max={questions[currentQuestion].max}
                        className="w-full px-6 py-4 pr-16 bg-slate-700/50 border border-slate-600 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                      <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-slate-400">
                        {questions[currentQuestion].unit}
                      </span>
                    </div>
                  </div>
                )}

                {questions[currentQuestion].type === 'single-choice' && (
                  <div className="grid gap-4">
                    {questions[currentQuestion].options?.map((option) => {
                      const isSelected = userResponses[questions[currentQuestion].id as keyof UserResponses] === option.value;
                      
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(option.value)}
                          className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-white'
                              : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <div className="font-medium text-lg mb-1">{option.label}</div>
                              <div className="text-sm opacity-80">{option.description}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-12">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <button
                  onClick={nextQuestion}
                  disabled={!isAnswered()}
                  className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <span>{currentQuestion === questions.length - 1 ? 'Get My Plan' : 'Next'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generating Screen */}
      {currentScreen === 'generating' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-8 mx-auto animate-pulse">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Creating Your Perfect Plan</h2>
            <p className="text-lg text-slate-300 mb-8">
              Analyzing your responses and building a personalized 12-week program...
            </p>
            <div className="w-64 h-2 bg-slate-700 rounded-full mx-auto">
              <div className="h-2 bg-emerald-500 rounded-full animate-pulse" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Email Gate Screen */}
      {currentScreen === 'email-gate' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
          <div className="px-6 py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-8 mx-auto">
                <Mail className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Your Plan is Ready! 🎉
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Get your personalized 12-week rucking plan delivered instantly to your email.
              </p>

              {/* Blurred Preview */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900/80 z-10" />
                <div className="filter blur-sm">
                  <h3 className="text-xl font-bold text-white mb-4">Your 12-Week Training Plan</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-left">
                    <div className="bg-slate-700/50 p-4 rounded-xl">
                      <div className="text-emerald-400 font-semibold">Week 1-4: Foundation</div>
                      <div className="text-white">2-3 miles • 15-20 lbs</div>
                    </div>
                    <div className="bg-slate-700/50 p-4 rounded-xl">
                      <div className="text-emerald-400 font-semibold">Week 5-8: Building</div>
                      <div className="text-white">4-6 miles • 20-25 lbs</div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-semibold">
                    Enter email to unlock
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      id="name-input"
                      placeholder="Your name"
                      className="px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <input
                      type="email"
                      id="email-input"
                      placeholder="Your email address"
                      className="px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const emailInput = e.target as HTMLInputElement;
                          const nameInput = document.getElementById('name-input') as HTMLInputElement;
                          const email = emailInput.value;
                          const name = nameInput?.value || '';
                          if (email && email.includes('@') && name) {
                            handleEmailSubmit(email, name);
                          }
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const emailInput = document.getElementById('email-input') as HTMLInputElement;
                      const nameInput = document.getElementById('name-input') as HTMLInputElement;
                      const email = emailInput?.value || '';
                      const name = nameInput?.value || '';
                      if (email && email.includes('@') && name) {
                        handleEmailSubmit(email, name);
                      }
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                  >
                    Get My Personalized Plan
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-4">
                  We respect your privacy. No spam, just your personalized plan and occasional tips.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Sent Screen */}
      {currentScreen === 'email-sent' && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-8 mx-auto">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Plan Sent! 📧</h2>
            <p className="text-lg text-slate-300">
              Check your email for your personalized rucking plan. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Results Screen */}
      {currentScreen === 'results' && generatedPlan && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">

          <div className="px-6 py-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {userResponses.name ? `${userResponses.name}'s` : 'Your'} Personal Rucking Plan! 🎉
                </h1>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                  Here's {userResponses.name ? `${userResponses.name.split(' ')[0]}'s` : 'your'} comprehensive 12-week program tailored to your goals, experience, and preferences.
                </p>
              </div>

              {/* Plan Overview */}
              <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <Weight className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300 text-sm">Body Weight</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{userResponses.bodyWeight} lbs</span>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300 text-sm">Primary Goal</span>
                  </div>
                  <span className="text-2xl font-bold text-white capitalize">{userResponses.goal?.replace('-', ' ')}</span>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <Star className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300 text-sm">Experience</span>
                  </div>
                  <span className="text-2xl font-bold text-white capitalize">{userResponses.experience}</span>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <span className="text-slate-300 text-sm">Frequency</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{userResponses.frequency}</span>
                </div>
              </div>

              {/* Training Plan */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">{userResponses.name ? `${userResponses.name}'s` : 'Your'} 12-Week Training Plan</h3>
                
                <div className="space-y-4">
                  {generatedPlan.weeks.map((week, index) => (
                    <div key={week.week} className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/30">
                      <div className="grid md:grid-cols-4 gap-4 items-center">
                        <div>
                          <div className="text-emerald-400 font-semibold text-lg mb-1">Week {week.week}</div>
                          <div className="text-slate-300 text-sm">{week.notes}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-300 text-sm mb-1">Distance</div>
                          <div className="text-white font-semibold">{week.distance}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-300 text-sm mb-1">Weight</div>
                          <div className="text-white font-semibold">{week.weight}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-300 text-sm mb-1">Frequency</div>
                          <div className="text-white font-semibold">{week.frequency}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gear Recommendations */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">Gear Recommendations</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold text-emerald-400 mb-4">Essential Gear</h4>
                    <div className="space-y-3">
                      {generatedPlan.gearRecommendations.essential.map((item, index) => (
                        <div key={index} className="bg-slate-700/30 p-4 rounded-xl">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-medium">{item.item}</h5>
                            <span className="text-emerald-400 font-semibold text-sm">{item.price}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-slate-400 mb-4">Optional Upgrades</h4>
                    <div className="space-y-3">
                      {generatedPlan.gearRecommendations.optional.map((item, index) => (
                        <div key={index} className="bg-slate-700/20 p-4 rounded-xl border border-slate-600/30">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-medium">{item.item}</h5>
                            <span className="text-slate-400 font-medium text-sm">{item.price}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Tips */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6">Success Tips & Guidelines</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {generatedPlan.tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-slate-300">{tip}</p>
                    </div>
                  ))}
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <button
                  onClick={generatePDF}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download My Plan</span>
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="border-2 border-slate-600 hover:border-emerald-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <Share className="w-5 h-5" />
                  <span>Share with Friends</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Components */}
      {showWeightCalculator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Weight Calculator</h3>
              <button onClick={() => setShowWeightCalculator(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-slate-300 mb-4">
              Use the 150lb rule: if you weigh under 150lbs, start with 20lbs. If over 150lbs, start with 30lbs.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-white font-medium">Your body weight (lbs):</label>
                <input 
                  type="number" 
                  className="w-full mt-2 px-4 py-2 bg-slate-700 rounded-lg text-white" 
                  placeholder="Enter weight"
                  onChange={(e) => {
                    const weight = parseInt(e.target.value) || 0;
                    const recommendedWeight = weight < 150 ? 20 : 30;
                    const resultDiv = document.getElementById('weight-result');
                    if (resultDiv) {
                      resultDiv.textContent = weight > 0 ? `Recommended starting weight: ${recommendedWeight} lbs` : '';
                    }
                  }}
                />
              </div>
              <div id="weight-result" className="text-emerald-400 font-semibold"></div>
            </div>
          </div>
        </div>
      )}

      {showProgressTracker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Rucking Progress Tracker</h3>
              <button onClick={() => setShowProgressTracker(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats Overview */}
            {getProgressStats() && (
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Your Stats
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {(() => {
                    const stats = getProgressStats()!;
                    return (
                      <>
                        <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-emerald-400">{stats.totalSessions}</div>
                          <div className="text-slate-300 text-sm">Total Sessions</div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-emerald-400">{stats.totalDistance}</div>
                          <div className="text-slate-300 text-sm">Miles Rucked</div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-emerald-400">{Math.round(stats.totalTime / 60)}</div>
                          <div className="text-slate-300 text-sm">Hours Trained</div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-emerald-400">{stats.averagePace}</div>
                          <div className="text-slate-300 text-sm">Avg Pace (min/mi)</div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-emerald-400">{stats.longestRuck}</div>
                          <div className="text-slate-300 text-sm">Longest Ruck (mi)</div>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-xl text-center">
                          <div className="text-2xl font-bold text-emerald-400">{stats.heaviestWeight}</div>
                          <div className="text-slate-300 text-sm">Max Weight (lbs)</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Log New Session */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Log New Session
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white font-medium text-sm mb-2 block">Distance (miles):</label>
                      <input 
                        id="distance-input" 
                        type="number" 
                        step="0.1"
                        className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                        placeholder="e.g. 3.2" 
                      />
                    </div>
                    <div>
                      <label className="text-white font-medium text-sm mb-2 block">Weight (lbs):</label>
                      <input 
                        id="weight-input" 
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                        placeholder="e.g. 25" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white font-medium text-sm mb-2 block">Duration (minutes):</label>
                      <input 
                        id="duration-input" 
                        type="number" 
                        className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                        placeholder="e.g. 45" 
                      />
                    </div>
                    <div>
                      <label className="text-white font-medium text-sm mb-2 block">Difficulty:</label>
                      <select 
                        id="difficulty-select"
                        className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select...</option>
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Hard">Hard</option>
                        <option value="Brutal">Brutal</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-white font-medium text-sm mb-2 block">Notes (optional):</label>
                    <textarea 
                      id="notes-input"
                      className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      rows={3}
                      placeholder="How did it feel? Weather conditions? Route notes?"
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      const distance = parseFloat((document.getElementById('distance-input') as HTMLInputElement).value);
                      const weight = parseFloat((document.getElementById('weight-input') as HTMLInputElement).value);
                      const duration = parseFloat((document.getElementById('duration-input') as HTMLInputElement).value);
                      const difficulty = (document.getElementById('difficulty-select') as HTMLSelectElement).value;
                      const notes = (document.getElementById('notes-input') as HTMLTextAreaElement).value;

                      if (distance && weight && duration && difficulty) {
                        saveProgressSession(distance, weight, duration, difficulty, notes);
                        // Clear form
                        (document.getElementById('distance-input') as HTMLInputElement).value = '';
                        (document.getElementById('weight-input') as HTMLInputElement).value = '';
                        (document.getElementById('duration-input') as HTMLInputElement).value = '';
                        (document.getElementById('difficulty-select') as HTMLSelectElement).value = '';
                        (document.getElementById('notes-input') as HTMLTextAreaElement).value = '';
                      }
                    }}
                    className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
                  >
                    Log Session
                  </button>
                </div>
              </div>

              {/* Recent Sessions */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Sessions
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {progressSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No sessions logged yet.</p>
                      <p className="text-slate-500 text-sm">Start tracking your progress!</p>
                    </div>
                  ) : (
                    progressSessions.slice(0, 10).map((session, index) => (
                      <div key={session.id} className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-white font-medium">
                            {session.distance} miles • {session.weight} lbs • {session.duration} min
                          </div>
                          <div className="text-slate-400 text-sm">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            session.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                            session.difficulty === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                            session.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {session.difficulty}
                          </span>
                          <span className="text-slate-400">
                            {Math.round(session.pace * 10) / 10} min/mile
                          </span>
                        </div>
                        {session.notes && (
                          <p className="text-slate-300 text-sm mt-2 italic">"{session.notes}"</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Rucking Community & Resources</h3>
              <button onClick={() => setShowCommunity(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Community Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-emerald-400" />
                <h4 className="text-lg font-semibold text-emerald-400">Community</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://reddit.com/r/rucking" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Reddit - r/Rucking</div>
                  <div className="text-slate-300 text-sm">Join 25k+ ruckers sharing tips and motivation</div>
                </a>
                <a href="https://www.facebook.com/groups/6828200673863149/" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Facebook Groups</div>
                  <div className="text-slate-300 text-sm">Local rucking groups and meetups</div>
                </a>
                <a href="https://discord.gg/goruck" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">GORUCK Discord</div>
                  <div className="text-slate-300 text-sm">Real-time chat with fellow ruckers</div>
                </a>
                <a href="https://www.strava.com" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Strava Clubs</div>
                  <div className="text-slate-300 text-sm">Track progress and find local ruckers</div>
                </a>
              </div>
            </div>

            {/* Events Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h4 className="text-lg font-semibold text-emerald-400">Events</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://www.goruck.com/collections/events" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">GORUCK Events</div>
                  <div className="text-slate-300 text-sm">Official challenges and competitions</div>
                </a>
                <a href="https://thesummitproject.org/event/ruck-for-the-fallen-2025/" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Rucking for the Fallen</div>
                  <div className="text-slate-300 text-sm">Memorial events and fundraisers</div>
                </a>
                <a href="https://www.meetup.com/find/?keywords=rucking&source=EVENTS" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Local Meetups</div>
                  <div className="text-slate-300 text-sm">Find rucking groups near you</div>
                </a>
                <a href="https://spartan.com" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Spartan Races</div>
                  <div className="text-slate-300 text-sm">Obstacle races with rucking divisions</div>
                </a>
              </div>
            </div>

            {/* Resources Section */}
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Link className="w-5 h-5 text-emerald-400" />
                <h4 className="text-lg font-semibold text-emerald-400">Resources</h4>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <a href="https://www.ruckingstart.com/resources/Ruckgang-Rucking-Starter-Guide.pdf" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Official Rucking Guide</div>
                  <div className="text-slate-300 text-sm">Comprehensive training manual</div>
                </a>
                <a href="https://www.youtube.com/results?search_query=rucking" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">YouTube Tutorials</div>
                  <div className="text-slate-300 text-sm">Form, gear reviews, and workouts</div>
                </a>
                <a href="https://www.military.com/military-fitness/workouts" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">Military Fitness</div>
                  <div className="text-slate-300 text-sm">Advanced training protocols</div>
                </a>
                <a href="https://www.alltrails.com" target="_blank" className="block bg-slate-700/50 p-4 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/30">
                  <div className="text-white font-medium">AllTrails</div>
                  <div className="text-slate-300 text-sm">Find the best trails for rucking</div>
                </a>
              </div>
            </div>

            {/* Pro Tip Section */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Award className="w-5 h-5 text-emerald-400" />
                <h4 className="text-emerald-300 font-semibold">💡 Pro Tip</h4>
              </div>
              <p className="text-emerald-200 text-sm leading-relaxed">
                Start with local online communities before attending events. Many experienced ruckers are happy to mentor beginners. 
                Don't be afraid to ask questions about form, gear, or training - the rucking community is incredibly welcoming and supportive!
              </p>
            </div>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Your Feedback</h3>
              <button onClick={() => setShowFeedback(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <textarea
                className="w-full px-4 py-3 bg-slate-700 rounded-lg text-white placeholder-slate-400 resize-none"
                rows={4}
                placeholder="How was your experience with RuckingStart? Any suggestions for improvement?"
              />
              <button className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-3xl p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Your Plan</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p className="text-slate-300 mb-6 text-center">
              Share your personalized rucking plan with friends and help them start their fitness journey!
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => { shareToTwitter(); setShowShareModal(false); }}
                className="flex items-center justify-center space-x-3 p-4 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105"
              >
                <Twitter className="w-5 h-5" />
                <span>Twitter</span>
              </button>
              
              <button
                onClick={() => { shareToLinkedIn(); setShowShareModal(false); }}
                className="flex items-center justify-center space-x-3 p-4 bg-blue-700 hover:bg-blue-800 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105"
              >
                <Linkedin className="w-5 h-5" />
                <span>LinkedIn</span>
              </button>
              
              <button
                onClick={() => { shareToFacebook(); setShowShareModal(false); }}
                className="flex items-center justify-center space-x-3 p-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105"
              >
                <Facebook className="w-5 h-5" />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => { shareToWhatsApp(); setShowShareModal(false); }}
                className="flex items-center justify-center space-x-3 p-4 bg-green-500 hover:bg-green-600 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span>WhatsApp</span>
              </button>
              
              <button
                onClick={() => { shareViaEmail(); setShowShareModal(false); }}
                className="flex items-center justify-center space-x-3 p-4 bg-slate-600 hover:bg-slate-700 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                <span>Email</span>
              </button>
              
              <button
                onClick={() => { copyPlanUrl(); setShowShareModal(false); }}
                className="flex items-center justify-center space-x-3 p-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105"
              >
                <Copy className="w-5 h-5" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;