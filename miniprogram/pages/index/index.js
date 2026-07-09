Page({
  data: {},

  onLoad() {
    console.log('[FitBuddy] WebView page loaded');
  },

  onShareAppMessage() {
    return {
      title: 'FitBuddy 健身教练',
      path: 'pages/index/index'
    };
  }
});
