
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008080',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});

export default styles;