import React, { useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useCart, useDispatchCart } from '../context/CartContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export function OrderSummary() {
  const cart = useCart();
  const dispatch = useDispatchCart();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const total = cart.items.reduce((s,i) => s + i.price * i.qty, 0);

  const submitOrder = async () => {
    if (cart.items.length === 0) return Alert.alert('Cart empty');
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        items: cart.items,
        total,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      dispatch({ type: 'CLEAR' });
      Alert.alert('Order placed', 'Your order was submitted successfully');
      navigation.navigate('Menu');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex:1,padding:12}}>
      <Text style={{fontSize:22,fontWeight:'700',marginBottom:12}}>Order Summary</Text>
      <FlatList
        data={cart.items}
        keyExtractor={i => i.id}
        renderItem={({item}) => (
          <View style={{flexDirection:'row',justifyContent:'space-between',padding:8,backgroundColor:'#fff',borderRadius:8,elevation:1,marginBottom:8}}>
            <Text>{item.name} x{item.qty}</Text>
            <Text>₹{(item.price * item.qty).toFixed(2)}</Text>
          </View>
        )}
      />

      <View style={{marginTop:12}}>
        <Text style={{fontSize:18,fontWeight:'700'}}>Total: ₹{total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        onPress={submitOrder}
        style={{backgroundColor:'#28a745',padding:14,borderRadius:8,alignItems:'center',marginTop:20}}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{color:'#fff',fontWeight:'700'}}>Confirm & Place Order</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
