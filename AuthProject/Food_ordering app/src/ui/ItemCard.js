import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import { useDispatchCart } from '../context/CartContext';

export function ItemCard({ item }) {
  const dispatch = useDispatchCart();
  const [qty, setQty] = useState('1');

  const add = () => {
    const q = Math.max(1, parseInt(qty || '1'));
    dispatch({
      type: 'ADD_ITEM',
      payload: { id: item.id, name: item.name, price: item.price, qty: q, image: item.image }
    });
  };

  return (
    <View style={{flexDirection:'row',backgroundColor:'#fff',padding:12,borderRadius:8,elevation:2}}>
      <Image source={{uri: item.image}} style={{width:80,height:80,borderRadius:8}} />
      <View style={{flex:1,paddingLeft:12}}>
        <Text style={{fontSize:16,fontWeight:'600'}}>{item.name}</Text>
        <Text numberOfLines={2} style={{color:'#444',marginTop:4}}>{item.description}</Text>
        <Text style={{marginTop:8,fontWeight:'700'}}>₹{item.price.toFixed(2)}</Text>

        <View style={{flexDirection:'row',alignItems:'center',marginTop:8}}>
          <TextInput
            value={qty}
            onChangeText={setQty}
            keyboardType="number-pad"
            style={{width:56,borderWidth:1,borderColor:'#ddd',padding:6,borderRadius:6,marginRight:8}}
          />
          <TouchableOpacity
            onPress={add}
            style={{backgroundColor:'#28a745',paddingVertical:8,paddingHorizontal:12,borderRadius:6}}>
            <Text style={{color:'#fff'}}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
