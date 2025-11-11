import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { ItemCard } from '../ui/ItemCard';
import { useNavigation } from '@react-navigation/native';

export function MenuScreen() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const q = collection(db, 'menu');
    const unsub = onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenu(items);
      setLoading(false);
    }, err => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return (
    <SafeAreaView style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <ActivityIndicator size="large" />
      <Text>Loading menu...</Text>
    </SafeAreaView>
  );

  if (error) return (
    <SafeAreaView style={{flex:1,justifyContent:'center',alignItems:'center'}}>
      <Text>Error: {error}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{flex:1, padding:12}}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
        <Text style={{fontSize:24,fontWeight:'700'}}>Menu</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Text style={{fontSize:16,color:'#007bff'}}>View Cart</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={menu}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ItemCard item={item} />}
        ItemSeparatorComponent={() => <View style={{height:12}} />}
      />
    </SafeAreaView>
  );
}
