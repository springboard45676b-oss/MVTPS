import React from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useCart, useDispatchCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';

export function CartScreen() {
  const cart = useCart();
  const dispatch = useDispatchCart();
  const navigation = useNavigation();

  const total = cart.items.reduce((s,i) => s + i.price * i.qty, 0);

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
    }
  };

  return (
    <SafeAreaView style={{flex:1,padding:12}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <Text style={{fontSize:22,fontWeight:'700'}}>Cart</Text>
        <Text style={{fontSize:16}}>Total: ₹{total.toFixed(2)}</Text>
      </View>

      <FlatList
        data={cart.items}
        keyExtractor={i => i.id}
        ListEmptyComponent={() => <Text>No items in cart</Text>}
        renderItem={({item}) => (
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:8,backgroundColor:'#fff',borderRadius:8,elevation:1,marginBottom:8}}>
            <View style={{flex:1}}>
              <Text style={{fontWeight:'600'}}>{item.name}</Text>
              <Text>₹{item.price.toFixed(2)}</Text>
            </View>
            <View style={{flexDirection:'row',alignItems:'center'}}>
              <TouchableOpacity onPress={() => updateQty(item.id, item.qty - 1)} style={{padding:8}}>
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={{marginHorizontal:8}}>{item.qty}</Text>
              <TouchableOpacity onPress={() => updateQty(item.id, item.qty + 1)} style={{padding:8}}>
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('OrderSummary')}
        style={{backgroundColor:'#007bff',padding:14,borderRadius:8,alignItems:'center',marginTop:12}}>
        <Text style={{color:'#fff',fontWeight:'700'}}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
