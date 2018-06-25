//时间格式化：20180320
function formatDate(date){
  if (!date) return;
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  // return y + '' + m + '' + d;
  return y + '-' + m + '-' + d;
}


function formatNativeDate(date, fmt) {
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + '';
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }
  return fmt;
}

function padLeftZero(str) {
  return ('00' + str).substr(str.length);
}

//金额格式化
function fmoney(s, n)
{
  s = s||0
  n = n > 0 && n <= 20 ? n : 2;
  s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
  var l = s.split(".")[0].split("").reverse(),
    r = s.split(".")[1];
  let t = "";
  for(let i = 0; i < l.length; i ++ )
  {
    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
  }
  return (t.split("").reverse().join("") + "." + r).padStart(20);
}

//深拷贝
function deepClone(obj1,obj2){
  var obj2 = obj2||{}; //最初的时候给它一个初始值=它自己或者是一个json
  for(var name in obj1){
    if(typeof obj1[name] === "object"){ //先判断一下obj[name]是不是一个对象
      obj2[name] = (obj1[name].constructor===Array)?[]:{}; //我们让要复制的对象的name项=数组或者是json
      deepClone(obj1[name],obj2[name]); //然后来无限调用函数自己 递归思想
    }else{
      obj2[name] = obj1[name];  //如果不是对象，直接等于即可，不会发生引用。
    }
  }
  return obj2; //然后在把复制好的对象给return出去
}

export
{
  formatDate,
  formatNativeDate,
  fmoney,
  deepClone,
}
