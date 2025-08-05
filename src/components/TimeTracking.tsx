import React, { useState, useEffect } from 'react';

interface TimeEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end' | 'lunch-start' | 'lunch-end';
    timestamp: string;
    date: string;
}

interface EmployeeStatus {
    employeeId: string;
    employeeName: string;
    isLoggedIn: boolean;
    isOnBreak: boolean;
    isOnLunch: boolean;
    clockInTime?: string;
    breakStartTime?: string;
    lunchStartTime?: string;
    totalHoursToday: number;
    totalBreakTime: number;
    totalLunchTime: number;
    dailyPay: number;
    hourlyRate: number;
    currentEarnings: number;
}

interface TimeTrackingProps {
    currentUser: { id: string; username: string } | null;
    isAdmin?: boolean;
}

const TimeTracking: React.FC<TimeTrackingProps> = ({ currentUser, isAdmin = false }) => {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [employeeStatuses, setEmployeeStatuses] = useState<EmployeeStatus[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [employees, setEmployees] = useState<any[]>([]);

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Load time entries from localStorage
    useEffect(() => {
        const savedEntries = localStorage.getItem('timeEntries');
        if (savedEntries) {
            setTimeEntries(JSON.parse(savedEntries));
        }

        // Load employee data for daily pay calculation
        const savedEmployees = localStorage.getItem('p-town-cashiers');
        if (savedEmployees) {
            setEmployees(JSON.parse(savedEmployees));
        }
    }, []);

    // Save time entries to localStorage
    const saveTimeEntries = (entries: TimeEntry[]) => {
        localStorage.setItem('timeEntries', JSON.stringify(entries));
        setTimeEntries(entries);
        updateEmployeeStatuses(entries);
    };

    // Update employee statuses based on time entries
    const updateEmployeeStatuses = (entries: TimeEntry[]) => {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = entries.filter(entry => entry.date === today);
        
        // Get all unique employees
        const allEmployees = Array.from(new Set(entries.map(entry => ({
            id: entry.employeeId,
            name: entry.employeeName
        })).map(emp => JSON.stringify(emp)))).map(emp => JSON.parse(emp));

        const statuses: EmployeeStatus[] = allEmployees.map(employee => {
            const employeeEntries = todayEntries.filter(entry => entry.employeeId === employee.id);
            
            let isLoggedIn = false;
            let isOnBreak = false;
            let isOnLunch = false;
            let clockInTime: string | undefined;
            let breakStartTime: string | undefined;
            let lunchStartTime: string | undefined;
            let totalHoursToday = 0;
            let totalBreakTime = 0;
            let totalLunchTime = 0;

            // Sort entries by timestamp
            employeeEntries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            let lastClockIn: Date | null = null;
            let lastBreakStart: Date | null = null;
            let lastLunchStart: Date | null = null;

            employeeEntries.forEach(entry => {
                const entryTime = new Date(entry.timestamp);
                
                switch (entry.type) {
                    case 'clock-in':
                        isLoggedIn = true;
                        lastClockIn = entryTime;
                        clockInTime = entry.timestamp;
                        break;
                    case 'clock-out':
                        isLoggedIn = false;
                        if (lastClockIn) {
                            totalHoursToday += (entryTime.getTime() - lastClockIn.getTime()) / (1000 * 60 * 60);
                        }
                        break;
                    case 'break-start':
                        isOnBreak = true;
                        lastBreakStart = entryTime;
                        breakStartTime = entry.timestamp;
                        break;
                    case 'break-end':
                        isOnBreak = false;
                        if (lastBreakStart) {
                            totalBreakTime += (entryTime.getTime() - lastBreakStart.getTime()) / (1000 * 60 * 60);
                        }
                        breakStartTime = undefined;
                        break;
                    case 'lunch-start':
                        isOnLunch = true;
                        lastLunchStart = entryTime;
                        lunchStartTime = entry.timestamp;
                        break;
                    case 'lunch-end':
                        isOnLunch = false;
                        if (lastLunchStart) {
                            totalLunchTime += (entryTime.getTime() - lastLunchStart.getTime()) / (1000 * 60 * 60);
                        }
                        lunchStartTime = undefined;
                        break;
                }
            });

            // If still logged in, add current working time
            if (isLoggedIn && lastClockIn) {
                totalHoursToday += (currentTime.getTime() - (lastClockIn as Date).getTime()) / (1000 * 60 * 60);
            }

            // If still on break, add current break time
            if (isOnBreak && lastBreakStart) {
                totalBreakTime += (currentTime.getTime() - (lastBreakStart as Date).getTime()) / (1000 * 60 * 60);
            }

            // If still on lunch, add current lunch time
            if (isOnLunch && lastLunchStart) {
                totalLunchTime += (currentTime.getTime() - (lastLunchStart as Date).getTime()) / (1000 * 60 * 60);
            }

            // Get employee data for pay calculations
            const employeeData = employees.find(emp => emp.id === employee.id);
            const dailyPay = employeeData?.dailyPay || 0;
            // Standard 8-hour workday + 1 hour lunch + 0.5 hour breaks = 9.5 total hours
            const standardWorkHours = 8;
            const hourlyRate = dailyPay / standardWorkHours;
            
            // Calculate current earnings based on work hours (excluding breaks and lunch)
            const workHours = totalHoursToday;
            const currentEarnings = Math.min(workHours * hourlyRate, dailyPay);

            return {
                employeeId: employee.id,
                employeeName: employee.name,
                isLoggedIn,
                isOnBreak,
                isOnLunch,
                clockInTime,
                breakStartTime,
                lunchStartTime,
                totalHoursToday: Math.round(totalHoursToday * 100) / 100,
                totalBreakTime: Math.round(totalBreakTime * 100) / 100,
                totalLunchTime: Math.round(totalLunchTime * 100) / 100,
                dailyPay,
                hourlyRate: Math.round(hourlyRate * 100) / 100,
                currentEarnings: Math.round(currentEarnings * 100) / 100
            };
        });

        setEmployeeStatuses(statuses);
    };

    // Re-calculate statuses when time changes
    useEffect(() => {
        updateEmployeeStatuses(timeEntries);
    }, [timeEntries, currentTime, employees]);

    const addTimeEntry = (type: TimeEntry['type']) => {
        if (!currentUser) return;

        const newEntry: TimeEntry = {
            id: Date.now().toString(),
            employeeId: currentUser.id,
            employeeName: currentUser.username,
            type,
            timestamp: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };

        saveTimeEntries([...timeEntries, newEntry]);
    };

    const getCurrentUserStatus = (): EmployeeStatus | null => {
        if (!currentUser) return null;
        return employeeStatuses.find(status => status.employeeId === currentUser.id) || null;
    };

    const formatTime = (hours: number): string => {
        const totalMinutes = Math.round(hours * 60);
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hrs}h ${mins}m`;
    };

    const formatTimestamp = (timestamp: string): string => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const currentUserStatus = getCurrentUserStatus();

    if (isAdmin) {
        // Admin View - All Employee Tracking
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '2rem',
                borderRadius: '20px',
                border: '1px solid rgba(226, 232, 240, 0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
            }}>
                <h2 style={{
                    color: '#1e293b',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    ⏰ Employee Time Tracking
                </h2>

                <div style={{
                    display: 'grid',
                    gap: '1.5rem'
                }}>
                    {employeeStatuses.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            color: '#64748b',
                            padding: '2rem',
                            background: 'rgba(148, 163, 184, 0.1)',
                            borderRadius: '12px'
                        }}>
                            No employee time data available
                        </div>
                    ) : (
                        employeeStatuses.map(status => (
                            <div key={status.employeeId} style={{
                                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
                                padding: '1.5rem',
                                borderRadius: '15px',
                                border: `2px solid ${status.isLoggedIn ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`,
                                boxShadow: status.isLoggedIn ? '0 4px 15px rgba(16, 185, 129, 0.1)' : 'none'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '1rem'
                                }}>
                                    <div>
                                        <h3 style={{
                                            color: '#1e293b',
                                            fontSize: '1.2rem',
                                            fontWeight: '600',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {status.employeeName}
                                        </h3>
                                        <div style={{
                                            display: 'flex',
                                            gap: '1rem',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{
                                                background: status.isLoggedIn ? '#10b981' : '#ef4444',
                                                color: 'white',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}>
                                                {status.isLoggedIn ? '🟢 Logged In' : '🔴 Logged Out'}
                                            </span>
                                            {status.isOnBreak && (
                                                <span style={{
                                                    background: '#f59e0b',
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    ☕ On Break
                                                </span>
                                            )}
                                            {status.isOnLunch && (
                                                <span style={{
                                                    background: '#8b5cf6',
                                                    color: 'white',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '20px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600'
                                                }}>
                                                    🍽️ On Lunch
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {status.clockInTime && (
                                        <div style={{
                                            textAlign: 'right',
                                            color: '#64748b',
                                            fontSize: '0.9rem'
                                        }}>
                                            Clocked in at {formatTimestamp(status.clockInTime)}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(6, 1fr)',
                                    gap: '1rem'
                                }}>
                                    <div style={{
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: '600' }}>
                                            WORK TIME TODAY
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                            {formatTime(status.totalHoursToday)}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: '600' }}>
                                            BREAK TIME
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                            {formatTime(status.totalBreakTime)}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(139, 92, 246, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#8b5cf6', fontSize: '0.8rem', fontWeight: '600' }}>
                                            LUNCH TIME
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                            {formatTime(status.totalLunchTime)}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600' }}>
                                            DAILY PAY
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                            ₱{status.dailyPay.toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(168, 85, 247, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#a855f7', fontSize: '0.8rem', fontWeight: '600' }}>
                                            HOURLY RATE
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                            ₱{status.hourlyRate.toFixed(2)}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        padding: '1rem',
                                        borderRadius: '10px',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: '600' }}>
                                            CURRENT EARNINGS
                                        </div>
                                        <div style={{ color: '#1e293b', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                            ₱{status.currentEarnings.toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // Employee View - Personal Time Clock
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
        }}>
            <h2 style={{
                color: '#1e293b',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '1.5rem',
                textAlign: 'center'
            }}>
                ⏰ Time Clock
            </h2>

            {/* Current Time Display */}
            <div style={{
                textAlign: 'center',
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                borderRadius: '15px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
                <div style={{
                    color: '#1e293b',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '0.5rem'
                }}>
                    {currentTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    })}
                </div>
                <div style={{ color: '#64748b', fontSize: '1rem' }}>
                    {currentTime.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {/* Current Status */}
            {currentUserStatus && (
                <div style={{
                    marginBottom: '2rem',
                    padding: '1.5rem',
                    background: currentUserStatus.isLoggedIn ? 
                        'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)' :
                        'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                    borderRadius: '15px',
                    border: `1px solid ${currentUserStatus.isLoggedIn ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                    <h3 style={{ color: '#1e293b', marginBottom: '1rem' }}>Current Status</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                WORK TIME TODAY
                            </div>
                            <div style={{ color: '#1e293b', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {formatTime(currentUserStatus.totalHoursToday)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                BREAK TIME
                            </div>
                            <div style={{ color: '#1e293b', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {formatTime(currentUserStatus.totalBreakTime)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>
                                LUNCH TIME
                            </div>
                            <div style={{ color: '#1e293b', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {formatTime(currentUserStatus.totalLunchTime)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
            }}>
                {/* Clock In/Out */}
                <button
                    onClick={() => addTimeEntry(currentUserStatus?.isLoggedIn ? 'clock-out' : 'clock-in')}
                    style={{
                        padding: '1rem 2rem',
                        background: currentUserStatus?.isLoggedIn ? 
                            'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' :
                            'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    {currentUserStatus?.isLoggedIn ? '🚪 Clock Out' : '🟢 Clock In'}
                </button>

                {/* Break In/Out */}
                <button
                    onClick={() => addTimeEntry(currentUserStatus?.isOnBreak ? 'break-end' : 'break-start')}
                    disabled={!currentUserStatus?.isLoggedIn}
                    style={{
                        padding: '1rem 2rem',
                        background: !currentUserStatus?.isLoggedIn ? 
                            'rgba(148, 163, 184, 0.3)' :
                            currentUserStatus?.isOnBreak ? 
                                'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' :
                                'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: !currentUserStatus?.isLoggedIn ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: !currentUserStatus?.isLoggedIn ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}
                >
                    {currentUserStatus?.isOnBreak ? '▶️ End Break' : '☕ Start Break'}
                </button>

                {/* Lunch In/Out */}
                <button
                    onClick={() => addTimeEntry(currentUserStatus?.isOnLunch ? 'lunch-end' : 'lunch-start')}
                    disabled={!currentUserStatus?.isLoggedIn}
                    style={{
                        padding: '1rem 2rem',
                        background: !currentUserStatus?.isLoggedIn ? 
                            'rgba(148, 163, 184, 0.3)' :
                            currentUserStatus?.isOnLunch ? 
                                'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' :
                                'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: !currentUserStatus?.isLoggedIn ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: !currentUserStatus?.isLoggedIn ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.2)',
                        gridColumn: 'span 2'
                    }}
                >
                    {currentUserStatus?.isOnLunch ? '▶️ End Lunch' : '🍽️ Start Lunch'}
                </button>
            </div>
        </div>
    );
};

export default TimeTracking;
