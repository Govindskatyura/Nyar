
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: "#00CED1",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 7,
    gap: 10,
    backgroundColor: "white",
    borderRadius: 3,
    height: 38,
    flex: 1,
  },
  searchIcon: {
    paddingLeft: 10,
  },
  addressContainer: {
    padding: 10,
  },
  addressTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingVertical: 7,
    paddingHorizontal: 5,
  },
  addressItem: {
    borderWidth: 1,
    borderColor: "#D0D0D0",
    padding: 10,
    flexDirection: "column",
    gap: 5,
    marginVertical: 10,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "bold",
  },
  addressText: {
    fontSize: 15,
    color: "#181818",
  },
  addressActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 7,
  },
  addressActionButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    borderWidth: 0.9,
    borderColor: "#D0D0D0",
  },
});

export default styles;