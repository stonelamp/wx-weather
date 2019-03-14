//index.js
//获取应用实例

var util = require('../../util.js')

Page({

  data: {
    weather: {}
  },
  onLoad: function () {
    
    var self = this;

    util.loadWeatherData(function(data){
      console.log(data);
      self.setData({
        weather: data
      });
      // self.data.weather = data;
    });    
  }

})
