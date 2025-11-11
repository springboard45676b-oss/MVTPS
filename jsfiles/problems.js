class Solution{
    primeFactorisation(n){
        const factors = [];
        while(n % 2 === 0){
            factors.push(2);
            n/=2;
        }
        for(let i = 3; i*i <= n; i+=3){
        while( n % i === 0) {
            factors.push(i);
            n/=i;
        }
   }
        if(n>2){
        factors.push(n);
        }
console.log(factors.join(" "));
  }
    
};
const sol = new Solution();
sol.primeFactorisation(100);
//const result = primeFactorization(100);
//console.log(result);