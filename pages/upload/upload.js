const app = getApp();
// pages/upload/upload.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    SQLphonenumber: '未取到号码',
    id_front: '../index/img/id_front.png',
    id_back: '../index/img/id_back.png',
    bankcard: '../index/img/bankcard.png',
    hand: '../index/img/hand.png',

    ready1: '',
    ready2: '',
    ready3: '',
    ready4: '',
    imgOpacityid_front: 1,
    imgOpacityid_back: 1,
    imgOpacitybankcard: 1,
    imgOpacityhand: 1,
    fail: '../index/img/fail.png',
    source: '',
    upload_picture_list: [],
    upload_percent: 0,
    showModal: false,
    uploadState: [
      { id_front: false, id_back: false, bankcard: false, hand: false }
    ],
    newnumber: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var app = getApp();
    console.log('传来的号码是', options.mobile);
    this.setData({ SQLphonenumber: options.mobile });
    this.refresh();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    console.log('refreshing page...');
    this.refresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},
  //弹窗方法：
  showDialogBtn: function() {
    this.setData({
      showModal: true
    });
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function() {},
  /**
   * 隐藏模态对话框
   */
  hideModal: function() {
    this.setData({
      showModal: false
    });
  },
  newnumberinput: function(e) {
    this.setData({
      newnumber: e.detail.value
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function() {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function() {
    var that = this;
    if (this.data.newnumber == '') {
      wx.showToast({
        title: '请正确填写',

        icon: 'error',

        duration: 1500
      });
    } else {
      console.log(
        '**token为：',
        app.globalData.token,
        app.globalData.userIdNO,
        this.data.newnumber
      );
      wx.request({
        url:
          'http://192.168.31.170/testupload-php/index.php/api/v1/Change/change_phone',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          Authorization: app.globalData.token
        },
        data: {
          userIdNO: app.globalData.userIdNO,
          newnumber: this.data.newnumber
        },
        success: function(res) {
          console.log('change_phone result:', res);
          console.log(JSON.parse(res.data.result));
          var newnumber = JSON.parse(res.data.result);
          that.setData({
            SQLphonenumber: newnumber
          });
          that.hideModal();
        }
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},

  refresh: function() {
    var that = this;
    console.log('用户id是', app.globalData.userInfo);
    console.log('openid为:', app.globalData.openId);
    var ids = ['id_front', 'id_back', 'bankcard', 'hand'];
    var states = [
      'id_front_state',
      'id_back_state',
      'bankcard_state',
      'hand_state'
    ];
    wx.request({
      url:
        'http://192.168.31.170/testupload-php/index.php/api/v1/Check/check_img',
      header: {
        'content-type': 'application/json',
        Authorization: app.globalData.token
      },
      method: 'POST',
      data: {
        PIDNO: app.globalData.userIdNO
      },
      success: function(res) {
        console.log('check_img result:', res);
        if (res.data.success == false) {
          wx.showToast({
            title: '错误',
            icon: '未查询到图片',
            duration: 1500
          });
        } else {
          wx.showToast({
            title: '已查询到图片',
            icon: 'success',
            duration: 1000
          });
          var tmpsrc = {};
          console.log(res.data.imgs[0]['srcurl']);
          for (var i = 0; i < res.data.imgs.length; i++) {
            // console.log(res.data.imgs[i]['srcurl']);
            var id = res.data.imgs[i]['imgId'];
            tmpsrc[id] = res.data.imgs[i]['srcurl'];
            console.log(id, tmpsrc, tmpsrc[id]);
            that.setData({
              [id]: tmpsrc[id]
            });
            // var blurid = that.data.blurs[i];
            if (res.data.imgs[i]['passed'] == null) {
              console.log(res.data.imgs[i], '未审核');
              var tmp = 'ready' + [i + 1];
              that.setData({
                [tmp]: '../index/img/waiting.png'
              });
            } else if (res.data.imgs[i]['passed'] == 0) {
              console.log(res.data.imgs[i], '没通过');
              // var tempblur = {
              //   blurid: 'unchecked'
              // };
              // that.setData(tempblur);
              var tmp = 'ready' + [i + 1];
              that.setData({
                [tmp]: '../index/img/fail.png'
              });
            } else if (res.data.imgs[i]['passed'] == 1) {
              console.log(res.data.imgs[i], '通过');
              var tmp = 'ready' + [i + 1];
              that.setData({
                [tmp]: '../index/img/ready.png'
              });
            } else {
              console.log(res.data.imgs[i], '未知状态');
            }
          }
          console.log(that.data.id_back);
        }
      }
    });
  },

  uploadimg: function(event) {
    console.log('上传的是：', event.target.id);
    var that = this;
    var whichone = event.target.id;
    wx.chooseImage({
      //从本地相册选择图片或使用相机拍照
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        //前台显示
        that.setData({
          source: res.tempFilePaths
        });
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        console.log(tempFilePaths);
        var util = require('../../utils/util.js');
        var time = new Date();
        var datetime = util.formatTime(time); //获取时间 防止命名重复
        var date = datetime.substring(0, 8); //获取日期 分日期 文件夹存储
        console.log('uploading start');
        var upload_task = wx.uploadFile({
          url: app.globalData.baseUrl + 'UploadImg/upload/',
          filePath: tempFilePaths[0],
          name: 'userfile',
          formData: {
            folderName: app.globalData.userIdNO,
            imgId: whichone,
            datetime: datetime,
            date: date
          },
          header: {
            'Content-Type': 'multipart/form-data',
            Authorization: app.globalData.token
          },
          success: function(res) {
            var _this = that;
            console.log('返回信息：', JSON.parse(res.data));
            console.log(
              '存储路径为：',
              decodeURIComponent(JSON.parse(res.data)['new_path'])
            );
            var file_URL =
              getApp().globalData.uploadUrl +
              JSON.parse(res.data)['folderName'] +
              '/' +
              JSON.parse(res.data)['new_file_name'];
            console.log('URL为：', file_URL);
            var data = JSON.parse(res.data);

            //重设预览照片
            if (data['success'] == true) {
              var temp1 = 'uploadState[' + 0 + "]['id_front']";
              _this.data.uploadState[0][whichone] = true;
              switch (whichone) {
                case 'id_front':
                  //超麻烦的组合技
                  // 现在全局变量中生命该照片已上传，并记录该照片的url地址
                  _this.setData({
                    id_front: file_URL,
                    uploadState: _this.data.uploadState
                  });
                  // 再存到本地缓存中
                  wx.setStorageSync('id_front', file_URL);
                  wx.setStorageSync('id_front_state', true);
                  console.log(temp1, _this.data);
                  break;
                case 'id_back':
                  _this.setData({
                    id_back: file_URL,
                    uploadState: _this.data.uploadState
                  });
                  wx.setStorageSync('id_back', file_URL);
                  wx.setStorageSync('id_back_state', true);
                  console.log(_this.data);
                  break;
                case 'bankcard':
                  _this.setData({
                    bankcard: file_URL,
                    uploadState: _this.data.uploadState
                  });
                  wx.setStorageSync('bankcard', file_URL);
                  wx.setStorageSync('bankcard_state', true);
                  console.log(_this.data);
                  break;
                case 'hand':
                  _this.setData({
                    hand: file_URL,
                    uploadState: _this.data.uploadState
                  });
                  wx.setStorageSync('hand', file_URL);
                  wx.setStorageSync('hand_state', true);
                  console.log(_this.data);
                  break;
              }
            } else {
              var filename = data.file; //存储地址 显示
              console.log('OK', filename);
            }
          },
          fail: function(res) {
            wx.hideToast();
            wx.showModal({
              title: '错误提示',
              content: '上传图片失败',
              showCancel: false,
              success: function(res) {}
            });
          }
        });
        var pageData = {};
        pageData.data = {};
        // 显示上传进度：
        upload_task.onProgressUpdate(res => {
          var live_percent = res.progress;
          var tmpop = 'imgOpacity'.whichone;
          var tmparr = { tmpop: 'imgOpacity'.whichone };
          that.setData({
            upload_percent: live_percent + '%',
            tmparr
          });
          console.log(live_percent + '%');
        });
      }
    });
  }
});
