class Solution{
    toBinary(n){
        const decimalNum = parseInt(n,10);
        const binaryString = decimalNum.toString(2);
        return binaryString;
    }
}

const sol = new Solution();
console.log(sol.toBinary(2));