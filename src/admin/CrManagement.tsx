import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Mock data for CRs (this would come from your database)
const mockCRData = [
  { id: '1', name: 'John Doe', year: 'E2', branch: 'CSE', section: 'A', phone: '9876543210' },
  { id: '2', name: 'Jane Smith', year: 'E2', branch: 'CSE', section: 'B', phone: '9876543211' },
  { id: '3', name: 'Mike Johnson', year: 'E3', branch: 'ECE', section: 'A', phone: '9876543212' },
  { id: '4', name: 'Sarah Wilson', year: 'E3', branch: 'ECE', section: 'D', phone: '9876543213' },
  { id: '5', name: 'David Brown', year: 'E4', branch: 'ME', section: 'A', phone: '9876543214' },
  { id: '6', name: 'Emily Davis', year: 'E4', branch: 'ME', section: 'D', phone: '9876543215' },
  { id: '7', name: 'Robert Miller', year: 'E2', branch: 'CIVIL', section: 'A', phone: '9876543216' },
  { id: '8', name: 'Lisa Garcia', year: 'E2', branch: 'CIVIL', section: 'B', phone: '9876543217' },
];

// API function to add CR (replace with your actual API call)
// const addCRToBackend = async (crData) => {
//   try {
//     // Simulate API call delay
//     await new Promise(resolve => setTimeout(resolve, 1000));
    
//     // Replace this with your actual API endpoint
//     // const response = await fetch('YOUR_BACKEND_API/cr/add', {
//     //   method: 'POST',
//     //   headers: {
//     //     'Content-Type': 'application/json',
//     //   },
//     //   body: JSON.stringify({
//     //     studentId: crData.id,
//     //     phone: crData.phone
//     //   }),
//     // });

//     // if (!response.ok) {
//     //   throw new Error(`HTTP error! status: ${response.status}`);
//     // }

//     // const result = await response.json();
//     // return result;
    
//     // Mock response
//     return { success: true, cr: { ...crData, name: "New CR", year: "E2", branch: "CSE", section: "A" } };
//   } catch (error) {
//     console.error("Error adding CR:", error);
//     throw error;
//   }
// };

// // API function to fetch CR list (replace with your actual API call)
// const fetchCRList = async () => {
//   try {
//     // Replace this with your actual API endpoint
//     // const response = await fetch('YOUR_BACKEND_API/cr/list');
    
//     // if (!response.ok) {
//     //   throw new Error(`HTTP error! status: ${response.status}`);
//     // }

//     // const result = await response.json();
//     // return result;
    
//     // Mock response
//     return mockCRData;
//   } catch (error) {
//     console.error("Error fetching CR list:", error);
//     throw error;
//   }
// };

// // API function to remove CR (replace with your actual API call)
// const removeCRFromBackend = async (crId) => {
//   try {
//     // Replace this with your actual API endpoint
//     // const response = await fetch(`YOUR_BACKEND_API/cr/remove/${crId}`, {
//     //   method: 'DELETE',
//     // });

//     // if (!response.ok) {
//     //   throw new Error(`HTTP error! status: ${response.status}`);
//     // }

//     // const result = await response.json();
//     // return result;
    
//     // Mock response
//     return { success: true };
//   } catch (error) {
//     console.error("Error removing CR:", error);
//     throw error;
//   }
// };

// Filter options
const yearOptions = ['All', 'E1', 'E2', 'E3', 'E4'];
const branchOptions = ['All', 'CSE', 'ECE', 'EEE', 'CIVIL', 'ME', 'MME', 'CHEM'];

const CrManagement = () => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [crList, setCrList] = useState(mockCRData);
  const [filteredCrList, setFilteredCrList] = useState(mockCRData);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCR, setNewCR] = useState({
    id: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch CR list on component mount
  React.useEffect(() => {
    fetchCRListFromBackend();
  }, []);

  // Auto-filter when selections or search query change
  React.useEffect(() => {
    filterCRs();
  }, [selectedYear, selectedBranch, searchQuery, crList]);

  // Fetch CR list from backend
  const fetchCRListFromBackend = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCRList();
      setCrList(data);
      setFilteredCrList(data);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch CR list");
      console.error("Error fetching CR list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter CRs based on selected filters and search query
  const filterCRs = () => {
    let filtered = [...crList];
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(cr => 
        cr.id.toLowerCase().includes(query) || 
        cr.name.toLowerCase().includes(query)
      );
    }
    
    // Apply year filter
    if (selectedYear !== 'All') {
      filtered = filtered.filter(cr => cr.year === selectedYear);
    }
    
    // Apply branch filter
    if (selectedBranch !== 'All') {
      filtered = filtered.filter(cr => cr.branch === selectedBranch);
    }
    
    setFilteredCrList(filtered);
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedYear('All');
    setSelectedBranch('All');
    setSearchQuery('');
  };

  // Remove CR
  const removeCR = async (crId: string) => {
    Alert.alert(
      "Remove CR",
      "Are you sure you want to remove this CR?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Remove", 
          onPress: async () => {
            try {
              await removeCRFromBackend(crId);
              const updatedList = crList.filter(cr => cr.id !== crId);
              setCrList(updatedList);
              Alert.alert("Success", "CR removed successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to remove CR");
            }
          }
        }
      ]
    );
  };

  // Add new CR
  const addCR = () => {
    setIsAddModalVisible(true);
  };

  // Handle adding new CR
  const handleAddCR = async () => {
    // Validation
    if (!newCR.id) {
      Alert.alert("Error", "Please enter a student ID");
      return;
    }

    if (!newCR.phone) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    if (newCR.phone.length !== 10 || isNaN(Number(newCR.phone))) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Send only ID and phone to backend
      const result = await addCRToBackend({
        id: newCR.id,
        phone: newCR.phone
      });

      if (result.success) {
        // Add the new CR to the list with data returned from backend
        const updatedList = [...crList, result.cr];
        setCrList(updatedList);
        
        // Reset form and close modal
        setNewCR({
          id: '',
          phone: ''
        });
        setIsAddModalVisible(false);
        
        Alert.alert("Success", "CR added successfully!");
      } else {
        Alert.alert("Error", result.message || "Failed to add CR");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add CR. Please try again.");
      console.error("Error adding CR:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewCR({
      id: '',
      phone: ''
    });
    setIsAddModalVisible(false);
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedYear !== 'All') count++;
    if (selectedBranch !== 'All') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  };

  // Render filter buttons in modal
  const renderFilterButtons = (options: string[], selected: string, setSelected: (value: string) => void, label: string) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterLabel}>{label}:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterButtonsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterButton,
                selected === option && styles.filterButtonSelected
              ]}
              onPress={() => setSelected(option)}
            >
              <Text style={[
                styles.filterButtonText,
                selected === option && styles.filterButtonTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  // Render CR item
  const renderCRItem = ({ item }: { item: any }) => (
    <View style={styles.crCard}>
      <View style={styles.crInfo}>
        <View style={styles.crHeader}>
          <Text style={styles.crName}>{item.name}</Text>
          <View style={styles.crBadge}>
            <Text style={styles.crBadgeText}>CR</Text>
          </View>
        </View>
        <View style={styles.crDetailsContainer}>
          <View style={styles.detailRow}>
            <Icon name="badge" size={14} color="#600202" />
            <Text style={styles.crDetails}>ID: {item.id}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="school" size={14} color="#600202" />
            <Text style={styles.crDetails}>Year: {item.year} • Branch: {item.branch}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="class" size={14} color="#600202" />
            <Text style={styles.crDetails}>Section: {item.section}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="phone" size={14} color="#600202" />
            <Text style={styles.crDetails}>{item.phone}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => removeCR(item.id)}
      >
        <Icon name="delete" size={18} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#600202" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID or name..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={20} color="#600202" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity 
          style={[
            styles.filterButtonMain,
            getActiveFiltersCount() > 0 && styles.filterButtonActive
          ]} 
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Icon name="filter-list" size={24} color="#FFF" />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.addButton} onPress={addCR}>
          <Icon name="person-add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add New CR</Text>
        </TouchableOpacity>

        
      </View>

      {/* Stats Bar */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Showing {filteredCrList.length} CR{filteredCrList.length !== 1 ? 's' : ''}
          {getActiveFiltersCount() > 0 && ` • ${getActiveFiltersCount()} filter${getActiveFiltersCount() !== 1 ? 's' : ''} active`}
        </Text>
      </View>

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f5f5f5" />
          <Text style={styles.loadingText}>Loading CRs...</Text>
        </View>
      )}

      {/* CR List */}
      {!isLoading && (
        <FlatList
          data={filteredCrList}
          renderItem={renderCRItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={60} color="#f5f5f5" />
              <Text style={styles.emptyText}>No CRs Found</Text>
              <Text style={styles.emptySubText}>
                {getActiveFiltersCount() > 0 
                  ? 'Try changing your filters or add a new CR' 
                  : 'No CRs available. Add a new CR to get started'
                }
              </Text>
            </View>
          }
        />
      )}

      {/* Add CR Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => !isSubmitting && setIsAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New CR</Text>
              {!isSubmitting && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsAddModalVisible(false)}
                >
                  <Icon name="close" size={24} color="#600202" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Student ID *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCR.id}
                  onChangeText={(text) => setNewCR({...newCR, id: text})}
                  placeholder="Enter student ID"
                  placeholderTextColor="#999"
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCR.phone}
                  onChangeText={(text) => setNewCR({...newCR, phone: text})}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isSubmitting}
                />
              </View>

              <View style={styles.noteContainer}>
                <Icon name="info" size={16} color="#600202" />
                <Text style={styles.noteText}>
                  Student details (name, year, branch, section) will be fetched from the database automatically.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.cancelButton, isSubmitting && styles.buttonDisabled]}
                onPress={resetForm}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  (!newCR.id || !newCR.phone) && styles.submitButtonDisabled,
                  isSubmitting && styles.buttonDisabled
                ]}
                onPress={handleAddCR}
                disabled={!newCR.id || !newCR.phone || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Icon name="person-add" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Add CR</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Icon name="close" size={24} color="#600202" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalContent}>
              {renderFilterButtons(yearOptions, selectedYear, setSelectedYear, 'Academic Year')}
              {renderFilterButtons(branchOptions, selectedBranch, setSelectedBranch, 'Department')}
              
              <View style={styles.filterActions}>
                <TouchableOpacity 
                  style={styles.clearAllButton}
                  onPress={clearFilters}
                >
                  <Icon name="clear" size={20} color="#FFF" />
                  <Text style={styles.clearAllButtonText}>Clear All</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.applyButton}
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#600202',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingBottom: 5,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#600202',
  },
  filterButtonMain: {
    backgroundColor: '#495057',
    padding: 12,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#495057',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 10,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 5,
  },
  statsText: {
    color: '#f5f5f5',
    fontSize: 12,
    opacity: 0.9,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  crCard: {
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
  crInfo: {
    flex: 1,
  },
  crHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  crName: {
    color: '#600202',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  crBadge: {
    backgroundColor: '#600202',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  crBadgeText: {
    color: '#f5f5f5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  crDetailsContainer: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  crDetails: {
    color: '#600202',
    fontSize: 12,
    marginLeft: 6,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 6,
    marginLeft: 10,
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
    lineHeight: 20,
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
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#600202',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: -10,
  },
  noteText: {
    fontSize: 12,
    color: '#600202',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#6c757d',
    marginRight: 10,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#28a745',
    marginLeft: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingText: {
    color: '#f5f5f5',
    marginTop: 10,
    fontSize: 16,
  },
  // Filter Modal Styles
  filterModalContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterLabel: {
    color: '#600202',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 50,
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
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  clearAllButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CrManagement;