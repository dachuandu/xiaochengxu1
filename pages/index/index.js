//index.js
//获取应用实例
const app = getApp();
const backgroundAudioManager = wx.getBackgroundAudioManager();

backgroundAudioManager.title = '1';
backgroundAudioManager.epname = '1';
backgroundAudioManager.singer = '1';
backgroundAudioManager.coverImgUrl = '1';
// 设置了 src 之后会自动播放
backgroundAudioManager.src =
  'http://192.168.31.170/testupload-php/uploads/music.mp3';
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    storedName: '',
    storedPID: '',
    EMPNAME_xml: '',
    PIDNO_xml: '',
    items: [{ name: 'remember', value: '记住我', checked: true }],
    music_icon: '../index/img/music.png',
    music: 'music'
  },

  containerTap: function(res) {
    var that = this;
    var x = res.touches[0].pageX;
    var y = res.touches[0].pageY + 85;
    this.setData({
      rippleStyle: ''
    });
    setTimeout(function() {
      that.setData({
        rippleStyle:
          'top:' +
          y +
          'px;left:' +
          x +
          'px;-webkit-animation: ripple 0.4s linear;animation:ripple 0.4s linear;'
      });
    }, 200);
  },
  playmusic: function() {
    if (this.data.music == 'music') {
      //pause music
      wx.getBackgroundAudioManager().pause();
      this.setData({
        music: 'music_pause'
      });
    } else {
      wx.getBackgroundAudioManager().play();
      //continue playing
      this.setData({
        music: 'music'
      });
    }
  },
  checkboxChange(e) {
    var that = this;
    that.data.items[0]['checked'] = !that.data.items[0]['checked'];
    console.log('checked or not:', that.data.items[0]['checked']);
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    });
  },
  onLoad: function() {
    var isstored = this.checkLocalStorage();
    if (isstored) {
      //如果存的有信息：
      this.setData({
        EMPNAME_xml: this.data.storedName,
        PIDNO_xml: this.data.storedPID
      });
      console.log(
        isstored,
        '有信息',
        this.data,
        this.data.storedName,
        this.data.PIDNO_xml
      );
    } else {
      console.log(isstored, '没有信息！');
    }
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      };
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo;

          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      });
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo;
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    });
    console.log('事件为', e, e.detail.userInfo);
  },
  //点击检索，跳转函数
  go: function(e) {
    console.log('手机号为：' + e);
    console.log('openid为:', app.globalData.openId);
    wx.navigateTo({
      url: '../upload/upload?mobile=' + e
    });
  },
  //发送表单匹配函数
  checkLocalStorage: function() {
    var that = this;
    // 同步读取
    if (wx.getStorageSync('EMPNAME') || wx.getStorageSync('PIDNO')) {
      var name = wx.getStorageSync('EMPNAME');
      var idno = wx.getStorageSync('PIDNO');
      that.setData({
        storedName: name,
        storedPID: idno
      });
      return true;
    } else {
      return false;
    }
  },
  inputer1: function(e) {
    this.setData({
      EMPNAME_xml: e.detail.value
    });
  },
  inputer2: function(e) {
    this.setData({
      PIDNO_xml: e.detail.value
    });
  },
  formSubmit: function(e) {
    var that = this;

    if (
      e.detail.value.EMPNAME.length == 0 ||
      e.detail.value.PIDNO.length == 0
    ) {
      wx.showToast({
        title: '姓名和身份证不得为空!',

        icon: 'loading',

        duration: 1500
      });

      setTimeout(function() {
        wx.hideToast();
      }, 2000);
    } else if (e.detail.value.PIDNO.length != 18) {
      wx.showToast({
        title: '请输入18位身份证号码!',

        icon: 'loading',

        duration: 1500
      });

      setTimeout(function() {
        wx.hideToast();
      }, 2000);
    } else {
      var this1 = that;
      wx.request({
        url:
          'http://192.168.31.170/testupload-php/index.php/api/v1/Check/check_pid',

        header: {
          // "Content-Type": "application/x-www-form-urlencoded"
        },

        method: 'POST',

        data: {
          e_EMPNAME: this1.data.EMPNAME_xml,
          e_PIDNO: this1.data.PIDNO_xml
        },

        success: function(res) {
          console.log('sending', this1.data.EMPNAME_xml, this1.data.PIDNO_xml);
          if (res.data == '') {
            wx.showToast({
              title: '错误',

              icon: '未查询到结果',

              duration: 1500
            });
          } else {
            wx.showToast({
              title: '检索成功',

              icon: 'success',

              duration: 1000
            });
            console.log(
              'token是：',
              res.data.data['token'],
              'res.data.result.EMPNAME是',
              JSON.parse(res.data.result)['EMPNAME']
            );
            app.globalData.token = res.data.data['token'];
            app.globalData.userIdNO = JSON.parse(res.data.result)['PIDNO'];
            console.log(
              '登录为：',
              JSON.parse(res.data.result)['EMPNAME'],
              JSON.parse(res.data.result)['PIDNO'],
              '已存入的token：',
              app.globalData.token
            );
            this1.setData({
              e_EMPNAME: JSON.parse(res.data.result)['EMPNAME'],
              e_PIDNO: JSON.parse(res.data.result)['PIDNO']
            });
            // console.log('当前data:', this1.data);
            console.log('e_EMPNAME：' + this1.data.e_EMPNAME);
            console.log('e_PIDNO：' + this1.data.e_PIDNO);
            console.log(this1.data.items[0]['checked']);
            //成功就会记录到本地storage
            if (this1.data.items[0]['checked']) {
              console.log('准备记录信息。。。');
              // 同步存储：
              wx.setStorageSync('EMPNAME', this1.data.e_EMPNAME);
              wx.setStorageSync('PIDNO', this1.data.e_PIDNO);
              wx.setStorageSync('token', app.globalData.token);
              console.log('已存入的token：', app.globalData.token);
              this1.go(JSON.parse(res.data.result)['MOBILEPHONE']);
            } else {
              console.log('不记录');
              wx.setStorageSync('EMPNAME', '');
              wx.setStorageSync('PIDNO', '');
              console.log('已存入的token：', app.globalData.token);
              this1.go(JSON.parse(res.data.result)['MOBILEPHONE']);
            }
          }
        },
        fail: function(err) {
          console.log(err);
        }
      });
    }
  }
});
