import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  PenTool, 
  CheckCircle, 
  BarChart as BarChartIcon, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  AlertCircle,
  Award,
  BookA,
  MessageSquare
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// 1. กำหนดโจทย์ (Mock Data สำหรับโจทย์และรูปภาพ/กราฟ)
const ieltsPrompts = [
  {
    id: 1,
    taskType: "task1",
    title: "Internet Usage Trends",
    type: "line",
    prompt: "The graph below shows the percentage of the population using the internet in three different countries from 1999 to 2009. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    data: [
      { year: '1999', USA: 20, Canada: 15, Mexico: 5 },
      { year: '2001', USA: 40, Canada: 30, Mexico: 8 },
      { year: '2003', USA: 60, Canada: 50, Mexico: 12 },
      { year: '2005', USA: 68, Canada: 65, Mexico: 20 },
      { year: '2007', USA: 75, Canada: 72, Mexico: 25 },
      { year: '2009', USA: 80, Canada: 78, Mexico: 30 },
    ],
    colors: { USA: "#3b82f6", Canada: "#ef4444", Mexico: "#10b981" },
    dataDescription: "A line graph showing internet usage. USA started at 20% in 1999 and rose steadily to 80% in 2009. Canada started at 15% and followed a similar trend, reaching 78%. Mexico started very low at 5% and experienced slower growth, reaching 30% by 2009."
  },
  {
    id: 2,
    taskType: "task1",
    title: "Coffee vs Tea Consumption",
    type: "bar",
    prompt: "The chart below shows the average daily consumption of coffee and tea (in cups per person) in five different cities. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    data: [
      { city: 'London', Coffee: 2.5, Tea: 4.0 },
      { city: 'New York', Coffee: 3.8, Tea: 1.5 },
      { city: 'Tokyo', Coffee: 1.2, Tea: 3.5 },
      { city: 'Sydney', Coffee: 3.0, Tea: 2.0 },
      { city: 'Rome', Coffee: 4.5, Tea: 0.8 },
    ],
    colors: { Coffee: "#8b5a2b", Tea: "#4ade80" },
    dataDescription: "A bar chart comparing daily cups of coffee and tea per person in 5 cities. London and Tokyo prefer Tea (4.0 and 3.5 cups respectively). New York, Sydney, and Rome prefer Coffee, with Rome having the highest coffee consumption at 4.5 cups, while having the lowest tea consumption at 0.8 cups."
  },
  {
    id: 3,
    taskType: "task1",
    title: "Energy Production Sources (2020)",
    type: "pie",
    prompt: "The pie chart below shows the primary sources of energy production in a specific country in 2020. Summarise the information by selecting and reporting the main features.",
    data: [
      { name: 'Coal', value: 45, color: '#334155' },
      { name: 'Natural Gas', value: 25, color: '#3b82f6' },
      { name: 'Nuclear', value: 15, color: '#f59e0b' },
      { name: 'Renewables', value: 15, color: '#10b981' }
    ],
    dataDescription: "A pie chart showing energy sources in 2020. Coal is the largest at 45%. Natural Gas is 25%. Nuclear and Renewables both make up 15% each."
  },
  {
    id: 4,
    taskType: "task2",
    prompt: "Some people believe that unpaid community service should be a compulsory part of high school programmes. To what extent do you agree or disagree?",
  },
  {
    id: 5,
    taskType: "task2",
    prompt: "In many countries, the proportion of older people is steadily increasing. Does this trend have more positive or negative effects on society?",
  },
  {
    id: 6,
    taskType: "task2",
    prompt: "Nowadays, many people complain that they have difficulties getting enough sleep. What problems can lack of sleep cause? What can be done about lack of sleep?",
  },
  {
    id: 7,
    taskType: "task1",
    title: "Fast Food Consumption (Teenagers)",
    type: "line",
    prompt: "The graph below shows the amount of fast food consumed by teenagers (in millions) in a specific country from 2000 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    data: [
      { year: '2000', Pizza: 20, Hamburger: 40, FriedChicken: 30 },
      { year: '2005', Pizza: 35, Hamburger: 45, FriedChicken: 40 },
      { year: '2010', Pizza: 50, Hamburger: 55, FriedChicken: 45 },
      { year: '2015', Pizza: 70, Hamburger: 65, FriedChicken: 50 },
      { year: '2020', Pizza: 85, Hamburger: 75, FriedChicken: 60 },
    ],
    colors: { Pizza: "#ef4444", Hamburger: "#f59e0b", FriedChicken: "#8b5a2b" },
    dataDescription: "A line graph showing fast food consumption from 2000 to 2020. Pizza consumption grew the fastest, from 20 to 85. Hamburger and Fried Chicken also increased steadily over the 20-year period."
  },
  {
    id: 8,
    taskType: "task2",
    prompt: "Some people think that the increasing use of computers and mobile phones for communication has had a negative effect on young people's reading and writing skills. To what extent do you agree or disagree?",
  },
  {
    id: 9,
    taskType: "task2",
    prompt: "Global warming is one of the biggest threats to our environment. What causes global warming and what solutions are there to reduce this problem?",
  }
];

export default function App() {
  const [appState, setAppState] = useState('home'); // 'home', 'writing', 'grading', 'result'
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [gradingResult, setGradingResult] = useState(null);
  
  const timerRef = useRef(null);

  // Update word count automatically
  useEffect(() => {
    const words = essay.trim().split(/\s+/);
    setWordCount(essay.trim() === '' ? 0 : words.length);
  }, [essay]);

  // Timer logic
  useEffect(() => {
    if (appState === 'writing') {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [appState]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startPractice = () => {
    // Randomly select a prompt
    const randomPrompt = ieltsPrompts[Math.floor(Math.random() * ieltsPrompts.length)];
    setCurrentPrompt(randomPrompt);
    setEssay('');
    setTimeElapsed(0);
    setErrorMsg('');
    setAppState('writing');
  };

  const submitForGrading = async () => {
    if (wordCount < 50) {
      setErrorMsg('Please write at least 50 words to get a meaningful score.');
      return;
    }
    
    setAppState('grading');
    setErrorMsg('');

    try {
      const isTask2 = currentPrompt.taskType === 'task2';
      const taskName = isTask2 ? 'Task 2' : 'Task 1';
      const criteriaName = isTask2 ? 'tr' : 'ta';
      const dataDesc = isTask2 ? '' : `Data in the Graph: ${currentPrompt.dataDescription}`;

      // Create prompt for Gemini
      const aiPrompt = `Act as an expert, strict IELTS Writing examiner. Evaluate the following IELTS Writing ${taskName} essay based on the official grading criteria.
      
      Prompt Given to Student: ${currentPrompt.prompt}
      ${dataDesc}
      
      Student's Essay:
      "${essay}"
      
      Evaluate strictly and provide a JSON response WITHOUT ANY MARKDOWN TICKS. Use the exact structure below:
      {
        "overallBand": (number, e.g., 6.5),
        "${criteriaName}": { "score": (number), "feedback": "(string, 1-2 sentences)" },
        "cc": { "score": (number), "feedback": "(string, 1-2 sentences)" },
        "lr": { "score": (number), "feedback": "(string, 1-2 sentences)" },
        "gra": { "score": (number), "feedback": "(string, 1-2 sentences)" },
        "generalFeedback": "(string, 1 paragraph overall summary)",
        "strengths": ["(string)", "(string)"],
        "weaknesses": ["(string)", "(string)"]
      }`;

      const payload = {
        contents: [{ role: "user", parts: [{ text: aiPrompt }] }]
      };

      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + import.meta.env.VITE_GEMINI_API_KEY;
      
      // --- อัปเกรดระบบ Auto-Retry เป็น Exponential Backoff ---
      let result;
      let retries = 5; // พยายามสูงสุด 5 ครั้ง
      let delay = 2000; // เริ่มต้นรอที่ 2 วินาที
      
      for (let i = 0; i < retries; i++) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData?.error?.message || '';
          
          // ตรวจจับ Error 503 (Service Unavailable) หรือ 429 (Too Many Requests) หรือข้อความ High demand
          const isHighDemand = errMsg.toLowerCase().includes('high demand') || 
                               response.status === 503 || 
                               response.status === 429;
          
          if (isHighDemand && i < retries - 1) {
            // ถ้าระบบโหลดหนัก ให้รอเวลาที่เพิ่มขึ้นเรื่อยๆ (2s -> 4s -> 8s -> 16s)
            console.log(`AI Server is busy (Attempt ${i + 1}/${retries}). Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // คูณ 2 เวลาที่ต้องรอในรอบถัดไป
            continue; 
          }
          throw new Error(errMsg || `API Error: ${response.status}`);
        }
        
        result = await response.json();
        break; // สำเร็จแล้วออกจากลูป
      }
      // --------------------------------------------------

      if (result && result.candidates && result.candidates.length > 0) {
        let jsonText = result.candidates[0].content.parts[0].text;
        
        // Clean up markdown formatting if the model included them by mistake
        jsonText = jsonText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        
        const parsedResult = JSON.parse(jsonText);
        setGradingResult(parsedResult);
        setAppState('result');
      } else {
        if (result.promptFeedback && result.promptFeedback.blockReason) {
            throw new Error(`Content blocked by safety filters: ${result.promptFeedback.blockReason}`);
        }
        throw new Error('Invalid response from AI examiner.');
      }

    } catch (error) {
      console.error("Grading Error Details:", error);
      
      let displayError = error.message || 'Failed to grade the essay. Please try again.';
      
      // ดักจับ Error กรณีโควต้าฟรีเต็ม (Rate Limit Exceeded / Quota)
      if (displayError.toLowerCase().includes('quota') || displayError.toLowerCase().includes('429')) {
        displayError = '⏳ มีผู้ใช้งานพร้อมกันจำนวนมาก โควต้าฟรีรายนาทีเต็มชั่วคราว กรุณารอประมาณ 1 นาทีแล้วกดปุ่ม Submit ใหม่อีกครั้งนะครับ';
      }
      
      setErrorMsg(displayError);
      setAppState('writing');
    }
  };

  const renderChart = () => {
    if (!currentPrompt || currentPrompt.taskType !== 'task1') return null;

    return (
      <div className="h-64 w-full mt-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-center font-semibold text-slate-700 mb-2">{currentPrompt.title}</h3>
        <ResponsiveContainer width="100%" height="100%">
          {currentPrompt.type === 'line' ? (
            <LineChart data={currentPrompt.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              {Object.keys(currentPrompt.colors).map((key) => (
                <Line key={key} type="monotone" dataKey={key} stroke={currentPrompt.colors[key]} strokeWidth={3} activeDot={{ r: 8 }} />
              ))}
            </LineChart>
          ) : currentPrompt.type === 'pie' ? (
            <PieChart>
              <Pie
                data={currentPrompt.data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {currentPrompt.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            </PieChart>
          ) : (
            <BarChart data={currentPrompt.data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="city" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend />
              {Object.keys(currentPrompt.colors).map((key) => (
                <Bar key={key} dataKey={key} fill={currentPrompt.colors[key]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl cursor-pointer" onClick={() => setAppState('home')}>
            <BookOpen className="w-6 h-6" />
            <span>IELTS Writing Master</span>
          </div>
          {appState === 'writing' && (
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                <span className={timeElapsed > (currentPrompt?.taskType === 'task2' ? 2400 : 1200) ? "text-red-500" : ""}>{formatTime(timeElapsed)}</span>
                <span className="text-xs text-slate-400 ml-1">(Rec. {currentPrompt?.taskType === 'task2' ? '40' : '20'}:00)</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${wordCount >= (currentPrompt?.taskType === 'task2' ? 250 : 150) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                <PenTool className="w-4 h-4" />
                <span>{wordCount} words</span>
                <span className="text-xs ml-1">(Min {currentPrompt?.taskType === 'task2' ? '250' : '150'})</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* State: Home */}
        {appState === 'home' && (
          <div className="flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <BookA className="w-12 h-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
              Master IELTS Writing Task 1
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
              ฝึกเขียนบรรยายกราฟและแผนภูมิ (Task 1) พร้อมรับคะแนนประเมินและฟีดแบ็กอย่างละเอียดจาก AI ผู้เชี่ยวชาญ (อ้างอิงตามเกณฑ์จริง TA, CC, LR, GRA)
            </p>
            <button 
              onClick={startPractice}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              Start Practice Now <ChevronRight className="w-5 h-5" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl text-left">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <BarChartIcon className="w-8 h-8 text-blue-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">1. Get a Prompt</h3>
                <p className="text-slate-500 text-sm">รับโจทย์จำลองพร้อมกราฟ หรือแผนภูมิที่มีข้อมูลเสมือนจริง</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <PenTool className="w-8 h-8 text-amber-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">2. Write your Essay</h3>
                <p className="text-slate-500 text-sm">ฝึกเขียนพร้อมตัวจับเวลาและตัวนับคำเพื่อให้คุ้นชินกับสภาวะห้องสอบ</p>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <CheckCircle className="w-8 h-8 text-green-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2">3. Instant Grading</h3>
                <p className="text-slate-500 text-sm">AI ประเมินคะแนนแยกรายทักษะ พร้อมข้อเสนอแนะในการพัฒนา</p>
              </div>
            </div>
          </div>
        )}

        {/* State: Writing */}
        {appState === 'writing' && (
          <div className="flex flex-col lg:flex-row gap-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Left Column: Prompt & Chart */}
            <div className="lg:w-1/2 flex flex-col gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Academic {currentPrompt?.taskType === 'task2' ? 'Task 2' : 'Task 1'}</h2>
                <p className="text-slate-800 leading-relaxed font-medium mb-4">{currentPrompt?.prompt}</p>
                {currentPrompt?.taskType === 'task1' && renderChart()}
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-sm text-blue-800">
                <h4 className="font-bold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Instructions</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Spend about {currentPrompt?.taskType === 'task2' ? '40' : '20'} minutes on this task.</li>
                  <li>Write at least {currentPrompt?.taskType === 'task2' ? '250' : '150'} words.</li>
                  {currentPrompt?.taskType === 'task2' ? (
                     <li>Give reasons for your answer and include any relevant examples from your own knowledge or experience.</li>
                  ) : (
                     <li>Do not express your own opinion.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column: Writing Area */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-grow overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700">Your Response</h3>
                </div>
                <textarea
                  className="flex-grow w-full p-6 resize-none focus:outline-none text-slate-700 leading-loose"
                  placeholder="Start writing your essay here..."
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  style={{ minHeight: '400px' }}
                />
              </div>
              
              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
              )}

              <button 
                onClick={submitForGrading}
                className="mt-4 w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Submit for Grading <CheckCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* State: Grading Loading */}
        {appState === 'grading' && (
          <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              <Award className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Examiner AI is reviewing your essay...</h2>
            <p className="text-slate-500 max-w-md text-center">
              Evaluating Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy.
            </p>
          </div>
        )}

        {/* State: Result */}
        {appState === 'result' && gradingResult && (
          <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
            {/* Top Score Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-800 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <h2 className="text-blue-200 font-semibold mb-1 uppercase tracking-wider text-sm">Estimated Band Score</h2>
                <div className="text-6xl font-extrabold flex items-baseline gap-2 justify-center md:justify-start">
                  {gradingResult.overallBand.toFixed(1)} <span className="text-xl font-normal text-blue-300">/ 9.0</span>
                </div>
                <p className="mt-4 text-blue-100 max-w-lg leading-relaxed text-sm md:text-base">
                  {gradingResult.generalFeedback}
                </p>
              </div>
              <button 
                onClick={startPractice}
                className="bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-full font-bold flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <RefreshCw className="w-5 h-5" /> Try Another Prompt
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BarChartIcon className="w-5 h-5 text-blue-600"/> Score Breakdown
                </h3>
                
                <div className="space-y-6">
                  {[
                    { key: currentPrompt?.taskType === 'task2' ? 'tr' : 'ta', label: currentPrompt?.taskType === 'task2' ? 'Task Response (TR)' : 'Task Achievement (TA)', icon: <CheckCircle className="w-4 h-4 text-green-500"/> },
                    { key: 'cc', label: 'Coherence & Cohesion (CC)', icon: <RefreshCw className="w-4 h-4 text-amber-500"/> },
                    { key: 'lr', label: 'Lexical Resource (LR)', icon: <BookA className="w-4 h-4 text-purple-500"/> },
                    { key: 'gra', label: 'Grammatical Range (GRA)', icon: <PenTool className="w-4 h-4 text-rose-500"/> },
                  ].map((item) => (
                    <div key={item.key} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-semibold text-slate-700 flex items-center gap-2">
                          {item.icon} {item.label}
                        </div>
                        <div className="bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full text-sm">
                          {gradingResult[item.key].score.toFixed(1)}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg">
                        {gradingResult[item.key].feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses and Original Essay */}
              <div className="space-y-6 flex flex-col">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-grow">
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600"/> Strengths & Areas to Improve
                  </h3>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2">Strengths</h4>
                    <ul className="space-y-2">
                      {gradingResult.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-rose-700 uppercase tracking-wider mb-2">Areas to Improve</h4>
                    <ul className="space-y-2">
                      {gradingResult.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Original Essay Reference */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">Your Submitted Essay</h3>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed italic max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {essay}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      
      {/* Global styles for scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
}
