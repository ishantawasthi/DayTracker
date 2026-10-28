import http from 'http';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING DAYTRACK INTEGRATION & END-TO-END VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.status === 'ok', 'Server health check returns ok');

    // 2. Register a new user
    const testEmail = `testuser_${Date.now()}@daytrack.app`;
    const regRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        name: 'Vikash Sagar',
        email: testEmail,
        password: 'password123'
      }
    );
    assert(regRes.status === 201 && regRes.data.success, 'User registered successfully');
    const token = regRes.data.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };

    // 3. Login with credentials
    const loginRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: testEmail,
        password: 'password123'
      }
    );
    assert(loginRes.status === 200 && loginRes.data.data.token, 'User login verified & issued JWT');

    // 4. Verify 8 Seeded Categories
    const catRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/categories',
      method: 'GET',
      headers: authHeaders
    });
    assert(catRes.status === 200 && catRes.data.count >= 8, `Categories pre-seeded for user (count: ${catRes.data.count})`);

    const techCat = catRes.data.data.find((c) => c.name === 'Technical Study');
    const govtCat = catRes.data.data.find((c) => c.name === 'Government Exam');
    const fitCat = catRes.data.data.find((c) => c.name === 'Fitness');
    const grocCat = catRes.data.data.find((c) => c.name === 'Groceries & Shopping');

    assert(techCat && govtCat && fitCat && grocCat, 'Verified core domains (Tech, Govt, Fitness, Groceries)');

    // 5. Create Today's Tasks
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const task1 = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/tasks',
        method: 'POST',
        headers: authHeaders
      },
      {
        title: 'Study Java multithreading for 45 mins',
        category: techCat._id,
        scheduledDate: todayStr,
        priority: 'high',
        estimatedDuration: 45
      }
    );
    assert(task1.status === 201 && task1.data.data.title.includes('Study Java'), 'Created Technical Study task');

    const task2 = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/tasks',
        method: 'POST',
        headers: authHeaders
      },
      {
        title: 'Revise SSC CGL Quantitative Aptitude',
        category: govtCat._id,
        scheduledDate: todayStr,
        priority: 'medium',
        estimatedDuration: 40
      }
    );
    assert(task2.status === 201, 'Created Govt Exam task');

    const task3 = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/tasks',
        method: 'POST',
        headers: authHeaders
      },
      {
        title: 'Gym workout: Chest & Triceps',
        category: fitCat._id,
        scheduledDate: todayStr,
        priority: 'high',
        estimatedDuration: 60
      }
    );
    assert(task3.status === 201, 'Created Gym workout task');

    // 6. One-tap toggle completion
    const toggleRes = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/tasks/${task1.data.data._id}/toggle`,
      method: 'PATCH',
      headers: authHeaders
    });
    assert(toggleRes.status === 200 && toggleRes.data.data.status === 'completed', 'Marked task 1 as completed');

    // 7. Dashboard Summary Verification
    const dashSummary = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/tasks/dashboard-summary?date=${todayStr}`,
      method: 'GET',
      headers: authHeaders
    });
    assert(
      dashSummary.status === 200 &&
      dashSummary.data.data.totalToday === 3 &&
      dashSummary.data.data.completedToday === 1 &&
      dashSummary.data.data.completionPercentage === 33,
      `Dashboard progress computed correctly (33% completed, 1/3 done)`
    );

    // 8. Reschedule Task to Tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    const resched = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/tasks/${task2.data.data._id}/reschedule`,
        method: 'PATCH',
        headers: authHeaders
      },
      { scheduledDate: tomorrowStr }
    );
    assert(resched.status === 200 && resched.data.data.scheduledDate === tomorrowStr, 'Rescheduled task 2 to tomorrow');

    // 9. Batch Plan Tomorrow
    const batchPlan = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/tasks/batch-plan-tomorrow',
        method: 'POST',
        headers: authHeaders
      },
      {
        moveTaskIds: [task3.data.data._id],
        newTasks: [{ title: 'Solve 3 Dynamic Programming problems', priority: 'high' }],
        tomorrowDate: tomorrowStr
      }
    );
    assert(batchPlan.status === 200 && batchPlan.data.success, 'Batch planned tomorrow with rollover & new tasks');

    // 10. Habits Management & Heatmap
    const habit = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/habits',
        method: 'POST',
        headers: authHeaders
      },
      {
        title: 'Daily DSA Problem Practice',
        targetFrequency: 'daily'
      }
    );
    assert(habit.status === 201 && habit.data.data.title, 'Created habit');

    const toggleHabit = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: `/api/habits/${habit.data.data._id}/toggle-date`,
        method: 'PATCH',
        headers: authHeaders
      },
      { date: todayStr }
    );
    assert(
      toggleHabit.status === 200 &&
      toggleHabit.data.data.isCompletedToday === true &&
      toggleHabit.data.data.currentStreak === 1,
      'Completed habit for today & streak incremented to 1'
    );

    const heatmap = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/habits/heatmap?days=30',
      method: 'GET',
      headers: authHeaders
    });
    assert(heatmap.status === 200 && heatmap.data.data.dateCounts[todayStr] >= 1, 'Habit heatmap data populated');

    // 11. Study Session Tracker
    const techStudy = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/study/sessions',
        method: 'POST',
        headers: authHeaders
      },
      {
        subject: 'DSA',
        domain: 'technical',
        durationMinutes: 50,
        notes: 'Solved 2 medium sliding window problems on LeetCode'
      }
    );
    assert(techStudy.status === 201, 'Logged Technical Study session (50 mins)');

    const govtStudy = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/study/sessions',
        method: 'POST',
        headers: authHeaders
      },
      {
        subject: 'SSC CGL Quantitative Aptitude',
        domain: 'government',
        durationMinutes: 40,
        notes: 'Percentages and profit/loss practice set'
      }
    );
    assert(govtStudy.status === 201, 'Logged Govt Exam study session (40 mins)');

    const studyStats = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api/study/stats?date=${todayStr}`,
      method: 'GET',
      headers: authHeaders
    });
    assert(
      studyStats.status === 200 &&
      studyStats.data.data.today.totalMinutes === 90 &&
      studyStats.data.data.today.technicalMinutes === 50 &&
      studyStats.data.data.today.governmentMinutes === 40,
      'Study stats accurately compare Tech (50m) vs Govt (40m) = 90m total'
    );

    // 12. End-of-Day Review
    const reviewRes = await request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: '/api/reviews',
        method: 'POST',
        headers: authHeaders
      },
      {
        date: todayStr,
        wentWellNotes: 'Focused 50 mins on DSA before work; completed gym session.',
        toImproveNotes: 'Sleep by 11:15 PM so I have high energy for tomorrow office.',
        tasksCompleted: 1,
        tasksPending: 0,
        totalStudyMinutes: 90,
        habitsCompleted: 1
      }
    );
    assert(reviewRes.status === 200 && reviewRes.data.data.wentWellNotes, 'End-of-day review saved in MongoDB');

    // 13. Consolidated Growth Analytics
    const analytics = await request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/analytics/overview?days=30',
      method: 'GET',
      headers: authHeaders
    });
    assert(
      analytics.status === 200 &&
      analytics.data.data.summary.totalStudyHours === '1.5',
      'Growth analytics calculated total study hours accurately (1.5 hrs)'
    );

    // 14. Frontend proxy / static check
    const frontendCheck = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/',
      method: 'GET'
    });
    assert(frontendCheck.status === 200 && frontendCheck.text.includes('DayTrack'), 'Frontend web app serving on port 3000');

    console.log(`\n--- TEST RESULTS: ${passed} PASSED, ${failed} FAILED ---`);
  } catch (err) {
    console.error('Test execution error:', err);
  }
}

runTests();
