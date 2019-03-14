
//获取当前位置坐标
function getLocation(callback) {
    wx.getLocation({
        success: function(res) {
        	callback(true, res.latitude, res.longitude);
        },
        fail: function() {
        	callback(false);
        }
    })
}

//Reverse Geocoding 根据经纬度获取城市名称
function getCityName(latitude, longitude, callback) {
    var apiURL = "http://api.map.baidu.com/geocoder?output=json&location="+ latitude + "," + longitude + "&key=37492c0ee6f924cb5e934fa08c6b1676";
    // wx.request({
    //     url: apiURL,
    //     success: function(res) {
    //         callback(res.data["result"]["addressComponent"]["city"]);
    //     }
    // });

  var res = '{"data":{"result":{"addressComponent":{"city":"平乐村"}}}}';
  var res = JSON.parse(res); 
  callback(res.data["result"]["addressComponent"]["city"]);
}

//获取指定位置的天气信息
function getWeatherByLocation(latitude, longitude, callback) {
    var apiKey = "你自己的Key";
    var apiURL = "https://api.darksky.net/forecast/" + apiKey + "/" + latitude + "," + longitude + "?lang=zh&units=ca";
    // wx.request({
    //     url: apiURL,
    //     success: function(res){
    //         var weatherData = parseWeatherData(res.data);
    //         getCityName(latitude, longitude, function(city){
    //             weatherData.city = city;
    //             callback(weatherData);
    //         });            
    //     }
    // });

  var res = '{"header":{"content-type":"application/json"},"statusCode":200,"data":{"latitude":39.90403,"longitude": 116.407526,"currently":{"time":1552540457,"temperature":"26.7","summary":"局部有雨"},"daily":{"data":[{"time":1552626857,"temperatureMin":"23.3","temperatureMax":"27.8","summary":"天气晴朗并可持续"},{"time":1552713257,"temperatureMin":"24.3","temperatureMax":"29.8","summary":"会有大雨"},{"time":1552799657,"temperatureMin":"22.3","temperatureMax":"25.8","summary":"局部小雨转好"},{"time":1552886057,"temperatureMin":"25.3","temperatureMax":"29.8","summary":"局部有雨持续到晚上"},{"time":1552972457,"temperatureMin":"23.3","temperatureMax":"28.8","summary":"天气晴朗"},{"time":1553058857,"temperatureMin":"22.3","temperatureMax":"25.8","summary":"局部有雨"},{"time":1553145257,"temperatureMin":"25.3","temperatureMax":"29.8","summary":"天气持续晴朗"},{"time":1553231657,"temperatureMin":"23.3","temperatureMax":"28.8","summary":"局部大雨"}],"summary":"好雨知时节，当春乃发生。随风潜入夜，润物细无声。野径云俱黑，江船火独明。晓看红湿处，花重锦官城。"}}}';
  var res = JSON.parse(res); 
  var weatherData = parseWeatherData(res.data);
  getCityName(latitude, longitude, function (city) {
    weatherData.city = city;
    callback(weatherData);
  });   
}

//解析天气数据
function parseWeatherData(data) {
    var weather = {};
    weather["current"] = data.currently;
    weather["daily"] = data.daily;
    return weather;
}

//将时间戳格式化为日期
function formatDate(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.getMonth()+1 + "月" + date.getDate() + "日 " + formatWeekday(timestamp);
}

//将时间戳格式化为时间
function formatTime(timestamp) {
    var date = new Date(timestamp * 1000);
    return date.getHours() + ":" + date.getMinutes();
}

//中文形式的每周日期
function formatWeekday(timestamp) {
    var date = new Date(timestamp * 1000);
    var weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var index = date.getDay();
    return weekday[index];
}

//加载天气数据
function requestWeatherData(cb) {
    getLocation(function(success, latitude, longitude){
      //如果 GPS 信息获取不成功， 设置一个默认坐标
      if(success == false) {
          latitude = 39.90403;
          longitude = 116.407526;
      }      
      
      //请求天气数据 API
      getWeatherByLocation(latitude, longitude, function(weatherData){
            cb(weatherData);    
      });
    });
}

function loadWeatherData(callback) {
    requestWeatherData(function(data){
      //对原始数据做一些修整， 然后输出给前端
      var weatherData = {};
      weatherData = data;      
      weatherData.current.formattedDate = formatDate(data.current.time);
      weatherData.current.formattedTime = formatTime(data.current.time);
      weatherData.current.temperature = parseInt(weatherData.current.temperature);
      var wantedDaily = [];
      for(var i = 0;i < weatherData.daily.data.length;i++) {
        var wantedDailyItem = weatherData.daily.data[i];
        var time = weatherData.daily.data[i].time;
        wantedDailyItem["weekday"] = formatWeekday(time);
        wantedDailyItem["temperatureMin"] = parseInt(weatherData.daily.data[i]["temperatureMin"])
        wantedDailyItem["temperatureMax"] = parseInt(weatherData.daily.data[i]["temperatureMax"])
        wantedDailyItem["summary"] = weatherData.daily.data[i]["summary"]
        wantedDaily.push(wantedDailyItem);
      }      
      weatherData.daily.data = wantedDaily;
      callback(weatherData);
    });
}

module.exports = {
    loadWeatherData: loadWeatherData
}
