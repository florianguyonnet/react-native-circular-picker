
import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import CircularPicker from 'react-native-circular-picker';

export default () => {
  const [price, setPrice] = useState(0);
  const handleChange = (v) => setPrice((v * 10).toFixed(0));

  return (
    <View style={{ padding: 24, flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
      <CircularPicker
        size={Dimensions.get('window').width - 48}
        steps={[15, 40, 70, 100]}
        gradients={{
          0: ['rgb(255, 97, 99)', 'rgb(247, 129, 119)'],
          15: ['rgb(255, 204, 0)', 'rgb(255, 214, 10)'],
          40: ['rgb(52, 199, 89)', 'rgb(48, 209, 88)'],
          70: ['rgb(0, 122, 255)', 'rgb(10, 132, 255)'],
        }}
        onChange={handleChange}
      >
        <>
          <Text style={{ textAlign: 'center', fontSize: 24, marginBottom: 8 }}>{price} $</Text>
          <Text style={{ textAlign: 'center' }}>Available balance 1000 $</Text>
        </>
      </CircularPicker>
    </View>
  );
}
