import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("My First App")), 
      body: Center(
        child: Container(
          // 1. The Card Styling
          padding: EdgeInsets.all(20),
          height: 200, // I made it slightly taller to fit the button
          width: 320,  // And slightly wider
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
            boxShadow: [
              BoxShadow(
                blurRadius: 10, 
                color: Colors.black12,
                offset: Offset(0, 5),
              )
            ],
          ),
          
          // 2. The Content inside the Card
          child: Row(
            children: [
              // A. The Profile Image
              CircleAvatar(
                radius: 40, 
                backgroundImage: NetworkImage("https://i.pravatar.cc/300"), 
              ),
              
              SizedBox(width: 20), // Spacing
              
              // B. The Column with Name + Button
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text("Jane Doe", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  Text("Flutter Developer", style: TextStyle(color: Colors.grey)),
                  
                  SizedBox(height: 10), // Small gap
                  
                  // C. The Button
                  ElevatedButton(
                    onPressed: () {
                      print("Button Clicked!"); 
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                    ),
                    child: Text("Contact Me"),
                  )
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}