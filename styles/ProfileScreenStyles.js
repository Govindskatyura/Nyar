import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#008080',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  balanceContainer: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 18,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#008080',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default styles;
