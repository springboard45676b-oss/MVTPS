/*class Solution{
    areAnagrams(s1,s2){
        if(s1.length !== s2.length){
            return false;
        }
        const freqMap = new Array(26).fill(0);
        for(let i = 0; i < s1.length ; i++){
            freqMap[s1.charCodeAt(i) - 'a'.charCodeAt(0)]++;
            freqMap[s2.charCodeAt(i) - 'a'.charCodeAt(0)]--;
        }
        for(let i = 0; i < 26; i++){
            if(freqMap[i] !== 0){
                return false;
            }
        }
        return true;
    }
}

const sol = new Solution();
console.log(sol.areAnagrams("geeks","seekg"));
console.log(sol.areAnagrams("geeks","seekog"));
class Solution{
    extrachar(s1,s2){
        const charCounts = new Array(26).fill(0);
        for(let i = 0; i < s1.length ; i++){
            charCounts[s1.charCodeAt(i)-'a'.charCodeAt(0)]++;
        }
        for(let i = 0; i < s2.length ; i++){
           charCounts[s2.charCodeAt(i)-'a'.charCodeAt(0)]--;
        }
        for (let i = 0 ; i < 26 ; i++){
            if(charCounts[i] === -1){
                return String.fromCharCode(i + 'a'.charCodeAt(0));
            }
        }
        return ' ';
    }
} 
const sol = new Solution();
console.log(sol.extrachar("geek","geeks"));*/

// User function Template for javascript

class Solution {

    alphabets(c1, c2) {
        let result = [];
        const startCode = c1.charCodeAt(0);
        const endCode = c2.charCodeAt(0);

        for (let i = startCode; i <= endCode; i++) {
            result.push(String.fromCharCode(i));
        }

        // Return the final string instead of printing it
        return result.join(' ');
    }
}

// When testing locally, you can do this:
const sol = new Solution();
console.log(sol.alphabets("a", "h"));


// User function Template for javascript

class Solution {
    binaryToDecimal(b) {
        let decimalValue = 0;
        for ( let i = 0; i< b.length ; i++){
            decimalValue =  decimalValue * 2;
            if (b[i]=== '1'){
                decimalValue += 1;
            }
        }
        return decimalValue;
    }
}