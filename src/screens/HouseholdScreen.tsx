import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, ActivityIndicator, Modal, TextInput } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Household } from '@/entities/Household';
import { Timestamp } from 'firebase/firestore';
import { Task } from '@/entities/Task';
import { Header } from '@/components/Header';
import { useHousehold } from '@/context/household-context';
import EmptyHousehold from '@/components/Household/EmptyHousehold';

// Mock data fetching functions (replace with actual API calls)
const fetchHousehold = async (id: string) :Promise<Household>=> {
  return {
    id,
    name: 'Smith Family',
    address: '123 Main St, Anytown, USA',
    members: [
      { id: '1', name: 'John Smith', role: 'parent',joinDate:Timestamp.now(),email:"",phone:"" },
      { id: '2', name: 'Jane Smith', role: 'parent' ,joinDate:Timestamp.now(),email:"",phone:""},
      { id: '3', name: 'Billy Smith', role: 'child' ,joinDate:Timestamp.now(),email:"",phone:""},
    ],
  };
};

const fetchTasks = async (householdId: string):Promise<Task[]> => {
  return [ 
  ];
};

const fetchEvents = async (householdId: string) => {
  return [
    { id: 'e1', title: 'Family Meeting', date: '2023-10-20' },
    { id: 'e2', title: 'Billy\'s Birthday', date: '2023-11-05' },
  ];
};

const fetchPerformanceReports = async (householdId: string) => {
  return {
    totalTasks: 10,
    completedTasks: 7,
  };
};

const HouseholdScreen = () => {
    //const { householdId } = route.params;
    const  householdId  = "route.params";
  const [household, setHousehold] = useState<Household>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const layout = useWindowDimensions();
  const{households} = useHousehold();

  
  useFocusEffect(() => {
    const loadData = async () => {
      try {
        const householdData = await fetchHousehold(householdId);
        const tasksData = await fetchTasks(householdId);
        const eventsData = await fetchEvents(householdId);
        const reportsData = await fetchPerformanceReports(householdId);
        setHousehold(householdData);
        setTasks(tasksData);
        setEvents(eventsData);
        setReports(reportsData);
      } catch (err) {
        setError('Failed to load household data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, );

  // Add a new member to the household
  const addMember = () => {
    if (newMemberName && newMemberRole) {
      const newMember = {
        id: Math.random().toString(),
        name: newMemberName,
        role: newMemberRole,
      };
      setHousehold({
        ...household,
        members: [...household.members, newMember],
      });
      setNewMemberName('');
      setNewMemberRole('');
      setModalVisible(false);
    }
  };

  // Loading and error states
  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

 
  if (error) {
    return <Text className="text-red-500 text-center mt-4">{error}</Text>;
  }

  if(households.length ==0){
    return <EmptyHousehold/>
  }
  // Task tab views
  const AllTasks = () => (
    <FlatList
      data={tasks}
      renderItem={({ item }) => (
        <View className="p-4 mb-2 bg-white rounded shadow">
          <Text className="text-lg font-semibold">{item.title}</Text>
          <Text>Due: {item.dueDate}</Text>
          <Text>Status: {item.status}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const UpcomingTasks = () => (
    <FlatList
      data={tasks.filter((task) => new Date(task.dueDate) > new Date())}
      renderItem={({ item }) => (
        <View className="p-4 mb-2 bg-white rounded shadow">
          <Text className="text-lg font-semibold">{item.title}</Text>
          <Text>Due: {item.dueDate}</Text>
          <Text>Status: {item.status}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const OverdueTasks = () => (
    <FlatList
      data={tasks.filter((task) => new Date(task.dueDate) < new Date() && task.status !== 'completed')}
      renderItem={({ item }) => (
        <View className="p-4 mb-2 bg-white rounded shadow">
          <Text className="text-lg font-semibold">{item.title}</Text>
          <Text>Due: {item.dueDate}</Text>
          <Text>Status: {item.status}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );

  const renderScene = SceneMap({
    all: AllTasks,
    upcoming: UpcomingTasks,
    overdue: OverdueTasks,
  });

  // Main screen layout
  return (
     <View className="flex-1 bg-gradient-to-br from-Background-800 to-Background-100 px-2">
           <Header 
            title="Household Members" 
            showNotification 
            onNotificationPress={() => console.log('Notification pressed')}
            rightAction={{
              icon: 'settings-outline',
              onPress: () => console.log('Settings pressed'),
              accessibilityLabel: 'Settings'
            }}
          /> {/* Header */}
      <Text className="text-2xl font-bold mb-2">{household.name}</Text>
      <Text className="text-lg mb-4">{household.address}</Text>

      {/* Members Section */}
      <Text className="text-xl font-semibold mb-2">Members</Text>
      <FlatList
        data={household.members}
        renderItem={({ item }) => (
          <View className="p-2 mb-2 bg-white rounded shadow">
            <Text>{item.name} - {item.role}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        className="mb-4"
      />
      <Button title="Add Member" onPress={() => setModalVisible(true)} />

      {/* Add Member Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View className="flex-1 p-4 bg-gray-100">
          <Text className="text-xl font-bold mb-4">Add New Member</Text>
          <TextInput
            className="border border-gray-300 p-2 mb-2 rounded bg-white"
            placeholder="Member Name"
            value={newMemberName}
            onChangeText={setNewMemberName}
          />
          <TextInput
            className="border border-gray-300 p-2 mb-2 rounded bg-white"
            placeholder="Role (e.g., Parent, Child)"
            value={newMemberRole}
            onChangeText={setNewMemberRole}
          />
          <Button title="Add" onPress={addMember} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>

      {/* Tasks Overview */}
      <Text className="text-xl font-semibold mb-2 mt-4">Tasks Overview</Text>
      <TabView
        navigationState={{
          index: 0,
          routes: [
            { key: 'all', title: 'All' },
            { key: 'upcoming', title: 'Upcoming' },
            { key: 'overdue', title: 'Overdue' },
          ],
        }}
        renderScene={renderScene}
        onIndexChange={() => {}}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: '#0000ff' }}
            style={{ backgroundColor: '#ffffff' }}
            labelStyle={{ color: '#000000' }}
          />
        )}
      />

      {/* Events Section */}
      <Text className="text-xl font-semibold mb-2 mt-4">Upcoming Events</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <View className="p-2 mb-2 bg-white rounded shadow">
            <Text>{item.title} - {item.date}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        className="mb-4"
      />

      {/* Performance Reports */}
      <Text className="text-xl font-semibold mb-2 mt-4">Performance Reports</Text>
      <View className="p-4 bg-white rounded shadow">
        <Text>Total Tasks: {reports.totalTasks}</Text>
        <Text>Completed Tasks: {reports.completedTasks}</Text>
        <Text>Completion Rate: {((reports.completedTasks / reports.totalTasks) * 100).toFixed(2)}%</Text>
      </View>
    </View>
  );
};

export default HouseholdScreen;