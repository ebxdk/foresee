import { StyleSheet, Text, View } from 'react-native';

export default function EPCExplanationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EPC Explanation</Text>
      <Text style={styles.text}>Energy, Purpose, and Connection are your three batteries. This screen will explain how they’re calculated and how to improve them.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1C1E',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#3A3A3C',
  },
});


