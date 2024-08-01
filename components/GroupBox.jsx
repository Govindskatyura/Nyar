// import React from "react";
// import { View, Text, Image, StyleSheet, TouchableWithoutFeedback } from "react-native";
// // import { useNavigation } from "@react-navigation/native";
// function GroupBox({ imageLink, groupName, totalAmount, owesOrOwns, onPress}) {
//   // const navigation = useNavigation();

//   const handlePress = (groupName) => {
//     // Redirect to GroupScreen with necessary parameters
//     const name = groupName;
//       navigation.navigate('GroupScreen',params={groupName, totalAmount, owesOrOwns, name})
//     // router.push("/GroupScreen/"+groupName);
//   };

//   return (
//     <TouchableWithoutFeedback onPress={() =>onPress()}>
//       <View style={styles.container}>
//         <View style={styles.leftContent}>
//           <Image source={{ uri: imageLink }} style={styles.image} />
//           <Text style={styles.groupName}>{groupName}</Text>
//         </View>
//         <View style={styles.rightContent}>
//           <Text>{owesOrOwns}</Text>
//           <Text style={{color:'red'}}>₹ {totalAmount}</Text>
//         </View>
//       </View>
//     </TouchableWithoutFeedback>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor:'#fff',
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     width: "100%",
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   leftContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   image: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 16,
//   },
//   groupName: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   rightContent: {
//     alignItems: "flex-end",
//   },
// });

// export default GroupBox;


import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const GroupBox = ({ imageLink, groupName, totalAmount, owesOrOwns, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: imageLink }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.groupName}>{groupName}</Text>
        <Text style={styles.amountText}>
          {owesOrOwns === "Owes you" ? "Owes you" : owesOrOwns === "You owe" ? "You owe" : "Settled"}
          {owesOrOwns !== "Settled" && ` $${totalAmount}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  amountText: {
    fontSize: 14,
    color: '#008080',
  },
});

export default GroupBox;