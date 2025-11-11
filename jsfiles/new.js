/*for (i=1 ; i<=10 ; i++){
    for( j=1 ; j<=10 ; j++){
        var product = ( i*j);
        console.log(`${i} X ${j} = ${product}`);
    }console.log("-------------")
    for(i=1; i<=10 ; i++){
         if(i % 2 == 0){
         console.log(`even numbers are `);
         console.log(`${i}`);
        }  
    }
        var name= " Akhila Thammenenwar";
    vowels = "aeiou";
    for(i=1 ; i<name.length ; i++){
         if (vowels.includes(name[i])) {
            console.log(`vowels in the string are ${name[i]}`)
        }
    }
} */

    

/*class Solution {
    utility(n) {
    for(i=1 ; i<=n ; i++){
        for(j=1 ; j<=n; j++){
    if(n % 2 === 0){
        console.log("Friend[i]");
    } else {
        console.log("You[j]");
    }
    }
}
}
}*/

function calculateSum(min,max){
    let sum=0;
    for(let i=min; i<=max; i++){
        sum = sum + i;
    }
}
calculateSum(1,10);