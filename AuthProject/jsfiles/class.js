
/*function names(name, age){
    console.log(`${name} is ${age} years old`);
}
names("Akhila", 21);
names("Ester", 22);*/

function calculateSum(min,max){
    let sum=0;
    for(let i=min; i<=max; i++){
         sum = sum + i;
}console.log(sum);
 return sum;

}
calculateSum(1,10);

/*let factorial = function fact(n){
    if (n<1) return 1;
    return n*fact(n-1);
    console.log(factorial(5));
}; 
const calculateAddition = (x,y) => x+y
console.log(calculateAddition(60,18));*/

function addNumbers(small, large){
    result = 0;
 for(let i=small; i<=large ; i++){
    result = result+i;
}//console.log(result);
return result
};
addNumbers(20, 40);
//const total = addNumbers(20, 40);
//console.log(total);

