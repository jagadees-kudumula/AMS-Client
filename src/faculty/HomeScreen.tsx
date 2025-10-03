import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

type HomeScreenProps = {
    userEmail: string;
    user: {
        name: string;
        email: string;
    } | null;
    setIsLoggedIn: (value: boolean) => void;
    setUser: (user: { name: string; email: string } | null) => void;
};

type ScheduleItem = {
    id: number;
    subject_name: string;
    year: string;
    department: string;
    section: string;
    venue: string;
    start_time: string;
    end_time: string;
    status: boolean;
    subject_code: string;
};

type ScheduleData = {
    faculty_name: string;
    schedules: ScheduleItem[];
};

type TimeSlot = {
    start_time: string;
    end_time: string;
};

type Subject = {
    subject_code: string;
    subject_name: string;
    subject_type: string;
};

type ServerTimeData = {
    datetime: string;
    date: string;
    time: string;
    timezone: string;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ userEmail, user, setIsLoggedIn, setUser }) => {
    const [actualFacultyId, setActualFacultyId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [showAttendanceModal, setShowAttendanceModal] = useState<boolean>(false);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [fetchingSlots, setFetchingSlots] = useState<boolean>(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null);
    const [generatedOTP, setGeneratedOTP] = useState<string>('');
    const [isGeneratingOTP, setIsGeneratingOTP] = useState<boolean>(false);
    const [serverTime, setServerTime] = useState<Date>(new Date());
    const [timeLoading, setTimeLoading] = useState<boolean>(true);
    
    // Filter options
    const yearOptions = ['E1', 'E2', 'E3', 'E4'];
    const departmentOptions = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];
    const sectionOptions = ['A', 'B', 'C', 'D', 'E'];
    
    const [newSchedule, setNewSchedule] = useState({
        year: '',
        department: '',
        section: '',
        venue: '',
        start_time: '',
        end_time: '',
        subject_code: ''
    });

    const API_BASE_URL = 'http://10.173.174.102:5000';

    useEffect(() => {
        if (user?.email) {
            setActualFacultyId("F006");
        }
    }, [user]);

    useEffect(() => {
        fetchServerTime();
    }, []);

    useEffect(() => {
        if (actualFacultyId && !timeLoading) {
            fetchScheduleForDate(selectedDate);
        }
    }, [selectedDate, actualFacultyId, timeLoading]);

    const fetchServerTime = async () => {
        try {
            setTimeLoading(true);
            const response = await fetch(`${API_BASE_URL}/time`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch server time');
            }
            
            const data: ServerTimeData = await response.json();
            const serverDateTime = new Date(data.datetime);
            setServerTime(serverDateTime);
            console.log('Fetched server time:', serverDateTime);
        } catch (err) {
            console.error('Fetch server time error:', err);
            // Fallback to system time if API fails
            setServerTime(new Date());
            Alert.alert('Info', 'Using system time as fallback');
        } finally {
            setTimeLoading(false);
        }
    };

    const fetchScheduleForDate = async (date: Date) => {
        if (!actualFacultyId || timeLoading) return;

        try {
            setLoading(true);
            const dateStr = date.toISOString().split('T')[0];
            
            const response = await fetch(
                `${API_BASE_URL}/faculty/${actualFacultyId}/schedule?date=${dateStr}`
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch schedule');
            }
            
            const data: ScheduleData = await response.json();
            setScheduleData(data);
        } catch (err) {
            console.error('Fetch schedule error:', err);
            Alert.alert('Error', (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFacultySubjects = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/faculty/${actualFacultyId}/subjects`);
            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }
            const data = await response.json();
            setSubjects(data.subjects || []);
        } catch (err) {
            console.error('Fetch subjects error:', err);
            Alert.alert('Error', 'Failed to fetch subjects');
        }
    };

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        
        // Only allow yesterday, today, and tomorrow based on server time
        const today = new Date(serverTime);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const allowedDates = [today, tomorrow, yesterday];
        const isAllowed = allowedDates.some(date => 
            date.toDateString() === newDate.toDateString()
        );
        
        if (isAllowed) {
            setSelectedDate(newDate);
        }
    };

    const getDateDisplayText = (): string => {
        if (timeLoading) return 'Loading...';
        
        const today = new Date(serverTime);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (selectedDate.toDateString() === today.toDateString()) {
            return "Today's Schedule";
        } else if (selectedDate.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow's Schedule";
        } else if (selectedDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday's Schedule";
        } else {
            return "Invalid Date";
        }
    };

    const getGreeting = (): string => {
        if (timeLoading) return 'Loading...';
        
        const hour = serverTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 15) return 'Good Afternoon';
        return 'Good Evening';
    };

    const formatTime = (timeStr: string): string => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    };

    const getCurrentTimeStatus = (startTime: string, endTime: string): string => {
    if (timeLoading) return 'Loading...';
    
    const currentTime = serverTime.getHours() * 60 + serverTime.getMinutes();
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    const gracePeriod = 30; // We can change the time limit for marking attendance after the completion of class...
    
    if (currentTime < startTimeInMinutes) {
        return 'Upcoming';
    } else if (currentTime >= startTimeInMinutes && currentTime <= endTimeInMinutes + gracePeriod) {
        return 'Ongoing';
    } else {
        return 'Expired';
    }
};
    const handleCancelSchedule = (schedule: ScheduleItem) => {
        Alert.alert(
            'Cancel Class',
            `Are you sure you want to cancel ${schedule.subject_name} class?`,
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes', 
                    style: 'destructive',
                    onPress: () => cancelSchedule(schedule.id)
                }
            ]
        );
    };

    const cancelSchedule = async (scheduleId: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/schedule/${scheduleId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to cancel schedule');
            }
            
            Alert.alert('Success', 'Class cancelled successfully');
            fetchScheduleForDate(selectedDate);
        } catch (err) {
            console.error('Cancel schedule error:', err);
            Alert.alert('Error', (err as Error).message);
        }
    };

    const handleMarkAttendance = (schedule: ScheduleItem) => {
        setSelectedSchedule(schedule);
        setShowAttendanceModal(true);
        setGeneratedOTP('');
    };

    const generateOTP = async () => {
        if (!selectedSchedule) return;

        try {
            setIsGeneratingOTP(true);
            
            // Generate OTP with 2 capital letters, 2 small letters, 2 digits
            const capitals = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const smalls = 'abcdefghijklmnopqrstuvwxyz';
            const digits = '0123456789';
            
            const getRandomChar = (str: string) => str[Math.floor(Math.random() * str.length)];
            
            const otp = 
                getRandomChar(capitals) + 
                getRandomChar(capitals) + 
                getRandomChar(smalls) + 
                getRandomChar(smalls) + 
                getRandomChar(digits) + 
                getRandomChar(digits);
            
            // Shuffle the OTP
            const shuffledOTP = otp.split('').sort(() => 0.5 - Math.random()).join('');
            
            // Call backend to store OTP
            const response = await fetch(`${API_BASE_URL}/generate-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schedule_id: selectedSchedule.id,
                    faculty_id: actualFacultyId,
                    otp: shuffledOTP
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate OTP');
            }

            setGeneratedOTP(shuffledOTP);
            Alert.alert('Success', `OTP generated: ${shuffledOTP}`);
        } catch (err) {
            console.error('Generate OTP error:', err);
            Alert.alert('Error', 'Failed to generate OTP');
        } finally {
            setIsGeneratingOTP(false);
        }
    };

    const handleCreateSchedule = () => {
        setShowCreateModal(true);
        setAvailableSlots([]);
        fetchFacultySubjects();
    };

    const fetchAvailableSlots = async () => {
        if (!newSchedule.year || !newSchedule.department || !newSchedule.section || !newSchedule.subject_code) {
            Alert.alert('Error', 'Please select Year, Department, Section and Subject first');
            return;
        }

        try {
            setFetchingSlots(true);
            const dateStr = selectedDate.toISOString().split('T')[0];
            
            const selectedSubject = subjects.find(sub => sub.subject_code === newSchedule.subject_code);
            const subjectType = selectedSubject?.subject_type || 'normal';

            const response = await fetch(
                `${API_BASE_URL}/faculty/${actualFacultyId}/available-slots?date=${dateStr}&year=${newSchedule.year}&department=${newSchedule.department}&section=${newSchedule.section}&subject_type=${subjectType}`
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch available slots');
            }
            
            const data = await response.json();
            
            if (data.success) {
                setAvailableSlots(data.available_slots || []);
                if (data.available_slots.length === 0) {
                    Alert.alert('Info', 'No available time slots found for the selected criteria.');
                }
            } else {
                throw new Error(data.error || 'Failed to fetch available slots');
            }
        } catch (err) {
            console.error('Fetch slots error:', err);
            Alert.alert('Error', (err as Error).message);
            setAvailableSlots([]);
        } finally {
            setFetchingSlots(false);
        }
    };

    const handleCreateSubmit = async () => {
        if (!newSchedule.year || !newSchedule.department || !newSchedule.section || 
            !newSchedule.start_time || !newSchedule.end_time || !newSchedule.subject_code) {
            Alert.alert('Error', 'Please fill all required fields including subject and time slot');
            return;
        }

        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const payload = {
                faculty_id: actualFacultyId,
                date: dateStr,
                year: newSchedule.year,
                department: newSchedule.department,
                section: newSchedule.section,
                start_time: newSchedule.start_time,
                end_time: newSchedule.end_time,
                venue: newSchedule.venue || '',
                subject_code: newSchedule.subject_code
            };

            const response = await fetch(`${API_BASE_URL}/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to create schedule');
            }
            
            Alert.alert('Success', 'Schedule created successfully');
            setShowCreateModal(false);
            resetNewSchedule();
            fetchScheduleForDate(selectedDate);
        } catch (err) {
            console.error('Create schedule error:', err);
            Alert.alert('Error', (err as Error).message);
        }
    };

    const resetNewSchedule = () => {
        setNewSchedule({
            year: '',
            department: '',
            section: '',
            venue: '',
            start_time: '',
            end_time: '',
            subject_code: ''
        });
        setAvailableSlots([]);
    };

    const renderFilterButtons = (options: string[], selectedValue: string, setValue: (value: string) => void, title: string) => (
        <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{title}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filterButtonsContainer}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.filterButton,
                                selectedValue === option && styles.filterButtonSelected
                            ]}
                            onPress={() => {
                                setValue(option);
                                if (availableSlots.length > 0) {
                                    setAvailableSlots([]);
                                }
                            }}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                selectedValue === option && styles.filterButtonTextSelected
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );

    const renderScheduleCard = ({ item }: { item: ScheduleItem }) => {
    const timeStatus = getCurrentTimeStatus(item.start_time, item.end_time);
    const isCompleted = item.status === true;
    const isOngoing = timeStatus === 'Ongoing' && !item.status;
    const isExpired = timeStatus === 'Expired' && !item.status;
    const isScheduled = timeStatus === 'Upcoming' && !item.status;
    
    // Determine badge text and style
    let badgeText = 'Loading...';
    let badgeStyle = styles.loadingBadge;
    
    if (!timeLoading) {
        if (isCompleted) {
            badgeText = 'Completed';
            badgeStyle = styles.completedBadge;
        } else if (isOngoing) {
            badgeText = 'Ongoing';
            badgeStyle = styles.ongoingBadge;
        } else if (isExpired) {
            badgeText = 'Expired';
            badgeStyle = styles.expiredBadge;
        } else if (isScheduled) {
            badgeText = 'Scheduled';
            badgeStyle = styles.scheduledBadge;
        }
    }
    
    return (
        <View style={styles.scheduleCard}>
            <View style={styles.scheduleInfo}>
                <View style={styles.scheduleHeader}>
                    <Text style={styles.subjectName}>{item.subject_name}</Text>
                    <View style={[styles.timeStatusBadge, badgeStyle]}>
                        <Text style={styles.timeStatusText}>{badgeText}</Text>
                    </View>
                </View>
                <View style={styles.scheduleDetailsContainer}>
                    <View style={styles.detailRow}>
                        <Icon name="school" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            E-{item.year} ,{item.department} - {item.section}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="access-time" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="location-on" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            {item.venue || 'Venue not specified'}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Icon name="info" size={14} color="#600202" />
                        <Text style={styles.scheduleDetails}>
                            Status: {item.status ? 'Completed' : 'Scheduled'}
                        </Text>
                    </View>
                </View>
            </View>
            
            <View style={styles.actionButtons}>
                {isOngoing && !item.status && (
                    <TouchableOpacity 
                        style={styles.attendanceButton}
                        onPress={() => handleMarkAttendance(item)}
                    >
                        <Icon name="how-to-reg" size={16} color="#FFF" />
                        <Text style={styles.attendanceButtonText}>Mark Attendance</Text>
                    </TouchableOpacity>
                )}
                {!isCompleted && !item.status && timeStatus !== 'Loading...' && (
                    <TouchableOpacity 
                        style={styles.cancelButton}
                        onPress={() => handleCancelSchedule(item)}
                    >
                        <Icon name="close" size={16} color="#FFF" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

    // Show loading if faculty ID is not available yet or time is loading
    if ((!actualFacultyId && user?.email) || timeLoading) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f5f5f5" />
                    <Text style={styles.loadingText}>
                        {timeLoading ? 'Fetching Server Time...' : 'Loading Faculty Data...'}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>
                    {getGreeting()}, {user?.name || scheduleData?.faculty_name || 'Faculty'}!
                </Text>    
                {/* Calendar Navigation */}
                <View style={styles.calendarNav}>
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => navigateDate(-1)}
                    >
                        <Icon name="chevron-left" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <View style={styles.dateDisplay}>
                        <Text style={styles.dateTitle}>{getDateDisplayText()}</Text>
                    </View>
                    
                    <TouchableOpacity 
                        style={styles.navButton}
                        onPress={() => navigateDate(1)}
                    >
                        <Icon name="chevron-right" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsContainer}>
                <Text style={styles.statsText}>
                    {scheduleData?.schedules?.length || 0} class{scheduleData?.schedules?.length !== 1 ? 'es' : ''} scheduled
                </Text>
            </View>

            {/* Schedule List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f5f5f5" />
                    <Text style={styles.loadingText}>Loading Schedule...</Text>
                </View>
            ) : (
                <FlatList
                    data={(scheduleData?.schedules || []).sort(
                        (a, b) => {
                            const [ah, am] = a.start_time.split(':').map(Number);
                            const [bh, bm] = b.start_time.split(':').map(Number);
                            return ah * 60 + am - (bh * 60 + bm);
                        }
                    )}
                    renderItem={renderScheduleCard}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Icon name="event-busy" size={60} color="#f5f5f5" />
                            <Text style={styles.emptyText}>No Classes Scheduled</Text>
                            <Text style={styles.emptySubText}>
                                No classes scheduled for {getDateDisplayText().toLowerCase()}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        <View style={styles.footerContainer}>
                            <TouchableOpacity 
                                style={styles.createScheduleButton}
                                onPress={handleCreateSchedule}
                            >
                                <Icon name="add" size={20} color="#FFF" />
                                <Text style={styles.createScheduleButtonText}>
                                    Schedule New Class
                                </Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Create Schedule Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowCreateModal(false);
                    resetNewSchedule();
                }}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Schedule New Class</Text>
                            <TouchableOpacity onPress={() => {
                                setShowCreateModal(false);
                                resetNewSchedule();
                            }}>
                                <Icon name="close" size={24} color="#600202" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.formContainer}>
                            {/* Filter Sections */}
                            {renderFilterButtons(yearOptions, newSchedule.year, 
                                (value) => setNewSchedule({...newSchedule, year: value}),'Academic Year')}
                            
                            {renderFilterButtons(departmentOptions, newSchedule.department, 
                                (value) => setNewSchedule({...newSchedule, department: value}), 'Department')}
                            
                            {renderFilterButtons(sectionOptions, newSchedule.section, 
                                (value) => setNewSchedule({...newSchedule, section: value}), 'Section')}

                            {/* Subject Dropdown */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Subject *</Text>
                                <ScrollView style={styles.subjectDropdown}>
                                    {subjects.map((subject) => (
                                        <TouchableOpacity
                                            key={subject.subject_code}
                                            style={[
                                                styles.subjectItem,
                                                newSchedule.subject_code === subject.subject_code && styles.subjectItemSelected
                                            ]}
                                            onPress={() => setNewSchedule({
                                                ...newSchedule, 
                                                subject_code: subject.subject_code
                                            })}
                                        >
                                            <Text style={styles.subjectText}>
                                                {subject.subject_code} - {subject.subject_name}
                                            </Text>
                                            <Text style={styles.subjectType}>
                                                ({subject.subject_type})
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Fetch Time Slots Button */}
                            {newSchedule.year && newSchedule.department && newSchedule.section && newSchedule.subject_code && (
                                <TouchableOpacity 
                                    style={[styles.fetchSlotsButton, fetchingSlots && styles.buttonDisabled]}
                                    onPress={fetchAvailableSlots}
                                    disabled={fetchingSlots}
                                >
                                    {fetchingSlots ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Icon name="search" size={20} color="#FFF" />
                                            <Text style={styles.fetchSlotsButtonText}>
                                                Fetch Available Time Slots
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}

                            {/* Available Time Slots */}
                            {availableSlots.length > 0 && (
                                <View style={styles.slotsSection}>
                                    <Text style={styles.slotsTitle}>Available Time Slots:</Text>
                                    {availableSlots.map((slot, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.slotItem,
                                                newSchedule.start_time === slot.start_time && styles.slotItemSelected
                                            ]}
                                            onPress={() => setNewSchedule({
                                                ...newSchedule,
                                                start_time: slot.start_time,
                                                end_time: slot.end_time
                                            })}
                                        >
                                            <Text style={styles.slotText}>
                                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Venue Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Venue (Optional)</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Enter venue"
                                    value={newSchedule.venue}
                                    onChangeText={(text) => setNewSchedule({...newSchedule, venue: text})}
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {/* Selected Time Display */}
                            {newSchedule.start_time && (
                                <View style={styles.selectedTimeContainer}>
                                    <Text style={styles.selectedTime}>
                                        Selected: {formatTime(newSchedule.start_time)} - {formatTime(newSchedule.end_time)}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={[styles.modalCancelButton, styles.modalButton]}
                                onPress={() => {
                                    setShowCreateModal(false);
                                    resetNewSchedule();
                                }}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalSubmitButton, styles.modalButton, (!newSchedule.start_time) && styles.modalSubmitButtonDisabled]}
                                onPress={handleCreateSubmit}
                                disabled={!newSchedule.start_time}
                            >
                                <Text style={styles.modalSubmitButtonText}>Schedule Class</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Mark Attendance Modal */}
            <Modal
                visible={showAttendanceModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => {
                    setShowAttendanceModal(false);
                    setSelectedSchedule(null);
                    setGeneratedOTP('');
                }}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    style={styles.modalContainer}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Mark Attendance</Text>
                            <TouchableOpacity onPress={() => {
                                setShowAttendanceModal(false);
                                setSelectedSchedule(null);
                                setGeneratedOTP('');
                            }}>
                                <Icon name="close" size={24} color="#600202" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.formContainer}>
                            {selectedSchedule && (
                                <View style={styles.classInfoContainer}>
                                    <Text style={styles.classInfoTitle}>Class Details</Text>
                                    <View style={styles.classDetailRow}>
                                        <Text style={styles.classDetailLabel}>Subject:</Text>
                                        <Text style={styles.classDetailValue}>{selectedSchedule.subject_name}</Text>
                                    </View>
                                    <View style={styles.classDetailRow}>
                                        <Text style={styles.classDetailLabel}>Class:</Text>
                                        <Text style={styles.classDetailValue}>
                                            E-{selectedSchedule.year} {selectedSchedule.department} - {selectedSchedule.section}
                                        </Text>
                                    </View>
                                    <View style={styles.classDetailRow}>
                                        <Text style={styles.classDetailLabel}>Time:</Text>
                                        <Text style={styles.classDetailValue}>
                                            {formatTime(selectedSchedule.start_time)} - {formatTime(selectedSchedule.end_time)}
                                        </Text>
                                    </View>
                                    <View style={styles.classDetailRow}>
                                        <Text style={styles.classDetailLabel}>Venue:</Text>
                                        <Text style={styles.classDetailValue}>
                                            {selectedSchedule.venue || 'Not specified'}
                                        </Text>
                                    </View>
                                    <View style={styles.classDetailRow}>
                                        <Text style={styles.classDetailLabel}>Current Server Time:</Text>
                                        <Text style={styles.classDetailValue}>
                                            {serverTime.toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: true
                                            })}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* OTP Generation Section */}
                            <View style={styles.otpSection}>
                                <Text style={styles.otpTitle}>Generate OTP for Attendance</Text>
                                <Text style={styles.otpDescription}>
                                    Generate a one-time password to share with students
                                </Text>
                                
                                <TouchableOpacity 
                                    style={[styles.generateOtpButton, isGeneratingOTP && styles.buttonDisabled]}
                                    onPress={generateOTP}
                                    disabled={isGeneratingOTP}
                                >
                                    {isGeneratingOTP ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <>
                                            <Icon name="vpn-key" size={20} color="#FFF" />
                                            <Text style={styles.generateOtpButtonText}>
                                                {generatedOTP ? 'Regenerate OTP' : 'Generate OTP'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                {generatedOTP && (
                                    <View style={styles.generatedOtpContainer}>
                                        <Text style={styles.generatedOtpLabel}>Generated OTP:</Text>
                                        <Text style={styles.generatedOtpValue}>{generatedOTP}</Text>
                                        <Text style={styles.otpInstruction}>
                                            Share this OTP with your students. They need to enter this in their app to mark attendance.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#600202',
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    calendarNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 15,
        padding: 10,
        marginHorizontal: 10,
    },
    navButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    dateDisplay: {
        flex: 1,
        alignItems: 'center',
    },
    dateTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    statsText: {
        color: '#f5f5f5',
        fontSize: 12,
        opacity: 0.9,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#f5f5f5',
        marginTop: 10,
    },
    listContainer: {
        padding: 10,
        paddingBottom: 20,
    },
    scheduleCard: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        marginHorizontal: 10,
        alignItems: 'center',
        borderLeftWidth: 6,
        borderLeftColor: '#dd5e5eff',
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    subjectName: {
        color: '#600202',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    
   
    scheduleDetailsContainer: {},
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    scheduleDetails: {
        color: '#600202',
        fontSize: 12,
        marginLeft: 6,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    attendanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
        gap: 4,
    },
    attendanceButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        padding: 8,
        borderRadius: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 20,
    },
    emptyText: {
        color: '#f5f5f5',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 12,
    },
    emptySubText: {
        color: 'rgba(245, 245, 245, 0.7)',
        fontSize: 14,
        marginTop: 6,
        textAlign: 'center',
    },
    footerContainer: {
        padding: 20,
        alignItems: 'center',
    },
    createScheduleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28a745',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 20,
        justifyContent: 'center',
    },
    createScheduleButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFF',
        margin: 20,
        borderRadius: 15,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#600202',
    },
    formContainer: {
        padding: 20,
    },
    // Filter Styles
    filterSection: {
        marginBottom: 25,
    },
    filterLabel: {
        color: '#600202',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    filterButtonsContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        minWidth: 60,
        alignItems: 'center',
    },
    filterButtonSelected: {
        backgroundColor: '#600202',
        borderColor: '#600202',
    },
    filterButtonText: {
        color: '#495057',
        fontWeight: '500',
        fontSize: 14,
    },
    filterButtonTextSelected: {
        color: '#f5f5f5',
        fontWeight: '600',
    },
    // Subject Dropdown
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#600202',
        marginBottom: 8,
    },
    subjectDropdown: {
        maxHeight: 150,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
    },
    subjectItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    subjectItemSelected: {
        backgroundColor: '#D4EDDA',
        borderLeftWidth: 4,
        borderLeftColor: '#28A745',
    },
    subjectText: {
        fontSize: 14,
        color: '#600202',
        fontWeight: '500',
    },
    subjectType: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 2,
    },
    fetchSlotsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff6b35',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 20,
        justifyContent: 'center',
        gap: 8,
    },
    fetchSlotsButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    slotsSection: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#28A745',
    },
    slotsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#600202',
        marginBottom: 10,
    },
    slotItem: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    slotItemSelected: {
        backgroundColor: '#D4EDDA',
        borderColor: '#28A745',
    },
    slotText: {
        fontSize: 14,
        color: '#28A745',
        fontWeight: '500',
        textAlign: 'center',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
    },
    selectedTimeContainer: {
        backgroundColor: '#FFF3CD',
        padding: 15,
        borderRadius: 8,
        marginTop: 10,
    },
    selectedTime: {
        fontSize: 15,
        color: '#600202',
        fontWeight: '600',
        textAlign: 'center',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    modalCancelButton: {
        backgroundColor: '#6c757d',
    },
    modalSubmitButton: {
        backgroundColor: '#28a745',
    },
    modalSubmitButtonDisabled: {
        backgroundColor: '#6c757d',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    modalCancelButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    modalSubmitButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    // Attendance Modal Styles
    classInfoContainer: {
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#600202',
    },
    classInfoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#600202',
        marginBottom: 10,
    },
    classDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    classDetailLabel: {
        fontSize: 14,
        color: '#600202',
        fontWeight: '600',
    },
    classDetailValue: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    otpSection: {
        backgroundColor: '#E8F5E8',
        padding: 15,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#28A745',
    },
    otpTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28A745',
        marginBottom: 5,
    },
    otpDescription: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 15,
        lineHeight: 20,
    },
    generateOtpButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#28A745',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        gap: 8,
        marginBottom: 10,
    },
    generateOtpButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    generatedOtpContainer: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#28A745',
    },
    generatedOtpLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#28A745',
        marginBottom: 5,
    },
    generatedOtpValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#600202',
        textAlign: 'center',
        marginVertical: 10,
        letterSpacing: 3,
    },
    otpInstruction: {
        fontSize: 12,
        color: '#6C757D',
        fontStyle: 'italic',
        textAlign: 'center',
    },
   
    loadingBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    timeStatusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    ongoingBadge: {
        backgroundColor: '#28a745', // Green for ongoing
    },
    completedBadge: {
        backgroundColor: '#007bff', // Blue for completed
    },
    expiredBadge: {
        backgroundColor: '#f40e25ff', // Red for expired
    },
    scheduledBadge: {
        backgroundColor: '#ffc107', // Yellow for scheduled/upcoming
    },
    loadingBadge: {
        backgroundColor: '#6c757d', // Gray for loading
    },
    timeStatusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },

});

export default HomeScreen;
