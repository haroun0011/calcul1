// Fixed subjects list
const subjects = [
    'رياضيات مالية',
    'استراتيجية مؤسسة',
    'قانون شركات',
    'محاسبة وطنية',
    'تحليل بيانات',
    'إدارة الإنتاج والعمليات',
    'لغة إنجليزية',
    'نظرية المنظمة'
];

// Subject coefficients - fixed values
const subjectCoefficients = {
    'رياضيات مالية': 2,
    'استراتيجية مؤسسة': 2,
    'قانون شركات': 2,
    'محاسبة وطنية': 2,
    'تحليل بيانات': 2,
    'إدارة الإنتاج والعمليات': 2,
    'لغة إنجليزية': 1,
    'نظرية المنظمة': 2
};

// Fixed Exam/TD weights (not configurable via UI)
const examWeight = 0.6;
const tdWeight = 0.4;

// Data storage
const semesterData = {
    S1: {},
    S2: {}
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSubjects();
    initializeTabs();
    calculateAll();
});

// Initialize subjects for both semesters
function initializeSubjects() {
    ['S1', 'S2'].forEach(semester => {
        const container = document.getElementById(`subjects-${semester}`);
        subjects.forEach((subject, index) => {
            const subjectCard = createSubjectCard(subject, semester, index);
            container.appendChild(subjectCard);
            
            // Initialize data structure
            if (!semesterData[semester][subject]) {
                semesterData[semester][subject] = {
                    exam: '',
                    td: ''
                };
            }
        });
    });
}

// Check if subject is English (TD only, no Exam)
const ENGLISH_SUBJECT = 'لغة إنجليزية';

function isEnglishSubject(subjectName) {
    return subjectName === ENGLISH_SUBJECT;
}

// Create a subject card element
function createSubjectCard(subjectName, semester, index) {
    const card = document.createElement('div');
    const isEnglish = isEnglishSubject(subjectName);
    card.className = isEnglish ? 'subject-card english-only' : 'subject-card';
    card.id = `subject-${semester}-${index}`;
    
    // Build HTML - hide Exam input for English
    let examInputHTML = '';
    if (!isEnglish) {
        examInputHTML = `
        <div class="input-group">
            <label for="exam-${semester}-${index}">الامتحان (Exam):</label>
            <input 
                type="number" 
                id="exam-${semester}-${index}" 
                min="0" 
                max="20" 
                step="0.01"
                placeholder="0.00"
                inputmode="decimal"
                data-semester="${semester}"
                data-subject="${subjectName}"
                data-type="exam"
            >
        </div>`;
    }
    
    card.innerHTML = `
        <div class="subject-name">${subjectName} <span class="coefficient">(معامل: ${subjectCoefficients[subjectName]})</span></div>
        ${examInputHTML}
        <div class="input-group">
            <label for="td-${semester}-${index}">${isEnglish ? 'الدرجة (TD):' : 'الأعمال الموجهة (TD):'}</label>
            <input 
                type="number" 
                id="td-${semester}-${index}" 
                min="0" 
                max="20" 
                step="0.01"
                placeholder="0.00"
                inputmode="decimal"
                data-semester="${semester}"
                data-subject="${subjectName}"
                data-type="td"
            >
        </div>
        <div class="subject-average">
            <span class="label">المعدل:</span>
            <span class="value" id="avg-${semester}-${index}">-</span>
        </div>
    `;
    
    // Add event listeners
    const tdInput = card.querySelector(`#td-${semester}-${index}`);
    tdInput.addEventListener('input', handleGradeInput);
    tdInput.addEventListener('blur', handleGradeInput);
    
    // Only add Exam input listeners if not English
    if (!isEnglish) {
        const examInput = card.querySelector(`#exam-${semester}-${index}`);
        examInput.addEventListener('input', handleGradeInput);
        examInput.addEventListener('blur', handleGradeInput);
        
        // Prevent zoom on iOS when focusing inputs
        examInput.addEventListener('focus', () => {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    examInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    }
    
    tdInput.addEventListener('focus', () => {
        if (window.innerWidth <= 768) {
            setTimeout(() => {
                tdInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
    
    return card;
}

// Handle grade input changes with mobile optimizations
function handleGradeInput(event) {
    const input = event.target;
    const semester = input.dataset.semester;
    const subject = input.dataset.subject;
    const type = input.dataset.type;
    let value = input.value;
    
    // Validate and format input
    if (value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            // Clamp value between 0 and 20
            if (numValue < 0) {
                value = 0;
                input.value = 0;
            } else if (numValue > 20) {
                value = 20;
                input.value = 20;
            } else {
                value = numValue;
            }
        } else {
            value = '';
        }
    }
    
    // Update data
    semesterData[semester][subject][type] = value;
    
    // Add visual feedback
    input.style.transform = 'scale(1.05)';
    setTimeout(() => {
        input.style.transform = '';
    }, 200);
    
    // Recalculate with debounce for better performance
    clearTimeout(input.calculateTimeout);
    input.calculateTimeout = setTimeout(() => {
        calculateAll();
    }, 300);
}

// Initialize semester tabs with swipe support
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const semesterContents = document.querySelectorAll('.semester-content');
    const container = document.querySelector('.container');
    
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;
    
    function switchTab(targetSemester) {
        // Update active tab
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.semester === targetSemester) {
                btn.classList.add('active');
            }
        });
        
        // Show/hide semester content with animation
        semesterContents.forEach(content => {
            if (content.id === targetSemester) {
                content.style.display = 'block';
                content.style.animation = 'fadeIn 0.4s ease-out';
            } else {
                content.style.display = 'none';
            }
        });
        
        // Scroll to top smoothly
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.semester);
        });
        
        // Add touch feedback
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.96)';
        });
        
        button.addEventListener('touchend', () => {
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });
    
    // Swipe gesture support for mobile
    let isSwiping = false;
    
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isSwiping = true;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        touchEndX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    container.addEventListener('touchend', () => {
        if (!isSwiping) return;
        isSwiping = false;
        
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const activeButton = document.querySelector('.tab-button.active');
            const currentSemester = activeButton.dataset.semester;
            
            if (diff > 0 && currentSemester === 'S1') {
                // Swipe right to left (RTL) - go to S2
                switchTab('S2');
            } else if (diff < 0 && currentSemester === 'S2') {
                // Swipe left to right (RTL) - go to S1
                switchTab('S1');
            }
        }
        
        touchStartX = 0;
        touchEndX = 0;
    }, { passive: true });
}


// Calculate subject average
function calculateSubjectAverage(exam, td, subjectName) {
    const isEnglish = isEnglishSubject(subjectName);
    
    if (isEnglish) {
        // English: TD only
        if (td === '') {
            return null;
        }
        const tdValue = parseFloat(td);
        if (isNaN(tdValue)) {
            return null;
        }
        return tdValue;
    } else {
        // Other subjects: Exam + TD
        if (exam === '' || td === '') {
            return null;
        }
        
        const examValue = parseFloat(exam);
        const tdValue = parseFloat(td);
        
        if (isNaN(examValue) || isNaN(tdValue)) {
            return null;
        }
        
        return (examValue * examWeight) + (tdValue * tdWeight);
    }
}

// Check if subject is passed
function isSubjectPassed(average, subjectName, td) {
    if (average === null) {
        return false;
    }
    
    const isEnglish = isEnglishSubject(subjectName);
    
    if (isEnglish) {
        // English: passed if TD >= 10
        const tdValue = parseFloat(td) || 0;
        return tdValue >= 10;
    } else {
        // Other subjects: passed if average >= 10
        return average >= 10;
    }
}

// Animate number changes smoothly
function animateValue(element, start, end, duration = 300) {
    if (element.textContent === '-' || element.textContent === '') {
        element.textContent = end !== null ? end.toFixed(2) : '-';
        return;
    }
    
    const startValue = parseFloat(start) || 0;
    const endValue = parseFloat(end) || 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + (endValue - startValue) * easeOut;
        
        if (end !== null && !isNaN(end)) {
            element.textContent = currentValue.toFixed(2);
        } else {
            element.textContent = '-';
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            if (end !== null && !isNaN(end)) {
                element.textContent = end.toFixed(2);
            } else {
                element.textContent = '-';
            }
        }
    }
    
    requestAnimationFrame(update);
}

// Animate integer values
function animateInteger(element, start, end, duration = 300) {
    const startValue = parseInt(start) || 0;
    const endValue = parseInt(end) || 0;
    
    if (startValue === endValue) {
        element.textContent = endValue.toString();
        return;
    }
    
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (endValue - startValue) * easeOut);
        
        element.textContent = currentValue.toString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = endValue.toString();
        }
    }
    
    requestAnimationFrame(update);
}

// Calculate all averages and update UI
function calculateAll() {
    ['S1', 'S2'].forEach(semester => {
        let weightedSum = 0;
        let totalCoefficients = 0;
        let passedCount = 0;
        let failedCount = 0;
        
        subjects.forEach((subject, index) => {
            const data = semesterData[semester][subject];
            const average = calculateSubjectAverage(data.exam, data.td, subject);
            const card = document.getElementById(`subject-${semester}-${index}`);
            const avgDisplay = document.getElementById(`avg-${semester}-${index}`);
            const coefficient = subjectCoefficients[subject];
            
            // Update average display with animation
            const previousAvg = parseFloat(avgDisplay.textContent) || null;
            if (average !== null) {
                animateValue(avgDisplay, previousAvg, average, 400);
                weightedSum += average * coefficient;
                totalCoefficients += coefficient;
                
                // Update card styling - pass subject name and TD for English check
                card.classList.remove('passed', 'failed');
                if (isSubjectPassed(average, subject, data.td)) {
                    card.classList.add('passed');
                    passedCount++;
                } else {
                    card.classList.add('failed');
                    failedCount++;
                }
            } else {
                if (previousAvg !== null) {
                    animateValue(avgDisplay, previousAvg, null, 300);
                } else {
                    avgDisplay.textContent = '-';
                }
                card.classList.remove('passed', 'failed');
            }
        });
        
        // Calculate semester average using weighted average
        const semesterAverage = totalCoefficients > 0 ? weightedSum / totalCoefficients : null;
        const averageDisplay = document.getElementById(`average-${semester}`);
        const passedDisplay = document.getElementById(`passed-${semester}`);
        const failedDisplay = document.getElementById(`failed-${semester}`);
        
        // Animate semester average
        const previousSemAvg = parseFloat(averageDisplay.textContent) || null;
        if (semesterAverage !== null) {
            animateValue(averageDisplay, previousSemAvg, semesterAverage, 500);
        } else {
            if (previousSemAvg !== null) {
                animateValue(averageDisplay, previousSemAvg, null, 300);
            } else {
                averageDisplay.textContent = '-';
            }
        }
        
        // Animate counts
        const previousPassed = parseInt(passedDisplay.textContent) || 0;
        const previousFailed = parseInt(failedDisplay.textContent) || 0;
        animateInteger(passedDisplay, previousPassed, passedCount, 400);
        animateInteger(failedDisplay, previousFailed, failedCount, 400);
    });
    
    // Calculate overall average
    calculateOverallAverage();
}

// Calculate overall average (average of both semesters)
function calculateOverallAverage() {
    const s1Average = parseFloat(document.getElementById('average-S1').textContent);
    const s2Average = parseFloat(document.getElementById('average-S2').textContent);
    const overallDisplay = document.getElementById('overallAverage');
    
    const previousOverall = parseFloat(overallDisplay.textContent) || null;
    let newOverall = null;
    
    if (!isNaN(s1Average) && !isNaN(s2Average)) {
        newOverall = (s1Average + s2Average) / 2;
    } else if (!isNaN(s1Average)) {
        newOverall = s1Average;
    } else if (!isNaN(s2Average)) {
        newOverall = s2Average;
    }
    
    if (newOverall !== null) {
        animateValue(overallDisplay, previousOverall, newOverall, 600);
    } else {
        if (previousOverall !== null) {
            animateValue(overallDisplay, previousOverall, null, 300);
        } else {
            overallDisplay.textContent = '-';
        }
    }
}
